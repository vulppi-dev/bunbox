import { lstatSync, readFileSync } from 'fs';
import { sha } from 'bun';
import { ulid } from 'ulid';
import { EngineError } from '../errors';

export type ShaderHolder = string & { __shaderHolderBrand: never };

type ShaderPack =
  | {
      type: 'compute';
      entry: string;
      src: string;
      key?: string;
    }
  | {
      type: 'graphics';
      src: string;
      vEntry: string;
      fEntry?: string;
      key?: string;
    };

const SHADER_HOLDER_TYPE = Symbol('ShaderHolder');

function isShaderHolder(value: any): value is ShaderHolder {
  return value[SHADER_HOLDER_TYPE] === true && typeof value === 'string';
}

function createShaderHolder(): ShaderHolder {
  const holder = ulid();
  Object.defineProperty(holder, SHADER_HOLDER_TYPE, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  return holder as ShaderHolder;
}

export class ShaderStorage {
  private __shaders: Map<ShaderHolder, ShaderPack> = new Map();
  private __hashIndex: Map<string, ShaderHolder> = new Map();
  private __keys: Map<string, ShaderHolder> = new Map();

  registerGraphicsShaderFile(
    path: string,
    vertexEntryPoint: string,
    fragmentEntryPoint?: string,
    key?: string,
  ): ShaderHolder {
    const stats = lstatSync(path);
    if (!stats.isFile()) {
      throw new EngineError(
        `Shader path is not a file: ${path}`,
        'ShaderStorage',
      );
    }
    const source = readFileSync(path, 'utf-8');
    return this.registerGraphicsShaderSource(
      source,
      vertexEntryPoint,
      fragmentEntryPoint,
      key,
    );
  }

  registerGraphicsShaderSource(
    source: string,
    vertexEntryPoint: string,
    fragmentEntryPoint?: string,
    key?: string,
  ): ShaderHolder {
    const pack: ShaderPack = {
      type: 'graphics',
      src: source,
      vEntry: vertexEntryPoint,
      fEntry: fragmentEntryPoint,
      key,
    };
    return this.__register(pack, key);
  }

  registerComputeShaderFile(
    path: string,
    entryPoint: string,
    key?: string,
  ): ShaderHolder {
    const stats = lstatSync(path);
    if (!stats.isFile()) {
      throw new EngineError(
        `Shader path is not a file: ${path}`,
        'ShaderStorage',
      );
    }
    const source = readFileSync(path, 'utf-8');
    return this.registerComputeShaderSource(source, entryPoint, key);
  }

  registerComputeShaderSource(
    source: string,
    entryPoint: string,
    key?: string,
  ): ShaderHolder {
    const pack: ShaderPack = {
      type: 'compute',
      entry: entryPoint,
      src: source,
      key,
    };
    return this.__register(pack, key);
  }

  getShaderPack(holder: ShaderHolder): ShaderPack | undefined {
    if (!isShaderHolder(holder)) {
      throw new EngineError(`Invalid ShaderHolder provided`, 'ShaderStorage');
    }
    return this.__shaders.get(holder);
  }

  getHolderByKey(key: string): ShaderHolder | undefined {
    return this.__keys.get(key);
  }

  unregister(holder: ShaderHolder): boolean {
    if (!isShaderHolder(holder)) {
      throw new EngineError(`Invalid ShaderHolder provided`, 'ShaderStorage');
    }
    const pack = this.__shaders.get(holder);
    if (!pack) return false;

    this.__shaders.delete(holder);

    const hash = this.__computeContentHash(pack);
    const existingHashHolder = this.__hashIndex.get(hash);
    if (existingHashHolder === holder) {
      this.__hashIndex.delete(hash);
    }

    if (pack.key) {
      const existingKeyHolder = this.__keys.get(pack.key);
      if (existingKeyHolder === holder) {
        this.__keys.delete(pack.key);
      }
    }

    return true;
  }

  clear(): void {
    this.__shaders.clear();
    this.__hashIndex.clear();
    this.__keys.clear();
  }

  private __register(pack: ShaderPack, key?: string): ShaderHolder {
    const contentHash = this.__computeContentHash(pack);

    // Check key collision
    if (key) {
      const existingHolder = this.__keys.get(key);
      if (existingHolder) {
        const existingPack = this.__shaders.get(existingHolder);
        if (
          existingPack &&
          this.__computeContentHash(existingPack) === contentHash
        ) {
          return existingHolder;
        }
        throw new EngineError(
          `Key already used by a different shader: ${key}`,
          'ShaderStorage',
        );
      }
    }

    const existingHolder = this.__hashIndex.get(contentHash);
    if (existingHolder) {
      if (key) {
        this.__keys.set(key, existingHolder);
      }
      return existingHolder;
    }

    const holder = createShaderHolder();
    this.__shaders.set(holder, pack);
    this.__hashIndex.set(contentHash, holder);
    if (key) {
      this.__keys.set(key, holder);
    }
    return holder;
  }

  private __computeContentHash(pack: ShaderPack): string {
    const canonical =
      pack.type === 'compute'
        ? { type: 'compute', entry: pack.entry, src: pack.src }
        : {
            type: 'graphics',
            src: pack.src,
            vEntry: pack.vEntry,
            fEntry: pack.fEntry,
          };
    return sha(JSON.stringify(canonical), 'hex');
  }
}
