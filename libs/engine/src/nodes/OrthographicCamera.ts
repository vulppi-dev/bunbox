// prettier-multiline-arrays-set-line-pattern: 4

import { Vector2 } from '../math';
import { AbstractCamera } from './AbstractCamera';

/**
 * Orthographic camera with configurable horizontal/vertical extents.
 * Right-handed, column-major, NDC Z in [0,1].
 */
export class OrthographicCamera extends AbstractCamera {
  #horizontal: Vector2 = new Vector2(-1, 1);
  #vertical: Vector2 = new Vector2(-1, 1);

  /** Horizontal extents as [left, right]. */
  get horizontal(): Vector2 {
    return this.#horizontal;
  }

  /** Vertical extents as [bottom, top]. */
  get vertical(): Vector2 {
    return this.#vertical;
  }

  /** Top extent. */
  get top(): number {
    return this.#vertical.y;
  }

  /** Right extent. */
  get right(): number {
    return this.#horizontal.x;
  }

  /** Bottom extent. */
  get bottom(): number {
    return this.#vertical.x;
  }

  /** Left extent. */
  get left(): number {
    return this.#horizontal.y;
  }

  set horizontal(value: Vector2) {
    this.#horizontal = value;
    this.markAsDirty();
  }

  set vertical(value: Vector2) {
    this.#vertical = value;
    this.markAsDirty();
  }

  set top(value: number) {
    this.#vertical.y = value;
    this.markAsDirty();
  }

  set right(value: number) {
    this.#horizontal.x = value;
    this.markAsDirty();
  }

  set bottom(value: number) {
    this.#vertical.x = value;
    this.markAsDirty();
  }

  set left(value: number) {
    this.#horizontal.y = value;
    this.markAsDirty();
  }

  override _update(deltaTime: number): void {
    super._update(deltaTime);

    if (this.#horizontal.isDirty || this.#vertical.isDirty) {
      this._updateProjectionMatrix();
    }
  }

  protected override _updateProjectionMatrix(): void {
    // Right-handed orthographic, column-major, NDC Z in [0, 1]
    const l = this.left;
    const r = this.right;
    const b = this.bottom;
    const t = this.top;
    const n = this.near;
    const f = this.far;

    let dh = r - l;
    let dv = t - b;
    // Avoid division by zero in degenerate frustums
    if (dh === 0) dh = 1e-6;
    if (dv === 0) dv = 1e-6;

    const invNF = 1 / (n - f);

    // Maps x in [l,r] to [-1,1], y in [b,t] to [-1,1], z in [-n,-f] to [0,1]
    this.projectionMatrix.set([
      // col 0
      2 / dh, 0, 0, 0,
      // col 1
      0, 2 / dv, 0, 0,
      // col 2 (maps z=-n -> 0, z=-f -> 1)
      0, 0, 1 * invNF, 0,
      // col 3 (translation)
      -(r + l) / dh, -(t + b) / dv, n * invNF, 1,
    ]);
  }

  protected override _getType(): string {
    return 'OrthographicCamera';
  }
}
