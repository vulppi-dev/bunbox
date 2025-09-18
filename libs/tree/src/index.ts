import {
  EventEmitter,
  type EventMap,
  type MergeEventMaps,
} from '@bunbox/utils';
import { ulid } from 'ulid';

type NodeEvents = {
  'add-child': [child: AbstractNode];
  'remove-child': [child: AbstractNode];
  rename: [child: AbstractNode, prev: string, next: string];
};

const NODE_ID_MAP = new Map<string, AbstractNode>();
const NODE_NAME_MAP = new Map<string, Set<AbstractNode>>();
const NODE_TYPE_MAP = new Map<string, Set<AbstractNode>>();

function setOnMap(
  key: string,
  node: AbstractNode,
  map: Map<string, Set<AbstractNode>>,
) {
  if (!key) return;

  if (!map.has(key)) {
    map.set(key, new Set());
  }
  map.get(key)!.add(node);
}

function deleteOnMap(
  key: string,
  node: AbstractNode,
  map: Map<string, Set<AbstractNode>>,
) {
  if (!key) return;

  if (map.has(key)) {
    map.get(key)!.delete(node);
    if (map.get(key)!.size === 0) {
      map.delete(key);
    }
  }
}

export abstract class AbstractNode<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends EventEmitter<MergeEventMaps<NodeEvents, T>> {
  readonly #id: string;
  readonly #properties: P;
  metadata: Partial<M> = {};

  #name: string = '';
  #parent: AbstractNode | null = null;
  #children: Set<AbstractNode> = new Set();

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

    NODE_ID_MAP.set(this.#id, this as AbstractNode);
    setOnMap(this._getType(), this as AbstractNode, NODE_TYPE_MAP);
    if (name) {
      this.#name = name;
      setOnMap(name, this as AbstractNode, NODE_NAME_MAP);
    }

    this.on('dispose', () => {
      NODE_ID_MAP.delete(this.#id);
      deleteOnMap(this.#name, this as AbstractNode, NODE_NAME_MAP);
      deleteOnMap(this._getType(), this as AbstractNode, NODE_TYPE_MAP);

      if (this.#parent) {
        this.#parent.removeChild(this as AbstractNode);
      }

      const snapshot = [...this.#children];
      for (const child of snapshot) {
        child.dispose();
      }
      this.#children.clear();
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

  get children(): readonly AbstractNode[] {
    return Object.freeze([...this.#children]);
  }

  get name() {
    return this.#name;
  }

  set name(value: string) {
    if (this.#name === value) return;

    const oldName = this.#name;
    this.#name = value;
    this.markAsDirty();
    deleteOnMap(oldName, this as AbstractNode, NODE_NAME_MAP);
    setOnMap(value, this as AbstractNode, NODE_NAME_MAP);
    (this as AbstractNode).emit('rename', this as AbstractNode, oldName, value);
  }

  #isAncestorOf(node: AbstractNode): boolean {
    let curr: AbstractNode | null = node.#parent;
    while (curr) {
      if (curr === this) return true;
      curr = curr.#parent;
    }
    return false;
  }

  addChild(child: AbstractNode) {
    if (child === this) {
      throw new Error('Cannot add a node as a child of itself');
    }
    if (child.#isAncestorOf(this as AbstractNode)) {
      throw new Error('Cannot add an ancestor as a child (cycle detected)');
    }

    if (child.#parent) {
      child.#parent.removeChild(child);
    }

    if (child.#parent === this) return true;
    if (this.#children.has(child)) return true;

    this.#children.add(child);
    child.#parent = this as any;
    this.markAsDirty();
    (this as AbstractNode).emit('add-child', child);

    // Bind child events
    const unsubscribe = [
      child.subscribe('rename', (c, prev, next) => {
        this.markAsDirty();
        (this as AbstractNode).emit('rename', c, prev, next);
      }),
      child.subscribe('add-child', (c) => {
        this.markAsDirty();
        (this as AbstractNode).emit('add-child', c);
      }),
      child.subscribe('remove-child', (c) => {
        this.markAsDirty();
        (this as AbstractNode).emit('remove-child', c);
      }),
    ];

    this.#bindMap.set(child.id, () => {
      for (const off of unsubscribe) off();
    });

    child._ready();

    return true;
  }

  removeChild(child: AbstractNode) {
    if (!this.#children.has(child)) {
      return false;
    }

    this.#children.delete(child);
    child.#parent = null;

    // Unbind child events
    const unbind = this.#bindMap.get(child.id);
    if (unbind) {
      unbind();
      this.#bindMap.delete(child.id);
    }

    this.markAsDirty();
    (this as AbstractNode).emit('remove-child', child);

    return true;
  }

  getById(id: string): AbstractNode | null {
    return this.#id === id
      ? (this as AbstractNode)
      : (NODE_ID_MAP.get(id) ?? null);
  }

  findByName(name: string): AbstractNode[] {
    return [...(NODE_NAME_MAP.get(name) ?? [])];
  }

  findByType<T extends AbstractNode>(type: new (...args: any[]) => T): T[] {
    return [...(NODE_TYPE_MAP.get(type.name) ?? [])] as T[];
  }

  getRoot(): AbstractNode {
    let node: AbstractNode = this as any;
    while (node.#parent) {
      node = node.#parent;
    }
    return node;
  }

  protected _ready(): void {
    // Override in subclasses
  }

  protected abstract _getType(): string;
}

export class Node<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends AbstractNode<P, M, T> {
  protected override _getType(): string {
    return 'Node';
  }
}
