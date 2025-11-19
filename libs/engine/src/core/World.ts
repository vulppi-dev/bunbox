import type { Disposable } from '@bunbox/utils';
import { ulid } from 'ulid';
import { EngineError } from '../errors';
import type { AssetsStorage } from './AssetsStorage';
import {
  isComponentType,
  type ComponentProps,
  type ComponentType,
} from './Component';
import {
  Commands,
  isRegisteredSystem,
  type RegisteredSystem,
  type RenderContext,
  type SystemContext,
} from './System';

export type Entity = string & { __entityBrand: never };

type QueryComponents = readonly ComponentType<any>[];

type QueryResult<C extends QueryComponents> = [
  Entity,
  ...{
    [K in keyof C]: C[K] extends ComponentType<infer T> ? T : never;
  },
];

export const FRAME_LOOP = Symbol('frameLoop');

export function forEachQuery<C extends QueryComponents>(
  world: World,
  components: Readonly<C>,
  callback: (...args: QueryResult<C>) => void,
): void {
  if (components.length === 0) {
    return;
  }

  const primary = components[0]!;
  const primaryStore = world.getStore(primary);

  for (const [entity, primaryComp] of primaryStore.entries()) {
    const allComponents: any[] = [entity, primaryComp];

    let missing = false;
    for (let i = 1; i < components.length; i += 1) {
      const type = components[i] as ComponentType<any>;
      const store = world.getStore(type);
      const comp = store.get(entity);
      if (comp === undefined) {
        missing = true;
        break;
      }
      allComponents.push(comp);
    }

    if (!missing) {
      callback(...(allComponents as QueryResult<C>));
    }
  }
}

export class World implements Disposable {
  private __id = ulid();

  private __stores: Map<string, Map<Entity, any>> = new Map();
  private __systems: RegisteredSystem[] = [];
  private __disposed = false;

  private __lockLoop = false;

  get id(): string {
    return this.__id;
  }

  get isDisposed(): boolean {
    return this.__disposed;
  }

  createEntity(): Entity {
    return ulid() as Entity;
  }

  getStore<T extends ComponentProps>(
    component: ComponentType<T>,
  ): Map<Entity, T> {
    if (isComponentType(component) === false) {
      throw new EngineError('Invalid component type', 'World');
    }
    let store = this.__stores.get(component.id);
    if (!store) {
      store = new Map<Entity, T>();
      this.__stores.set(component.id, store);
    }
    return store as Map<Entity, T>;
  }

  addComponent<T extends ComponentProps>(
    entity: Entity,
    component: ComponentType<T>,
    props?: Partial<T>,
  ): void {
    if (this.__lockLoop) {
      throw new EngineError('Cannot add component during frame loop', 'World');
    }
    const store = this.getStore(component);
    store.set(entity, Object.assign(component.props(), props));
  }

  removeComponent<T extends ComponentProps>(
    entity: Entity,
    component: ComponentType<T>,
  ): void {
    if (this.__lockLoop) {
      throw new EngineError(
        'Cannot remove component during frame loop',
        'World',
      );
    }
    const store = this.getStore(component);
    store.delete(entity);
  }

  getComponentValue<T extends ComponentProps>(
    entity: Entity,
    component: ComponentType<T>,
  ): T | undefined {
    const store = this.getStore(component);
    return store.get(entity);
  }

  clearStores(): void {
    if (this.__lockLoop) {
      throw new EngineError('Cannot clear world during frame loop', 'World');
    }
    this.__stores.clear();
  }

  clearSystems(): void {
    if (this.__lockLoop) {
      throw new EngineError('Cannot clear world during frame loop', 'World');
    }
    this.__systems = [];
  }

  clear(): void {
    this.clearStores();
    this.clearSystems();
  }

  registerSystem<S extends RegisteredSystem>(system: S): void {
    if (!isRegisteredSystem(system)) {
      throw new EngineError('Invalid system type', 'World');
    }
    this.__systems.push(system);
    this.__systems.sort((a, b) => a.priority - b.priority);
  }

  dispose(): void | Promise<void> {
    if (this.__disposed) return;

    this.__stores.clear();
    this.__disposed = true;
  }

  [FRAME_LOOP](
    window: bigint,
    renderContext: RenderContext,
    assetsStorage: AssetsStorage,
    time: number,
    delta: number,
  ): void {
    if (this.__disposed) return;

    this.__lockLoop = true;
    const commands = new Commands();

    const ctx = {
      world: this,
      window,
      commands,
      renderContext,
      assetsStorage,
      time,
      delta,
    } as SystemContext;

    for (const system of this.__systems) {
      if (this.__disposed) return;
      system.run(ctx);
    }
    this.__lockLoop = false;
    commands.flush();
  }
}
