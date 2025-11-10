import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import { ulid } from 'ulid';
import type { TextureFormat, SampleCount, TextureUsage } from './types';

/**
 * Descriptor for creating texture instances.
 *
 * Defines the properties needed to configure a texture resource for GPU usage.
 */
export interface TextureBaseDescriptor {
  /** Optional label for debugging purposes */
  label?: string;
  /** Texture width in pixels (minimum 1) */
  width: number;
  /** Texture height in pixels (minimum 1) */
  height: number;
  /**
   * Number of mip levels for mipmapping.
   * Use {@link TextureBase.computeMaxMipLevels} to calculate maximum.
   * @default 1
   */
  mipLevels?: number;
  /**
   * Number of samples for multisampling (MSAA).
   * Valid values: 1, 4
   * @default 1
   */
  sampleCount?: SampleCount;
  /**
   * Pixel format of the texture data.
   * Common formats: 'rgba8unorm', 'bgra8unorm', 'depth24plus'
   * @default 'rgba8unorm'
   */
  format?: TextureFormat;
  /**
   * Bitmask defining allowed usages of the texture.
   * Multiple usages can be combined.
   * @default ['sampler', 'color-target']
   */
  usage?: TextureUsage[];
}

/**
 * Abstract base class for all texture types (2D, 3D, Cube, Image).
 *
 * Provides common texture properties and functionality including:
 * - Dimensions (width, height, depth for 3D textures)
 * - Mipmap configuration
 * - Pixel format and multisampling
 * - Usage flags for GPU operations
 * - Content hashing for resource deduplication
 *
 * **Texture Types:**
 * - {@link TextureImage}: 2D texture loaded from image file
 * - {@link Texture3D}: 3D volumetric texture
 * - {@link TextureCube}: Cubemap for environment mapping
 *
 * **Mipmapping:**
 * Use {@link computeMaxMipLevels} to calculate the maximum number of mip levels
 * based on texture dimensions. Mipmaps improve rendering quality and performance.
 *
 * @extends {DirtyState}
 *
 * @example
 * ```ts
 * // Calculate max mip levels for a 1024x512 texture
 * const maxMips = TextureBase.computeMaxMipLevels(1024, 512); // Returns 11
 * ```
 */
export abstract class TextureBase extends DirtyState {
  /**
   * Calculate maximum number of mip levels for given dimensions.
   *
   * Mip levels are successive half-resolution versions of the texture
   * down to 1x1 pixel. Useful for texture filtering at different distances.
   *
   * @param w - Width in pixels
   * @param h - Height in pixels
   * @param d - Depth in pixels (for 3D textures, default: 1)
   * @returns Maximum number of mip levels (including base level)
   *
   * @example
   * ```ts
   * TextureBase.computeMaxMipLevels(512, 512);  // Returns 10 (512→256→...→1)
   * TextureBase.computeMaxMipLevels(1024, 256); // Returns 11 (1024→512→...→1)
   * ```
   */
  static computeMaxMipLevels(w: number, h: number, d: number = 1): number {
    const maxDim = Math.max(1, w | 0, h | 0, d | 0);
    return Math.floor(Math.log2(maxDim)) + 1;
  }

  #label: string = '';
  #id: string = '';
  #width: number = 1;
  #height: number = 1;
  #mipLevels: number = 1;
  #sampleCount: SampleCount = 1;
  #format: TextureFormat = 'rgba8unorm';
  #usage: TextureUsage[] = ['sampler', 'color-target'];

  protected constructor(desc: TextureBaseDescriptor) {
    super();
    this.#id = ulid();
    this.#label = desc.label ?? '';
    this.#width = Math.max(1, desc.width | 0);
    this.#height = Math.max(1, desc.height | 0);
    this.#format = desc.format ?? 'rgba8unorm';
    this.#mipLevels = Math.max(1, desc.mipLevels ?? 1);
    this.#sampleCount = desc.sampleCount ?? 1;
    this.#usage = Array.isArray(desc.usage)
      ? [...new Set(desc.usage)]
      : ['sampler', 'color-target'];
  }

  /** Unique identifier generated at creation time */
  get id() {
    return this.#id;
  }

  /** Debug label for resource tracking */
  get label() {
    return this.#label;
  }

