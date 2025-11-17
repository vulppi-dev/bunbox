import { Node, Root } from '../src/index';

// Create a Root node that will manage all indices
const scene = new Root('MainScene');

// Create nodes
const camera = new Node('camera');
const player = new Node('player');
const enemy1 = new Node('enemy');
const enemy2 = new Node('enemy');

// Build the tree
scene.addChild(camera);
scene.addChild(player);
player.addChild(enemy1);
player.addChild(enemy2);

console.log('Total nodes in scene:', scene.nodeCount); // 5 (scene + camera + player + enemy1 + enemy2)

// Find nodes by ID
const foundCamera = scene.getById(camera.id);
console.log('Found camera:', foundCamera?.name); // 'camera'

// Find nodes by name
const enemies = scene.findByName('enemy');
console.log('Number of enemies:', enemies.length); // 2

// Any node can query the root
const foundPlayer = camera.getById(player.id);
console.log('Camera found player:', foundPlayer?.name); // 'player'

// Rename a node
enemy1.name = 'boss';
console.log('Enemies after rename:', scene.findByName('enemy').length); // 1
console.log('Bosses:', scene.findByName('boss').length); // 1

// Remove a node (and all its children)
scene.removeChild(player);
console.log('Total nodes after removal:', scene.nodeCount); // 2 (scene + camera)
console.log('Enemies:', scene.findByName('enemy').length); // 0 (removed with player)
