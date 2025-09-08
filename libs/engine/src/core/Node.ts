import { EventEmitter, type EventMap } from '../abstract';
import type { RenderProps } from '../types';

type NodeEvents = {
  'add-child': [child: Node];
  'remove-child': [child: Node];
  rename: [child: Node, prev: string, next: string];
  priority: [child: Node, priority: number];
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
  #typeMap: Map<string, Set<Node>> = new Map();
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
    this.#setOnMap(child.name, child, this.#nameMap);
    this.#setOnMap(child.constructor.name, child, this.#typeMap);

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
        this.#deleteOnMap(prev, c, this.#nameMap);
        this.#setOnMap(next, c, this.#nameMap);
        this.markAsDirty();
        // @ts-expect-error
        this.emit('rename', c, prev, next);
      }),
      child.subscribe('add-child', (c) => {
        this.#idMap.set(c.id, c);
        this.#setOnMap(c.name, c, this.#nameMap);
        this.#setOnMap(c.constructor.name, c, this.#typeMap);
        this.markAsDirty();
        // @ts-expect-error
        this.emit('add-child', c);
      }),
      child.subscribe('remove-child', (c) => {
        this.#idMap.delete(c.id);
        this.#deleteOnMap(c.name, c, this.#nameMap);
        this.#deleteOnMap(c.constructor.name, c, this.#typeMap);

        this.markAsDirty();
        // @ts-expect-error
        this.emit('remove-child', c);
      }),
    ];

    this.#bindMap.set(child.id, () => {
      for (const off of unsubscribe) off();
    });

    child._ready();

    return this;
  }

  removeChild(child: Node) {
    if (!this.#idMap.has(child.id)) {
      throw new Error(`Child with id ${child.id} does not exist`);
    }

    this.#children = this.#children.filter((c) => c.id !== child.id);
    this.#idMap.delete(child.id);
    this.#deleteOnMap(child.name, child, this.#nameMap);
    this.#deleteOnMap(child.constructor.name, child, this.#typeMap);
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

  #setOnMap(key: string, node: Node, map: Map<string, Set<Node>>) {
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, new Set());
    }
    map.get(key)!.add(node);
  }

  #deleteOnMap(key: string, node: Node, map: Map<string, Set<Node>>) {
    if (!key) return;

    if (map.has(key)) {
      map.get(key)!.delete(node);
      if (map.get(key)!.size === 0) {
        map.delete(key);
      }
    }
  }

  getChildById(id: string): Node | null {
    return this.#idMap.get(id) ?? null;
  }

  getChildrenByName(name: string): Node[] {
    return [...(this.#nameMap.get(name) ?? [])];
  }

  getChildrenByType<T extends Node>(type: new (...args: any[]) => T): T[] {
    return [...(this.#typeMap.get(type.name) ?? [])] as T[];
  }

  findById(id: string): Node | null {
    const root = this.getRoot();
    if (root.id === id) return root;
    return root.#idMap.get(id) ?? null;
  }

  findByName(name: string): Node[] {
    const root = this.getRoot();
    const found = [...(root.#nameMap.get(name) ?? [])];
    if (root.#name === name) found.push(root);
    return found;
  }

  findByType<T extends Node>(type: new (...args: any[]) => T): T[] {
    const root = this.getRoot();
    const found = [...(root.#typeMap.get(type.name) ?? [])] as T[];
    if (root instanceof type) found.push(root as T);
    return found;
  }

  getRoot(): Node {
    let node: Node = this;
    while (node.#parent) {
      node = node.#parent;
    }
    return node;
  }

  _beforeProcess(deltaTime: number): void {
    // Override in subclasses
  }

  _process(deltaTime: number): void {
    // Override in subclasses
  }

  _afterProcess(deltaTime: number): void {
    // Override in subclasses
  }

  _beforeProcessStatic(deltaTime: number): void {
    // Override in subclasses
  }

  _processStatic(deltaTime: number): void {
    // Override in subclasses
  }

  _afterProcessStatic(deltaTime: number): void {
    // Override in subclasses
  }

  protected _ready(): void {
    // Override in subclasses
  }
}
