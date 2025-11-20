import type { TextureBase } from '../resources';

export type TextureHolder = string & { __textureHolderBrand: never };

const TEXTURE_HOLDER_TYPE = Symbol('TextureHolder');

function isTextureHolder(value: any): value is TextureHolder {
  return value[TEXTURE_HOLDER_TYPE] === true && typeof value === 'string';
}

export class TextureStorage {
  private __textures: Map<TextureHolder, TextureBase> = new Map();
}
