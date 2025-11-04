import { BaseNode, Root } from '../src/index';

// Create a scene with Root
const scene = new Root('GameScene');

// Create game entities
const player = new BaseNode('player');
const enemy1 = new BaseNode('goblin');
const enemy2 = new BaseNode('orc');
const enemy3 = new BaseNode('dragon');
const npc1 = new BaseNode('merchant');
const npc2 = new BaseNode('guard');

// Add tags to entities
player.addTag('player');
player.addTag('alive');
player.addTag('controllable');

enemy1.addTag('enemy');
enemy1.addTag('alive');
enemy1.addTag('hostile');
enemy1.addTag('weak');

enemy2.addTag('enemy');
enemy2.addTag('alive');
enemy2.addTag('hostile');

enemy3.addTag('enemy');
enemy3.addTag('alive');
enemy3.addTag('hostile');
enemy3.addTag('boss');

npc1.addTag('npc');
npc1.addTag('alive');
npc1.addTag('friendly');

npc2.addTag('npc');
npc2.addTag('alive');
npc2.addTag('friendly');

// Build the scene
scene.addChild(player);
scene.addChild(enemy1);
scene.addChild(enemy2);
scene.addChild(enemy3);
scene.addChild(npc1);
scene.addChild(npc2);

console.log('=== Tag System Examples ===\n');

// Find all enemies
console.log(
  'All enemies:',
  scene.findByTag('enemy').map((n) => n.name),
);
// Output: ['goblin', 'orc', 'dragon']

// Find all alive entities
console.log(
  'All alive entities:',
  scene.findByTag('alive').map((n) => n.name),
);
// Output: ['player', 'goblin', 'orc', 'dragon', 'merchant', 'guard']

// Find entities with multiple tags (AND operation)
console.log(
  'Hostile enemies:',
  scene.findByTags('enemy', 'hostile').map((n) => n.name),
);
// Output: ['goblin', 'orc', 'dragon']

console.log(
  'Weak enemies:',
  scene.findByTags('enemy', 'weak').map((n) => n.name),
);
// Output: ['goblin']

console.log(
  'Boss enemies:',
  scene.findByTags('enemy', 'boss').map((n) => n.name),
);
// Output: ['dragon']

console.log(
  'Friendly NPCs:',
  scene.findByTags('npc', 'friendly').map((n) => n.name),
);
// Output: ['merchant', 'guard']

// Get all unique tags in the scene
console.log('\nAll tags in scene:', scene.getAllTags());

console.log('\n=== AND Logic Demonstration ===\n');
console.log('findByTags uses AND logic - nodes must have ALL tags:');
console.log(
  '  enemy + hostile:',
  scene.findByTags('enemy', 'hostile').length,
  'nodes',
);
console.log(
  '  enemy + weak:',
  scene.findByTags('enemy', 'weak').length,
  'node (only goblin)',
);
console.log(
  '  enemy + boss:',
  scene.findByTags('enemy', 'boss').length,
  'node (only dragon)',
);
console.log(
  '  weak + boss:',
  scene.findByTags('weak', 'boss').length,
  'nodes (no entity has BOTH)',
);
console.log(
  '  npc + hostile:',
  scene.findByTags('npc', 'hostile').length,
  'nodes (NPCs are friendly)',
);

// Dynamic tag changes
console.log('\n=== Dynamic Tag Changes ===\n');

// Kill an enemy
console.log('Killing goblin...');
enemy1.removeTag('alive');
console.log(
  'Alive entities:',
  scene.findByTag('alive').map((n) => n.name),
);
// Output: ['player', 'orc', 'dragon', 'merchant', 'guard']

// Add a new tag dynamically
console.log('\nAdding "poisoned" tag to player...');
player.addTag('poisoned');
console.log(
  'Poisoned entities:',
  scene.findByTag('poisoned').map((n) => n.name),
);
// Output: ['player']

// Check tags on a node
console.log('\nPlayer tags:', player.getTags());
// Output: ['player', 'alive', 'controllable', 'poisoned']

console.log('Player has "poisoned" tag:', player.hasTag('poisoned')); // true
console.log('Player has "enemy" tag:', player.hasTag('enemy')); // false

// Clear all tags from a node
console.log('\nClearing all tags from orc...');
const cleared = enemy2.clearTags();
console.log(`Removed ${cleared} tags`);
console.log('Orc tags:', enemy2.getTags()); // []

// Query from any node
console.log('\n=== Query from Any Node ===\n');
const foundBosses = player.findByTag('boss'); // Can query from any node!
console.log(
  'Bosses found by player:',
  foundBosses.map((n) => n.name),
);
// Output: ['dragon']

console.log('\nTotal nodes in scene:', scene.nodeCount);
