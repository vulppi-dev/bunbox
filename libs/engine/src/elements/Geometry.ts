import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import { Vector3 } from '../math';

/**
 * Geometry stores vertex attributes and indices using typed arrays.
 * - Positions and normals are Float32Array with 3 components per vertex.
 * - UVs are an array of Float32Array with 2 components per vertex.
 * - Indices are Uint32Array.
 *
 * DirtyState is marked when buffers change. Direct buffer mutation via getters
 * is allowed for performance but remember to call markAsDirty() afterwards.
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
    this.#uvs = Array.from({ length: uvLayers }, () => new Float32Array(vertexLength * 2));
    this.#indices = new Uint32Array(indexLength);
  }

  /** Compute a stable content hash combining positions, normals, uvs and indices. */
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

  /** Vertex positions buffer (mutate then call markAsDirty). */
  get vertex(): Float32Array {
    return this.#vertex;
  }

  /** Vertex normals buffer (mutate then call markAsDirty). */
  get normal(): Float32Array {
    return this.#normal;
  }

  /**
   * UV layers buffers (copy of the array wrapper). Mutate inner typed arrays then call markAsDirty.
   */
  get uvs(): readonly Float32Array[] {
    return Object.freeze([...this.#uvs]);
  }

  /** Index buffer (mutate then call markAsDirty). */
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
      throw new Error(`Vertex index out of range [0, ${this.#vertexCount - 1}]: ${i}`);
    }
  }

  #assertUVLayer(layer: number): void {
    if (!Number.isInteger(layer) || layer < 0 || layer >= this.#uvs.length) {
      throw new Error(`UV layer out of range [0, ${this.#uvs.length - 1}]: ${layer}`);
    }
  }

  #assertIndexIndex(i: number): void {
    if (!Number.isInteger(i) || i < 0 || i >= this.#indexCount) {
      throw new Error(`Index out of range [0, ${this.#indexCount - 1}]: ${i}`);
    }
  }

  // ---------- Per-vertex setters/getters ----------
  setVertex(i: number, x: number, y: number, z: number): this {
    this.#assertVertexIndex(i);
    const o = i * 3;
    if (this.#vertex[o] === x && this.#vertex[o + 1] === y && this.#vertex[o + 2] === z)
      return this;
    this.#vertex[o] = x;
    this.#vertex[o + 1] = y;
    this.#vertex[o + 2] = z;
    return this.markAsDirty();
  }

  getVertex(i: number): [number, number, number] {
    this.#assertVertexIndex(i);
    const o = i * 3;
    return [this.#vertex[o]!, this.#vertex[o + 1]!, this.#vertex[o + 2]!];
  }

  setNormal(i: number, nx: number, ny: number, nz: number): this {
    this.#assertVertexIndex(i);
    const o = i * 3;
    if (this.#normal[o] === nx && this.#normal[o + 1] === ny && this.#normal[o + 2] === nz)
      return this;
    this.#normal[o] = nx;
    this.#normal[o + 1] = ny;
    this.#normal[o + 2] = nz;
    return this.markAsDirty();
  }

  getNormal(i: number): [number, number, number] {
    this.#assertVertexIndex(i);
    const o = i * 3;
    return [this.#normal[o]!, this.#normal[o + 1]!, this.#normal[o + 2]!];
  }

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

  getUV(layer: number, i: number): [number, number] {
    this.#assertUVLayer(layer);
    this.#assertVertexIndex(i);
    const arr = this.#uvs[layer]!;
    const o = i * 2;
    return [arr[o]!, arr[o + 1]!];
  }

  // ---------- Bulk writers ----------
  writeVertices(data: ArrayLike<number>, offsetVertex = 0): this {
    if (offsetVertex < 0 || !Number.isInteger(offsetVertex))
      throw new Error('offsetVertex must be a non-negative integer.');
    if (data.length % 3 !== 0) throw new Error('Vertices data length must be a multiple of 3.');
    const count = data.length / 3;
    if (offsetVertex + count > this.#vertexCount)
      throw new Error('Vertices write exceeds vertexCount.');
    this.#vertex.set(data, offsetVertex * 3);
    return this.markAsDirty();
  }

  writeNormals(data: ArrayLike<number>, offsetVertex = 0): this {
    if (offsetVertex < 0 || !Number.isInteger(offsetVertex))
      throw new Error('offsetVertex must be a non-negative integer.');
    if (data.length % 3 !== 0) throw new Error('Normals data length must be a multiple of 3.');
    const count = data.length / 3;
    if (offsetVertex + count > this.#vertexCount)
      throw new Error('Normals write exceeds vertexCount.');
    this.#normal.set(data, offsetVertex * 3);
    return this.markAsDirty();
  }

  writeUVs(layer: number, data: ArrayLike<number>, offsetVertex = 0): this {
    this.#assertUVLayer(layer);
    if (offsetVertex < 0 || !Number.isInteger(offsetVertex))
      throw new Error('offsetVertex must be a non-negative integer.');
    if (data.length % 2 !== 0) throw new Error('UVs data length must be a multiple of 2.');
    const count = data.length / 2;
    if (offsetVertex + count > this.#vertexCount) throw new Error('UVs write exceeds vertexCount.');
    this.#uvs[layer]!.set(data, offsetVertex * 2);
    return this.markAsDirty();
  }

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
        throw new Error(`Index ${v} out of vertex range [0, ${this.#vertexCount - 1}]`);
    }
    this.#indices.set(data, offsetIndex);
    return this.markAsDirty();
  }

  setIndex(i: number, value: number): this {
    this.#assertIndexIndex(i);
    if (!Number.isInteger(value) || value < 0 || value >= this.#vertexCount) {
      throw new Error(`Index value out of range [0, ${this.#vertexCount - 1}]: ${value}`);
    }
    if (this.#indices[i] === value) return this;
    this.#indices[i] = value >>> 0;
    return this.markAsDirty();
  }

  getIndex(i: number): number {
    this.#assertIndexIndex(i);
    return this.#indices[i]!;
  }

  // ---------- Utilities ----------
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

  /** Compute axis-aligned bounding box from positions. Returns null if empty. */
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

  /** Deep copy from another Geometry (resizes if needed). */
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

  /** Create a deep clone. */
  clone(): this {
    const g = new Geometry(this.#vertexCount, this.#indexCount, this.#uvs.length);
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
      pos.set(this.#vertex.subarray(0, Math.min(this.#vertex.length, pos.length)));
      this.#vertex = pos;

      const nrm = new Float32Array(newV * 3);
      nrm.set(this.#normal.subarray(0, Math.min(this.#normal.length, nrm.length)));
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
          this.#uvs[i]!.subarray(0, Math.min(this.#uvs[i]!.length, nextUVs[i]!.length)),
        );
      }
      this.#uvs = nextUVs;
      changed = true;
    }

    if (newI !== this.#indexCount) {
      const idx = new Uint32Array(newI);
      idx.set(this.#indices.subarray(0, Math.min(this.#indices.length, idx.length)));
      this.#indices = idx;
      changed = true;
    }

    this.#vertexCount = newV;
    this.#indexCount = newI;

    return changed ? this.markAsDirty() : this;
  }
}