  /** Texture width in pixels */
  get width() {
    return this.#width;
  }

  /** Texture height in pixels */
  get height() {
    return this.#height;
  }

  /** Number of mip levels (1 = no mipmaps) */
  get mipLevels() {
    return this.#mipLevels;
  }

  /**
   * Number of samples for multisampling (MSAA).
   * 1 = no MSAA, 4 = 4x MSAA
   */
  get sampleCount() {
    return this.#sampleCount;
  }

  /**
   * Pixel format of texture data.
   * Examples: 'rgba8unorm', 'bgra8unorm', 'depth24plus'
   */
  get format() {
    return this.#format;
  }

  /**
   * Array of usage flags defining how texture can be used.
   * Returns a frozen copy for immutability.
   */
  get usage(): readonly TextureUsage[] {
    return Object.freeze(this.#usage.slice());
  }

  /**
   * Check if texture format is a depth format.
   * Depth textures are used for depth/stencil attachments in render passes.
   */
  get isDepthFormat(): boolean {
    return this.#format.startsWith('depth');
  }

  /**
   * Compute content hash for resource deduplication.
   *
   * Two textures with identical properties will produce the same hash.
   * Includes all texture parameters and subclass-specific extensions.
   *
   * @returns Hex string representing texture configuration
   */
  get hash(): string {
    const key = {
      label: this.#label,
      width: this.#width,
      height: this.#height,
      mipLevels: this.#mipLevels,
      sampleCount: this.#sampleCount,
      format: this.#format,
      usage: this.#usage,
      kind: this._kind(),
      ext: this._extraHashKey(),
    };
    return sha(JSON.stringify(key), 'hex');
  }

  get layerCount(): number {
    return 1;
  }

  get depth(): number {
    return 1;
  }

  set label(v: string) {
    if (this.#label === v) return;
    this.#label = v;
    this.markAsDirty();
  }

  set width(v: number) {
    const nv = Math.max(1, v | 0);
    if (this.#width === nv) return;
    this.#width = nv;
    this.#mipLevels = Math.min(
      this.#mipLevels,
      TextureBase.computeMaxMipLevels(this.#width, this.#height),
    );
    this.markAsDirty();
  }

  set height(v: number) {
    const nv = Math.max(1, v | 0);
    if (this.#height === nv) return;
    this.#height = nv;
    this.#mipLevels = Math.min(
      this.#mipLevels,
      TextureBase.computeMaxMipLevels(this.#width, this.#height),
    );
    this.markAsDirty();
  }

  set mipLevels(v: number) {
    const nv = Math.max(1, v | 0);
    const maxAllowed = TextureBase.computeMaxMipLevels(
      this.#width,
      this.#height,
    );
    const clamped = Math.min(nv, maxAllowed);
    if (this.#mipLevels === clamped) return;
    this.#mipLevels = clamped;
    this.markAsDirty();
  }

  set sampleCount(v: SampleCount) {
    const allowed: SampleCount[] = [1, 2, 4, 8];
    const nv = allowed.includes(v) ? v : 1;
    if (this.#sampleCount === nv) return;
    this.#sampleCount = nv;
    this.markAsDirty();
  }

  set format(v: TextureFormat) {
    if (this.#format === v) return;
    this.#format = v;
    this.markAsDirty();
  }

  set usage(v: TextureUsage[]) {
    const nv = [...new Set(v)];
    // Shallow equality check
    if (
      nv.length === this.#usage.length &&
      nv.every((u, i) => u === this.#usage[i])
    )
      return;
    this.#usage = nv;
    this.markAsDirty();
  }

  addUsage(flag: TextureUsage): this {
    if (!this.#usage.includes(flag)) {
      this.#usage.push(flag);
      this.markAsDirty();
    }
    return this;
  }

  removeUsage(flag: TextureUsage): this {
    const before = this.#usage.length;
    this.#usage = this.#usage.filter((u) => u !== flag);
    if (this.#usage.length !== before) this.markAsDirty();
    return this;
  }

  hasUsage(flag: TextureUsage): boolean {
    return this.#usage.includes(flag);
  }

  // Protected hooks: non-abstract before abstract to satisfy ordering
  protected _extraHashKey(): string | undefined {
    return undefined;
  }
  protected abstract _kind(): '2d' | 'cube' | '3d';
}
