import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import { ulid } from 'ulid';
import type { TextureFormat, SampleCount, TextureUsage } from './types';

export interface TextureBaseDescriptor {
  label?: string;
  width: number;
  height: number;
  /** @default 1 */
  mipLevels?: number;
  /** @default 1 */
  sampleCount?: SampleCount;
  /** @default rgba8unorm */
  format?: TextureFormat;
  /**
   * Bitmask defining allowed usages of the texture.
   * Represented as string usages for clarity.
   * @default ['sampler', 'color-target']
   */
  usage?: TextureUsage[];
}

export abstract class TextureBase extends DirtyState {
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

  get id() {
    return this.#id;
  }
  get label() {
    return this.#label;
  }
  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }
  get mipLevels() {
    return this.#mipLevels;
  }
  get sampleCount() {
    return this.#sampleCount;
  }
  get format() {
    return this.#format;
  }
  // Usage as string array + numeric mapper
  get usage(): readonly TextureUsage[] {
    return Object.freeze(this.#usage.slice());
  }
  get isDepthFormat(): boolean {
    return this.#format.startsWith('depth');
  }
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
  // Subclass-provided getters (place before setters to satisfy ordering)
  // Must be provided by subclasses (getters before protected methods)
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
