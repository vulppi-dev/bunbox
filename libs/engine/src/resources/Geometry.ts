import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import { Vector3 } from '../math';

/**
 * Geometry stores vertex attributes and indices using typed arrays.
 *
 * This class manages mesh vertex data including positions, normals, texture coordinates (UVs),
 * and index buffers. All data is stored in typed arrays for optimal GPU transfer.
 *
 * **Vertex Attributes:**
 * - `positions`: Float32Array with 3 components per vertex (x, y, z)
 * - `normals`: Float32Array with 3 components per vertex (x, y, z)
 * - `uvs`: Array of Float32Array layers with 2 components per vertex (u, v)
 * - `indices`: Uint32Array defining triangle face connectivity
 *
 * **Performance Considerations:**
 * - Direct buffer mutation via getters is allowed for performance
 * - Always call {@link markAsDirty} after modifying buffers directly
 * - Use setter methods to automatically mark as dirty
 * - Content hash is computed lazily for geometry deduplication
 *
 * @example
 * ```ts
 * // Create a simple quad geometry
 * const geometry = new Geometry(4, 6, 1); // 4 vertices, 6 indices, 1 UV layer
 *
 * // Set vertex positions (quad in XY plane)
 * geometry.setPosition(0, -1, -1, 0);
 * geometry.setPosition(1,  1, -1, 0);
 * geometry.setPosition(2,  1,  1, 0);
 * geometry.setPosition(3, -1,  1, 0);
 *
 * // Set normals (all pointing toward camera)
 * for (let i = 0; i < 4; i++) {
 *   geometry.setNormal(i, 0, 0, 1);
 * }
 *
 * // Set UVs
 * geometry.setUv(0, 0, 0, 0);
 * geometry.setUv(0, 1, 1, 0);
 * geometry.setUv(0, 2, 1, 1);
 * geometry.setUv(0, 3, 0, 1);
 *
 * // Set indices (two triangles)
 * geometry.setIndex(0, 0);
 * geometry.setIndex(1, 1);
 * geometry.setIndex(2, 2);
 * geometry.setIndex(3, 0);
 * geometry.setIndex(4, 2);
 * geometry.setIndex(5, 3);
 * ```
 *
 * @example
 * ```ts
 * // Direct buffer manipulation for performance
 * const positions = geometry.vertex;
 * for (let i = 0; i < positions.length; i += 3) {
 *   positions[i] *= 2;     // Scale X
 *   positions[i + 1] *= 2; // Scale Y
 *   positions[i + 2] *= 2; // Scale Z
 * }
 * geometry.markAsDirty(); // Don't forget!
 * ```
 *
 * @extends {DirtyState}
 */
export class Geometry extends DirtyState {
  #vertex: Float32Array;
  #normal: Float32Array;
  #uvs: Float32Array[];
  #indices: Uint32Array;

  #vertexCount: number;
  #indexCount: number;

