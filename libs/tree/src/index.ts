import {
  EventEmitter,
  type Ctor,
  type EventMap,
  type MergeEventMaps,
} from '@bunbox/utils';
import { ulid } from 'ulid';

type NodeEvents = {
  'add-child': [child: BaseNode];
  'remove-child': [child: BaseNode];
  rename: [child: BaseNode, prev: string, next: string];
  'enabled-change': [child: BaseNode];
  'tag-change': [node: BaseNode, tag: string, action: 'add' | 'remove'];
};

/**
 * Base class for all nodes in the tree.
 *
 * Responsibilities:
 * - Identity (unique `id`)
 * - Parent/children management (acyclic, re-parenting supported)
 * - Dirty-state tracking on property and structural changes
 * - Name/type indexing for fast lookup (via Root node)
 * - Enabled state (skip traversal by default when disabled)
 * - Event propagation: child events are re-emitted by ancestors
 *
 * Generics:
 * - `P`: Shape of the reactive `properties` bag. Assignments mark the node as dirty.
 * - `M`: Shape of the `metadata` bag (free-form, not reactive by default).
 * - `T`: Additional event map merged with built-in `NodeEvents`.
 */
export class BaseNode<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends EventEmitter<MergeEventMaps<NodeEvents, T>> {
  readonly #id: string;
  readonly #properties: P;
  metadata: Partial<M> = {};

  #name: string = '';
  #parent: BaseNode | null = null;
  #children: Set<BaseNode> = new Set();
  #enabled: boolean = true;
  #tags: Set<string> = new Set();

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

    if (name) {
      this.#name = name;
    }
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
  get children(): readonly BaseNode[] {
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

    (this as BaseNode).emit('rename', this as BaseNode, oldName, value);
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
    (this as BaseNode).emit('enabled-change', this as BaseNode);
    return this;
  }

