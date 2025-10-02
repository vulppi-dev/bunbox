// prettier-multiline-arrays-set-line-pattern: 4

import { Color } from '../math/Color';
import { Node3D } from './Node3D';

/**
 * Light construction properties.
 */
export interface LightProps {
  color?: Color;
  intensity?: number;
  enabled?: boolean;
}

/** Base class for light nodes. Not directly renderable. */
export abstract class AbstractLight extends Node3D<LightProps> {
  #color: Color = new Color(1, 1, 1, 1);
  #intensity: number = 1.0;
  #enabled: boolean = true;

  /**
   * Light color. Alpha channel may be unused by some shading models.
   */
  get color(): Color {
    return this.#color;
  }
  /** Scalar intensity multiplier. */
  get intensity(): number {
    return this.#intensity;
  }
  /** Whether the light participates in lighting calculations. */
  get enabled(): boolean {
    return this.#enabled;
  }

  set color(value: Color) {
    this.#color = value;
    this.markAsDirty();
    this.#color.markAsDirty();
  }
  set intensity(value: number) {
    this.#intensity = value;
    this.markAsDirty();
  }
  set enabled(value: boolean) {
    this.#enabled = value;
    this.markAsDirty();
  }
}
