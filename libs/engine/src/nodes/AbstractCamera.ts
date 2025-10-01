// prettier-multiline-arrays-set-line-pattern: 4

import { Matrix, Quaternion, Vector3, VectorParser } from '../math';
import { Rect } from '../math/Rect';
import { Node3D } from './Node3D';

/**
 * Base camera node holding view/projection matrices and near/far planes.
 * Subclasses implement `_updateProjectionMatrix()`.
 */
export abstract class AbstractCamera extends Node3D {
  #near: number = 0.1;
  #far: number = 1000;

  #viewport: Rect = new Rect();
  #viewMatrix: Matrix = new Matrix();
  #projectionMatrix: Matrix = new Matrix();

  /** Near clipping plane distance (meters). */
  get near(): number {
    return this.#near;
  }
  set near(value: number) {
    this.#near = value;
    this.markAsDirty();
  }

  /** Far clipping plane distance (meters). */
  get far(): number {
    return this.#far;
  }
  set far(value: number) {
    this.#far = value;
    this.markAsDirty();
  }

  /** Camera viewport rectangle (in pixels or normalized units as defined by renderer). */
  get viewport(): Rect {
    return this.#viewport;
  }
  set viewport(value: Rect) {
    this.#viewport = value;
    this.markAsDirty();
  }

  /** View matrix (world-to-camera). */
  get viewMatrix(): Matrix {
    return this.#viewMatrix;
  }
  /** Projection matrix (camera to clip/NDC). */
  get projectionMatrix(): Matrix {
    return this.#projectionMatrix;
  }

  /** Point the camera towards a target in world space, preserving position. */
  lookAt(target: Vector3): void {
    const eye = this.position.clone();
    this.transform.lookAt(eye, target);
    if (this.rotationQ) {
      this.transform.decomposeRotationQ(this.rotationQ);
      this.rotationQ.unmarkAsDirty();
    } else {
      const q = new Quaternion();
      this.transform.decomposeRotationQ(q);
      this.rotation = VectorParser.quaternionToEuler(q, this.rotation.order);
      this.rotation.unmarkAsDirty();
    }
    this.markAsDirty();
  }

  override _update(deltaTime: number): void {
    if (this.isDirty) {
      this._updateProjectionMatrix();
      this.#updateViewMatrix();
    } else if (this.transform.isDirty) {
      this.#updateViewMatrix();
    }

    this.transform.unmarkAsDirty();
  }

  #updateViewMatrix() {
    this.#viewMatrix.copy(this.transform).invert();
  }

  /** Update projection matrix according to subclass parameters. */
  protected abstract _updateProjectionMatrix(): void;
}
