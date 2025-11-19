import type { Disposable } from '@bunbox/utils';
import { EngineError } from '../errors';
import type { Entity } from './World';

export class AssetsStorage implements Disposable {
  private __disposed = false;

  private __cache: Map<string | symbol, Map<Entity, any>> = new Map();

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

  dispose(): void | Promise<void> {
    if (this.__disposed) return;
    this.__disposed = true;
    this.clearCache();
  }
}
