import { DirtyState } from './DirtyState';

export type EventMap = Record<string | symbol, any[]>;

export type Listener<K extends keyof T, T extends EventMap> = T[K] extends any[]
  ? (...args: T[K]) => void | Promise<void>
  : () => void | Promise<void>;

export type Disposable = {
  dispose(): void | Promise<void>;
};

type Args<K extends keyof T, T extends EventMap> = T[K] extends any[]
  ? T[K]
  : [];

type BaseEvents = {
  dispose: [];
};

export type MergeEventMaps<A extends EventMap, B extends EventMap> = {
  [K in keyof A | keyof B]: K extends keyof A
    ? K extends keyof B
      ? A[K] | B[K]
      : A[K]
    : K extends keyof B
      ? B[K]
      : [];
};

type WithBase<T extends EventMap> = MergeEventMaps<BaseEvents, T>;

export class EventEmitter<T extends EventMap = {}> extends DirtyState {
  #isDisposed = false;
  #listeners: Map<keyof WithBase<T>, Set<(...args: any[]) => void>> = new Map();

  constructor() {
    super();
  }

  get isDisposed() {
    return this.#isDisposed;
  }

  subscribe<K extends keyof WithBase<T>>(
    eventName: K,
    listener: Listener<K, WithBase<T>>,
  ) {
    this.on(eventName, listener);
    return () => {
      this.off(eventName, listener);
    };
  }

  emit<K extends keyof WithBase<T>>(
    eventName: K,
    ...args: Args<K, WithBase<T>>
  ): this {
    if (this.#isDisposed) return this;
    const set = this.#listeners.get(eventName);
    if (!set || set.size === 0) return this;

    const snapshot = [...set];
    for (const listener of snapshot) {
      try {
        listener(...args);
      } catch (err) {
        console.error(`Unhandled error in event "${String(eventName)}":`, err);
      }
    }
    return this;
  }

  async asyncEmit<K extends keyof WithBase<T>>(
    eventName: K,
    ...args: Args<K, WithBase<T>>
  ) {
    if (this.#isDisposed) return this;
    const set = this.#listeners.get(eventName);
    if (!set || set.size === 0) return this;

    const snapshot = [...set];
    const promises: Promise<void>[] = [];
    for (const listener of snapshot) {
      try {
        const possiblePromise = listener(...args) as undefined | Promise<void>;
        if (possiblePromise && possiblePromise instanceof Promise)
          promises.push(possiblePromise);
      } catch (err) {
        console.error(`Unhandled error in event "${String(eventName)}":`, err);
      }
    }
    await Promise.allSettled(promises);
  }

  on<K extends keyof WithBase<T>>(
    eventName: K,
    listener: Listener<K, WithBase<T>>,
  ): this {
    if (this.#isDisposed) return this;
    if (!this.#listeners.has(eventName)) {
      this.#listeners.set(eventName, new Set());
    }
    this.#listeners.get(eventName)!.add(listener);
    return this;
  }

  off<K extends keyof WithBase<T>>(
    eventName: K,
    listener: Listener<K, WithBase<T>>,
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

  once<K extends keyof WithBase<T>>(
    eventName: K,
    listener: Listener<K, WithBase<T>>,
  ): this {
    if (this.#isDisposed) return this;
    const onceListener = (...args: any[]) => {
      // @ts-ignore
      listener(...args);
      this.off<K>(eventName, onceListener as Listener<K, WithBase<T>>);
    };
    return this.on(eventName, onceListener as Listener<K, WithBase<T>>);
  }

  clearListeners<K extends keyof WithBase<T>>(eventName?: K): this {
    if (this.#isDisposed) return this;
    if (eventName) {
      this.#listeners.delete(eventName);
    } else {
      this.#listeners.clear();
    }
    return this;
  }

  hasListeners<K extends keyof WithBase<T>>(eventName: K): boolean {
    const set = this.#listeners.get(eventName);
    return Boolean(set && set.size > 0);
  }

  listenerCount<K extends keyof WithBase<T>>(eventName?: K): number {
    if (eventName) return this.#listeners.get(eventName)?.size ?? 0;
    let total = 0;
    for (const set of this.#listeners.values()) total += set.size;
    return total;
  }

  async dispose(): Promise<void> {
    if (this.#isDisposed) return;
    this.emit('dispose');
    this.#isDisposed = true;
    this.#listeners.clear();
  }
}
