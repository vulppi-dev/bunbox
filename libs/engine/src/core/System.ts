import type { AssetsStorage } from './AssetsStorage';
import type { ComponentProps, ComponentType } from './Component';
import type { Entity, World } from './World';

export type SystemContext = {
  world: World;
  window: bigint;
  commands: Commands;
  assetsStorage: AssetsStorage;
  time: number;
  delta: number;
};

export type SystemFn = (systemContext: SystemContext) => void | Promise<void>;

export type RegisteredSystem = {
  readonly name: string;
  readonly priority: number;
  readonly run: SystemFn;
};

export const SYSTEM_TYPE = Symbol('systemType');

export function defineSystem(
  name: string,
  priority: number = 0,
  run: SystemFn,
): RegisteredSystem {
  const sys = {
    name,
    priority,
    run,
  };

  Object.defineProperty(sys, SYSTEM_TYPE, {
    value: true,
    writable: false,
    enumerable: false,
    configurable: false,
  });

  return sys;
}

export function isRegisteredSystem(obj: any): obj is RegisteredSystem {
  return Boolean(obj && obj[SYSTEM_TYPE] === true);
}

export class Commands {
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
