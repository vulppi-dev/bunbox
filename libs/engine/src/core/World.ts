import type { Disposable } from '@bunbox/utils';
import type { ComponentProps, ComponentType } from './Component';
import { ulid } from 'ulid';
import type { Window } from './Window';
import { EngineError } from '../errors';
import type { VkDevice } from './vulkan/VkDevice';
import type { VkSwapchain } from './vulkan/VkSwapchain';
import type { VkCommandBuffer } from './vulkan/VkCommandBuffer';
import type { AssetsStorage } from './AssetsStorage';

export type Entity = string & { __entityBrand: never };

export type SystemContext = {
  world: World;
  window: bigint;
  commands: Commands;
  renderContext: RenderContext;
  time: number;
  delta: number;
};

type SystemFn = (systemContext: SystemContext) => void | Promise<void>;

type RegisteredSystem = {
  readonly name: string;
  readonly priority: number;
  readonly run: SystemFn;
};

type RenderContext = {
  device: VkDevice;
  swapchain: VkSwapchain;
  commandBuffer: VkCommandBuffer;
  imageIndex: number;
  assetsStore: AssetsStorage;
};

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
  components: C,
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

  getStore<T extends ComponentProps>(
    component: ComponentType<T>,
  ): Map<Entity, T> {
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
    props: T,
  ): void {
    if (this.__lockLoop) {
      throw new EngineError('Cannot add component during frame loop', 'World');
    }
    const store = this.getStore(component);
    store.set(entity, props);
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

  registerSystem(name: string, priority: number, run: SystemFn): void {
    this.__systems.push({ name, priority, run });
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

class Commands {
  private __queue: (() => void)[] = [];

  enqueue(command: () => void): void {
    this.__queue.push(command);
  }

  flush(): void {
    for (const command of this.__queue) {
      command();
    }
    this.__queue = [];
  }

  addComponent<T extends ComponentProps>(
    world: World,
    entity: Entity,
    component: ComponentType<T>,
    props: T,
  ): void {
    this.enqueue(() => {
      world.addComponent(entity, component, props);
    });
  }

  removeComponent<T extends ComponentProps>(
    world: World,
    entity: Entity,
    component: ComponentType<T>,
  ): void {
    this.enqueue(() => {
      world.removeComponent(entity, component);
    });
  }
}
