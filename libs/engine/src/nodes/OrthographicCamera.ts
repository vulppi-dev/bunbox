// prettier-multiline-arrays-set-line-pattern: 4

import { Vector2 } from '../math';
import { AbstractCamera } from './AbstractCamera';

/**
 * Orthographic (parallel projection) camera.
 *
 * Objects appear the same size regardless of distance.
 * Useful for:
 * - 2D games and UI
 * - CAD/technical visualization
 * - Isometric/top-down views
 *
 * **Projection:**
 * - Right-handed coordinate system
 * - Column-major matrices
 * - NDC Z range: [0, 1]
 *
 * @example
 * ```ts
 * const camera = new OrthographicCamera();
 * camera.horizontal.set(-10, 10); // Left: -10, Right: 10
 * camera.vertical.set(-10, 10);   // Bottom: -10, Top: 10
 * camera.near = 0.1;
 * camera.far = 1000;
 * ```
 */
export class OrthographicCamera extends AbstractCamera {
  #horizontal: Vector2 = new Vector2(-1, 1);
  #vertical: Vector2 = new Vector2(-1, 1);

  /**
   * Horizontal extents [left, right].
   *
   * Defines the X range of the camera's view volume.
   * Default: [-1, 1]
   */
  get horizontal(): Vector2 {
    return this.#horizontal;
  }

  /**
   * Vertical extents [bottom, top].
   *
   * Defines the Y range of the camera's view volume.
   * Default: [-1, 1]
   */
  get vertical(): Vector2 {
    return this.#vertical;
  }

  /**
   * Top edge of the view volume.
   *
   * Shortcut for vertical.y
   */
  get top(): number {
    return this.#vertical.y;
  }

  /**
   * Right edge of the view volume.
   *
   * Shortcut for horizontal.x
   */
  get right(): number {
    return this.#horizontal.x;
  }

  /**
   * Bottom edge of the view volume.
   *
   * Shortcut for vertical.x
   */
  get bottom(): number {
    return this.#vertical.x;
  }

  /**
   * Left edge of the view volume.
   *
   * Shortcut for horizontal.y
   */
  get left(): number {
    return this.#horizontal.y;
  }

  /**
   * Set horizontal extents [left, right].
   *
   * @param value - New horizontal extents
   */
  set horizontal(value: Vector2) {
    this.#horizontal = value;
    this.#horizontal.markAsDirty();
    this.markAsDirty();
  }

  /**
   * Set vertical extents [bottom, top].
   *
   * @param value - New vertical extents
   */
  set vertical(value: Vector2) {
    this.#vertical = value;
    this.#vertical.markAsDirty();
    this.markAsDirty();
  }

  /**
   * Set top edge of the view volume.
   *
   * @param value - Top extent
   */
  set top(value: number) {
    this.#vertical.y = value;
    this.markAsDirty();
  }

  /**
   * Set right edge of the view volume.
   *
   * @param value - Right extent
   */
  set right(value: number) {
    this.#horizontal.x = value;
    this.markAsDirty();
  }

  /**
   * Set bottom edge of the view volume.
   *
   * @param value - Bottom extent
   */
  set bottom(value: number) {
    this.#vertical.x = value;
    this.markAsDirty();
  }

  /**
   * Set left edge of the view volume.
   *
   * @param value - Left extent
   */
  set left(value: number) {
    this.#horizontal.y = value;
    this.markAsDirty();
  }

  /**
   * Per-frame processing to update projection matrix.
   *
   * Recomputes projection when horizontal/vertical extents change.
   *
   * @param deltaTime - Time since last frame
   * @override
   */
  override _process(deltaTime: number): void {
    if (this.#horizontal.isDirty || this.#vertical.isDirty) {
      this._processProjectionMatrix();
      this.#horizontal.markAsClean();
      this.#vertical.markAsClean();
    }

    super._process(deltaTime);
  }

  /**
   * Compute orthographic projection matrix.
   *
   * Creates a parallel projection matrix that maps:
   * - X: [left, right] → [-1, 1]
   * - Y: [bottom, top] → [-1, 1]
   * - Z: [-near, -far] → [0, 1]
   *
   * Right-handed, column-major format.
   *
   * @protected
   * @override
   */
  protected override _processProjectionMatrix(): void {
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
}
