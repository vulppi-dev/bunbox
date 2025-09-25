// prettier-multiline-arrays-set-line-pattern: 4

import { Vector3 } from '../math/Vector3';
import { AbstractLight } from './AbstractLight';

export class DirectionalLight extends AbstractLight {
  #direction: Vector3 = new Vector3(0, -1, 0);

  protected override _getType(): string {
    return 'DirectionalLight';
  }

  get direction(): Vector3 {
    return this.#direction;
  }

  set direction(value: Vector3) {
    this.#direction = value;
    this.markAsDirty();
    this.#direction.markAsDirty();
  }
}
