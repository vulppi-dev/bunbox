import type { EventMap } from '@bunbox/utils';
import { Node } from '../core';
import { Euler, Matrix, Quaternion, Vector3 } from '../math';
import { MaskHelper } from '../elements';

/**
 * Base 3D node with transform and layer mask support.
 *
 * Conventions:
 * - Right-handed orientation; rotations follow engine defaults (Euler ZYX by default elsewhere; this node uses 'yzx' initial order).
 * - Matrices are 4x4 column-major.
 *
 * Lifecycle:
 * - On `_update`, if any component of the transform is dirty, the local matrix is recomposed.
 */
export class Node3D<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends Node<P, M, T> {
  #matrix: Matrix = new Matrix();
  #position: Vector3 = new Vector3();
  #scale: Vector3 = new Vector3(1, 1, 1);
  #rotation: Euler = new Euler(0, 0, 0, 'yzx');
  #rotationQ: Quaternion | null = null;

  #layer: MaskHelper = new MaskHelper();

  protected override _getType(): string {
    return 'Node3D';
  }

  /** Local transform matrix (compose of position, scale, rotation). */
  get transform(): Matrix {
    return this.#matrix;
  }

  /** Replace the local transform matrix. Marks node and matrix dirty. */
  set transform(transform: Matrix) {
    this.#matrix = transform;
    this.markAsDirty();
    this.#matrix.markAsDirty();
  }

  /** Local position (meters). */
  get position(): Vector3 {
    return this.#position;
  }

  /** Set local position and mark as dirty. */
  set position(position: Vector3) {
    this.#position = position;
    this.markAsDirty();
    this.#position.markAsDirty();
  }

  /** Local non-uniform scale. */
  get scale(): Vector3 {
    return this.#scale;
  }

  /** Set local scale and mark as dirty. */
  set scale(scale: Vector3) {
    this.#scale = scale;
    this.markAsDirty();
    this.#scale.markAsDirty();
  }

  /** Local Euler rotation (radians). */
  get rotation(): Euler {
    return this.#rotation;
  }

  /** Set local Euler rotation and mark as dirty. */
  set rotation(rotation: Euler) {
    this.#rotation = rotation;
    this.markAsDirty();
    this.#rotation.markAsDirty();
  }

  /** Optional local Quaternion rotation (if set, overrides Euler on compose). */
  get rotationQ(): Quaternion | null {
    return this.#rotationQ;
  }

  /** Set local Quaternion rotation; passing null reverts to Euler. */
  set rotationQ(rotationQ: Quaternion | null) {
    this.#rotationQ = rotationQ;
    this.markAsDirty();
    this.#rotationQ?.markAsDirty();
  }

  /** Layer mask helper to include/exclude from specific render passes. */
  get layer(): MaskHelper {
    return this.#layer;
  }

  /** Recompose local transform if any component changed since last frame. */
  override _update(_: number): void {
    if (
      this.#position.isDirty ||
      this.#scale.isDirty ||
      this.#rotation.isDirty ||
      this.#rotationQ?.isDirty
    ) {
      this.#matrix.compose(
        this.#position,
        this.#scale,
        this.#rotationQ || this.#rotation,
      );

      this.#position.unmarkAsDirty();
      this.#scale.unmarkAsDirty();
      this.#rotation.unmarkAsDirty();
      this.#rotationQ?.unmarkAsDirty();
    }
  }
}
