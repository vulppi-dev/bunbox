import type { Geometry } from './Geometry';
import type { Material } from './Material';
import { Node3D } from './Node3D';

export class Mesh extends Node3D {
  #geometry: Geometry | null = null;
  #materials: Material[] = [];

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
