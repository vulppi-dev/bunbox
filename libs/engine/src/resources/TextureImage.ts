import { sha } from 'bun';
import { TextureBase } from './TextureBase';
import type { TextureBaseDescriptor } from './TextureBase';

export interface TextureImageDescriptor extends TextureBaseDescriptor {
  /** Optional raw pixel buffer (usually RGBA8). */
  data?: Uint8Array;
}

export class TextureImage extends TextureBase {
  private __data?: Uint8Array;
  private __dataHash?: string;

  constructor(desc: TextureImageDescriptor) {
    super(desc);
    if (desc.data) {
      this.__data = desc.data;
      this.__dataHash = sha(desc.data, 'hex');
    }
  }

  override get layerCount(): number {
    return 1;
  }
  override get depth(): number {
    return 1;
  }
  get data(): Uint8Array | undefined {
    return this.__data;
  }
  set data(v: Uint8Array | undefined) {
    if (this.__data === v) return;
    this.__data = v;
    this.__dataHash = v ? sha(v, 'hex') : undefined;
    this.markAsDirty();
  }

  protected override _extraHashKey(): string | undefined {
    return this.__dataHash;
  }

  protected _kind(): '2d' {
    return '2d';
  }
}
