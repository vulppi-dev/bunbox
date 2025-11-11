import { DirtyState } from './DirtyState';

export type EventMap = Record<string | symbol, any[]>;

export type Disposable = {
  dispose(): void | Promise<void>;
};

type BaseEvents = {
  dispose: [];
};

export type MergeEventMaps<A extends EventMap, B extends EventMap> = {
  [K in keyof (A & B)]: K extends keyof B
    ? B[K]
    : K extends keyof A
      ? A[K]
      : never;
};

export class EventEmitter<T extends EventMap = {}> extends DirtyState {
  private __isDisposed = false;
  private __listeners: Map<
    keyof MergeEventMaps<T, BaseEvents>,
    Set<(...args: any[]) => void>
  > = new Map();

  constructor() {
    super();
  }

  get isDisposed() {
    return this.__isDisposed;
  }

  emit<K extends keyof MergeEventMaps<T, BaseEvents>>(
    eventName: K,
    ...args: MergeEventMaps<T, BaseEvents>[K]
  ): this {
    if (this.__isDisposed) return this;
    const set = this.__listeners.get(eventName);
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

  async asyncEmit<K extends keyof MergeEventMaps<T, BaseEvents>>(
    eventName: K,
    ...args: MergeEventMaps<T, BaseEvents>[K]
  ) {
    if (this.__isDisposed) return this;
    const set = this.__listeners.get(eventName);
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

  on<K extends keyof MergeEventMaps<T, BaseEvents>>(
    eventName: K,
    listener: (
      ...args: MergeEventMaps<T, BaseEvents>[K]
    ) => void | any | Promise<void | any>,
  ): this {
    if (this.__isDisposed) return this;
    if (!this.__listeners.has(eventName)) {
      this.__listeners.set(eventName, new Set());
    }
    this.__listeners.get(eventName)!.add(listener);
    return this;
  }

  off<K extends keyof MergeEventMaps<T, BaseEvents>>(
    eventName: K,
    listener: (
      ...args: MergeEventMaps<T, BaseEvents>[K]
    ) => void | any | Promise<void | any>,
  ): this {
    if (this.__isDisposed) return this;
    const listeners = this.__listeners.get(eventName);
    if (listeners) {
      listeners.delete(listener as any);
      if (listeners.size === 0) {
        this.__listeners.delete(eventName);
      }
    }
    return this;
  }

  subscribe<K extends keyof MergeEventMaps<T, BaseEvents>>(
    eventName: K,
    listener: (
      ...args: MergeEventMaps<T, BaseEvents>[K]
    ) => void | any | Promise<void | any>,
  ) {
    this.on(eventName, listener);
    return () => {
      this.off(eventName, listener);
    };
  }

  once<K extends keyof MergeEventMaps<T, BaseEvents>>(
    eventName: K,
    listener: (
      ...args: MergeEventMaps<T, BaseEvents>[K]
    ) => void | any | Promise<void | any>,
  ): this {
    if (this.__isDisposed) return this;
    const onceListener = (...args: any[]) => {
      // @ts-ignore
      listener(...args);
      this.off<K>(eventName, onceListener);
    };
    return this.on(eventName, onceListener);
  }

  clearListeners<K extends keyof MergeEventMaps<T, BaseEvents>>(
    eventName?: K,
  ): this {
    if (this.__isDisposed) return this;
    if (eventName) {
      this.__listeners.delete(eventName);
    } else {
      this.__listeners.clear();
    }
    return this;
  }

  hasListeners<K extends keyof MergeEventMaps<T, BaseEvents>>(
    eventName: K,
  ): boolean {
    const set = this.__listeners.get(eventName);
    return Boolean(set && set.size > 0);
  }

  listenerCount<K extends keyof MergeEventMaps<T, BaseEvents>>(
    eventName?: K,
  ): number {
    if (eventName) return this.__listeners.get(eventName)?.size ?? 0;
    let total = 0;
    for (const set of this.__listeners.values()) total += set.size;
    return total;
  }

  async dispose(): Promise<void> {
    if (this.__isDisposed) return;
    this.emit('dispose');
    this.__isDisposed = true;
    this.__listeners.clear();
  }
}
