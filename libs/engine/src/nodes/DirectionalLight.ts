// prettier-multiline-arrays-set-line-pattern: 4

import { Vector3 } from '../math/Vector3';
import { AbstractLight } from './AbstractLight';

/**
 * Light that emits parallel rays in a given direction (e.g., sunlight).
 */
export class DirectionalLight extends AbstractLight {
  #direction: Vector3 = new Vector3(0, -1, 0);

  protected override _getType(): string {
    return 'DirectionalLight';
  }

  /** Unit vector indicating light direction in world space. */
  get direction(): Vector3 {
    return this.#direction;
  }

  set direction(value: Vector3) {
    this.#direction = value;
    this.markAsDirty();
    this.#direction.markAsDirty();
  }
}
