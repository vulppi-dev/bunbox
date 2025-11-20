import { ulid } from 'ulid';
import { EngineError } from '../errors';
import type { TextureBase } from '../resources';

export type TextureHolder = string & { __textureHolderBrand: never };

const TEXTURE_HOLDER_TYPE = Symbol('TextureHolder');

function isTextureHolder(value: any): value is TextureHolder {
  return typeof value === 'string';
}

function createTextureHolder(): TextureHolder {
  const holder = ulid();
  Object.defineProperty(holder, TEXTURE_HOLDER_TYPE, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  return holder as TextureHolder;
}

export class TextureStorage {
  private __textures: Map<TextureHolder, TextureBase> = new Map();
  private __hashIndex: Map<string, TextureHolder> = new Map();
  private __keys: Map<string, TextureHolder> = new Map();

  register(texture: TextureBase, key?: string): TextureHolder {
    const contentHash = texture.contentHash;

    // Check key collision
    if (key) {
      const existingHolder = this.__keys.get(key);
      if (existingHolder) {
        const existingTexture = this.__textures.get(existingHolder);
        if (existingTexture && existingTexture.contentHash === contentHash) {
          return existingHolder;
        }
        throw new EngineError(
          `Key already used by a different texture: ${key}`,
          'TextureStorage',
        );
      }
    }

    // Check content deduplication
    const existingHolder = this.__hashIndex.get(contentHash);
    if (existingHolder) {
      if (key) {
        this.__keys.set(key, existingHolder);
      }
      return existingHolder;
    }

    const holder = createTextureHolder();
    this.__textures.set(holder, texture);
    this.__hashIndex.set(contentHash, holder);
    if (key) {
      this.__keys.set(key, holder);
    }
    return holder;
  }

  getTexture(holder: TextureHolder): TextureBase | undefined {
    if (!isTextureHolder(holder)) {
      throw new EngineError(`Invalid TextureHolder provided`, 'TextureStorage');
    }
    return this.__textures.get(holder);
  }

  getHolderByKey(key: string): TextureHolder | undefined {
    return this.__keys.get(key);
  }

  getHolderByContentHash(hash: string): TextureHolder | undefined {
    return this.__hashIndex.get(hash);
  }

  unregister(holder: TextureHolder): boolean {
    if (!isTextureHolder(holder)) {
      throw new EngineError(`Invalid TextureHolder provided`, 'TextureStorage');
    }
    const texture = this.__textures.get(holder);
    if (!texture) return false;

    this.__textures.delete(holder);

    const hash = texture.contentHash;
    const existingHashHolder = this.__hashIndex.get(hash);
    if (existingHashHolder === holder) {
      this.__hashIndex.delete(hash);
    }

    for (const [k, h] of this.__keys.entries()) {
      if (h === holder) {
        this.__keys.delete(k);
      }
    }

    return true;
  }

  clear(): void {
    this.__textures.clear();
    this.__hashIndex.clear();
    this.__keys.clear();
  }

  size(): number {
    return this.__textures.size;
  }
}
