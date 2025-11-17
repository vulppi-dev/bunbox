# @bunbox/tree

Lightweight, event-driven, TypeScript-first tree structure for the Bunbox ecosystem. Features unique node identity, acyclic parent/child management with safe reparenting, reactive dirty-state tracking, centralized indexing via `Root` for fast lookups, and configurable traversal that respects node enabled state.

## Features

- ✅ Acyclic tree structure with safe reparenting
- ✅ Event-driven architecture (child events bubble up to ancestors)
- ✅ Reactive properties that automatically mark nodes as dirty
- ✅ Centralized indexing via `Root` for O(1) lookup by ID and name
- ✅ `isEnabled` state to control node visibility in traversals
- ✅ Flexible traversal with pre/post-order and optional disabled node inclusion
- ✅ Full TypeScript support with generics for properties, metadata, and events

## Installation

```sh
# bun
bun add @bunbox/tree

# npm
npm install @bunbox/tree
```

Requirements:

- Node >= 20 or Bun >= 1.2
- TypeScript >= 5 (recommended)

## Quick Start

```typescript
import { Node, Root } from '@bunbox/tree';

// Create a Root to manage the tree indices
const scene = new Root('MainScene');

// Create nodes
const camera = new Node('camera');
const player = new Node('player');
const enemy = new Node('enemy');

// Build the tree
scene.addChild(camera);
scene.addChild(player);
player.addChild(enemy);

// Fast lookups via Root
console.log(scene.nodeCount); // 4 (scene + camera + player + enemy)

const foundEnemy = scene.getById(enemy.id);
console.log(foundEnemy?.name); // 'enemy'

const enemies = scene.findByName('enemy');
console.log(enemies.length); // 1
```

## API Reference

### `Node<P, M, T>`

Base class for all tree nodes.

**Type Parameters:**

- `P` - Shape of the reactive `properties` object
- `M` - Shape of the `metadata` object (non-reactive)
- `T` - Additional event types to merge with built-in events

**Properties:**

| Property     | Type              | Description                 |
| ------------ | ----------------- | --------------------------- |
| `id`         | `string`          | Unique identifier (ULID)    |
| `name`       | `string`          | Node name (indexed by Root) |
| `parent`     | `Node \| null`    | Parent node                 |
| `children`   | `readonly Node[]` | Read-only array of children |
| `properties` | `P`               | Reactive properties bag     |
| `metadata`   | `Partial<M>`      | Non-reactive metadata       |
| `isEnabled`  | `boolean`         | Whether node is enabled     |

**Methods:**

```typescript
// Structural
addChild(child: Node): boolean
removeChild(child: Node): boolean

// Lookup (delegates to Root if in tree)
getById(id: string): Node | null
findByName(name: string): Node[]
getRoot(): Node | Root

// State
enable(): this
disable(): this
setEnabled(enabled: boolean): this

// Traversal
traverse(
  visitor: (node: Node) => void,
  options?: {
    includeDisabled?: boolean;
    order?: 'pre' | 'post';
    ignoreType?: Ctor;
  }
): void

// Lifecycle hook
protected _ready(): void
```

**Events:**

- `add-child: [child: Node]` - Emitted when a child is added
- `remove-child: [child: Node]` - Emitted when a child is removed
- `rename: [node: Node, oldName: string, newName: string]` - Emitted when a node is renamed
- `enabled-change: [node: Node]` - Emitted when enabled state changes

### `Root<P, M, T>`

Extends `Node` and manages global indices for all nodes in the tree.

**Additional Properties:**

| Property    | Type     | Description                      |
| ----------- | -------- | -------------------------------- |
| `nodeCount` | `number` | Total number of registered nodes |

**Additional Methods:**

```typescript
// Index management (public for internal use)
_registerNode(node: Node): void
_unregisterNode(node: Node): void
_updateNodeName(node: Node, oldName: string, newName: string): void

// Query methods
getById(id: string): Node | null  // Overrides Node
findByName(name: string): Node[]  // Overrides Node
getAllIds(): string[]
getAllNames(): string[]
```

## Usage Examples

### Basic Tree Structure

