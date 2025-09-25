// prettier-multiline-arrays-set-line-pattern: 4

import { Color } from '../math/Color';
import { Node3D } from './Node3D';

export interface LightProps {
  color?: Color;
  intensity?: number;
  enabled?: boolean;
}

export abstract class AbstractLight extends Node3D<LightProps> {
  #color: Color = new Color(1, 1, 1, 1);
  #intensity: number = 1.0;
  #enabled: boolean = true;

  get color(): Color {
    return this.#color;
  }
  set color(value: Color) {
    this.#color = value;
    this.markAsDirty();
    this.#color.markAsDirty();
  }

  get intensity(): number {
    return this.#intensity;
  }
  set intensity(value: number) {
    this.#intensity = value;
    this.markAsDirty();
  }

  get enabled(): boolean {
    return this.#enabled;
  }
  set enabled(value: boolean) {
    this.#enabled = value;
    this.markAsDirty();
  }
}
