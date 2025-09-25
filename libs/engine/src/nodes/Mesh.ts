import type { Geometry, Material } from '../elements';
import { Node3D } from './Node3D';

export class Mesh extends Node3D {
  #geometry: Geometry | null = null;
  #materials: Material[] = [];

  protected override _getType(): string {
    return 'Mesh';
  }

  get geometry() {
    return this.#geometry;
  }

  set geometry(value: Geometry | null) {
    this.#geometry = value;
    this.markAsDirty();
  }

  get materials() {
    return this.#materials;
  }

  set materials(value: Material[]) {
    this.#materials = value;
    this.markAsDirty();
  }
}
