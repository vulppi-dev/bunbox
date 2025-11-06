import { sha } from 'bun';
import { TextureBase } from './TextureBase';
import type { TextureBaseDescriptor } from './TextureBase';

export interface TextureImageDescriptor extends TextureBaseDescriptor {
  /** Optional raw pixel buffer (usually RGBA8). */
  data?: Uint8Array;
}

export class TextureImage extends TextureBase {
  #data?: Uint8Array;
  #dataHash?: string;

  constructor(desc: TextureImageDescriptor) {
    super(desc);
    if (desc.data) {
      this.#data = desc.data;
      this.#dataHash = sha(desc.data, 'hex');
    }
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
    this.#dataHash = v ? sha(v, 'hex') : undefined;
    this.markAsDirty();
  }

  protected override _extraHashKey(): string | undefined {
    return this.#dataHash;
  }

  protected _kind(): '2d' {
    return '2d';
  }
}
