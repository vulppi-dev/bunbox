import { EventEmitter, type EventMap } from './EventEmitter';

type NodeEvents = {
  'add-child': [child: Node];
  'remove-child': [child: Node];
  rename: [child: Node, prev: string, next: string];
};

export class Node<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = any,
> extends EventEmitter<T & NodeEvents> {
  readonly #properties: P;
  metadata: Partial<M> = {};

  #name: string = '';
  #parent: Node | null = null;
  #children: Node[] = [];
  #idMap: Map<string, Node> = new Map();
  #nameMap: Map<string, Set<Node>> = new Map();
  #bindMap: Map<string, () => void> = new Map();

  constructor() {
    super();

    this.#properties = new Proxy({} as P, {
      set: (target, prop, value) => {
        const key = prop as keyof P;
        if (target[key] !== value) {
          target[key] = value;
          this.markAsDirty();
        }
        return true;
      },
      deleteProperty: (target, prop) => {
        const key = prop as keyof P;
        if (key in target) {
          delete target[key];
          this.markAsDirty();
        }
        return true;
      },
    });
  }

  get properties() {
    return this.#properties;
  }

  get parent() {
    return this.#parent;
  }

  get children() {
    return [...this.#children];
  }

  get name() {
    return this.#name;
  }

  set name(value: string) {
    if (this.#name === value) return;

    const oldName = this.#name;
    this.#name = value;
    this.markAsDirty();
    // @ts-expect-error
    this.emit('rename', this, oldName, value);
  }

  addChild(child: Node) {
    if (this.#idMap.has(child.id)) {
      throw new Error(`Child with id ${child.id} already exists`);
    }

    this.#children.push(child);
    this.#idMap.set(child.id, child);

    if (child.name && !this.#nameMap.has(child.name)) {
      this.#nameMap.set(child.name, new Set());
    }
    this.#nameMap.get(child.name)!.add(child);
    if (child.#parent) {
      child.#parent.removeChild(child);
    }

    child.#parent = this;
    this.markAsDirty();
    // @ts-expect-error
    this.emit('add-child', child);

    // Bind child events
    const unsubscribe = [
      child.subscribe('rename', (c, prev, next) => {
        if (prev && this.#nameMap.has(prev)) {
          this.#nameMap.get(prev)!.delete(c);
          if (this.#nameMap.get(prev)!.size === 0) {
            this.#nameMap.delete(prev);
          }
        }
        if (next) {
          if (!this.#nameMap.has(next)) {
            this.#nameMap.set(next, new Set());
          }
          this.#nameMap.get(next)!.add(c);
        }
        this.markAsDirty();
        // @ts-expect-error
        this.emit('rename', c, prev, next);
      }),
      child.subscribe('add-child', (c) => {
        this.#idMap.set(c.id, c);
        if (c.name && !this.#nameMap.has(c.name)) {
          this.#nameMap.set(c.name, new Set());
        }
        this.#nameMap.get(c.name)!.add(c);

        this.markAsDirty();
        // @ts-expect-error
        this.emit('add-child', c);
      }),
      child.subscribe('remove-child', (c) => {
        this.#idMap.delete(c.id);
        if (c.name && this.#nameMap.has(c.name)) {
          this.#nameMap.get(c.name)!.delete(c);
          if (this.#nameMap.get(c.name)!.size === 0) {
            this.#nameMap.delete(c.name);
          }
        }

        this.markAsDirty();
        // @ts-expect-error
        this.emit('remove-child', c);
      }),
    ];

    this.#bindMap.set(child.id, () => {
      for (const off of unsubscribe) off();
    });
    return this;
  }

  removeChild(child: Node) {
    if (!this.#idMap.has(child.id)) {
      throw new Error(`Child with id ${child.id} does not exist`);
    }

    this.#children = this.#children.filter((c) => c.id !== child.id);
    this.#idMap.delete(child.id);
    if (child.name && this.#nameMap.has(child.name)) {
      this.#nameMap.get(child.name)!.delete(child);
      if (this.#nameMap.get(child.name)!.size === 0) {
        this.#nameMap.delete(child.name);
      }
    }
    child.#parent = null;

    // Unbind child events
    const unbind = this.#bindMap.get(child.id);
    if (unbind) {
      unbind();
      this.#bindMap.delete(child.id);
    }

    this.markAsDirty();
    // @ts-expect-error
    this.emit('remove-child', child);

    return this;
  }

  process(deltaTime: number): void {
    // Override in subclasses
  }
}
