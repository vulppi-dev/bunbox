import type { EventMap } from '@bunbox/utils';
import { Node } from '../core';
import { MaskHelper } from '../elements';
import { Euler, Matrix, type Quaternion, Vector3 } from '../math';

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

  /** Local transform matrix (compose of position, scale, rotation). */
  get transform(): Matrix {
    return this.#matrix;
  }

  /** Local position (meters). */
  get position(): Vector3 {
    return this.#position;
  }

  /** Local non-uniform scale. */
  get scale(): Vector3 {
    return this.#scale;
  }

  /** Local Euler rotation (radians). */
  get rotation(): Euler {
    return this.#rotation;
  }

  /** Optional local Quaternion rotation (if set, overrides Euler on compose). */
  get rotationQ(): Quaternion | null {
    return this.#rotationQ;
  }

  /** Layer mask helper to include/exclude from specific render passes. */
  get layer(): MaskHelper {
    return this.#layer;
  }

  /** Replace the local transform matrix. Marks node and matrix dirty. */
  set transform(transform: Matrix) {
    this.#matrix = transform;
    this.markAsDirty();
    this.#matrix.markAsDirty();
  }

  /** Set local position and mark as dirty. */
  set position(position: Vector3) {
    this.#position = position;
    this.markAsDirty();
    this.#position.markAsDirty();
  }

  /** Set local scale and mark as dirty. */
  set scale(scale: Vector3) {
    this.#scale = scale;
    this.markAsDirty();
    this.#scale.markAsDirty();
  }

  /** Set local Euler rotation and mark as dirty. */
  set rotation(rotation: Euler) {
    this.#rotation = rotation;
    this.markAsDirty();
    this.#rotation.markAsDirty();
  }

  /** Set local Quaternion rotation; passing null reverts to Euler. */
  set rotationQ(rotationQ: Quaternion | null) {
    this.#rotationQ = rotationQ;
    this.markAsDirty();
    this.#rotationQ?.markAsDirty();
  }

  /** Recompose local transform if any component changed since last frame. */
  override _process(_delta: number): void {
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

      this.#position.markAsClean();
      this.#scale.markAsClean();
      this.#rotation.markAsClean();
      this.#rotationQ?.markAsClean();
    }
  }

  protected override _getType(): string {
    return 'Node3D';
  }
}
