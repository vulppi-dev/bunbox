# @bunbox/tree

Lightweight, event-driven, TypeScript-first tree structure used in the Bunbox ecosystem. It provides a base `AbstractNode` with unique identity, acyclic parent/child management with safe reparenting, reactive dirty-state, name/type indexing for fast lookups, and a configurable traversal that skips disabled nodes by default.

- Acyclic with safe reparenting
- Event chaining (child events are re-emitted by ancestors)
- Reactive properties mark the node as dirty automatically
- Global lookup by `id`, `name`, and `type`
- `isEnabled` state to toggle nodes and their subtrees
- `traverse()` with `pre`/`post` order and option to include disabled nodes

## Installation

```sh
# npm
npm install @bunbox/tree

# bun
bun add @bunbox/tree
```

Requirements:

- Node >= 20 or Bun >= 1.2
- TypeScript >= 5 (recommended)

## Concepts

- `AbstractNode<P, M, T>`: generic base class.
  - `P`: shape of the reactive `properties` bag (mutations mark the node as dirty).
  - `M`: shape of `metadata` (free-form, non-reactive by default).
  - `T`: additional events merged into the built-in node events.
- `Node`: default concrete implementation when you don’t need a custom subclass.

## Core API (at a glance)

Properties and getters:

- `id: string` — node ULID
- `name: string` — indexed name (used by `findByName`)
- `parent: AbstractNode | null` — node parent
- `children: readonly AbstractNode[]` — read-only snapshot of direct children
- `properties: P` — reactive bag (set/delete marks dirty)
- `metadata: Partial<M>` — free-form metadata (non-reactive by default)
- `isEnabled: boolean` — enablement state

Structural methods:

- `addChild(child)` — attach child (reparent if needed)
- `removeChild(child)` — detach child
- `getRoot()` — walk up to the root

Lookup/indexing:

- `getById(id)` — direct lookup by id
- `findByName(name)` — all nodes currently indexed by that name
- `findByType(Ctor)` — all nodes whose constructor has `Ctor.name`

Enablement:

- `enable()` / `disable()` / `setEnabled(boolean)` — toggles `isEnabled` and emits `enabled-change`

Traversal:

- `traverse(visitor, options?)` — walk the tree
  - `options.includeDisabled?: boolean` (default: `false`)
  - `options.order?: 'pre' | 'post'` (default: `'pre'`)
  - By default, disabled nodes and their subtrees are skipped

Events:

- `'add-child'`: [child]
- `'remove-child'`: [child]
- `'rename'`: [node, prevName, nextName]
- `'enabled-change'`: [node]

Note: events emitted by children are re-emitted by ancestors, so you can listen at the top of the tree if desired. Full event API provided by `EventEmitter` (`on`, `off`, `once`, `emit`, `subscribe`, etc.).

## Examples

### Creating nodes and structure

```ts
import { Node } from '@bunbox/tree';

const root = new Node('root');
const player = new Node('Player');
const enemy = new Node('Enemy');

root.addChild(player);
enemy.name = 'EnemyBoss';
root.addChild(enemy);
```

### Reactive properties and dirty-state

```ts
// Define properties shape via generics if you want
type Props = { hp: number; speed?: number };

class Character extends Node<Props> {}

const c = new Character('char');
c.properties.hp = 100; // marks dirty
delete c.properties.speed; // marks dirty
```

### Events

```ts
root.subscribe('add-child', (child) => {
  console.log('Child added:', child.name);
});

root.subscribe('rename', (node, prev, next) => {
  console.log(`Renamed ${prev} -> ${next}`);
});

root.subscribe('enabled-change', (node) => {
  console.log(`Enabled changed for: ${node.name}`);
});
```

### Enable/Disable and Traverse

```ts
// Disable a node to skip it in default traversal
enemy.disable();

// Pre-order (default), skips disabled by default
root.traverse((node) => {
  console.log('visit:', node.name);
});

// Include disabled nodes
root.traverse(
  (node) => {
    console.log('visit including disabled:', node.name);
  },
  { includeDisabled: true },
);

// Post-order
root.traverse(
  (node) => {
    console.log('post visit:', node.name);
  },
  { order: 'post' },
);
```

### Lookups

```ts
// By name
const enemies = root.findByName('EnemyBoss');

// By type (constructor)
class EnemyNode extends Node {}
const e1 = new EnemyNode('E1');
root.addChild(e1);

const found = root.findByType(EnemyNode); // [e1]
```

### Safe reparenting

```ts
const arm = new Node('Arm');
player.addChild(arm);

// Move `arm` under `enemy` (reparenting)
enemy.addChild(arm); // detaches from `player` and attaches to `enemy`
```

## Design Notes

- The structure is acyclic: you cannot create cycles (an ancestor cannot be added as a child).
- `properties` is a reactive `Proxy`: set/delete marks the node as dirty.
- `metadata` is free-form (does not mark dirty by default) — useful for auxiliary data.
- The `'enabled-change'` event sends only the node as payload.
- Global indexing by `id`, `name`, and `type` accelerates lookups. Indices are automatically updated on rename/attach/detach/dispose.

## TypeScript

The API is fully typed and supports specialization via generics:

```ts
class MyNode extends Node<{ health: number }, { team?: string }> {}

const n = new MyNode('hero');
n.properties.health = 50; // typed
n.metadata.team = 'blue'; // typed
```

## Build/Dev

- `bun run dev` — Type checking in watch mode
- `bun run build` — Bundle + types in `dist/`

## License

MIT © Vulppi — see [LICENSE](/LICENSE.md)