  constructor(vertexLength: number, indexLength: number, uvLayers = 1) {
    super();
    if (!Number.isInteger(vertexLength) || vertexLength < 0) {
      throw new Error('vertexLength must be a non-negative integer.');
    }
    if (!Number.isInteger(indexLength) || indexLength < 0) {
      throw new Error('indexLength must be a non-negative integer.');
    }
    if (!Number.isInteger(uvLayers) || uvLayers < 0) {
      throw new Error('uvLayers must be a non-negative integer.');
    }
    this.#vertexCount = vertexLength;
    this.#indexCount = indexLength;
    this.#vertex = new Float32Array(vertexLength * 3);
    this.#normal = new Float32Array(vertexLength * 3);
    this.#uvs = Array.from(
      { length: uvLayers },
      () => new Float32Array(vertexLength * 2),
    );
    this.#indices = new Uint32Array(indexLength);
  }

  /**
   * Compute a stable content hash combining positions, normals, UVs and indices.
   *
   * This hash can be used for geometry deduplication and caching. Two geometries
   * with identical vertex data will produce the same hash.
   *
   * @returns A hex string representing the geometry content hash
   */
  get hash(): string {
    // Mix numeric contents quickly then stabilize with sha hex
    const mixArray = (h: number, arr: ArrayLike<number>): number => {
      let x = h >>> 0;
      const n = (arr as { length: number }).length;
      for (let i = 0; i < n; i++) {
        let v = (arr as { [k: number]: number })[i]!;
        v = Math.imul((v * 2654435761) | 0, 1597334677) >>> 0;
        x ^= v;
        x = Math.imul(x, 2246822519) >>> 0;
      }
      return x >>> 0;
    };

    let h = 0x811c9dc5; // FNV-like seed
    h = mixArray(h, this.#vertex);
    h = mixArray(h, this.#normal);
    for (const uv of this.#uvs) h = mixArray(h, uv);
    h = mixArray(h, this.#indices);

    const meta = {
      vc: this.#vertexCount,
      ic: this.#indexCount,
      u: this.#uvs.length,
    };
    return sha(JSON.stringify({ h, meta }), 'hex');
  }

  /**
   * Vertex positions buffer (x, y, z components interleaved).
   *
   * Direct mutation is allowed for performance, but you must call {@link markAsDirty}
   * after modifications to notify the rendering system.
   *
   * @returns Float32Array with length = vertexCount * 3
   *
   * @example
   * ```ts
   * const positions = geometry.vertex;
   * positions[0] = 1.0; // X of first vertex
   * positions[1] = 2.0; // Y of first vertex
   * positions[2] = 3.0; // Z of first vertex
   * geometry.markAsDirty();
   * ```
   */
  get vertex(): Float32Array {
    return this.#vertex;
  }

  /**
   * Vertex normals buffer (x, y, z components interleaved).
   *
   * Normals should be unit vectors for correct lighting calculations.
   * Direct mutation is allowed, but call {@link markAsDirty} after modifications.
   *
   * @returns Float32Array with length = vertexCount * 3
   */
  get normal(): Float32Array {
    return this.#normal;
  }

  /**
   * UV coordinate layers (frozen array of Float32Arrays).
   *
   * Each layer contains u, v components interleaved. Multiple UV layers are used
   * for techniques like lightmaps or detail textures.
   *
   * Returns a frozen copy of the array wrapper. Mutate inner typed arrays directly,
   * then call {@link markAsDirty}.
   *
   * @returns Readonly array of Float32Array, each with length = vertexCount * 2
   */
  get uvs(): readonly Float32Array[] {
    return Object.freeze([...this.#uvs]);
  }

  /**
   * Index buffer defining triangle connectivity.
   *
   * Every 3 indices define one triangle. Values reference vertex indices.
   * Direct mutation is allowed, but call {@link markAsDirty} after modifications.
   *
   * @returns Uint32Array with length = indexCount
   */
  get indices(): Uint32Array {
    return this.#indices;
  }

  /** Number of vertices. */
  get vertexCount(): number {
    return this.#vertexCount;
  }

  /** Number of indices. */
  get indexCount(): number {
    return this.#indexCount;
  }

  /** Number of UV layers. */
  get uvLayerCount(): number {
    return this.#uvs.length;
  }

  // ---------- Validation helpers ----------
  #assertVertexIndex(i: number): void {
    if (!Number.isInteger(i) || i < 0 || i >= this.#vertexCount) {
      throw new Error(
        `Vertex index out of range [0, ${this.#vertexCount - 1}]: ${i}`,
      );
    }
  }

  #assertUVLayer(layer: number): void {
    if (!Number.isInteger(layer) || layer < 0 || layer >= this.#uvs.length) {
      throw new Error(
        `UV layer out of range [0, ${this.#uvs.length - 1}]: ${layer}`,
      );
    }
  }

  #assertIndexIndex(i: number): void {
    if (!Number.isInteger(i) || i < 0 || i >= this.#indexCount) {
      throw new Error(`Index out of range [0, ${this.#indexCount - 1}]: ${i}`);
    }
  }

  // ---------- Per-vertex setters/getters ----------

  /**
   * Set position for a specific vertex.
   *
   * @param i - Vertex index [0, vertexCount)
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @returns this for chaining
   * @throws Error if vertex index is out of range
   */
  setVertex(i: number, x: number, y: number, z: number): this {
    this.#assertVertexIndex(i);
    const o = i * 3;
    if (
      this.#vertex[o] === x &&
      this.#vertex[o + 1] === y &&
      this.#vertex[o + 2] === z
    )
      return this;
    this.#vertex[o] = x;
    this.#vertex[o + 1] = y;
    this.#vertex[o + 2] = z;
    return this.markAsDirty();
  }

  /**
   * Get position of a specific vertex.
   *
   * @param i - Vertex index [0, vertexCount)
   * @returns Tuple [x, y, z]
   * @throws Error if vertex index is out of range
   */
  getVertex(i: number): [number, number, number] {
    this.#assertVertexIndex(i);
    const o = i * 3;
    return [this.#vertex[o]!, this.#vertex[o + 1]!, this.#vertex[o + 2]!];
  }

  /**
   * Set normal for a specific vertex.
   *
   * Normals should be unit vectors for correct lighting calculations.
   *
   * @param i - Vertex index [0, vertexCount)
   * @param nx - Normal X component
   * @param ny - Normal Y component
   * @param nz - Normal Z component
   * @returns this for chaining
   * @throws Error if vertex index is out of range
   */
  setNormal(i: number, nx: number, ny: number, nz: number): this {
    this.#assertVertexIndex(i);
    const o = i * 3;
    if (
      this.#normal[o] === nx &&
      this.#normal[o + 1] === ny &&
      this.#normal[o + 2] === nz
    )
      return this;
    this.#normal[o] = nx;
    this.#normal[o + 1] = ny;
    this.#normal[o + 2] = nz;
    return this.markAsDirty();
  }

  /**
   * Get normal of a specific vertex.
   *
   * @param i - Vertex index [0, vertexCount)
   * @returns Tuple [nx, ny, nz]
   * @throws Error if vertex index is out of range
   */
  getNormal(i: number): [number, number, number] {
    this.#assertVertexIndex(i);
    const o = i * 3;
    return [this.#normal[o]!, this.#normal[o + 1]!, this.#normal[o + 2]!];
  }

  /**
   * Set UV coordinates for a specific vertex on a specific layer.
   *
   * @param layer - UV layer index [0, uvLayerCount)
   * @param i - Vertex index [0, vertexCount)
   * @param u - U coordinate (horizontal, typically [0, 1])
   * @param v - V coordinate (vertical, typically [0, 1])
   * @returns this for chaining
   * @throws Error if layer or vertex index is out of range
   */
  setUV(layer: number, i: number, u: number, v: number): this {
    this.#assertUVLayer(layer);
    this.#assertVertexIndex(i);
    const arr = this.#uvs[layer]!;
    const o = i * 2;
    if (arr[o]! === u && arr[o + 1]! === v) return this;
    arr[o] = u;
    arr[o + 1] = v;
    return this.markAsDirty();
  }

  /**
   * Get UV coordinates for a specific vertex on a specific layer.
   *
   * @param layer - UV layer index [0, uvLayerCount)
   * @param i - Vertex index [0, vertexCount)
   * @returns Tuple [u, v]
   * @throws Error if layer or vertex index is out of range
   */
  getUV(layer: number, i: number): [number, number] {
    this.#assertUVLayer(layer);
    this.#assertVertexIndex(i);
    const arr = this.#uvs[layer]!;
    const o = i * 2;
    return [arr[o]!, arr[o + 1]!];
  }

  // ---------- Bulk writers ----------

  /**
   * Write multiple vertex positions at once.
   *
   * @param data - Array of position components [x0, y0, z0, x1, y1, z1, ...]
   * @param offsetVertex - Starting vertex index (default: 0)
   * @returns this for chaining
   * @throws Error if data length is not multiple of 3 or exceeds buffer size
   *
   * @example
   * ```ts
   * geometry.writeVertices([
   *   0, 0, 0,  // vertex 0
   *   1, 0, 0,  // vertex 1
   *   1, 1, 0   // vertex 2
   * ]);
   * ```
   */
  writeVertices(data: ArrayLike<number>, offsetVertex = 0): this {
    if (offsetVertex < 0 || !Number.isInteger(offsetVertex))
      throw new Error('offsetVertex must be a non-negative integer.');
    if (data.length % 3 !== 0)
      throw new Error('Vertices data length must be a multiple of 3.');
    const count = data.length / 3;
    if (offsetVertex + count > this.#vertexCount)
      throw new Error('Vertices write exceeds vertexCount.');
    this.#vertex.set(data, offsetVertex * 3);
    return this.markAsDirty();
  }

  /**
   * Write multiple vertex normals at once.
   *
   * @param data - Array of normal components [nx0, ny0, nz0, nx1, ny1, nz1, ...]
   * @param offsetVertex - Starting vertex index (default: 0)
   * @returns this for chaining
   * @throws Error if data length is not multiple of 3 or exceeds buffer size
   */
  writeNormals(data: ArrayLike<number>, offsetVertex = 0): this {
    if (offsetVertex < 0 || !Number.isInteger(offsetVertex))
      throw new Error('offsetVertex must be a non-negative integer.');
    if (data.length % 3 !== 0)
      throw new Error('Normals data length must be a multiple of 3.');
    const count = data.length / 3;
    if (offsetVertex + count > this.#vertexCount)
      throw new Error('Normals write exceeds vertexCount.');
    this.#normal.set(data, offsetVertex * 3);
    return this.markAsDirty();
  }

  /**
   * Write multiple UV coordinates at once for a specific layer.
   *
   * @param layer - UV layer index [0, uvLayerCount)
   * @param data - Array of UV components [u0, v0, u1, v1, ...]
   * @param offsetVertex - Starting vertex index (default: 0)
   * @returns this for chaining
   * @throws Error if data length is not multiple of 2 or exceeds buffer size
   */
  writeUVs(layer: number, data: ArrayLike<number>, offsetVertex = 0): this {
    this.#assertUVLayer(layer);
    if (offsetVertex < 0 || !Number.isInteger(offsetVertex))
      throw new Error('offsetVertex must be a non-negative integer.');
    if (data.length % 2 !== 0)
      throw new Error('UVs data length must be a multiple of 2.');
    const count = data.length / 2;
    if (offsetVertex + count > this.#vertexCount)
      throw new Error('UVs write exceeds vertexCount.');
    this.#uvs[layer]!.set(data, offsetVertex * 2);
    return this.markAsDirty();
  }

  /**
   * Write multiple indices at once.
   *
   * Indices define triangles by referencing vertex indices. Every 3 indices form one triangle.
   *
   * @param data - Array of vertex indices [i0, i1, i2, i3, i4, i5, ...]
   * @param offsetIndex - Starting index position (default: 0)
   * @returns this for chaining
   * @throws Error if any index is out of vertex range or write exceeds buffer size
   *
   * @example
   * ```ts
   * // Two triangles sharing an edge (quad)
   * geometry.writeIndices([
   *   0, 1, 2,  // First triangle
   *   0, 2, 3   // Second triangle
   * ]);
   * ```
   */
  writeIndices(data: ArrayLike<number>, offsetIndex = 0): this {
    if (offsetIndex < 0 || !Number.isInteger(offsetIndex))
      throw new Error('offsetIndex must be a non-negative integer.');
    if (offsetIndex + data.length > this.#indexCount)
      throw new Error('Indices write exceeds indexCount.');
    // Validate indices range
    for (let i = 0; i < data.length; i++) {
      const v = data[i] as number;
      if (!Number.isInteger(v) || v < 0)
        throw new Error(`Index value must be a non-negative integer: ${v}`);
      if (v >= this.#vertexCount)
        throw new Error(
          `Index ${v} out of vertex range [0, ${this.#vertexCount - 1}]`,
        );
    }
    this.#indices.set(data, offsetIndex);
    return this.markAsDirty();
  }

  /**
   * Set a specific index value.
   *
   * @param i - Index position [0, indexCount)
   * @param value - Vertex index to reference [0, vertexCount)
   * @returns this for chaining
   * @throws Error if index position or vertex value is out of range
   */
  setIndex(i: number, value: number): this {
    this.#assertIndexIndex(i);
    if (!Number.isInteger(value) || value < 0 || value >= this.#vertexCount) {
      throw new Error(
        `Index value out of range [0, ${this.#vertexCount - 1}]: ${value}`,
      );
    }
    if (this.#indices[i] === value) return this;
    this.#indices[i] = value >>> 0;
    return this.markAsDirty();
  }

  /**
   * Get a specific index value.
   *
   * @param i - Index position [0, indexCount)
   * @returns Vertex index being referenced
   * @throws Error if index position is out of range
   */
  getIndex(i: number): number {
    this.#assertIndexIndex(i);
    return this.#indices[i]!;
  }

  // ---------- Utilities ----------

  /**
   * Clear all vertex data to zeros.
   *
   * Resets positions, normals, UVs, and indices to default values.
   * Only marks as dirty if data actually changed.
   *
   * @returns this for chaining
   */
  clear(): this {
    let changed = false;
    // positions
    let needFill = false;
    for (const x of this.#vertex) {
      if (x !== 0) {
        needFill = true;
        break;
      }
    }
    if (needFill) {
      this.#vertex.fill(0);
      changed = true;
    }
    // normals
    needFill = false;
    for (const x of this.#normal) {
      if (x !== 0) {
        needFill = true;
        break;
      }
    }
    if (needFill) {
      this.#normal.fill(0);
      changed = true;
    }
    // uvs
    for (let i = 0; i < this.#uvs.length; i++) {
      let uvChanged = false;
      for (const x of this.#uvs[i]!) {
        if (x !== 0) {
          uvChanged = true;
          break;
        }
      }
      if (uvChanged) {
        this.#uvs[i]!.fill(0);
        changed = true;
      }
    }
    // indices
    needFill = false;
    for (const x of this.#indices) {
      if (x !== 0) {
        needFill = true;
        break;
      }
    }
    if (needFill) {
      this.#indices.fill(0);
      changed = true;
    }
    return changed ? this.markAsDirty() : this;
  }

  /**
   * Compute axis-aligned bounding box from vertex positions.
   *
   * Useful for frustum culling and spatial queries.
   *
   * @returns Object with min and max Vector3, or null if geometry has no vertices
   *
   * @example
   * ```ts
   * const bounds = geometry.computeBounds();
   * if (bounds) {
   *   const center = bounds.min.clone().sum(bounds.max).mulS(0.5);
   *   const size = bounds.max.clone().sub(bounds.min);
   *   console.log('Center:', center, 'Size:', size);
   * }
   * ```
   */
  computeBounds(): { min: Vector3; max: Vector3 } | null {
    if (this.#vertexCount === 0) return null;
    const v = this.#vertex;
    let minX = v[0]!,
      minY = v[1]!,
      minZ = v[2]!;
    let maxX = v[0]!,
      maxY = v[1]!,
      maxZ = v[2]!;
    for (let i = 3; i < v.length; i += 3) {
      const x = v[i]!,
        y = v[i + 1]!,
        z = v[i + 2]!;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    return {
      min: new Vector3(minX, minY, minZ),
      max: new Vector3(maxX, maxY, maxZ),
    };
  }

  /**
   * Deep copy from another Geometry instance.
   *
   * Automatically resizes buffers if source geometry has different dimensions.
   * All vertex data is copied and the geometry is marked as dirty.
   *
   * @param g - Source geometry to copy from
   * @returns this for chaining
   */
  copy(g: Geometry): this {
    if (
      this.#vertexCount !== g.#vertexCount ||
      this.#uvs.length !== g.#uvs.length ||
      this.#indexCount !== g.#indexCount
    ) {
      this.#resize(g.#vertexCount, g.#indexCount, g.#uvs.length);
    }
    this.#vertex.set(g.#vertex);
    this.#normal.set(g.#normal);
    for (let i = 0; i < this.#uvs.length; i++) this.#uvs[i]!.set(g.#uvs[i]!);
    this.#indices.set(g.#indices);
    return this.markAsDirty();
  }

  /**
   * Create a deep clone of this geometry.
   *
   * Creates a new Geometry instance with identical vertex data.
   *
   * @returns New geometry instance with copied data
   */
  clone(): this {
    const g = new Geometry(
      this.#vertexCount,
      this.#indexCount,
      this.#uvs.length,
    );
    g.#vertex.set(this.#vertex);
    g.#normal.set(this.#normal);
    for (let i = 0; i < this.#uvs.length; i++) g.#uvs[i]!.set(this.#uvs[i]!);
    g.#indices.set(this.#indices);
    g.markAsDirty();
    return g as this;
  }
  #resize(vertexCount?: number, indexCount?: number, uvLayers?: number): this {
    const newV = vertexCount ?? this.#vertexCount;
    const newI = indexCount ?? this.#indexCount;
    const newU = uvLayers ?? this.#uvs.length;
    if (!Number.isInteger(newV) || newV < 0)
      throw new Error('vertexCount must be a non-negative integer.');
    if (!Number.isInteger(newI) || newI < 0)
      throw new Error('indexCount must be a non-negative integer.');
    if (!Number.isInteger(newU) || newU < 0)
      throw new Error('uvLayers must be a non-negative integer.');

    let changed = false;

    if (newV !== this.#vertexCount) {
      const pos = new Float32Array(newV * 3);
      pos.set(
        this.#vertex.subarray(0, Math.min(this.#vertex.length, pos.length)),
      );
      this.#vertex = pos;

      const nrm = new Float32Array(newV * 3);
      nrm.set(
        this.#normal.subarray(0, Math.min(this.#normal.length, nrm.length)),
      );
      this.#normal = nrm;

      changed = true;
    }

    if (newU !== this.#uvs.length || newV !== this.#vertexCount) {
      const nextUVs: Float32Array[] = Array.from(
        { length: newU },
        () => new Float32Array(newV * 2),
      );
      const copyLayers = Math.min(this.#uvs.length, newU);
      for (let i = 0; i < copyLayers; i++) {
        nextUVs[i]!.set(
          this.#uvs[i]!.subarray(
            0,
            Math.min(this.#uvs[i]!.length, nextUVs[i]!.length),
          ),
        );
      }
      this.#uvs = nextUVs;
      changed = true;
    }

    if (newI !== this.#indexCount) {
      const idx = new Uint32Array(newI);
      idx.set(
        this.#indices.subarray(0, Math.min(this.#indices.length, idx.length)),
      );
      this.#indices = idx;
      changed = true;
    }

    this.#vertexCount = newV;
    this.#indexCount = newI;

    return changed ? this.markAsDirty() : this;
  }
}
