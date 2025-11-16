import type { EventMap } from '@bunbox/utils';
import { MaskHelper } from '../resources';
import { Euler, Matrix, type Quaternion, Vector3 } from '../math';
import { Node } from '@bunbox/tree';

/**
 * Base 3D node with spatial transform and layer mask support.
 *
 * Provides position, rotation (Euler or Quaternion), and scale in 3D space.
 * Automatically maintains a transform matrix from these components.
 *
 * **Conventions:**
 * - Right-handed coordinate system
 * - Default Euler order: YZX (yaw-pitch-roll)
 * - Matrices are 4x4 column-major
 * - Position units are in meters
 * - Rotation units are in radians
 *
 * **Lifecycle:**
 * - On each frame (_process), automatically recomposes the transform matrix
 *   if position, scale, or rotation changed (dirty tracking)
 *
 * @template P - Properties type
 * @template M - Metadata type
 * @template T - Additional event map
 *
 * @example
 * ```ts
 * const node = new Node3D();
 * node.position.set(10, 5, 0);
 * node.rotation.set(0, Math.PI / 2, 0); // Rotate 90° on Y axis
 * node.scale.set(2, 2, 2); // Double size
 *
 * // Access composed transform matrix
 * const matrix = node.transform;
 * ```
 */
export class Node3D<
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends Node<M, T> {
  private __matrix: Matrix = new Matrix();
  private __position: Vector3 = new Vector3();
  private __scale: Vector3 = new Vector3(1, 1, 1);
  private __rotation: Euler = new Euler(0, 0, 0, 'yzx');
  private __rotationQ: Quaternion | null = null;

  private __layer: MaskHelper = new MaskHelper();

  /**
   * Local transform matrix composed from position, rotation, and scale.
   *
   * Automatically updated each frame when components change.
   * Can be replaced entirely if needed (marks node dirty).
   *
   * @readonly Use position/rotation/scale setters to modify transform
   */
  get transform(): Matrix {
    return this.__matrix;
  }

  /**
   * Local position in 3D space (meters).
   *
   * Modifying this vector marks the node dirty and triggers matrix recomposition.
   */
  get position(): Vector3 {
    return this.__position;
  }

  /**
   * Local non-uniform scale.
   *
   * Default: (1, 1, 1)
   * Values < 1 shrink, > 1 enlarge.
   */
  get scale(): Vector3 {
    return this.__scale;
  }

  /**
   * Local Euler rotation in radians.
   *
   * Default order: YZX (yaw-pitch-roll)
   * If rotationQ is set, quaternion takes priority.
   */
  get rotation(): Euler {
    return this.__rotation;
  }

  /**
   * Optional local Quaternion rotation.
   *
   * When set, overrides Euler rotation during matrix composition.
   * Set to null to revert to Euler mode.
   *
   * @remarks Use quaternions to avoid gimbal lock and for smooth interpolation
   */
  get rotationQ(): Quaternion | null {
    return this.__rotationQ;
  }

  /**
   * Layer mask helper for render pass filtering.
   *
   * Use to include/exclude this node from specific render passes or cameras.
   *
   * @example
   * ```ts
   * node.layer.enable(1); // Enable layer 1
   * node.layer.disable(0); // Disable layer 0
   * ```
   */
  get layer(): MaskHelper {
    return this.__layer;
  }

  /**
   * Replace the local transform matrix entirely.
   *
   * Marks both node and matrix as dirty.
   *
   * @param transform - New transform matrix
   */
  set transform(transform: Matrix) {
    this.__matrix = transform;
    this.markAsDirty();
    this.__matrix.markAsDirty();
  }

  /**
   * Set local position and mark as dirty.
   *
   * @param position - New position vector
   */
  set position(position: Vector3) {
    this.__position = position;
    this.markAsDirty();
    this.__position.markAsDirty();
  }

  /**
   * Set local scale and mark as dirty.
   *
   * @param scale - New scale vector
   */
  set scale(scale: Vector3) {
    this.__scale = scale;
    this.markAsDirty();
    this.__scale.markAsDirty();
  }

  /**
   * Set local Euler rotation and mark as dirty.
   *
   * @param rotation - New Euler rotation
   */
  set rotation(rotation: Euler) {
    this.__rotation = rotation;
    this.markAsDirty();
    this.__rotation.markAsDirty();
  }

  /**
   * Set local Quaternion rotation.
   *
   * Pass null to revert to Euler rotation mode.
   *
   * @param rotationQ - New quaternion rotation or null
   */
  set rotationQ(rotationQ: Quaternion | null) {
    this.__rotationQ = rotationQ;
    this.markAsDirty();
    this.__rotationQ?.markAsDirty();
  }

  /**
   * Recompose local transform matrix if any component changed.
   *
   * Called automatically each frame. Checks dirty state of position,
   * scale, rotation, and rotationQ, then recomposes matrix if needed.
   *
   * @param _delta - Time since last frame (unused)
   * @override
   */
  override _process(_delta: number): void {
    if (
      this.__position.isDirty ||
      this.__scale.isDirty ||
      this.__rotation.isDirty ||
      this.__rotationQ?.isDirty
    ) {
      this.__matrix.compose(
        this.__position,
        this.__scale,
        this.__rotationQ || this.__rotation,
      );

      this.__position.markAsClean();
      this.__scale.markAsClean();
      this.__rotation.markAsClean();
      this.__rotationQ?.markAsClean();
    }
  }
}
