import { EngineError } from '../errors';
import { ShaderStorage } from './ShaderStorage';
import { TextureStorage } from './TextureStorage';
import { PipelineStorage } from './PipelineStorage';
import type { Entity } from '../core/World';

export class AssetsStorage {
  private __disposed = false;

  private __cache: Map<string | symbol, Map<Entity, any>> = new Map();

  private __shaders = new ShaderStorage();
  private __textures = new TextureStorage();
  private __pipelines = new PipelineStorage(this.__shaders);

  get shaders(): ShaderStorage {
    return this.__shaders;
  }

  get textures(): TextureStorage {
    return this.__textures;
  }

  get pipelines(): PipelineStorage {
    return this.__pipelines;
  }

  get<T>(type: string | symbol, id: Entity): T | undefined {
    this.__ensureNotDisposed('getCache');
    const typeCache = this.__cache.get(type);
    return typeCache ? (typeCache.get(id) as T) : undefined;
  }

  set<T>(type: string | symbol, id: Entity, asset: T): void {
    this.__ensureNotDisposed('setCache');
    let typeCache = this.__cache.get(type);
    if (!typeCache) {
      typeCache = new Map<Entity, any>();
      this.__cache.set(type, typeCache);
    }
    typeCache.set(id, asset);
  }

  remove(type: string | symbol, id: Entity): void {
    this.__ensureNotDisposed('removeCache');
    let typeCache = this.__cache.get(type);
    if (!typeCache) {
      typeCache = new Map<Entity, any>();
      this.__cache.set(type, typeCache);
    }
    typeCache.delete(id);
  }

  getTypeCache<T>(type: string | symbol): Map<Entity, T> | undefined {
    this.__ensureNotDisposed('getTypeCache');
    return this.__cache.get(type) as Map<Entity, T> | undefined;
  }

  getTypeEntities(type: string | symbol): Entity[] {
    this.__ensureNotDisposed('getTypeEntities');
    const typeCache = this.__cache.get(type);
    if (!typeCache) {
      return [];
    }
    return Array.from(typeCache.keys());
  }

  private __ensureNotDisposed(methodName: string): void {
    if (this.__disposed) {
      throw new EngineError(
        `Cannot call ${methodName} on disposed AssetsStorage`,
        'AssetsStorage',
      );
    }
  }

  clearCache(): void {
    this.__cache.clear();
  }

  clear(): void {
    this.clearCache();
  }
}
