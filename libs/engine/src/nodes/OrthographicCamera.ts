// prettier-multiline-arrays-set-line-pattern: 4

import { Vector2 } from '../math';
import AbstractCamera from './AbstractCamera';

export default class OrthographicCamera extends AbstractCamera {
  #horizontal: Vector2 = new Vector2(-1, 1);
  #vertical: Vector2 = new Vector2(-1, 1);

  get horizontal(): Vector2 {
    return this.#horizontal;
  }
  set horizontal(value: Vector2) {
    this.#horizontal = value;
    this.markAsDirty();
  }

  get vertical(): Vector2 {
    return this.#vertical;
  }
  set vertical(value: Vector2) {
    this.#vertical = value;
    this.markAsDirty();
  }

  get top(): number {
    return this.#vertical.y;
  }
  set top(value: number) {
    this.#vertical.y = value;
    this.markAsDirty();
  }

  get right(): number {
    return this.#horizontal.x;
  }
  set right(value: number) {
    this.#horizontal.x = value;
    this.markAsDirty();
  }

  get bottom(): number {
    return this.#vertical.x;
  }
  set bottom(value: number) {
    this.#vertical.x = value;
    this.markAsDirty();
  }

  get left(): number {
    return this.#horizontal.y;
  }
  set left(value: number) {
    this.#horizontal.y = value;
    this.markAsDirty();
  }

  override _render(deltaTime: number): void {
    super._render(deltaTime);

    if (this.#horizontal.isDirty || this.#vertical.isDirty) {
      this._updateProjectionMatrix();
    }
  }

  override _updateProjectionMatrix() {
    const dh = this.right - this.left;
    const dv = this.top - this.bottom;
    const [
      n, f,
    ] = [
      this.near, this.far,
    ];
    const nf = n - f;

    this.projectionMatrix.set([
      2 / dh, 0, 0, 0,
      0, 2 / dv, 0, 0,
      0, 0, 1 / nf, 0,
      -(this.right + this.left) / dh, -(this.top + this.bottom) / dv, n / nf, 1,
    ]);
  }
}
