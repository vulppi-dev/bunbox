import { TextureBase } from './TextureBase';
import type { TextureBaseDescriptor } from './TextureBase';

export interface TextureCubeDescriptor extends TextureBaseDescriptor {
  /** Number of layers must be 6 or a multiple of 6 if array-cubemap. Default 6. */
  layers?: number;
}

export class TextureCube extends TextureBase {
  #layers: number = 6;

  constructor(desc: TextureCubeDescriptor) {
    super(desc);
    this.layers = desc.layers ?? 6;
  }

  override get layerCount(): number {
    return this.#layers;
  }
  set layers(v: number) {
    const n = Math.max(6, Math.ceil((v | 0) / 6) * 6);
    if (this.#layers === n) return;
    this.#layers = n;
    this.markAsDirty();
  }

  protected _kind(): 'cube' {
    return 'cube';
  }
}
