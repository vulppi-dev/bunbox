// prettier-multiline-arrays-set-line-pattern: 4

import {
  Frustum,
  Matrix,
  Plane,
  Quaternion,
  Vector3,
  VectorParser,
} from '../math';
import { Node3D } from './Node3D';

/**
 * Abstract base class for camera nodes.
 *
 * Provides common camera functionality:
 * - Near/far clipping planes
 * - Projection matrix (subclasses must implement)
 * - View frustum calculation for culling
 * - lookAt() helper for camera orientation
 *
 * **Subclass responsibilities:**
 * - Implement `_processProjectionMatrix()` to compute projection based on camera type
 *
 * @abstract
 *
 * @example
 * ```ts
 * class MyCamera extends AbstractCamera {
 *   protected _processProjectionMatrix(): void {
 *     // Custom projection math
 *     this.projectionMatrix.set([...]);
 *   }
 * }
 * ```
 */
export abstract class AbstractCamera extends Node3D {
  private __near: number = 0.1;
  private __far: number = 1000;

  private __projectionMatrix: Matrix = new Matrix();
  private __frustum: Frustum | null = null;

  /**
   * Near clipping plane distance in meters.
   *
   * Objects closer than this are not rendered.
   * Default: 0.1
   */
  get near(): number {
    return this.__near;
  }

  /**
   * Far clipping plane distance in meters.
   *
   * Objects farther than this are not rendered.
   * Default: 1000
   */
  get far(): number {
    return this.__far;
  }

  /**
   * Projection matrix transforming from camera space to clip space (NDC).
   *
   * Automatically updated when camera parameters change.
   *
   * @readonly Computed by subclass via _processProjectionMatrix()
   */
  get projectionMatrix(): Matrix {
    return this.__projectionMatrix;
  }

  /**
   * Set near clipping plane distance.
   *
   * @param value - Distance in meters (must be > 0)
   */
  set near(value: number) {
    this.__near = value;
    this.markAsDirty();
  }

  /**
   * Set far clipping plane distance.
   *
   * @param value - Distance in meters (must be > near)
   */
  set far(value: number) {
    this.__far = value;
    this.markAsDirty();
  }

  /**
   * Orient the camera to look at a target position in world space.
   *
   * Preserves the camera's position, only adjusts rotation.
   * Updates either rotationQ (if set) or rotation (Euler).
   *
   * @param target - World-space position to look at
   *
   * @example
   * ```ts
   * camera.position.set(10, 5, 10);
   * camera.lookAt(new Vector3(0, 0, 0)); // Look at origin
   * ```
   */
  lookAt(target: Vector3): void {
    const eye = this.position.clone();
    this.transform.lookAt(eye, target);
    if (this.rotationQ) {
      this.transform.decomposeRotationQ(this.rotationQ);
      this.rotationQ.markAsClean();
    } else {
      const q = new Quaternion();
      this.transform.decomposeRotationQ(q);
      this.rotation = VectorParser.quaternionToEuler(q, this.rotation.order);
      this.rotation.markAsClean();
    }
    this.markAsDirty();
  }

  /**
   * Get the view frustum for culling.
   *
   * The frustum represents the 6 planes that bound the camera's visible volume.
   * Used for frustum culling to skip rendering objects outside the view.
   *
   * Frustum is cached and recomputed only when camera or view changes.
   *
   * @param viewMatrix - View matrix (world to camera space transform)
   * @returns Frustum containing 6 bounding planes
   *
   * @example
   * ```ts
   * const viewMatrix = camera.transform.clone().invert();
   * const frustum = camera.getFrustum(viewMatrix);
   *
   * if (frustum.intersectsSphere(objectPos, objectRadius)) {
   *   // Object is visible, render it
   * }
   * ```
   */
  getFrustum(viewMatrix: Matrix): Frustum {
    // Recompute frustum if dirty or not yet created
    if (!this.__frustum || this.isDirty || this.transform.isDirty) {
      this._updateFrustum(viewMatrix);
    }
    return this.__frustum!;
  }

  /**
   * Per-frame processing for camera updates.
   *
   * Recomputes projection matrix when camera parameters change.
   * Invalidates frustum cache to force recomputation.
   *
   * @param _deltaTime - Time since last frame (unused)
   * @override
   */
  override _process(_deltaTime: number): void {
    if (this.isDirty || this.transform.isDirty) {
      this._processProjectionMatrix();
      this.__frustum = null; // Invalidate frustum cache
      this.transform.markAsClean();
      this.markAsClean();
    }
  }

  /**
   * Update frustum planes from view and projection matrices.
   *
   * Extracts the 6 frustum planes from the combined view-projection matrix.
   * Planes are in world space and can be used for culling.
   *
   * @param viewMatrix - View matrix (world to camera transform)
   * @protected
   */
  protected _updateFrustum(viewMatrix: Matrix): void {
    // Compute view-projection matrix
    const vp = this.__projectionMatrix.clone().mulL(viewMatrix);
    const m = vp.toArray();

    // Create frustum if needed
    if (!this.__frustum) {
      this.__frustum = new Frustum();
    }

    // Extract frustum planes from view-projection matrix
    // Left plane: m3 + m0, m7 + m4, m11 + m8, m15 + m12
    this.__frustum.setPlane(
      0,
      new Plane(
        new Vector3(m[3] + m[0], m[7] + m[4], m[11] + m[8]),
        m[15] + m[12],
      ).normalize(),
    );

    // Right plane: m3 - m0, m7 - m4, m11 - m8, m15 - m12
    this.__frustum.setPlane(
      1,
      new Plane(
        new Vector3(m[3] - m[0], m[7] - m[4], m[11] - m[8]),
        m[15] - m[12],
      ).normalize(),
    );

    // Bottom plane: m3 + m1, m7 + m5, m11 + m9, m15 + m13
    this.__frustum.setPlane(
      2,
      new Plane(
        new Vector3(m[3] + m[1], m[7] + m[5], m[11] + m[9]),
        m[15] + m[13],
      ).normalize(),
    );

    // Top plane: m3 - m1, m7 - m5, m11 - m9, m15 - m13
    this.__frustum.setPlane(
      3,
      new Plane(
        new Vector3(m[3] - m[1], m[7] - m[5], m[11] - m[9]),
        m[15] - m[13],
      ).normalize(),
    );

    // Near plane: m3 + m2, m7 + m6, m11 + m10, m15 + m14
    this.__frustum.setPlane(
      4,
      new Plane(
        new Vector3(m[3] + m[2], m[7] + m[6], m[11] + m[10]),
        m[15] + m[14],
      ).normalize(),
    );

    // Far plane: m3 - m2, m7 - m6, m11 - m10, m15 - m14
    this.__frustum.setPlane(
      5,
      new Plane(
        new Vector3(m[3] - m[2], m[7] - m[6], m[11] - m[10]),
        m[15] - m[14],
      ).normalize(),
    );
  }

  /**
   * Update projection matrix according to camera-specific parameters.
   *
   * Subclasses must implement this to compute their projection matrix
   * (e.g., perspective, orthographic, etc.).
   *
   * @abstract
   * @protected
   *
   * @example
   * ```ts
   * protected _processProjectionMatrix(): void {
   *   // Compute perspective projection
   *   const f = 1 / Math.tan(this.fov * 0.5);
   *   this.projectionMatrix.set([...]);
   * }
   * ```
   */
  protected abstract _processProjectionMatrix(): void;
}
