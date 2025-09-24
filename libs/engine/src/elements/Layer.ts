import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';

/**
 * Layer is a 32-bit bitmask utility for enabling/disabling up to 32 layers (0..31).
 * It extends DirtyState and will mark itself dirty only when the mask actually changes.
 */
export class Layer extends DirtyState {
  /**
   * Internal 32-bit unsigned mask. Default is 255 (bits 0..7 enabled).
   */
  #layerValue = 255 >>> 0;

  /**
   * Validate a layer index is an integer within [0, 31].
   */
  #validateIndex(index: number): void {
    if (!Number.isInteger(index)) {
      throw new Error('Layer index must be an integer.');
    }
    if (index < 0 || index > 31) {
      throw new Error('Layer index must be between 0 and 31.');
    }
  }

  /**
   * Validate a mask is an integer within [0, 0xFFFFFFFF].
   */
  #validateMask(mask: number): void {
    if (!Number.isFinite(mask) || !Number.isInteger(mask)) {
      throw new Error('Layer value must be a finite integer.');
    }
    if (mask < 0 || mask > 0xffffffff) {
      throw new Error('Layer value must be between 0 and 4294967295.');
    }
  }

  /**
   * Check if a specific layer bit is enabled.
   */
  hasLayer(index: number): boolean {
    this.#validateIndex(index);
    // Use unsigned shift to ensure correct semantics
    return ((this.#layerValue >>> index) & 1) === 1;
  }

  /**
   * Enable/disable a specific layer bit.
   */
  setLayer(index: number, state: boolean): this {
    this.#validateIndex(index);
    const before = this.#layerValue >>> 0;
    let next = before;
    if (state) {
      next = before | (1 << index);
    } else {
      next = before & ~(1 << index);
    }
    next >>>= 0; // normalize to uint32
    if (next === before) return this; // no change, avoid dirty
    this.#layerValue = next;
    return this.markAsDirty();
  }

  /**
   * Toggle a specific layer bit.
   */
  toggleLayer(index: number): this {
    this.#validateIndex(index);
    const before = this.#layerValue >>> 0;
    const next = (before ^ (1 << index)) >>> 0;
    if (next === before) return this;
    this.#layerValue = next;
    return this.markAsDirty();
  }

  /**
   * Return the current 32-bit unsigned mask.
   */
  get(): number {
    return this.#layerValue >>> 0;
  }

  /**
   * Replace the current mask with a new value.
   */
  set(value: number): this {
    this.#validateMask(value);
    const next = value >>> 0;
    if (next === this.#layerValue) return this;
    this.#layerValue = next;
    return this.markAsDirty();
  }

  /**
   * Enable all 32 layers (mask = 0xFFFFFFFF).
   */
  enableAll(): this {
    return this.set(0xffffffff);
  }

  /**
   * Disable all layers (mask = 0).
   */
  disableAll(): this {
    return this.set(0);
  }

  /**
   * Copy mask from another Layer.
   */
  copy(l: Layer): this {
    const next = l.#layerValue >>> 0;
    if (next === this.#layerValue) return this;
    this.#layerValue = next;
    return this.markAsDirty();
  }

  /**
   * Create a new Layer with the same mask.
   * Note: keeps previous behavior of returning a dirty clone.
   */
  clone(): this {
    const newLayer = new Layer();
    newLayer.#layerValue = this.#layerValue >>> 0;
    newLayer.markAsDirty();
    return newLayer as this;
  }

  /**
   * Check if there is any overlap between this and another Layer.
   */
  match(layer: Layer): boolean {
    return (this.#layerValue & layer.#layerValue) !== 0;
  }

  /** Stable content hash for caching/reuse (based on mask). */
  get hash(): string {
    // Keep it small and stable; use numeric mask only
    return sha(JSON.stringify({ m: this.#layerValue >>> 0 }), 'hex');
  }

  /**
   * Check if any bit in the provided mask/layer is enabled in this mask.
   */
  hasAny(maskOrLayer: number | Layer): boolean {
    const mask =
      typeof maskOrLayer === 'number'
        ? maskOrLayer >>> 0
        : maskOrLayer.#layerValue >>> 0;
    return (this.#layerValue & mask) !== 0;
  }

  /**
   * Check if all bits in the provided mask/layer are enabled in this mask.
   */
  hasAll(maskOrLayer: number | Layer): boolean {
    const mask =
      typeof maskOrLayer === 'number'
        ? maskOrLayer >>> 0
        : maskOrLayer.#layerValue >>> 0;
    return (this.#layerValue & mask) === mask >>> 0;
  }

  /**
   * Get enabled layer indices as an array (0..31).
   */
  toArray(): number[] {
    const out: number[] = [];
    let m = this.#layerValue >>> 0;
    for (let i = 0; i < 32; i++) {
      if ((m & (1 << i)) !== 0) out.push(i);
    }
    return out;
  }

  /**
   * Set enabled layers from an array of indices (0..31).
   */
  setFromArray(indices: number[]): this {
    if (!Array.isArray(indices)) throw new Error('Indices must be an array.');
    let mask = 0;
    for (const idx of indices) {
      this.#validateIndex(idx);
      mask |= 1 << idx;
    }
    return this.set(mask >>> 0);
  }

  /**
   * Serialize to a primitive number mask.
   */
  toJSON(): number {
    return this.get();
  }

  /**
   * Restore from a primitive number mask.
   */
  fromJSON(mask: number): this {
    return this.set(mask);
  }
}
