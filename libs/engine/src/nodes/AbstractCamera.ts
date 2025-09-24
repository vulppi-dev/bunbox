// prettier-multiline-arrays-set-line-pattern: 4

import { Matrix, Quaternion, Vector3, VectorParser } from '../math';
import { Rect } from '../math/Rect';
import { Node3D } from './Node3D';

export default abstract class AbstractCamera extends Node3D {
  #near: number = 0.1;
  #far: number = 1000;

  #viewport: Rect = new Rect();
  #viewMatrix: Matrix = new Matrix();
  #projectionMatrix: Matrix = new Matrix();

  get near(): number {
    return this.#near;
  }
  set near(value: number) {
    this.#near = value;
    this.markAsDirty();
  }

  get far(): number {
    return this.#far;
  }
  set far(value: number) {
    this.#far = value;
    this.markAsDirty();
  }

  get viewport(): Rect {
    return this.#viewport;
  }
  set viewport(value: Rect) {
    this.#viewport = value;
    this.markAsDirty();
  }

  get viewMatrix(): Matrix {
    return this.#viewMatrix;
  }
  get projectionMatrix(): Matrix {
    return this.#projectionMatrix;
  }

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

  override _render(deltaTime: number): void {
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

  protected abstract _updateProjectionMatrix(): void;
}
