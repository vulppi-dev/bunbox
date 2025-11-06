import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';

/**
 * 32-bit bitmask utility for layer management and visibility control.
 *
 * Provides efficient bit manipulation for enabling/disabling up to 32 flags (bits 0-31).
 * Commonly used for:
 * - Render layer masks
 * - Collision layers in physics
 * - Visibility flags
 * - Feature toggles
 *
 * Extends {@link DirtyState} to track when the mask changes, enabling efficient
 * GPU buffer updates.
 *
 * **Default State:** Bits 0-7 enabled (mask value 255)
 *
 * @extends {DirtyState}
 *
 * @example
 * ```ts
 * const mask = new MaskHelper();
 *
 * // Check if bit 0 is enabled
 * console.log(mask.has(0)); // true (default includes bits 0-7)
 *
 * // Enable bit 10
 * mask.setBit(10, true);
 *
 * // Disable bit 3
 * mask.setBit(3, false);
 *
 * // Toggle bit 5
 * mask.toggle(5);
 *
 * // Get numeric value
 * console.log(mask.value); // 32-bit unsigned integer
 * ```
 *
 * @example
 * ```ts
 * // Using with render layers
 * const cameraLayers = new MaskHelper();
 * cameraLayers.setBit(0, true);  // UI layer
 * cameraLayers.setBit(1, true);  // World layer
 * cameraLayers.setBit(2, false); // Shadow layer
 *
 * const objectLayers = new MaskHelper();
 * objectLayers.setBit(1, true);  // World layer
 *
 * // Check if object is visible to camera
 * if (cameraLayers.match(objectLayers)) {
 *   console.log('Object is visible');
 * }
 * ```
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

  /**
   * Compute stable content hash for mask value.
   *
   * Used for resource deduplication and caching.
   *
   * @returns Hex string representing the mask state
   */
  get hash(): string {
    return sha(JSON.stringify({ m: this.#value >>> 0 }), 'hex');
  }

  // Bit queries

  /**
   * Check if a specific bit is enabled.
   *
   * @param index - Bit index [0, 31]
   * @returns true if bit is set, false otherwise
   * @throws Error if index is out of range or not an integer
   *
   * @example
   * ```ts
   * mask.setBit(5, true);
   * console.log(mask.has(5)); // true
   * console.log(mask.has(6)); // false (if not set)
   * ```
   */
  has(index: number): boolean {
    this.#validateIndex(index);
    return ((this.#value >>> index) & 1) === 1;
  }
  /**
   * Legacy alias for {@link has}.
   * @deprecated Use {@link has} instead
   */
  hasLayer(index: number): boolean {
    return this.has(index);
  }

  // Mutations

  /**
   * Enable or disable a specific bit.
   *
   * Only marks as dirty if the bit value actually changes.
   *
   * @param index - Bit index [0, 31]
   * @param state - true to enable, false to disable
   * @returns this for chaining
   * @throws Error if index is out of range
   *
   * @example
   * ```ts
   * mask.setBit(3, true);   // Enable bit 3
   * mask.setBit(7, false);  // Disable bit 7
   * ```
   */
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
  /**
   * Legacy alias for {@link setBit}.
   * @deprecated Use {@link setBit} instead
   */
  setLayer(index: number, state: boolean): this {
    return this.setBit(index, state);
  }

  /**
   * Toggle a specific bit (flip its state).
   *
   * @param index - Bit index [0, 31]
   * @returns this for chaining
   * @throws Error if index is out of range
   *
   * @example
   * ```ts
   * mask.setBit(5, true);
   * mask.toggle(5); // Now false
   * mask.toggle(5); // Now true again
   * ```
   */
  toggle(index: number): this {
    this.#validateIndex(index);
    const before = this.#value >>> 0;
    const next = (before ^ (1 << index)) >>> 0;
    if (next === before) return this;
    this.#value = next;
    return this.markAsDirty();
  }
  /**
   * Legacy alias for {@link toggle}.
   * @deprecated Use {@link toggle} instead
   */
  toggleLayer(index: number): this {
    return this.toggle(index);
  }

  // Whole-mask accessors

  /**
   * Get the current mask as a 32-bit unsigned integer.
   *
   * @returns Mask value [0, 4294967295]
   */
  get(): number {
    return this.#value >>> 0;
  }
  /**
   * Set the entire mask value at once.
   *
   * Only marks as dirty if value actually changes.
   *
   * @param value - New mask value (32-bit unsigned integer)
   * @returns this for chaining
   * @throws Error if value is not a valid 32-bit unsigned integer
   *
   * @example
   * ```ts
   * mask.set(0b00001111); // Enable bits 0-3
   * mask.set(255);        // Enable bits 0-7
   * mask.set(0xFFFFFFFF); // Enable all bits
   * ```
   */
  set(value: number): this {
    this.#validateMask(value);
    const next = value >>> 0;
    if (next === this.#value) return this;
    this.#value = next;
    return this.markAsDirty();
  }

  /**
   * Enable all 32 bits.
   *
   * @returns this for chaining
   */
  enableAll(): this {
    return this.set(0xffffffff);
  }

  /**
   * Disable all 32 bits (set mask to 0).
   *
   * @returns this for chaining
   */
  disableAll(): this {
    return this.set(0);
  }

  /**
   * Copy mask value from another MaskHelper.
   *
   * @param m - Source mask to copy from
   * @returns this for chaining
   */
  copy(m: MaskHelper): this {
    const next = m.#value >>> 0;
    if (next === this.#value) return this;
    this.#value = next;
    return this.markAsDirty();
  }

  /**
   * Create a deep clone of this mask.
   *
   * @returns New MaskHelper instance with same value
   */
  clone(): this {
    const n = new MaskHelper();
    n.#value = this.#value >>> 0;
    n.markAsDirty();
    return n as this;
  }

  /**
   * Check if there is any overlap (common bits) between this and another mask.
   *
   * Used for layer visibility checks: if camera layers overlap with object layers,
   * the object should be rendered.
   *
   * @param mask - Other mask to check against
   * @returns true if any bits are enabled in both masks
   *
   * @example
   * ```ts
   * const mask1 = new MaskHelper();
   * mask1.set(0b00001111); // Bits 0-3
   *
   * const mask2 = new MaskHelper();
   * mask2.set(0b11110000); // Bits 4-7
   *
   * console.log(mask1.overlaps(mask2)); // false (no overlap)
   *
   * mask2.setBit(2, true); // Enable bit 2 on mask2
   * console.log(mask1.overlaps(mask2)); // true (bit 2 in common)
   * ```
   */
  overlaps(mask: MaskHelper): boolean {
    return (this.#value & mask.#value) !== 0;
  }
  /**
   * Legacy alias for {@link overlaps}.
   * @deprecated Use {@link overlaps} instead
   */
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
