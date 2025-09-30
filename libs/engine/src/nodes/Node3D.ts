import type { EventMap } from '@bunbox/utils';
import { Node } from '../core';
import { Euler, Matrix, Quaternion, Vector3 } from '../math';
import { MaskHelper } from '../elements';

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

  get transform(): Matrix {
    return this.#matrix;
  }

  set transform(transform: Matrix) {
    this.#matrix = transform;
    this.markAsDirty();
    this.#matrix.markAsDirty();
  }

  get position(): Vector3 {
    return this.#position;
  }

  set position(position: Vector3) {
    this.#position = position;
    this.markAsDirty();
    this.#position.markAsDirty();
  }

  get scale(): Vector3 {
    return this.#scale;
  }

  set scale(scale: Vector3) {
    this.#scale = scale;
    this.markAsDirty();
    this.#scale.markAsDirty();
  }

  get rotation(): Euler {
    return this.#rotation;
  }

  set rotation(rotation: Euler) {
    this.#rotation = rotation;
    this.markAsDirty();
    this.#rotation.markAsDirty();
  }

  get rotationQ(): Quaternion | null {
    return this.#rotationQ;
  }

  set rotationQ(rotationQ: Quaternion | null) {
    this.#rotationQ = rotationQ;
    this.markAsDirty();
    this.#rotationQ?.markAsDirty();
  }

  get layer(): MaskHelper {
    return this.#layer;
  }

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
