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
  readonly __id: string;
  readonly __properties: P;
  metadata: Partial<M> = {};

  private __name: string = '';
  private __parent: BaseNode | null = null;
  private __children: Set<BaseNode> = new Set();
  private __enabled: boolean = true;
  private __tags: Set<string> = new Set();

  private __bindMap: Map<string, () => void> = new Map();

  /**
   * Create a new node.
   * @param name Optional initial name. When provided, the node is indexed by this name.
   */
  constructor(name?: string) {
    super();
    this.__id = ulid();
    this.__properties = new Proxy({} as P, {
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
      this.__name = name;
    }
  }

  /**
   * Unique identifier of this node. Generated using ULID.
   */
  get id() {
    return this.__id;
  }

  /**
   * Reactive properties bag (shape `P`).
   * - Assigning or deleting a property marks the node as dirty.
   * - Use for gameplay/state properties that should trigger updates.
   */
  get properties() {
    return this.__properties;
  }

  /**
   * The parent node, or `null` if this node is the root of its tree.
   */
  get parent() {
    return this.__parent;
  }

  /**
   * Read-only snapshot of direct children.
   */
  get children(): readonly BaseNode[] {
    return Object.freeze([...this.__children]);
  }

  /**
   * Node name used for indexing and lookups via `findByName`.
   */
  get name() {
    return this.__name;
  }

  /**
   * Change the node name. Updates the name index and emits `rename`.
   */
  set name(value: string) {
    if (this.__name === value) return;

    const oldName = this.__name;
    this.__name = value;
    this.markAsDirty();

    (this as BaseNode).emit('rename', this as BaseNode, oldName, value);
  }

  // Enabled state API
  /**
   * Whether this node is enabled. Disabled nodes are ignored by traversal by default.
   */
  get isEnabled(): boolean {
    return this.__enabled;
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
    if (this.__enabled === value) return this;
    this.__enabled = value;
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
    if (!tag || this.__tags.has(tag)) return false;

    this.__tags.add(tag);
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
    if (!this.__tags.has(tag)) return false;

    this.__tags.delete(tag);
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
    return this.__tags.has(tag);
  }

  /**
   * Get all tags on this node.
   * @returns A read-only array of tags.
   */
  getTags(): readonly string[] {
    return Object.freeze([...this.__tags]);
  }

  /**
   * Clear all tags from this node.
   * @returns The number of tags that were removed.
   */
  clearTags(): number {
    const count = this.__tags.size;
    const tags = [...this.__tags];

    for (const tag of tags) {
      this.removeTag(tag);
    }

    return count;
  }

  private __isAncestorOf(node: BaseNode): boolean {
    let curr: BaseNode | null = node.__parent;
    while (curr) {
      if (curr === this) return true;
      curr = curr.__parent;
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
    if (child.__isAncestorOf(this as BaseNode)) {
      throw new Error('Cannot add an ancestor as a child (cycle detected)');
    }

    if (child.__parent) {
      child.__parent.removeChild(child);
    }

    if (child.__parent === this) return true;
    if (this.__children.has(child)) return true;

    this.__children.add(child);
    child.__parent = this as any;
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

    this.__bindMap.set(child.id, () => {
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
    if (!this.__children.has(child)) {
      return false;
    }

    this.__children.delete(child);
    child.__parent = null;

    // Unbind child events
    const unbind = this.__bindMap.get(child.id);
    if (unbind) {
      unbind();
      this.__bindMap.delete(child.id);
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
    if (this.__id === id) return this as BaseNode;

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
    while (node instanceof BaseNode && node.__parent) {
      node = node.__parent;
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

    for (const child of this.__children) {
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
    if (this.__parent) {
      this.__parent.removeChild(this as BaseNode);
    }

    // Step 2: Dispose children in post-order (leaf to root)
    const snapshot = [...this.__children];
    for (const child of snapshot) {
      await child.dispose();
    }
    this.__children.clear();

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
  readonly __nodeIdMap = new Map<string, BaseNode>();
  readonly __nodeNameMap = new Map<string, Set<BaseNode>>();
  readonly __nodeTagMap = new Map<string, Set<BaseNode>>();

  constructor(name?: string) {
    super(name);

    // Register self
    this.__nodeIdMap.set(this.id, this);
    if (this.name) {
      if (!this.__nodeNameMap.has(this.name)) {
        this.__nodeNameMap.set(this.name, new Set());
      }
      this.__nodeNameMap.get(this.name)!.add(this);
    }
    // Register self tags
    this.__registerNodeTags(this);

    // Listen to rename events from descendants to update name index
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('rename', (...args: [BaseNode, string, string]) => {
      const [node, oldName, newName] = args;
      this.__updateNodeName(node, oldName, newName);
    });

    // Listen to add-child events to register nodes
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('add-child', (...args: [BaseNode]) => {
      const [child] = args;
      this.__registerNode(child);
    });

    // Listen to remove-child events to unregister nodes
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('remove-child', (...args: [BaseNode]) => {
      const [child] = args;
      this.__unregisterNode(child);
    });

    // Listen to tag-change events to update tag index
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('tag-change', (...args: [BaseNode, string, 'add' | 'remove']) => {
      const [node, tag, action] = args;
      if (action === 'add') {
        this.__addTagToIndex(node, tag);
      } else {
        this.__removeTagFromIndex(node, tag);
      }
    });
  }

  /**
   * Register a node and all its descendants in the maps.
   */
  private __registerNode(node: BaseNode): void {
    // Register by ID
    this.__nodeIdMap.set(node.id, node);

    // Register by name
    if (node.name) {
      if (!this.__nodeNameMap.has(node.name)) {
        this.__nodeNameMap.set(node.name, new Set());
      }
      this.__nodeNameMap.get(node.name)!.add(node);
    }

    // Register tags
    this.__registerNodeTags(node);

    // Register all children recursively
    for (const child of node.children) {
      this.__registerNode(child);
    }
  }

  /**
   * Unregister a node and all its descendants from the maps.
   */
  private __unregisterNode(node: BaseNode): void {
    // Unregister by ID
    this.__nodeIdMap.delete(node.id);

    // Unregister by name
    if (node.name && this.__nodeNameMap.has(node.name)) {
      this.__nodeNameMap.get(node.name)!.delete(node);
      if (this.__nodeNameMap.get(node.name)!.size === 0) {
        this.__nodeNameMap.delete(node.name);
      }
    }

    // Unregister tags
    this.__unregisterNodeTags(node);

    // Unregister all children recursively
    for (const child of node.children) {
      this.__unregisterNode(child);
    }
  }

  /**
   * Update node name in the index.
   */
  private __updateNodeName(
    node: BaseNode,
    oldName: string,
    newName: string,
  ): void {
    // Remove from old name index
    if (oldName && this.__nodeNameMap.has(oldName)) {
      this.__nodeNameMap.get(oldName)!.delete(node);
      if (this.__nodeNameMap.get(oldName)!.size === 0) {
        this.__nodeNameMap.delete(oldName);
      }
    }

    // Add to new name index
    if (newName) {
      if (!this.__nodeNameMap.has(newName)) {
        this.__nodeNameMap.set(newName, new Set());
      }
      this.__nodeNameMap.get(newName)!.add(node);
    }
  }

  /**
   * Add a tag to the index for a specific node.
   */
  private __addTagToIndex(node: BaseNode, tag: string): void {
    if (!tag) return;

    if (!this.__nodeTagMap.has(tag)) {
      this.__nodeTagMap.set(tag, new Set());
    }
    this.__nodeTagMap.get(tag)!.add(node);
  }

  /**
   * Remove a tag from the index for a specific node.
   */
  private __removeTagFromIndex(node: BaseNode, tag: string): void {
    if (!tag || !this.__nodeTagMap.has(tag)) return;

    this.__nodeTagMap.get(tag)!.delete(node);
    if (this.__nodeTagMap.get(tag)!.size === 0) {
      this.__nodeTagMap.delete(tag);
    }
  }

  /**
   * Register all tags of a node in the index.
   */
  private __registerNodeTags(node: BaseNode): void {
    for (const tag of node.getTags()) {
      this.__addTagToIndex(node, tag);
    }
  }

  /**
   * Unregister all tags of a node from the index.
   */
  private __unregisterNodeTags(node: BaseNode): void {
    for (const tag of node.getTags()) {
      this.__removeTagFromIndex(node, tag);
    }
  }

  /**
   * Find a node by its unique ID.
   */
  override getById(id: string): BaseNode | null {
    return this.__nodeIdMap.get(id) ?? null;
  }

  /**
   * Find all nodes with the given name.
   */
  override findByName(name: string): BaseNode[] {
    return [...(this.__nodeNameMap.get(name) ?? [])];
  }

  /**
   * Find all nodes with the given tag.
   * @param tag The tag to search for.
   * @returns An array of nodes that have the specified tag.
   */
  override findByTag(tag: string): BaseNode[] {
    return [...(this.__nodeTagMap.get(tag) ?? [])];
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
    const firstTagNodes = this.__nodeTagMap.get(tags[0]!);
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
    return [...this.__nodeIdMap.keys()];
  }

  /**
   * Get all registered node names.
   */
  getAllNames(): string[] {
    return [...this.__nodeNameMap.keys()];
  }

  /**
   * Get all registered tags across all nodes.
   */
  getAllTags(): string[] {
    return [...this.__nodeTagMap.keys()];
  }

  /**
   * Get the total number of registered nodes.
   */
  get nodeCount(): number {
    return this.__nodeIdMap.size;
  }
}
