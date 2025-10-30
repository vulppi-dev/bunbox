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
 * Base camera node holding view/projection matrices and near/far planes.
 * Subclasses implement `_updateProjectionMatrix()`.
 */
export abstract class AbstractCamera extends Node3D {
  #near: number = 0.1;
  #far: number = 1000;

  #projectionMatrix: Matrix = new Matrix();
  #frustum: Frustum | null = null;

  /** Near clipping plane distance (meters). */
  get near(): number {
    return this.#near;
  }
  /** Far clipping plane distance (meters). */
  get far(): number {
    return this.#far;
  }
  /** Projection matrix (camera to clip/NDC). */
  get projectionMatrix(): Matrix {
    return this.#projectionMatrix;
  }

  set near(value: number) {
    this.#near = value;
    this.markAsDirty();
  }
  set far(value: number) {
    this.#far = value;
    this.markAsDirty();
  }

  /** Point the camera towards a target in world space, preserving position. */
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
   * Get the view frustum for this camera.
   * The frustum is computed from view and projection matrices.
   * @param viewMatrix The view matrix (world to camera space)
   * @returns Frustum for culling
   */
  getFrustum(viewMatrix: Matrix): Frustum {
    // Recompute frustum if dirty or not yet created
    if (!this.#frustum || this.isDirty || this.transform.isDirty) {
      this._updateFrustum(viewMatrix);
    }
    return this.#frustum!;
  }

  override _update(_deltaTime: number): void {
    if (this.isDirty || this.transform.isDirty) {
      this._updateProjectionMatrix();
      this.#frustum = null; // Invalidate frustum cache
      this.transform.markAsClean();
      this.markAsClean();
    }
  }

  /**
   * Update frustum planes from view and projection matrices.
   * Extracts the 6 frustum planes from the view-projection matrix.
   */
  protected _updateFrustum(viewMatrix: Matrix): void {
    // Compute view-projection matrix
    const vp = this.#projectionMatrix.clone().mulL(viewMatrix);
    const m = vp.toArray();

    // Create frustum if needed
    if (!this.#frustum) {
      this.#frustum = new Frustum();
    }

    // Extract frustum planes from view-projection matrix
    // Left plane: m3 + m0, m7 + m4, m11 + m8, m15 + m12
    this.#frustum.setPlane(
      0,
      new Plane(
        new Vector3(m[3] + m[0], m[7] + m[4], m[11] + m[8]),
        m[15] + m[12],
      ).normalize(),
    );

    // Right plane: m3 - m0, m7 - m4, m11 - m8, m15 - m12
    this.#frustum.setPlane(
      1,
      new Plane(
        new Vector3(m[3] - m[0], m[7] - m[4], m[11] - m[8]),
        m[15] - m[12],
      ).normalize(),
    );

    // Bottom plane: m3 + m1, m7 + m5, m11 + m9, m15 + m13
    this.#frustum.setPlane(
      2,
      new Plane(
        new Vector3(m[3] + m[1], m[7] + m[5], m[11] + m[9]),
        m[15] + m[13],
      ).normalize(),
    );

    // Top plane: m3 - m1, m7 - m5, m11 - m9, m15 - m13
    this.#frustum.setPlane(
      3,
      new Plane(
        new Vector3(m[3] - m[1], m[7] - m[5], m[11] - m[9]),
        m[15] - m[13],
      ).normalize(),
    );

    // Near plane: m3 + m2, m7 + m6, m11 + m10, m15 + m14
    this.#frustum.setPlane(
      4,
      new Plane(
        new Vector3(m[3] + m[2], m[7] + m[6], m[11] + m[10]),
        m[15] + m[14],
      ).normalize(),
    );

    // Far plane: m3 - m2, m7 - m6, m11 - m10, m15 - m14
    this.#frustum.setPlane(
      5,
      new Plane(
        new Vector3(m[3] - m[2], m[7] - m[6], m[11] - m[10]),
        m[15] - m[14],
      ).normalize(),
    );
  }

  /** Update projection matrix according to subclass parameters. */
  protected abstract _updateProjectionMatrix(): void;
}
