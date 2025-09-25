// prettier-multiline-arrays-set-line-pattern: 4

import { AbstractLight } from './AbstractLight';

export class PointLight extends AbstractLight {
  #range: number = 10.0; // meters

  protected override _getType(): string {
    return 'PointLight';
  }

  get range(): number {
    return this.#range;
  }

  set range(value: number) {
    this.#range = value;
    this.markAsDirty();
  }
}
