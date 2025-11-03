// prettier-multiline-arrays-set-line-pattern: 4

import { AbstractCamera } from './AbstractCamera';

/**
 * Perspective camera with vertical field-of-view and aspect ratio.
 * Fov is in radians.
 */
export class PerspectiveCamera extends AbstractCamera {
  #fov: number = Math.PI * 0.333;
  #aspect: number = 1;

  /** Vertical field of view in radians. */
  get fov(): number {
    return this.#fov;
  }

  /** Aspect ratio (width / height). */
  get aspect(): number {
    return this.#aspect;
  }

  set fov(value: number) {
    this.#fov = value;
    this.markAsDirty();
  }

  set aspect(value: number) {
    this.#aspect = value;
    this.markAsDirty();
  }

  protected override _getType(): string {
    return 'PerspectiveCamera';
  }

  protected override _processProjectionMatrix(): void {
    const a = this.#aspect || 1;
    const n = this.near;
    const fFar = this.far;

    const f = 1 / Math.tan(this.#fov * 0.5);

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
