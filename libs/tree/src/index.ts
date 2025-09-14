import {
  EventEmitter,
  type EventMap,
  type MergeEventMaps,
} from '@bunbox/utils';
import { ulid } from 'ulid';

type NodeEvents = {
  'add-child': [child: Node];
  'remove-child': [child: Node];
  rename: [child: Node, prev: string, next: string];
};

export const NODE_ID_MAP = new Map<string, Node>();
export const NODE_NAME_MAP = new Map<string, Set<Node>>();
export const NODE_TYPE_MAP = new Map<string, Set<Node>>();

function setOnMap(key: string, node: Node, map: Map<string, Set<Node>>) {
  if (!key) return;

  if (!map.has(key)) {
    map.set(key, new Set());
  }
  map.get(key)!.add(node);
}

function deleteOnMap(key: string, node: Node, map: Map<string, Set<Node>>) {
  if (!key) return;

  if (map.has(key)) {
    map.get(key)!.delete(node);
    if (map.get(key)!.size === 0) {
      map.delete(key);
    }
  }
}

export class Node<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends EventEmitter<MergeEventMaps<NodeEvents, T>> {
  readonly #id: string;
  readonly #properties: P;
  metadata: Partial<M> = {};

  #name: string = '';
  #parent: Node | null = null;
  #children: Node[] = [];

  #bindMap: Map<string, () => void> = new Map();

  constructor(name?: string) {
    super();
    this.#id = ulid();
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

    NODE_ID_MAP.set(this.#id, this as Node);
    setOnMap(this.constructor.name, this as Node, NODE_TYPE_MAP);
    if (name) {
      this.#name = name;
      setOnMap(name, this as Node, NODE_NAME_MAP);
    }

    this.on('dispose', () => {
      NODE_ID_MAP.delete(this.#id);
      deleteOnMap(this.#name, this as Node, NODE_NAME_MAP);
      deleteOnMap(this.constructor.name, this as Node, NODE_TYPE_MAP);

      if (this.#parent) {
        this.#parent.removeChild(this as Node);
      }

      const snapshot = [...this.#children];
      for (const child of snapshot) {
        child.dispose();
      }
      this.#children = [];
    });
  }

  get id() {
    return this.#id;
  }

  get properties() {
    return this.#properties;
  }

  get parent() {
    return this.#parent;
  }

  get children(): readonly Node[] {
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
    deleteOnMap(oldName, this as Node, NODE_NAME_MAP);
    setOnMap(value, this as Node, NODE_NAME_MAP);
    (this as Node).emit('rename', this as Node, oldName, value);
  }

  #isAncestorOf(node: Node): boolean {
    let curr: Node | null = node.#parent;
    while (curr) {
      if (curr === this) return true;
      curr = curr.#parent;
    }
    return false;
  }

  addChild(child: Node) {
    if (child === this) {
      throw new Error('Cannot add a node as a child of itself');
    }
    if (child.#isAncestorOf(this as Node)) {
      throw new Error('Cannot add an ancestor as a child (cycle detected)');
    }

    if (child.#parent) {
      child.#parent.removeChild(child);
    }

    if (child.#parent === this) return this;
    if (this.#children.includes(child)) return this;

    this.#children.push(child);
    child.#parent = this as any;
    this.markAsDirty();
    (this as Node).emit('add-child', child);

    // Bind child events
    const unsubscribe = [
      child.subscribe('rename', (c, prev, next) => {
        this.markAsDirty();
        (this as Node).emit('rename', c, prev, next);
      }),
      child.subscribe('add-child', (c) => {
        this.markAsDirty();
        (this as Node).emit('add-child', c);
      }),
      child.subscribe('remove-child', (c) => {
        this.markAsDirty();
        (this as Node).emit('remove-child', c);
      }),
    ];

    this.#bindMap.set(child.id, () => {
      for (const off of unsubscribe) off();
    });

    child._ready();

    return this;
  }

  removeChild(child: Node) {
    const index = this.#children.indexOf(child);
    if (index === -1) {
      throw new Error('The specified node is not a child of this node');
    }

    this.#children.splice(index, 1);
    child.#parent = null;

    // Unbind child events
    const unbind = this.#bindMap.get(child.id);
    if (unbind) {
      unbind();
      this.#bindMap.delete(child.id);
    }

    this.markAsDirty();
    (this as Node).emit('remove-child', child);

    return this;
  }

  getById(id: string): Node | null {
    return this.#id === id ? (this as Node) : (NODE_ID_MAP.get(id) ?? null);
  }

  findByName(name: string): Node[] {
    return [...(NODE_NAME_MAP.get(name) ?? [])];
  }

  findByType<T extends Node>(type: new (...args: any[]) => T): T[] {
    return [...(NODE_TYPE_MAP.get(type.name) ?? [])] as T[];
  }

  getRoot(): Node {
    let node: Node = this as any;
    while (node.#parent) {
      node = node.#parent;
    }
    return node;
  }

  protected _ready(): void {
    // Override in subclasses
  }
}
