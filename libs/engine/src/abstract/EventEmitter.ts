import { randomUUIDv7 } from 'bun';
import { Dirtyable } from './Dyrtiable';

export type EventMap = Record<string | symbol, any[]>;

export type Listener<K, T> = K extends keyof T
  ? T[K] extends any[]
    ? (...args: T[K]) => void
    : never
  : never;

export type Disposable = {
  dispose(): void | Promise<void>;
};

type InitialEvents = {
  dispose: [];
};

export class EventEmitter<T extends EventMap = any> extends Dirtyable {
  #isDisposed = false;
  #listeners: Map<keyof (T & InitialEvents), Set<(...args: any[]) => void>> =
    new Map();
  readonly #id: string;

  constructor() {
    super();
    this.#id = randomUUIDv7();
  }

  get id() {
    return this.#id;
  }

  get isDisposed() {
    return this.#isDisposed;
  }

  subscribe<K extends keyof (T & InitialEvents)>(
    eventName: K,
    listener: Listener<K, T & InitialEvents>,
  ) {
    this.on(eventName, listener);
    return () => {
      this.off(eventName, listener);
    };
  }

  emit<K extends keyof (T & InitialEvents)>(
    eventName: K,
    ...args: Parameters<Listener<K, T & InitialEvents>>
  ): this {
    if (this.#isDisposed) return this;
    const listeners = this.#listeners.get(eventName);

    if (listeners) {
      for (const listener of listeners) {
        listener(...args);
      }
    }
    return this;
  }

  on<K extends keyof (T & InitialEvents)>(
    eventName: K,
    listener: Listener<K, T & InitialEvents>,
  ): this {
    if (this.#isDisposed) return this;
    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, new Set());
    }
    this.#listeners.get(eventName)!.add(listener);
    return this;
  }

  off<K extends keyof (T & InitialEvents)>(
    eventName: K,
    listener: Listener<K, T & InitialEvents>,
  ): this {
    if (this.#isDisposed) return this;
    const listeners = this.#listeners.get(eventName);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.#listeners.delete(eventName);
      }
    }
    return this;
  }

  once<K extends keyof (T & InitialEvents)>(
    eventName: K,
    listener: Listener<K, T & InitialEvents>,
  ): this {
    if (this.#isDisposed) return this;
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.off<K>(eventName, onceListener as Listener<K, T & InitialEvents>);
    };
    return this.on(eventName, onceListener as Listener<K, T & InitialEvents>);
  }

  clear<K extends keyof (T & InitialEvents)>(eventName?: K): this {
    if (this.#isDisposed) return this;
    if (eventName) {
      this.#listeners.delete(eventName);
    } else {
      this.#listeners.clear();
    }
    return this;
  }

  async dispose(): Promise<void> {
    if (this.#isDisposed) return;
    // @ts-expect-error
    this.emit('dispose');
    this.#isDisposed = true;
  }
}