  // Tag API
  /**
   * Add a tag to this node.
   * Tags are indexed by Root for fast lookup via `findByTag()`.
   * @param tag The tag to add.
   * @returns `true` if the tag was added, `false` if it already existed.
   */
  addTag(tag: string): boolean {
    if (!tag || this.#tags.has(tag)) return false;

    this.#tags.add(tag);
    this.markAsDirty();
    (this as BaseNode).emit('tag-change', this as BaseNode, tag, 'add');

    return true;
  }

  /**
   * Remove a tag from this node.
   * @param tag The tag to remove.
   * @returns `true` if the tag was removed, `false` if it didn't exist.
   */
  removeTag(tag: string): boolean {
    if (!this.#tags.has(tag)) return false;

    this.#tags.delete(tag);
    this.markAsDirty();
    (this as BaseNode).emit('tag-change', this as BaseNode, tag, 'remove');

    return true;
  }

  /**
   * Check if this node has a specific tag.
   * @param tag The tag to check.
   * @returns `true` if the node has the tag, `false` otherwise.
   */
  hasTag(tag: string): boolean {
    return this.#tags.has(tag);
  }

  /**
   * Get all tags on this node.
   * @returns A read-only array of tags.
   */
  getTags(): readonly string[] {
    return Object.freeze([...this.#tags]);
  }

  /**
   * Clear all tags from this node.
   * @returns The number of tags that were removed.
   */
  clearTags(): number {
    const count = this.#tags.size;
    const tags = [...this.#tags];

    for (const tag of tags) {
      this.removeTag(tag);
    }

    return count;
  }

  #isAncestorOf(node: BaseNode): boolean {
    let curr: BaseNode | null = node.#parent;
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
   * @returns `true` when the child is attached or already present.
   */
  addChild(child: BaseNode) {
    if (child === this) {
      throw new Error('Cannot add a node as a child of itself');
    }
    if (child.#isAncestorOf(this as BaseNode)) {
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
    (this as BaseNode).emit('add-child', child);

    // Bind child events
    const unsubscribe = [
      child.subscribe('rename', (c, prev, next) => {
        this.markAsDirty();
        (this as BaseNode).emit('rename', c, prev, next);
      }),
      child.subscribe('add-child', (c) => {
        this.markAsDirty();
        (this as BaseNode).emit('add-child', c);
      }),
      child.subscribe('remove-child', (c) => {
        this.markAsDirty();
        (this as BaseNode).emit('remove-child', c);
      }),
      child.subscribe('enabled-change', (c) => {
        this.markAsDirty();
        (this as BaseNode).emit('enabled-change', c);
      }),
      child.subscribe('tag-change', (c, tag, action) => {
        this.markAsDirty();
        (this as BaseNode).emit('tag-change', c, tag, action);
      }),
    ];

    this.#bindMap.set(child.id, () => {
      for (const off of unsubscribe) off();
    });

    return true;
  }

  /**
   * Remove a child from this node.
   * - Unbinds event propagation from the removed child.
   * - Emits `remove-child`.
   * @returns `false` if the child was not attached, otherwise `true`.
   */
  removeChild(child: BaseNode) {
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
    (this as BaseNode).emit('remove-child', child);

    return true;
  }

  /**
   * Find a node by its unique ID.
   * Searches in the Root's index if this node is part of a tree.
   * @param id The unique ID to search for.
   * @returns The node with the given ID, or null if not found.
   */
  getById(id: string): BaseNode | null {
    if (this.#id === id) return this as BaseNode;

    const root = this.getRoot();
    if (root instanceof Root) {
      return root.getById(id);
    }

    return null;
  }

  /**
   * Find nodes by name.
   * Searches in the Root's index if this node is part of a tree.
   * @param name The name to look up.
   * @returns An array of nodes currently indexed by the given name.
   */
  findByName(name: string): BaseNode[] {
    const root = this.getRoot();
    if (root instanceof Root) {
      return root.findByName(name);
    }

    return [];
  }

  /**
   * Find nodes by tag.
   * Searches in the Root's index if this node is part of a tree.
   * @param tag The tag to search for.
   * @returns An array of nodes that have the specified tag.
   */
  findByTag(tag: string): BaseNode[] {
    const root = this.getRoot();
    if (root instanceof Root) {
      return root.findByTag(tag);
    }

    return [];
  }

  /**
   * Find nodes by multiple tags (AND operation).
   * Searches in the Root's index if this node is part of a tree.
   * Only returns nodes that have ALL specified tags.
   *
   * @example
   * ```ts
   * // Returns only nodes that have BOTH 'enemy' AND 'flying' tags
   * const results = node.findByTags('enemy', 'flying');
   * ```
   *
   * @param tags Tags to match (nodes must have ALL tags).
   * @returns An array of nodes that have all the specified tags.
   */
  findByTags(...tags: string[]): BaseNode[] {
    const root = this.getRoot();
    if (root instanceof Root) {
      return root.findByTags(...tags);
    }

    return [];
  }

  /**
   * Get the root node of this node's tree (walks parents to the top).
   */
  getRoot(): BaseNode | Root {
    let node: BaseNode | Root = this as any;
    while (node instanceof BaseNode && node.#parent) {
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
    visitor: (node: BaseNode) => void,
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

    if (order === 'pre') visitor(this as BaseNode);

    for (const child of this.#children) {
      child.traverse(visitor, { includeDisabled, order });
    }

    if (order === 'post') visitor(this as BaseNode);
  }

  /**
   * Dispose this node, removing it from the tree and recursively disposing all children.
   *
   * Process:
   * 1. Removes itself from parent (if any)
   * 2. Traverses children in post-order (reverse) and disposes each one
   * 3. Calls parent dispose() to emit 'dispose' event and clean up
   */
  override async dispose(): Promise<void> {
    // Step 1: Remove from parent tree
    if (this.#parent) {
      this.#parent.removeChild(this as BaseNode);
    }

    // Step 2: Dispose children in post-order (leaf to root)
    const snapshot = [...this.#children];
    for (const child of snapshot) {
      await child.dispose();
    }
    this.#children.clear();

    // Step 3: Dispose self (emits 'dispose' event and marks as disposed)
    await super.dispose();
  }
}

/**
 * Root node that manages the global indices for all nodes in its tree.
 *
 * Responsibilities:
 * - Maintains NODE_ID_MAP and NODE_NAME_MAP for fast lookups
 * - Automatically registers/unregisters nodes when they enter/leave the tree
 * - Scans entire subtrees to keep indices up-to-date
 */
export class Root<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends BaseNode<P, M, T> {
  readonly #nodeIdMap = new Map<string, BaseNode>();
  readonly #nodeNameMap = new Map<string, Set<BaseNode>>();
  readonly #nodeTagMap = new Map<string, Set<BaseNode>>();

  constructor(name?: string) {
    super(name);

    // Register self
    this.#nodeIdMap.set(this.id, this);
    if (this.name) {
      if (!this.#nodeNameMap.has(this.name)) {
        this.#nodeNameMap.set(this.name, new Set());
      }
      this.#nodeNameMap.get(this.name)!.add(this);
    }
    // Register self tags
    this.#registerNodeTags(this);

    // Listen to rename events from descendants to update name index
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('rename', (...args: [BaseNode, string, string]) => {
      const [node, oldName, newName] = args;
      this.#updateNodeName(node, oldName, newName);
    });

    // Listen to add-child events to register nodes
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('add-child', (...args: [BaseNode]) => {
      const [child] = args;
      this.#registerNode(child);
    });

    // Listen to remove-child events to unregister nodes
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('remove-child', (...args: [BaseNode]) => {
      const [child] = args;
      this.#unregisterNode(child);
    });

    // Listen to tag-change events to update tag index
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('tag-change', (...args: [BaseNode, string, 'add' | 'remove']) => {
      const [node, tag, action] = args;
      if (action === 'add') {
        this.#addTagToIndex(node, tag);
      } else {
        this.#removeTagFromIndex(node, tag);
      }
    });
  }

  /**
   * Register a node and all its descendants in the maps.
   */
  #registerNode(node: BaseNode): void {
    // Register by ID
    this.#nodeIdMap.set(node.id, node);

    // Register by name
    if (node.name) {
      if (!this.#nodeNameMap.has(node.name)) {
        this.#nodeNameMap.set(node.name, new Set());
      }
      this.#nodeNameMap.get(node.name)!.add(node);
    }

    // Register tags
    this.#registerNodeTags(node);

    // Register all children recursively
    for (const child of node.children) {
      this.#registerNode(child);
    }
  }

  /**
   * Unregister a node and all its descendants from the maps.
   */
  #unregisterNode(node: BaseNode): void {
    // Unregister by ID
    this.#nodeIdMap.delete(node.id);

    // Unregister by name
    if (node.name && this.#nodeNameMap.has(node.name)) {
      this.#nodeNameMap.get(node.name)!.delete(node);
      if (this.#nodeNameMap.get(node.name)!.size === 0) {
        this.#nodeNameMap.delete(node.name);
      }
    }

    // Unregister tags
    this.#unregisterNodeTags(node);

    // Unregister all children recursively
    for (const child of node.children) {
      this.#unregisterNode(child);
    }
  }

  /**
   * Update node name in the index.
   */
  #updateNodeName(node: BaseNode, oldName: string, newName: string): void {
    // Remove from old name index
    if (oldName && this.#nodeNameMap.has(oldName)) {
      this.#nodeNameMap.get(oldName)!.delete(node);
      if (this.#nodeNameMap.get(oldName)!.size === 0) {
        this.#nodeNameMap.delete(oldName);
      }
    }

    // Add to new name index
    if (newName) {
      if (!this.#nodeNameMap.has(newName)) {
        this.#nodeNameMap.set(newName, new Set());
      }
      this.#nodeNameMap.get(newName)!.add(node);
    }
  }

  /**
   * Add a tag to the index for a specific node.
   */
  #addTagToIndex(node: BaseNode, tag: string): void {
    if (!tag) return;

    if (!this.#nodeTagMap.has(tag)) {
      this.#nodeTagMap.set(tag, new Set());
    }
    this.#nodeTagMap.get(tag)!.add(node);
  }

  /**
   * Remove a tag from the index for a specific node.
   */
  #removeTagFromIndex(node: BaseNode, tag: string): void {
    if (!tag || !this.#nodeTagMap.has(tag)) return;

    this.#nodeTagMap.get(tag)!.delete(node);
    if (this.#nodeTagMap.get(tag)!.size === 0) {
      this.#nodeTagMap.delete(tag);
    }
  }

  /**
   * Register all tags of a node in the index.
   */
  #registerNodeTags(node: BaseNode): void {
    for (const tag of node.getTags()) {
      this.#addTagToIndex(node, tag);
    }
  }

  /**
   * Unregister all tags of a node from the index.
   */
  #unregisterNodeTags(node: BaseNode): void {
    for (const tag of node.getTags()) {
      this.#removeTagFromIndex(node, tag);
    }
  }

  /**
   * Find a node by its unique ID.
   */
  override getById(id: string): BaseNode | null {
    return this.#nodeIdMap.get(id) ?? null;
  }

  /**
   * Find all nodes with the given name.
   */
  override findByName(name: string): BaseNode[] {
    return [...(this.#nodeNameMap.get(name) ?? [])];
  }

  /**
   * Find all nodes with the given tag.
   * @param tag The tag to search for.
   * @returns An array of nodes that have the specified tag.
   */
  override findByTag(tag: string): BaseNode[] {
    return [...(this.#nodeTagMap.get(tag) ?? [])];
  }

  /**
   * Find all nodes that have ALL of the specified tags (AND operation).
   * Only nodes that possess every single tag in the list will be returned.
   *
   * @example
   * ```ts
   * const node1 = new BaseNode();
   * node1.addTag('enemy');
   * node1.addTag('flying');
   *
   * const node2 = new BaseNode();
   * node2.addTag('enemy');
   *
   * root.findByTags('enemy', 'flying'); // Returns [node1] only
   * root.findByTags('enemy'); // Returns [node1, node2]
   * ```
   *
   * @param tags Array of tags to match (AND operation - all tags required).
   * @returns An array of nodes that have all the specified tags.
   */
  override findByTags(...tags: string[]): BaseNode[] {
    if (tags.length === 0) return [];
    if (tags.length === 1) return this.findByTag(tags[0]!);

    // Start with nodes that have the first tag
    const firstTagNodes = this.#nodeTagMap.get(tags[0]!);
    if (!firstTagNodes) return [];

    // Filter nodes that have all other tags
    const result: BaseNode[] = [];
    for (const node of firstTagNodes) {
      if (tags.every((tag) => node.hasTag(tag))) {
        result.push(node);
      }
    }

    return result;
  }

  /**
   * Get all registered node IDs.
   */
  getAllIds(): string[] {
    return [...this.#nodeIdMap.keys()];
  }

  /**
   * Get all registered node names.
   */
  getAllNames(): string[] {
    return [...this.#nodeNameMap.keys()];
  }

  /**
   * Get all registered tags across all nodes.
   */
  getAllTags(): string[] {
    return [...this.#nodeTagMap.keys()];
  }

  /**
   * Get the total number of registered nodes.
   */
  get nodeCount(): number {
    return this.#nodeIdMap.size;
  }
}
