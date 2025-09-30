import type { Geometry, Material } from '../elements';
import { Node3D } from './Node3D';

export class Mesh extends Node3D {
  #geometry: Geometry | null = null;
  #material: Material | null = null;

  protected override _getType(): string {
    return 'Mesh';
  }

  get geometry(): Geometry | null {
    return this.#geometry;
  }

  set geometry(value: Geometry | null) {
    this.#geometry = value;
    this.markAsDirty();
  }

  get material(): Material | null {
    return this.#material;
  }

  set material(value: Material | null) {
    this.#material = value;
    this.markAsDirty();
  }
}