```typescript
import { Node, Root } from '@bunbox/tree';

const root = new Root('app');
const node1 = new Node('node1');
const node2 = new Node('node2');

root.addChild(node1);
root.addChild(node2);

console.log(root.children); // [node1, node2]
console.log(node1.parent === root); // true
```

### Reactive Properties

```typescript
interface PlayerProps {
  health: number;
  position: { x: number; y: number };
}

const player = new Node<PlayerProps>('player');

// Setting properties marks the node as dirty
player.properties.health = 100;
player.properties.position = { x: 10, y: 20 };

console.log(player.isDirty); // true
player.markAsClean();
console.log(player.isDirty); // false
```

### Fast Lookups

```typescript
const scene = new Root('scene');
const camera = new Node('camera');
const player = new Node('player');
const enemy1 = new Node('enemy');
const enemy2 = new Node('enemy');

scene.addChild(camera);
scene.addChild(player);
player.addChild(enemy1);
player.addChild(enemy2);

// Find by ID (O(1))
const foundCamera = scene.getById(camera.id);

// Find by name (O(1))
const enemies = scene.findByName('enemy');
console.log(enemies.length); // 2

// Total nodes
console.log(scene.nodeCount); // 5
```

### Tree Traversal

```typescript
const root = new Root('root');
const child1 = new Node('child1');
const child2 = new Node('child2');
const grandChild = new Node('grandchild');

root.addChild(child1);
root.addChild(child2);
child1.addChild(grandChild);

// Pre-order traversal (default)
root.traverse((node) => {
  console.log(node.name);
});
// Output: root, child1, grandchild, child2

// Post-order traversal
root.traverse(
  (node) => {
    console.log(node.name);
  },
  { order: 'post' },
);
// Output: grandchild, child1, child2, root
```

### Enabled State

```typescript
const root = new Root('root');
const enabled = new Node('enabled');
const disabled = new Node('disabled');

root.addChild(enabled);
root.addChild(disabled);
disabled.disable();

// By default, disabled nodes are skipped
root.traverse((node) => {
  console.log(node.name);
});
// Output: root, enabled

// Include disabled nodes
root.traverse(
  (node) => {
    console.log(node.name);
  },
  { includeDisabled: true },
);
// Output: root, enabled, disabled
```

### Event Handling

```typescript
const root = new Root('root');
const child = new Node('child');

// Listen to add-child events
root.on('add-child', (addedChild) => {
  console.log(`Child ${addedChild.name} was added`);
});

root.addChild(child); // Logs: "Child child was added"

// Events bubble up
child.on('rename', (node, oldName, newName) => {
  console.log(`Renamed from ${oldName} to ${newName}`);
});

root.on('rename', (node, oldName, newName) => {
  console.log(`Child renamed: ${oldName} -> ${newName}`);
});

child.name = 'newName';
// Logs both handlers
```

### Re-parenting

```typescript
const root = new Root('root');
const parent1 = new Node('parent1');
const parent2 = new Node('parent2');
const child = new Node('child');

root.addChild(parent1);
root.addChild(parent2);
parent1.addChild(child);

console.log(child.parent === parent1); // true

// Re-parent from parent1 to parent2
parent2.addChild(child);

console.log(child.parent === parent2); // true
console.log(parent1.children.length); // 0
console.log(parent2.children.length); // 1
```

## Architecture

### Centralized Index Management

The `Root` class maintains two internal maps:

- `NODE_ID_MAP`: Maps node IDs to node instances (O(1) lookup)
- `NODE_NAME_MAP`: Maps names to sets of nodes with that name (O(1) lookup)

When nodes are added to or removed from the tree:

1. The `Root` automatically registers/unregisters the node and all its descendants
2. Name changes are tracked and indices are updated accordingly
3. Lookups via `getById()` and `findByName()` on any node delegate to the `Root`

### Event Propagation

Events emitted by a node are automatically propagated to all ancestors:

- `add-child`, `remove-child`, `rename`, `enabled-change`
- Custom events can be added via the generic parameter `T`

### Dirty State

Nodes track whether they've been modified since last marked clean:

- Setting/deleting properties marks the node as dirty
- Structural changes (add/remove child, rename) mark the node as dirty
- Use `markAsClean()` after processing changes

## License

MIT License - see [LICENSE.md](./LICENSE.md) for details.
