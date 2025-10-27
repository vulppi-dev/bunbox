import {
  EventEmitter,
  type Ctor,
  type EventMap,
  type MergeEventMaps,
} from '@bunbox/utils';
import { ulid } from 'ulid';

type NodeEvents = {
  'add-child': [child: AbstractNode];
  'remove-child': [child: AbstractNode];
  rename: [child: AbstractNode, prev: string, next: string];
  'enabled-change': [child: AbstractNode];
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

/**
 * Base class for all nodes in the tree.
 *
 * Responsibilities:
 * - Identity (unique `id`)
 * - Parent/children management (acyclic, re-parenting supported)
 * - Dirty-state tracking on property and structural changes
 * - Name/type indexing for fast lookup (global maps)
 * - Enabled state (skip traversal by default when disabled)
 * - Event propagation: child events are re-emitted by ancestors
 *
 * Generics:
 * - `P`: Shape of the reactive `properties` bag. Assignments mark the node as dirty.
 * - `M`: Shape of the `metadata` bag (free-form, not reactive by default).
 * - `T`: Additional event map merged with built-in `NodeEvents`.
 */
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
  #enabled: boolean = true;

  #bindMap: Map<string, () => void> = new Map();

  /**
   * Create a new node.
   * @param name Optional initial name. When provided, the node is indexed by this name.
   */
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

  /**
   * Unique identifier of this node. Generated using ULID.
   */
  get id() {
    return this.#id;
  }

  /**
   * Reactive properties bag (shape `P`).
   * - Assigning or deleting a property marks the node as dirty.
   * - Use for gameplay/state properties that should trigger updates.
   */
  get properties() {
    return this.#properties;
  }

  /**
   * The parent node, or `null` if this node is the root of its tree.
   */
  get parent() {
    return this.#parent;
  }

  /**
   * Read-only snapshot of direct children.
   */
  get children(): readonly AbstractNode[] {
    return Object.freeze([...this.#children]);
  }

  /**
   * Node name used for indexing and lookups via `findByName`.
   */
  get name() {
    return this.#name;
  }

  /**
   * Change the node name. Updates the name index and emits `rename`.
   */
  set name(value: string) {
    if (this.#name === value) return;

    const oldName = this.#name;
    this.#name = value;
    this.markAsDirty();
    deleteOnMap(oldName, this as AbstractNode, NODE_NAME_MAP);
    setOnMap(value, this as AbstractNode, NODE_NAME_MAP);
    (this as AbstractNode).emit('rename', this as AbstractNode, oldName, value);
  }

  // Enabled state API
  /**
   * Whether this node is enabled. Disabled nodes are ignored by traversal by default.
   */
  get isEnabled(): boolean {
    return this.#enabled;
  }

  /** Enable this node. */
  enable(): this {
    return this.setEnabled(true);
  }

  /** Disable this node. */
  disable(): this {
    return this.setEnabled(false);
  }

  /**
   * Set the enabled state and emit `enabled-change` when it changes.
   *
   * Note: By design, the `enabled-change` event payload includes only the node itself.
   */
  setEnabled(value: boolean): this {
    if (this.#enabled === value) return this;
    this.#enabled = value;
    this.markAsDirty();
    (this as AbstractNode).emit('enabled-change', this as AbstractNode);
    return this;
  }

  #isAncestorOf(node: AbstractNode): boolean {
    let curr: AbstractNode | null = node.#parent;
    while (curr) {
      if (curr === this) return true;
      curr = curr.#parent;
    }
    return false;
  }

  /**
   * Add a child to this node.
   * - Throws if attempting to add itself or create a cycle (ancestor as child).
   * - If the child had a previous parent, it will be re-parented.
   * - Emits `add-child` on this node and re-emits child events up the chain.
   * - Invokes the child's protected `_ready()` hook after binding.
   * @returns `true` when the child is attached or already present.
   */
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
      child.subscribe('enabled-change', (c) => {
        this.markAsDirty();
        (this as AbstractNode).emit('enabled-change', c);
      }),
    ];

    this.#bindMap.set(child.id, () => {
      for (const off of unsubscribe) off();
    });

    child._ready();

    return true;
  }

  /**
   * Remove a child from this node.
   * - Unbinds event propagation from the removed child.
   * - Emits `remove-child`.
   * @returns `false` if the child was not attached, otherwise `true`.
   */
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

  /**
   * Find nodes by name across all existing nodes.
   * @param name The name to look up.
   * @returns An array of nodes currently indexed by the given name.
   */
  findByName(name: string): AbstractNode[] {
    return [...(NODE_NAME_MAP.get(name) ?? [])];
  }

  /**
   * Find nodes by constructor type across all existing nodes.
   * @param type The class constructor to search for (uses `type.name`).
   * @returns An array of nodes matching the type.
   */
  findByType<T extends AbstractNode>(type: new (...args: any[]) => T): T[] {
    return [...(NODE_TYPE_MAP.get(type.name) ?? [])] as T[];
  }

  /**
   * Get the root node of this node's tree (walks parents to the top).
   */
  getRoot(): AbstractNode {
    let node: AbstractNode = this as any;
    while (node.#parent) {
      node = node.#parent;
    }
    return node;
  }

  /**
   * Traverse the tree from this node and invoke `visitor` for each visited node.
   *
   * Behavior:
   * - By default, disabled nodes (isEnabled === false) are skipped along with their subtrees.
   * - Set `includeDisabled` to `true` to include disabled nodes in traversal.
   * - Use `order: 'pre' | 'post'` to control visit order (default: `'pre'`).
   *
   * @param visitor Function invoked for each visited node.
   * @param options Optional traversal options.
   */
  traverse(
    visitor: (node: AbstractNode) => void,
    options?: {
      includeDisabled?: boolean;
      order?: 'pre' | 'post';
      ignoreType?: Ctor;
    },
  ): void {
    const includeDisabled = Boolean(options?.includeDisabled);
    const order = options?.order ?? 'pre';

    if (options?.ignoreType && this instanceof options?.ignoreType) return;

    if (!includeDisabled && !this.isEnabled) return;

    if (order === 'pre') visitor(this as AbstractNode);

    for (const child of this.#children) {
      child.traverse(visitor, { includeDisabled, order });
    }

    if (order === 'post') visitor(this as AbstractNode);
  }

  protected _ready(): void {
    // Override in subclasses
  }

  /** @internal */
  protected abstract _getType(): string;
}

/**
 * Default concrete node type when you don't need a custom subclass.
 *
 * Example:
 * const root = new Node();
 * const child = new Node('child');
 * root.addChild(child);
 */
export class Node<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends AbstractNode<P, M, T> {
  /** @internal */
  protected override _getType(): string {
    return 'Node';
  }
}
