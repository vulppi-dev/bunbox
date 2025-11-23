import { DirtyState } from '@bunbox/utils';
import { Vector3 } from '../math';

export type VertexAttributeType =
  | 'float32'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'int8'
  | 'int16'
  | 'int32';

export type VertexAttributeArray =
  | Float32Array
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array;

export type GeometryCustomAttribute = {
  readonly name: string;
  readonly components: number;
  readonly type: VertexAttributeType;
  readonly normalized: boolean;
  readonly data: VertexAttributeArray;
};

type AttributeConstructor =
  | Float32ArrayConstructor
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor;

const ATTRIBUTE_TYPE_CTORS: Record<VertexAttributeType, AttributeConstructor> =
  {
    float32: Float32Array,
    uint8: Uint8Array,
    uint16: Uint16Array,
    uint32: Uint32Array,
    int8: Int8Array,
    int16: Int16Array,
    int32: Int32Array,
  };

type CustomAttribute = {
  name: string;
  components: number;
  type: VertexAttributeType;
  normalized: boolean;
  data: VertexAttributeArray;
};

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
 * - `customAttributes`: Map of named attributes with configurable component count and numeric type (e.g. tangents, skin weights)
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
 * @example
 * ```ts
 * // Add a custom tangent attribute (xyzw)
 * geometry.addCustomAttribute('tangent', 4);
 * geometry.setCustomAttribute('tangent', 0, [1, 0, 0, 1]);
 * ```
 *
 * @extends {DirtyState}
 */
export class Geometry extends DirtyState {
  private __vertex: Float32Array;
  private __normal: Float32Array;
  private __uvs: Float32Array[];
  private __indices: Uint32Array;
  private __customAttributes: Map<string, CustomAttribute>;

