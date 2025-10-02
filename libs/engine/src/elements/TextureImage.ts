import { TextureBase } from './TextureBase';
import type { TextureBaseDescriptor } from './TextureBase';

export interface TextureImageDescriptor extends TextureBaseDescriptor {
  /** Optional raw pixel buffer (usually RGBA8). */
  data?: Uint8Array;
}

export class TextureImage extends TextureBase {
  #data?: Uint8Array;

  constructor(desc: TextureImageDescriptor) {
    super(desc);
    if (desc.data) this.#data = desc.data;
  }

  override get layerCount(): number {
    return 1;
  }
  override get depth(): number {
    return 1;
  }
  get data(): Uint8Array | undefined {
    return this.#data;
  }
  set data(v: Uint8Array | undefined) {
    if (this.#data === v) return;
    this.#data = v;
    this.markAsDirty();
  }

  protected _kind(): '2d' {
    return '2d';
  }
}
