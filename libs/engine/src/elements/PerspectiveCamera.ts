// prettier-multiline-arrays-set-line-pattern: 4

import AbstractCamera from './AbstractCamera';

export default class PerspectiveCamera extends AbstractCamera {
  #fov: number = Math.PI * 0.333;
  #aspect: number = 1;

  get fov(): number {
    return this.#fov;
  }
  set fov(value: number) {
    this.#fov = value;
    this.markAsDirty();
  }

  get aspect(): number {
    return this.#aspect;
  }
  set aspect(value: number) {
    this.#aspect = value;
    this.markAsDirty();
  }

  override _updateProjectionMatrix() {
    const a = this.#aspect;
    const f = 1 / Math.tan(this.#fov * 0.5);
    const nf = 1 / (this.near - this.far);
    const A = (this.near + this.far) * nf;
    const B = 2 * this.near * this.far * nf;

    this.projectionMatrix.set([
      f / a, 0, 0, 0,
      0, f, 0, 0,
      0, 0, A, -1,
      0, 0, B, 0,
    ]);
  }
}
