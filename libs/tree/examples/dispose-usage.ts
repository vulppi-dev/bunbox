import { BaseNode, Root } from '../src/index';

/**
 * Example demonstrating the dispose functionality of the tree system.
 *
 * When a node is disposed:
 * 1. It removes itself from its parent
 * 2. Recursively disposes all children in post-order (leaf to root)
 * 3. Emits 'dispose' event
 * 4. Marks itself as disposed
 */

async function main() {
  // Create a tree structure
  const root = new Root('GameWorld');
  const level = new BaseNode('Level1');
  const player = new BaseNode('Player');
  const enemy1 = new BaseNode('Enemy1');
  const enemy2 = new BaseNode('Enemy2');
  const weapon = new BaseNode('Weapon');

  // Build the hierarchy
  root.addChild(level);
  level.addChild(player);
  level.addChild(enemy1);
  level.addChild(enemy2);
  player.addChild(weapon);

  console.log('Initial tree structure:');
  console.log(`- Root has ${root.children.length} children`);
  console.log(`- Level has ${level.children.length} children`);
  console.log(`- Player has ${player.children.length} children`);
  console.log(`- Total nodes in tree: ${root.nodeCount}`);

  // Track disposal events
  const disposalOrder: string[] = [];

  player.on('dispose', () => {
    console.log('Player disposed!');
    disposalOrder.push('player');
  });

  weapon.on('dispose', () => {
    console.log('Weapon disposed!');
    disposalOrder.push('weapon');
  });

  enemy1.on('dispose', () => {
    console.log('Enemy1 disposed!');
    disposalOrder.push('enemy1');
  });

  console.log('\nDisposing player (should also dispose weapon)...');
  await player.dispose();

  console.log('\nAfter player disposal:');
  console.log(`- Level has ${level.children.length} children`);
  console.log(`- Player is disposed: ${player.isDisposed}`);
  console.log(`- Weapon is disposed: ${weapon.isDisposed}`);
  console.log(`- Total nodes in tree: ${root.nodeCount}`);
  console.log(`- Disposal order: ${disposalOrder.join(' -> ')}`);

  console.log('\nDisposing entire level...');
  await level.dispose();

  console.log('\nAfter level disposal:');
  console.log(`- Root has ${root.children.length} children`);
  console.log(`- Level is disposed: ${level.isDisposed}`);
  console.log(`- Enemy1 is disposed: ${enemy1.isDisposed}`);
  console.log(`- Enemy2 is disposed: ${enemy2.isDisposed}`);
  console.log(`- Total nodes in tree: ${root.nodeCount}`);

  // Demonstrate that disposed nodes are no longer found in queries
  console.log('\nSearching for disposed nodes:');
  console.log(`- Find player by ID: ${root.getById(player.id)}`);
  console.log(`- Find enemy1 by ID: ${root.getById(enemy1.id)}`);
}

main().catch(console.error);