  private __vertexCount: number;
  private __indexCount: number;

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
    this.__vertexCount = vertexLength;
    this.__indexCount = indexLength;
    this.__vertex = new Float32Array(vertexLength * 3);
    this.__normal = new Float32Array(vertexLength * 3);
    this.__uvs = Array.from(
      { length: uvLayers },
      () => new Float32Array(vertexLength * 2),
    );
    this.__indices = new Uint32Array(indexLength);
    this.__customAttributes = new Map();
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
    return this.__vertex;
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
    return this.__normal;
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
    return Object.freeze([...this.__uvs]);
  }

  /**
   * Registered custom vertex attributes.
   *
   * Returned metadata is read-only. To mutate the attribute data directly (e.g.
   * for performance-critical updates), call {@link getCustomAttributeData} with
   * the attribute name and remember to {@link markAsDirty} afterwards.
   */
  get customAttributes(): readonly GeometryCustomAttribute[] {
    return this.__customAttributes.size === 0
      ? []
      : Array.from(this.__customAttributes.values(), (attr) => ({
          name: attr.name,
          components: attr.components,
          type: attr.type,
          normalized: attr.normalized,
          data: attr.data,
        }));
  }

  hasCustomAttribute(name: string): boolean {
    return this.__customAttributes.has(name);
  }

  getCustomAttributeData(name: string): VertexAttributeArray {
    const attr = this.__customAttributes.get(name);
    if (!attr) throw new Error(`Custom attribute not found: ${name}`);
    return attr.data;
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
    return this.__indices;
  }

  /** Number of vertices. */
  get vertexCount(): number {
    return this.__vertexCount;
  }

  /** Number of indices. */
  get indexCount(): number {
    return this.__indexCount;
  }

  /** Number of UV layers. */
  get uvLayerCount(): number {
    return this.__uvs.length;
  }

  // ---------- Validation helpers ----------
  private __assertVertexIndex(i: number): void {
    if (!Number.isInteger(i) || i < 0 || i >= this.__vertexCount) {
      throw new Error(
        `Vertex index out of range [0, ${this.__vertexCount - 1}]: ${i}`,
      );
    }
  }

  private __assertUVLayer(layer: number): void {
    if (!Number.isInteger(layer) || layer < 0 || layer >= this.__uvs.length) {
      throw new Error(
        `UV layer out of range [0, ${this.__uvs.length - 1}]: ${layer}`,
      );
    }
  }

  private __assertIndexIndex(i: number): void {
    if (!Number.isInteger(i) || i < 0 || i >= this.__indexCount) {
      throw new Error(`Index out of range [0, ${this.__indexCount - 1}]: ${i}`);
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
    this.__assertVertexIndex(i);
    const o = i * 3;
    if (
      this.__vertex[o] === x &&
      this.__vertex[o + 1] === y &&
      this.__vertex[o + 2] === z
    )
      return this;
    this.__vertex[o] = x;
    this.__vertex[o + 1] = y;
    this.__vertex[o + 2] = z;
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
    this.__assertVertexIndex(i);
    const o = i * 3;
    return [this.__vertex[o]!, this.__vertex[o + 1]!, this.__vertex[o + 2]!];
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
    this.__assertVertexIndex(i);
    const o = i * 3;
    if (
      this.__normal[o] === nx &&
      this.__normal[o + 1] === ny &&
      this.__normal[o + 2] === nz
    )
      return this;
    this.__normal[o] = nx;
    this.__normal[o + 1] = ny;
    this.__normal[o + 2] = nz;
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
    this.__assertVertexIndex(i);
    const o = i * 3;
    return [this.__normal[o]!, this.__normal[o + 1]!, this.__normal[o + 2]!];
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
    this.__assertUVLayer(layer);
    this.__assertVertexIndex(i);
    const arr = this.__uvs[layer]!;
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
    this.__assertUVLayer(layer);
    this.__assertVertexIndex(i);
    const arr = this.__uvs[layer]!;
    const o = i * 2;
    return [arr[o]!, arr[o + 1]!];
  }

  // ---------- Custom attributes ----------

  /**
   * Define a new custom vertex attribute (e.g. tangents, skin weights).
   *
   * @param name - Unique attribute identifier
   * @param components - Number of components per vertex (e.g. 3 for xyz, 4 for xyzw)
   * @param options - Attribute metadata (type, normalization and optional initial data)
   * @returns this for chaining
   */
  addCustomAttribute(
    name: string,
    components: number,
    options?: {
      type?: VertexAttributeType;
      normalized?: boolean;
      initialData?: ArrayLike<number>;
    },
  ): this {
    const key = this.__sanitizeAttributeName(name);
    if (!Number.isInteger(components) || components <= 0)
      throw new Error('components must be a positive integer.');
    if (this.__customAttributes.has(key))
      throw new Error(`Custom attribute already exists: ${key}`);

    const type = options?.type ?? 'float32';
    const normalized = options?.normalized ?? false;
    const data = this.__createAttributeArray(
      type,
      this.__vertexCount * components,
    );

    if (options?.initialData) {
      const initial = options.initialData;
      if (initial.length % components !== 0)
        throw new Error(
          `Initial data length for "${key}" must be a multiple of ${components}.`,
        );
      const vertexCount = initial.length / components;
      if (vertexCount > this.__vertexCount)
        throw new Error(
          `Initial data for "${key}" exceeds vertexCount (${this.__vertexCount}).`,
        );
      data.set(initial, 0);
    }

    this.__customAttributes.set(key, {
      name: key,
      components,
      type,
      normalized,
      data,
    });
    return this.markAsDirty();
  }

  removeCustomAttribute(name: string): this {
    const key = this.__sanitizeAttributeName(name);
    if (!this.__customAttributes.has(key)) return this;
    this.__customAttributes.delete(key);
    return this.markAsDirty();
  }

  setCustomAttribute(
    name: string,
    vertexIndex: number,
    values: ArrayLike<number>,
  ): this {
    this.__assertVertexIndex(vertexIndex);
    const attr = this.__requireCustomAttribute(name);
    if (values.length !== attr.components)
      throw new Error(
        `Expected ${attr.components} components for "${attr.name}", got ${values.length}.`,
      );

    const offset = vertexIndex * attr.components;
    let changed = false;
    for (let i = 0; i < attr.components; i++) {
      const v = values[i]!;
      if (attr.data[offset + i] !== v) {
        attr.data[offset + i] = v;
        changed = true;
      }
    }
    return changed ? this.markAsDirty() : this;
  }

  writeCustomAttribute(
    name: string,
    data: ArrayLike<number>,
    offsetVertex = 0,
  ): this {
    if (offsetVertex < 0 || !Number.isInteger(offsetVertex))
      throw new Error('offsetVertex must be a non-negative integer.');
    const attr = this.__requireCustomAttribute(name);
    if (data.length % attr.components !== 0)
      throw new Error(
        `Custom attribute data length for "${attr.name}" must be a multiple of ${attr.components}.`,
      );
    const count = data.length / attr.components;
    if (offsetVertex + count > this.__vertexCount)
      throw new Error('Custom attribute write exceeds vertexCount.');

    attr.data.set(data, offsetVertex * attr.components);
    return this.markAsDirty();
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
    if (offsetVertex + count > this.__vertexCount)
      throw new Error('Vertices write exceeds vertexCount.');
    this.__vertex.set(data, offsetVertex * 3);
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
    if (offsetVertex + count > this.__vertexCount)
      throw new Error('Normals write exceeds vertexCount.');
    this.__normal.set(data, offsetVertex * 3);
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
    this.__assertUVLayer(layer);
    if (offsetVertex < 0 || !Number.isInteger(offsetVertex))
      throw new Error('offsetVertex must be a non-negative integer.');
    if (data.length % 2 !== 0)
      throw new Error('UVs data length must be a multiple of 2.');
    const count = data.length / 2;
    if (offsetVertex + count > this.__vertexCount)
      throw new Error('UVs write exceeds vertexCount.');
    this.__uvs[layer]!.set(data, offsetVertex * 2);
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
    if (offsetIndex + data.length > this.__indexCount)
      throw new Error('Indices write exceeds indexCount.');
    // Validate indices range
    for (let i = 0; i < data.length; i++) {
      const v = data[i] as number;
      if (!Number.isInteger(v) || v < 0)
        throw new Error(`Index value must be a non-negative integer: ${v}`);
      if (v >= this.__vertexCount)
        throw new Error(
          `Index ${v} out of vertex range [0, ${this.__vertexCount - 1}]`,
        );
    }
    this.__indices.set(data, offsetIndex);
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
    this.__assertIndexIndex(i);
    if (!Number.isInteger(value) || value < 0 || value >= this.__vertexCount) {
      throw new Error(
        `Index value out of range [0, ${this.__vertexCount - 1}]: ${value}`,
      );
    }
    if (this.__indices[i] === value) return this;
    this.__indices[i] = value >>> 0;
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
    this.__assertIndexIndex(i);
    return this.__indices[i]!;
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
    for (const x of this.__vertex) {
      if (x !== 0) {
        needFill = true;
        break;
      }
    }
    if (needFill) {
      this.__vertex.fill(0);
      changed = true;
    }
    // normals
    needFill = false;
    for (const x of this.__normal) {
      if (x !== 0) {
        needFill = true;
        break;
      }
    }
    if (needFill) {
      this.__normal.fill(0);
      changed = true;
    }
    // uvs
    for (let i = 0; i < this.__uvs.length; i++) {
      let uvChanged = false;
      for (const x of this.__uvs[i]!) {
        if (x !== 0) {
          uvChanged = true;
          break;
        }
      }
      if (uvChanged) {
        this.__uvs[i]!.fill(0);
        changed = true;
      }
    }
    // custom attributes
    for (const attr of this.__customAttributes.values()) {
      let needsFill = false;
      for (const x of attr.data) {
        if (x !== 0) {
          needsFill = true;
          break;
        }
      }
      if (needsFill) {
        attr.data.fill(0);
        changed = true;
      }
    }
    // indices
    needFill = false;
    for (const x of this.__indices) {
      if (x !== 0) {
        needFill = true;
        break;
      }
    }
    if (needFill) {
      this.__indices.fill(0);
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
    if (this.__vertexCount === 0) return null;
    const v = this.__vertex;
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
      this.__vertexCount !== g.__vertexCount ||
      this.__uvs.length !== g.__uvs.length ||
      this.__indexCount !== g.__indexCount
    ) {
      this.__resize(g.__vertexCount, g.__indexCount, g.__uvs.length);
    }
    this.__vertex.set(g.__vertex);
    this.__normal.set(g.__normal);
    for (let i = 0; i < this.__uvs.length; i++) this.__uvs[i]!.set(g.__uvs[i]!);
    this.__indices.set(g.__indices);
    this.__copyCustomAttributesFrom(g);
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
      this.__vertexCount,
      this.__indexCount,
      this.__uvs.length,
    );
    g.__vertex.set(this.__vertex);
    g.__normal.set(this.__normal);
    for (let i = 0; i < this.__uvs.length; i++) g.__uvs[i]!.set(this.__uvs[i]!);
    g.__indices.set(this.__indices);
    for (const attr of this.__customAttributes.values()) {
      const data = this.__createAttributeArray(
        attr.type,
        this.__vertexCount * attr.components,
      );
      data.set(attr.data);
      g.__customAttributes.set(attr.name, { ...attr, data });
    }
    g.markAsDirty();
    return g as this;
  }
  private __resize(
    vertexCount?: number,
    indexCount?: number,
    uvLayers?: number,
  ): this {
    const newV = vertexCount ?? this.__vertexCount;
    const newI = indexCount ?? this.__indexCount;
    const newU = uvLayers ?? this.__uvs.length;
    if (!Number.isInteger(newV) || newV < 0)
      throw new Error('vertexCount must be a non-negative integer.');
    if (!Number.isInteger(newI) || newI < 0)
      throw new Error('indexCount must be a non-negative integer.');
    if (!Number.isInteger(newU) || newU < 0)
      throw new Error('uvLayers must be a non-negative integer.');

    let changed = false;

    if (newV !== this.__vertexCount) {
      const pos = new Float32Array(newV * 3);
      pos.set(
        this.__vertex.subarray(0, Math.min(this.__vertex.length, pos.length)),
      );
      this.__vertex = pos;

      const nrm = new Float32Array(newV * 3);
      nrm.set(
        this.__normal.subarray(0, Math.min(this.__normal.length, nrm.length)),
      );
      this.__normal = nrm;

      changed = true;
    }

    if (newU !== this.__uvs.length || newV !== this.__vertexCount) {
      const nextUVs: Float32Array[] = Array.from(
        { length: newU },
        () => new Float32Array(newV * 2),
      );
      const copyLayers = Math.min(this.__uvs.length, newU);
      for (let i = 0; i < copyLayers; i++) {
        nextUVs[i]!.set(
          this.__uvs[i]!.subarray(
            0,
            Math.min(this.__uvs[i]!.length, nextUVs[i]!.length),
          ),
        );
      }
      this.__uvs = nextUVs;
      changed = true;
    }

    if (newI !== this.__indexCount) {
      const idx = new Uint32Array(newI);
      idx.set(
        this.__indices.subarray(0, Math.min(this.__indices.length, idx.length)),
      );
      this.__indices = idx;
      changed = true;
    }

    if (newV !== this.__vertexCount && this.__customAttributes.size > 0) {
      if (this.__resizeCustomAttributes(newV)) {
        changed = true;
      }
    }

    this.__vertexCount = newV;
    this.__indexCount = newI;

    return changed ? this.markAsDirty() : this;
  }

  private __sanitizeAttributeName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Custom attribute name cannot be empty.');
    return trimmed;
  }

  private __requireCustomAttribute(name: string): CustomAttribute {
    const key = this.__sanitizeAttributeName(name);
    const attr = this.__customAttributes.get(key);
    if (!attr) throw new Error(`Custom attribute not found: ${key}`);
    return attr;
  }

  private __createAttributeArray(
    type: VertexAttributeType,
    length: number,
  ): VertexAttributeArray {
    const ctor = ATTRIBUTE_TYPE_CTORS[type];
    if (!ctor) throw new Error(`Unsupported attribute type: ${type}`);
    return new ctor(length);
  }

  private __resizeCustomAttributes(vertexCount: number): boolean {
    let changed = false;
    for (const [name, attr] of this.__customAttributes) {
      const length = vertexCount * attr.components;
      if (attr.data.length === length) continue;
      const data = this.__createAttributeArray(attr.type, length);
      data.set(attr.data.subarray(0, Math.min(attr.data.length, data.length)));
      this.__customAttributes.set(name, { ...attr, data });
      changed = true;
    }
    return changed;
  }

  private __copyCustomAttributesFrom(source: Geometry): void {
    const seen = new Set<string>();
    for (const attr of source.__customAttributes.values()) {
      const expectedLength = this.__vertexCount * attr.components;
      const current = this.__customAttributes.get(attr.name);
      let data: VertexAttributeArray;
      if (
        !current ||
        current.components !== attr.components ||
        current.type !== attr.type ||
        current.data.length !== expectedLength
      ) {
        data = this.__createAttributeArray(attr.type, expectedLength);
      } else {
        data = current.data;
      }
      data.set(attr.data);
      this.__customAttributes.set(attr.name, {
        name: attr.name,
        components: attr.components,
        type: attr.type,
        normalized: attr.normalized,
        data,
      });
      seen.add(attr.name);
    }

    for (const name of this.__customAttributes.keys()) {
      if (!seen.has(name)) {
        this.__customAttributes.delete(name);
      }
    }
  }
}
