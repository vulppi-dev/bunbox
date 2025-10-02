// prettier-multiline-arrays-set-line-pattern: 4

import { AbstractLight } from './AbstractLight';

/** Omnidirectional point light with inverse-square falloff (implementation-defined). */
export class PointLight extends AbstractLight {
  #range: number = 10.0; // meters

  /** Effective radius where contribution becomes negligible (engine-dependent). */
  get range(): number {
    return this.#range;
  }

  set range(value: number) {
    this.#range = value;
    this.markAsDirty();
  }

  protected override _getType(): string {
    return 'PointLight';
  }
}
