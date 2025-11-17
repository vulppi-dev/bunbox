import {
  EventEmitter,
  type Ctor,
  type EventMap,
  type MergeEventMaps,
} from '@bunbox/utils';
import { ulid } from 'ulid';

type NodeEvents = {
  'add-child': [child: Node];
  'remove-child': [child: Node];
  rename: [child: Node, prev: string, next: string];
  'enabled-change': [child: Node];
  'dirty-change': [child: Node];
  'tag-change': [node: Node, tag: string, action: 'add' | 'remove'];
};

/**
 * Internal symbol for the process event.
 * Used to trigger frame updates on nodes.
 */
export const PROCESS_EVENT = Symbol('_process');

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
 * - `M`: Shape of the `metadata` bag (free-form, not reactive by default).
 * - `T`: Additional event map merged with built-in `NodeEvents`.
 */
export class Node<
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends EventEmitter<MergeEventMaps<NodeEvents, T>> {
  private readonly __id: string;
  private __plugins: NodePlugin<Node>[] = [];
  metadata: Partial<M> = {};

  private __name: string = '';
  private __parent: Node | null = null;
  private __children: Set<Node> = new Set();
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
   * The parent node, or `null` if this node is the root of its tree.
   */
  get parent() {
    return this.__parent;
  }

  /**
   * Read-only snapshot of direct children.
   */
  get children(): readonly Node[] {
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

    (this as Node).emit('rename', this as Node, oldName, value);
  }

  // Enabled state API
  /**
   * Whether this node is enabled. Disabled nodes are ignored by traversal by default.
   */
  get isEnabled(): boolean {
    return this.__enabled;
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
    // Step 1: Dispose plugins
    const plugins = [...this.__plugins];
    for (const plugin of plugins) {
      plugin.dispose(this);
    }
    // Step 2: Dispose children in post-order (leaf to root)
    const children = [...this.__children];
    for (const child of children) {
      await child.dispose();
    }
    // Step 3: Remove from parent tree
    if (this.__parent) {
      this.__parent.removeChild(this as Node);
    }

    this.__children.clear();

    // Step 3: Dispose self (emits 'dispose' event and marks as disposed)
    await super.dispose();
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
    (this as Node).emit('enabled-change', this as Node);
    return this;
  }

  /**
   * Mark this node as dirty, indicating it has changed.
   * Emits `dirty-change` event.
   *
   * @returns This node for chaining.
   */
  override markAsDirty(): this {
    const self = super.markAsDirty();
    (this as Node).emit('dirty-change', this as Node);
    return self;
  }

  /**
   * Mark this node as clean, indicating it is up-to-date.
   * Emits `dirty-change` event.
   *
   * @returns This node for chaining.
   */
  override markAsClean(): this {
    const self = super.markAsClean();
    (this as Node).emit('dirty-change', this as Node);
    return self;
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
    (this as Node).emit('tag-change', this as Node, tag, 'add');

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
    (this as Node).emit('tag-change', this as Node, tag, 'remove');

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

  private __isAncestorOf(node: Node): boolean {
    let curr: Node | null = node.__parent;
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
  addChild(child: Node) {
    if (child === this) {
      throw new Error('Cannot add a node as a child of itself');
    }
    if (!(child instanceof Node)) {
      throw new TypeError('Child must be an instance of Node');
    }
    if (child.__isAncestorOf(this as Node)) {
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
      child.subscribe('enabled-change', (c) => {
        this.markAsDirty();
        (this as Node).emit('enabled-change', c);
      }),
      child.subscribe('tag-change', (c, tag, action) => {
        this.markAsDirty();
        (this as Node).emit('tag-change', c, tag, action);
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
  removeChild(child: Node) {
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
    (this as Node).emit('remove-child', child);

    return true;
  }

  /**
   * Find a node by its unique ID.
   * Searches in the Root's index if this node is part of a tree.
   * @param id The unique ID to search for.
   * @returns The node with the given ID, or null if not found.
   */
  getById(id: string): Node | null {
    if (this.__id === id) return this as Node;

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
  findByName(name: string): Node[] {
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
  findByTag(tag: string): Node[] {
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
  findByTags(...tags: string[]): Node[] {
    const root = this.getRoot();
    if (root instanceof Root) {
      return root.findByTags(...tags);
    }

    return [];
  }

  /**
   * Get the root node of this node's tree (walks parents to the top).
   */
  getRoot(): Node | Root {
    let node: Node | Root = this as any;
    while (node instanceof Node && node.__parent) {
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
    visitor: (node: Node) => void,
    options?: {
      includeDisabled?: boolean;
      order?: 'pre' | 'post';
      ignoreType?: Ctor;
    },
  ): void {
    const includeDisabled = Boolean(options?.includeDisabled);
    const order = options?.order ?? 'pre';
    const ignoreType = options?.ignoreType;

    if (ignoreType && this instanceof ignoreType) return;

    if (!includeDisabled && !this.isEnabled) return;

    if (order === 'pre') visitor(this as Node);

    for (const child of this.__children) {
      child.traverse(visitor, options);
    }

    if (order === 'post') visitor(this as Node);
  }

  /**
   * Add a plugin to this node.
   *
   * Plugins extend node functionality without inheritance.
   * Each plugin can hook into ready, process, and dispose lifecycles.
   *
   * @param plugin - The plugin to add
   * @returns This node for chaining
   * @throws {EngineError} If plugin is already added
   */
  addPlugin(plugin: NodePlugin<this>): this {
    const index = this.__plugins.indexOf(plugin);
    if (!(plugin instanceof NodePlugin)) {
      throw new TypeError('Plugin must be an instance of NodePlugin');
    }
    if (index !== -1) {
      throw new ReferenceError(
        `Plugin already added to node on ${index} index`,
      );
    }
    this.__plugins.push(plugin);
    return this;
  }

  /**
   * Remove a plugin from this node.
   *
   * @param plugin - The plugin to remove
   * @returns This node for chaining
   */
  removePlugin(plugin: NodePlugin<this>): this {
    const index = this.__plugins.indexOf(plugin);
    if (index === -1) {
      return this;
    }
    this.__plugins.splice(index, 1);
    return this;
  }

  /**
   * Get a copy of all plugins attached to this node.
   *
   * @returns Array of plugins (copy, not reference)
   */
  getPlugins(): NodePlugin<Node>[] {
    return [...this.__plugins];
  }

  /**
   * Replace all plugins with a new set.
   *
   * @param plugins - Array of plugins to set
   * @returns This node for chaining
   */
  setPlugins(plugins: NodePlugin<this>[]): this {
    this.__plugins = [];
    for (const plugin of plugins) {
      this.addPlugin(plugin);
    }
    return this;
  }

  /**
   * **INTERNAL METHOD**
   *
   * Node processing step called each frame with delta time.
   * Calls _process() on this node, then all plugin process() methods.
   *
   * @internal
   * @param delta - Time elapsed since last frame in milliseconds
   */
  [PROCESS_EVENT](delta: number): void {
    this._process(delta);
    for (const plugin of this.__plugins) {
      if (plugin.enabled) plugin.process(this, delta);
    }
  }

  /**
   * Override this method to implement per-frame processing logic.
   *
   * Called every frame before plugins are processed.
   *
   * @param _delta - Time elapsed since last frame in milliseconds
   *
   * @example
   * ```ts
   * protected _process(delta: number): void {
   *   this.position.x += this.velocity * delta;
   * }
   * ```
   */
  protected _process(_delta: number): void {
    // Emit process event for plugins
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
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends Node<M, T> {
  readonly __nodeIdMap = new Map<string, Node>();
  readonly __nodeNameMap = new Map<string, Set<Node>>();
  readonly __nodeTagMap = new Map<string, Set<Node>>();

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
    this.on('rename', (...args: [Node, string, string]) => {
      const [node, oldName, newName] = args;
      this.__updateNodeName(node, oldName, newName);
    });

    // Listen to add-child events to register nodes
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('add-child', (...args: [Node]) => {
      const [child] = args;
      this.__registerNode(child);
    });

    // Listen to remove-child events to unregister nodes
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('remove-child', (...args: [Node]) => {
      const [child] = args;
      this.__unregisterNode(child);
    });

    // Listen to tag-change events to update tag index
    // @ts-expect-error - Event typing is complex but we know the signature
    this.on('tag-change', (...args: [Node, string, 'add' | 'remove']) => {
      const [node, tag, action] = args;
      if (action === 'add') {
        this.__addTagToIndex(node, tag);
      } else {
        this.__removeTagFromIndex(node, tag);
      }
    });
  }

  /**
   * Get the total number of registered nodes.
   */
  get nodeCount(): number {
    return this.__nodeIdMap.size;
  }

  /**
   * Find a node by its unique ID.
   */
  override getById(id: string): Node | null {
    return this.__nodeIdMap.get(id) ?? null;
  }

  /**
   * Find all nodes with the given name.
   */
  override findByName(name: string): Node[] {
    return [...(this.__nodeNameMap.get(name) ?? [])];
  }

  /**
   * Find all nodes with the given tag.
   * @param tag The tag to search for.
   * @returns An array of nodes that have the specified tag.
   */
  override findByTag(tag: string): Node[] {
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
  override findByTags(...tags: string[]): Node[] {
    if (tags.length === 0) return [];
    if (tags.length === 1) return this.findByTag(tags[0]!);

    // Start with nodes that have the first tag
    const firstTagNodes = this.__nodeTagMap.get(tags[0]!);
    if (!firstTagNodes) return [];

    // Filter nodes that have all other tags
    const result: Node[] = [];
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
   * Register a node and all its descendants in the maps.
   */
  private __registerNode(node: Node): void {
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
  private __unregisterNode(node: Node): void {
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
  private __updateNodeName(node: Node, oldName: string, newName: string): void {
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
  private __addTagToIndex(node: Node, tag: string): void {
    if (!tag) return;

    if (!this.__nodeTagMap.has(tag)) {
      this.__nodeTagMap.set(tag, new Set());
    }
    this.__nodeTagMap.get(tag)!.add(node);
  }

  /**
   * Remove a tag from the index for a specific node.
   */
  private __removeTagFromIndex(node: Node, tag: string): void {
    if (!tag || !this.__nodeTagMap.has(tag)) return;

    this.__nodeTagMap.get(tag)!.delete(node);
    if (this.__nodeTagMap.get(tag)!.size === 0) {
      this.__nodeTagMap.delete(tag);
    }
  }

  /**
   * Register all tags of a node in the index.
   */
  private __registerNodeTags(node: Node): void {
    for (const tag of node.getTags()) {
      this.__addTagToIndex(node, tag);
    }
  }

  /**
   * Unregister all tags of a node from the index.
   */
  private __unregisterNodeTags(node: Node): void {
    for (const tag of node.getTags()) {
      this.__removeTagFromIndex(node, tag);
    }
  }

  protected _processNodes(delta: number): void {
    this.traverse((node) => {
      node[PROCESS_EVENT](delta);
    });
  }
}

/**
 * Abstract base class for node plugins.
 *
 * Plugins provide a way to extend node functionality without inheritance.
 * They hook into the node lifecycle: ready, process (per-frame), and dispose.
 *
 * @template Target - The type of node this plugin can be attached to
 *
 * @example
 * ```ts
 * class RotationPlugin extends NodePlugin<Node3D> {
 *   ready(target: Node3D): void {
 *     console.log('Plugin ready');
 *   }
 *
 *   process(target: Node3D, delta: number): void {
 *     target.rotation.y += delta * 0.001;
 *   }
 *
 *   dispose(target: Node3D): void {
 *     console.log('Plugin disposed');
 *   }
 * }
 * ```
 */
export abstract class NodePlugin<Target extends Node> {
  private __enabled: boolean = true;

  set enabled(value: boolean) {
    this.__enabled = value;
  }

  get enabled(): boolean {
    return this.__enabled;
  }

  /**
   * Called every frame to update the plugin's logic.
   *
   * @param target - The node this plugin is attached to
   * @param delta - Time elapsed since last frame in milliseconds
   */
  abstract process(target: Target, delta: number): void;

  /**
   * Called when the plugin is removed or the node is disposed.
   *
   * @param target - The node this plugin is attached to
   */
  abstract dispose(target: Target): void;
}
