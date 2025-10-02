import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';

/**
 * MaskHelper is a 32-bit bitmask utility for enabling/disabling up to 32 bits (0..31).
 * It extends DirtyState and will mark itself dirty only when the mask actually changes.
 */
export class MaskHelper extends DirtyState {
  /** Internal 32-bit unsigned mask. Default is 255 (bits 0..7 enabled). */
  #value = 255 >>> 0;

  // Validation helpers
  #validateIndex(index: number): void {
    if (!Number.isInteger(index))
      throw new Error('Mask index must be an integer.');
    if (index < 0 || index > 31)
      throw new Error('Mask index must be between 0 and 31.');
  }
  #validateMask(mask: number): void {
    if (!Number.isFinite(mask) || !Number.isInteger(mask))
      throw new Error('Mask value must be a finite integer.');
    if (mask < 0 || mask > 0xffffffff)
      throw new Error('Mask value must be between 0 and 4294967295.');
  }

  /** Stable content hash for caching/reuse (based on mask). */
  get hash(): string {
    return sha(JSON.stringify({ m: this.#value >>> 0 }), 'hex');
  }

  // Bit queries
  has(index: number): boolean {
    this.#validateIndex(index);
    return ((this.#value >>> index) & 1) === 1;
  }
  // Back-compat alias from former Layer API
  hasLayer(index: number): boolean {
    return this.has(index);
  }

  // Mutations
  setBit(index: number, state: boolean): this {
    this.#validateIndex(index);
    const before = this.#value >>> 0;
    let next = before;
    if (state) next = before | (1 << index);
    else next = before & ~(1 << index);
    next >>>= 0;
    if (next === before) return this;
    this.#value = next;
    return this.markAsDirty();
  }
  // Back-compat alias
  setLayer(index: number, state: boolean): this {
    return this.setBit(index, state);
  }

  toggle(index: number): this {
    this.#validateIndex(index);
    const before = this.#value >>> 0;
    const next = (before ^ (1 << index)) >>> 0;
    if (next === before) return this;
    this.#value = next;
    return this.markAsDirty();
  }
  // Back-compat alias
  toggleLayer(index: number): this {
    return this.toggle(index);
  }

  // Whole-mask accessors
  get(): number {
    return this.#value >>> 0;
  }
  set(value: number): this {
    this.#validateMask(value);
    const next = value >>> 0;
    if (next === this.#value) return this;
    this.#value = next;
    return this.markAsDirty();
  }

  enableAll(): this {
    return this.set(0xffffffff);
  }
  disableAll(): this {
    return this.set(0);
  }

  copy(m: MaskHelper): this {
    const next = m.#value >>> 0;
    if (next === this.#value) return this;
    this.#value = next;
    return this.markAsDirty();
  }

  clone(): this {
    const n = new MaskHelper();
    n.#value = this.#value >>> 0;
    n.markAsDirty();
    return n as this;
  }

  /** Check if there is any overlap between this and another mask. */
  overlaps(mask: MaskHelper): boolean {
    return (this.#value & mask.#value) !== 0;
  }
  // Back-compat alias
  match(layer: MaskHelper): boolean {
    return this.overlaps(layer);
  }

  hasAny(maskOrHelper: number | MaskHelper): boolean {
    const mask =
      typeof maskOrHelper === 'number'
        ? maskOrHelper >>> 0
        : maskOrHelper.#value >>> 0;
    return (this.#value & mask) !== 0;
  }

  hasAll(maskOrHelper: number | MaskHelper): boolean {
    const mask =
      typeof maskOrHelper === 'number'
        ? maskOrHelper >>> 0
        : maskOrHelper.#value >>> 0;
    return (this.#value & mask) === mask >>> 0;
  }

  toArray(): number[] {
    const out: number[] = [];
    const m = this.#value >>> 0;
    for (let i = 0; i < 32; i++) if ((m & (1 << i)) !== 0) out.push(i);
    return out;
  }

  setFromArray(indices: number[]): this {
    if (!Array.isArray(indices)) throw new Error('Indices must be an array.');
    let mask = 0;
    for (const idx of indices) {
      this.#validateIndex(idx);
      mask |= 1 << idx;
    }
    return this.set(mask >>> 0);
  }

  toJSON(): number {
    return this.get();
  }
  fromJSON(mask: number): this {
    return this.set(mask);
  }

  override toString(): string {
    return `MaskHelper(0x${(this.#value >>> 0).toString(16).padStart(8, '0')})`;
  }
}
