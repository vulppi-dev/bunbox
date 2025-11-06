import type { Material } from '../builders';
import type { GeometryPointer } from '../managers';
import { Node3D } from './Node3D';

/**
 * Renderable 3D object binding a Geometry and a Material.
 */
export class Mesh extends Node3D {
  #geometry: GeometryPointer | null = null;
  #material: Material | null = null;

  /** Geometry to be rendered (vertex/index data). */
  get geometry(): GeometryPointer | null {
    return this.#geometry;
  }

  /** Material/shader to render the geometry. */
  get material(): Material | null {
    return this.#material;
  }

  /** Set geometry; marks node as dirty. */
  set geometry(value: GeometryPointer | null) {
    this.#geometry = value;
    this.markAsDirty();
  }

  /** Set material; marks node as dirty. */
  set material(value: Material | null) {
    this.#material = value;
    this.markAsDirty();
  }
}
