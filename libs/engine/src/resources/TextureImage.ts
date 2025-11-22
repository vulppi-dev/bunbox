import { TextureBase } from './TextureBase';
import type { TextureBaseDescriptor } from './TextureBase';

export interface TextureImageDescriptor extends TextureBaseDescriptor {}

export class TextureImage extends TextureBase {
  constructor(desc: TextureImageDescriptor) {
    super(desc);
  }

  override get layerCount(): number {
    return 1;
  }
  override get depth(): number {
    return 1;
  }

  protected _kind(): '2d' {
    return '2d';
  }
}
