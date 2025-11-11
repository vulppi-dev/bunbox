// prettier-multiline-arrays-set-line-pattern: 4

import { AbstractCamera } from './AbstractCamera';

/**
 * Perspective (pinhole) camera with field of view.
 *
 * Objects appear smaller as they get farther away, matching human vision.
 * Most common camera type for 3D games and applications.
 *
 * **Parameters:**
 * - **FOV**: Vertical field of view in radians
 * - **Aspect**: Width / height ratio
 * - **Near/Far**: Clipping planes
 *
 * **Projection:**
 * - Right-handed coordinate system
 * - Column-major matrices
 * - NDC Z range: [0, 1]
 *
 * @example
 * ```ts
 * const camera = new PerspectiveCamera();
 * camera.fov = Math.PI / 3; // 60 degrees
 * camera.aspect = window.innerWidth / window.innerHeight;
 * camera.near = 0.1;
 * camera.far = 1000;
 * camera.position.set(0, 5, 10);
 * camera.lookAt(new Vector3(0, 0, 0));
 * ```
 */
export class PerspectiveCamera extends AbstractCamera {
  private __fov: number = Math.PI * 0.333;
  private __aspect: number = 1;

  /**
   * Vertical field of view in radians.
   *
   * Determines how "zoomed in" the camera is.
   * - Smaller FOV = more zoomed in (telephoto)
   * - Larger FOV = more zoomed out (wide angle)
   *
   * Default: ~60 degrees (PI * 0.333)
   *
   * Common values:
   * - 45°: Math.PI / 4
   * - 60°: Math.PI / 3
   * - 90°: Math.PI / 2
   */
  get fov(): number {
    return this.__fov;
  }

  /**
   * Aspect ratio (width / height).
   *
   * Should match the viewport's aspect ratio to avoid distortion.
   *
   * Default: 1 (square)
   *
   * @example
   * ```ts
   * camera.aspect = canvas.width / canvas.height;
   * ```
   */
  get aspect(): number {
    return this.__aspect;
  }

  /**
   * Set vertical field of view.
   *
   * @param value - FOV in radians (typically 0.5 to 2.0)
   */
  set fov(value: number) {
    this.__fov = value;
    this.markAsDirty();
  }

  /**
   * Set aspect ratio.
   *
   * @param value - Width / height (typically 1.333 to 2.0)
   */
  set aspect(value: number) {
    this.__aspect = value;
    this.markAsDirty();
  }

  /**
   * Compute perspective projection matrix.
   *
   * Creates a perspective projection that maps:
   * - 3D camera space to 2D clip space
   * - Applies perspective divide (objects smaller with distance)
   * - Z: [-near, -far] → [0, 1]
   *
   * Uses vertical FOV and aspect ratio.
   * Right-handed, column-major format.
   *
   * @protected
   * @override
   */
  protected override _processProjectionMatrix(): void {
    const a = this.__aspect || 1;
    const n = this.near;
    const fFar = this.far;

    const f = 1 / Math.tan(this.__fov * 0.5);

    const invNF = 1 / (n - fFar);
    const A = fFar * invNF;
    const B = fFar * n * invNF;

    // Right-handed, column-major, maps z=-near -> 0 and z=-far -> 1
    this.projectionMatrix.set([
      f / a, 0, 0, 0,
      0, f, 0, 0,
      0, 0, A, -1,
      0, 0, B, 0,
    ]);
  }
}
