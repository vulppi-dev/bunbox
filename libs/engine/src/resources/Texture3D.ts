import { TextureBase } from './TextureBase';
import type { TextureBaseDescriptor } from './TextureBase';

export interface Texture3DDescriptor extends TextureBaseDescriptor {
  /** Depth of the 3D texture. */
  depth: number;
}

export class Texture3D extends TextureBase {
  #depth: number = 1;

  constructor(desc: Texture3DDescriptor) {
    super(desc);
    this.depth = desc.depth;
  }

  override get depth(): number {
    return this.#depth;
  }
  override set depth(v: number) {
    const n = Math.max(1, v | 0);
    if (this.#depth === n) return;
    this.#depth = n;
    this.markAsDirty();
  }

  protected _kind(): '3d' {
    return '3d';
  }
}
