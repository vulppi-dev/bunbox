# Tag System Documentation

The `@bunbox/tree` library includes a powerful tag-based indexing system that allows for fast O(1) lookups of nodes by tags.

## Features

- **Add/Remove Tags**: Nodes can have multiple tags added or removed at any time
- **Fast Lookups**: O(1) tag-based queries via automatic caching in Root
- **Dynamic Updates**: Tag cache is automatically updated when tags are added/removed
- **Multi-tag Queries**: Find nodes that match ALL specified tags
- **Event-Driven**: `tag-change` events propagate up the tree hierarchy

## API Reference

### BaseNode Tag Methods

```typescript
// Add a tag
node.addTag(tag: string): boolean

// Remove a tag
node.removeTag(tag: string): boolean

// Check if node has a tag
node.hasTag(tag: string): boolean

// Get all tags on this node
node.getTags(): readonly string[]

// Remove all tags
node.clearTags(): number

// Query nodes by tag (delegates to Root)
node.findByTag(tag: string): BaseNode[]
node.findByTags(...tags: string[]): BaseNode[]
```

### Root Tag Methods

```typescript
// Find all nodes with a specific tag (O(1))
root.findByTag(tag: string): BaseNode[]

// Find nodes that have ALL specified tags
root.findByTags(...tags: string[]): BaseNode[]

// Get all unique tags in the tree
root.getAllTags(): string[]
```

## Usage Examples

### Basic Tag Usage

```typescript
import { BaseNode, Root } from '@bunbox/tree';

const scene = new Root('scene');
const player = new BaseNode('player');

// Add tags
player.addTag('player');
player.addTag('alive');
player.addTag('controllable');

scene.addChild(player);

// Check tags
console.log(player.hasTag('player')); // true
console.log(player.getTags()); // ['player', 'alive', 'controllable']
```

### Finding Nodes by Tags

```typescript
const scene = new Root('scene');

const enemy1 = new BaseNode('goblin');
const enemy2 = new BaseNode('orc');
const npc = new BaseNode('merchant');

enemy1.addTag('enemy');
enemy1.addTag('hostile');
enemy2.addTag('enemy');
enemy2.addTag('hostile');
npc.addTag('npc');
npc.addTag('friendly');

scene.addChild(enemy1);
scene.addChild(enemy2);
scene.addChild(npc);

// Find by single tag
const enemies = scene.findByTag('enemy');
console.log(enemies.length); // 2

// Find by multiple tags (AND operation)
const hostileEnemies = scene.findByTags('enemy', 'hostile');
console.log(hostileEnemies.length); // 2

const friendly = scene.findByTag('friendly');
console.log(friendly.length); // 1
```

### Dynamic Tag Updates

```typescript
const scene = new Root('scene');
const entity = new BaseNode('entity');

entity.addTag('alive');
scene.addChild(entity);

// Tag cache is automatically updated
console.log(scene.findByTag('alive').length); // 1

// Remove tag - cache updates automatically
entity.removeTag('alive');
console.log(scene.findByTag('alive').length); // 0

// Add new tag dynamically
entity.addTag('dead');
console.log(scene.findByTag('dead').length); // 1
```

### Game Example

```typescript
const scene = new Root('GameScene');

// Create entities with tags
const player = new BaseNode('player');
player.addTag('player');
player.addTag('alive');
player.addTag('controllable');

const boss = new BaseNode('dragon');
boss.addTag('enemy');
boss.addTag('boss');
boss.addTag('hostile');

scene.addChild(player);
scene.addChild(boss);

// Game logic using tags
const allEnemies = scene.findByTag('enemy');
const bosses = scene.findByTags('enemy', 'boss');
const controllable = scene.findByTag('controllable');

// Handle entity death
player.removeTag('alive');
player.addTag('dead');

// Find all alive entities
const aliveEntities = scene.findByTag('alive');
```

### Querying from Any Node

```typescript
const scene = new Root('scene');
const node1 = new BaseNode('node1');
const node2 = new BaseNode('node2');

node1.addTag('special');
node2.addTag('special');

scene.addChild(node1);
scene.addChild(node2);

// Any node can query the tree via Root
const found = node1.findByTag('special');
console.log(found.length); // 2 (includes node1 and node2)
```

## Performance

- **Add Tag**: O(1) - Direct Set insertion
- **Remove Tag**: O(1) - Direct Set deletion
- **Find by Tag**: O(1) - Direct Map lookup
- **Find by Multiple Tags**: O(n) where n is the number of nodes with the first tag
- **Cache Update**: O(1) - Automatically triggered by events

## Events

The `tag-change` event is emitted when tags are added or removed:

```typescript
node.on('tag-change', (node, tag, action) => {
  console.log(`Tag "${tag}" was ${action}ed on ${node.name}`);
});

node.addTag('test'); // Emits: tag-change with action='add'
node.removeTag('test'); // Emits: tag-change with action='remove'
```

The event propagates up the tree hierarchy, allowing ancestors to react to tag changes.

## Best Practices

1. **Use meaningful tag names**: Tags should represent logical categories or states
2. **Keep tags flat**: Avoid hierarchical tag names (use multiple tags instead)
3. **Clean up tags**: Remove tags when they're no longer relevant
4. **Batch operations**: For multiple nodes, add them to the tree after tagging for efficiency
5. **Query from Root**: For best performance, query directly from Root when possible

## Integration with Root

Tags are automatically indexed when:

- A node with tags is added to the tree (including all descendants)
- A tag is added to a node already in the tree
- A tag is removed from a node in the tree

Tags are automatically unindexed when:

- A node is removed from the tree (including all descendants)
- The tree is disposed

This ensures the tag cache is always synchronized with the current tree state.
