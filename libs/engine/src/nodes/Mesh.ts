import type { Material } from '../builders';
import type { GeometryPointer } from '../managers';
import { Node3D } from './Node3D';

/**
 * Renderable 3D mesh node combining geometry and material.
 *
 * A Mesh binds:
 * - **Geometry**: Vertex/index data (positions, normals, UVs)
 * - **Material**: Shader, textures, and rendering properties
 *
 * The renderer uses both to draw the mesh on screen.
 *
 * @example
 * ```ts
 * const mesh = new Mesh();
 * mesh.geometry = geometryManager.create(boxGeometry);
 * mesh.material = createMaterial({
 *   shader: 'pbr',
 *   schema: { ... }
 * });
 * mesh.position.set(0, 1, 0);
 * ```
 */
export class Mesh extends Node3D {
  #geometry: GeometryPointer | null = null;
  #material: Material | null = null;

  /**
   * Geometry containing vertex/index data to be rendered.
   *
   * Use GeometryManager to create geometry pointers from Geometry instances.
   */
  get geometry(): GeometryPointer | null {
    return this.#geometry;
  }

  /**
   * Material defining how the geometry is rendered.
   *
   * Includes shader, textures, uniforms, and rasterization state.
   */
  get material(): Material | null {
    return this.#material;
  }

  /**
   * Set the geometry for this mesh.
   *
   * Marks the node as dirty to trigger rendering updates.
   *
   * @param value - Geometry pointer or null to clear
   */
  set geometry(value: GeometryPointer | null) {
    this.#geometry = value;
    this.markAsDirty();
  }

  /**
   * Set the material for this mesh.
   *
   * Marks the node as dirty to trigger rendering updates.
   *
   * @param value - Material instance or null to clear
   */
  set material(value: Material | null) {
    this.#material = value;
    this.markAsDirty();
  }
}
