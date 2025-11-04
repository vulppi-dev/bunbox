/// <reference types="@types/bun" />
import { describe, expect, test } from 'bun:test';
import { BaseNode, Root } from '../src/index';

describe('Root', () => {
  test('should register nodes when added to tree', () => {
    const root = new Root('root');
    const child1 = new BaseNode('child1');
    const child2 = new BaseNode('child2');
    const grandChild = new BaseNode('grandchild');

    root.addChild(child1);
    root.addChild(child2);
    child1.addChild(grandChild);

    // Root should track all nodes including itself
    expect(root.nodeCount).toBe(4);
    expect(root.getById(child1.id)).toBe(child1);
    expect(root.getById(child2.id)).toBe(child2);
    expect(root.getById(grandChild.id)).toBe(grandChild);
  });

  test('should find nodes by name', () => {
    const root = new Root('root');
    const child1 = new BaseNode('player');
    const child2 = new BaseNode('enemy');
    const child3 = new BaseNode('player'); // Same name as child1

    root.addChild(child1);
    root.addChild(child2);
    root.addChild(child3);

    const players = root.findByName('player');
    expect(players.length).toBe(2);
    expect(players).toContain(child1);
    expect(players).toContain(child3);

    const enemies = root.findByName('enemy');
    expect(enemies.length).toBe(1);
    expect(enemies[0]).toBe(child2);
  });

  test('should unregister nodes when removed from tree', () => {
    const root = new Root('root');
    const child = new BaseNode('child');
    const grandChild = new BaseNode('grandchild');

    root.addChild(child);
    child.addChild(grandChild);
    expect(root.nodeCount).toBe(3); // root + child + grandchild

    // Remove child should also remove its descendants
    root.removeChild(child);
    expect(root.nodeCount).toBe(1); // Only root remains
    expect(root.getById(child.id)).toBeNull();
    expect(root.getById(grandChild.id)).toBeNull();
  });

  test('should update name index when node is renamed', () => {
    const root = new Root('root');
    const child = new BaseNode('oldName');
    root.addChild(child);

    let found = root.findByName('oldName');
    expect(found.length).toBe(1);
    expect(found[0]).toBe(child);

    // Rename the node
    child.name = 'newName';

    found = root.findByName('oldName');
    expect(found.length).toBe(0);

    found = root.findByName('newName');
    expect(found.length).toBe(1);
    expect(found[0]).toBe(child);
  });

  test('should handle re-parenting correctly', () => {
    const root = new Root('root');
    const parent1 = new BaseNode('parent1');
    const parent2 = new BaseNode('parent2');
    const child = new BaseNode('child');

    root.addChild(parent1);
    root.addChild(parent2);
    parent1.addChild(child);

    expect(root.nodeCount).toBe(4);
    expect(root.getById(child.id)).toBe(child);

    // Re-parent child from parent1 to parent2
    parent2.addChild(child);

    // Should still be in the root's index
    expect(root.nodeCount).toBe(4);
    expect(root.getById(child.id)).toBe(child);
    expect(child.parent).toBe(parent2);
  });

  test('nodes not attached to Root should not be indexed', () => {
    const orphan = new BaseNode('orphan');
    const child = new BaseNode('orphanChild');
    orphan.addChild(child);

    // These nodes are not part of any Root tree
    expect(orphan.getById(child.id)).toBeNull();
    expect(orphan.findByName('orphanChild').length).toBe(0);
  });

  test('BaseNode can query root for lookups', () => {
    const root = new Root('root');
    const child = new BaseNode('child');
    const grandChild = new BaseNode('grandchild');

    root.addChild(child);
    child.addChild(grandChild);

    // Child node should be able to find grandchild via root
    expect(child.getById(grandChild.id)).toBe(grandChild);
    expect(grandChild.getById(child.id)).toBe(child);

    const found = child.findByName('grandchild');
    expect(found.length).toBe(1);
    expect(found[0]).toBe(grandChild);
  });
});

describe('Tags', () => {
  test('should add and remove tags from nodes', () => {
    const node = new BaseNode('node');

    expect(node.hasTag('player')).toBe(false);
    expect(node.getTags().length).toBe(0);

    // Add tag
    const added = node.addTag('player');
    expect(added).toBe(true);
    expect(node.hasTag('player')).toBe(true);
    expect(node.getTags()).toContain('player');

    // Add duplicate tag
    const duplicate = node.addTag('player');
    expect(duplicate).toBe(false);

    // Remove tag
    const removed = node.removeTag('player');
    expect(removed).toBe(true);
    expect(node.hasTag('player')).toBe(false);

    // Remove non-existent tag
    const notFound = node.removeTag('player');
    expect(notFound).toBe(false);
  });

  test('should find nodes by tag in Root', () => {
    const root = new Root('root');
    const player = new BaseNode('player');
    const enemy1 = new BaseNode('enemy1');
    const enemy2 = new BaseNode('enemy2');

    player.addTag('player');
    player.addTag('alive');
    enemy1.addTag('enemy');
    enemy1.addTag('alive');
    enemy2.addTag('enemy');

    root.addChild(player);
    root.addChild(enemy1);
    root.addChild(enemy2);

    // Find by single tag
    const enemies = root.findByTag('enemy');
    expect(enemies.length).toBe(2);
    expect(enemies).toContain(enemy1);
    expect(enemies).toContain(enemy2);

    const players = root.findByTag('player');
    expect(players.length).toBe(1);
    expect(players[0]).toBe(player);

    const alive = root.findByTag('alive');
    expect(alive.length).toBe(2);
  });

  test('should find nodes by multiple tags', () => {
    const root = new Root('root');
    const node1 = new BaseNode('node1');
    const node2 = new BaseNode('node2');
    const node3 = new BaseNode('node3');

    node1.addTag('red');
    node1.addTag('fast');
    node2.addTag('red');
    node2.addTag('slow');
    node3.addTag('blue');
    node3.addTag('fast');

    root.addChild(node1);
    root.addChild(node2);
    root.addChild(node3);

    // Find nodes with ALL specified tags
    const redAndFast = root.findByTags('red', 'fast');
    expect(redAndFast.length).toBe(1);
    expect(redAndFast[0]).toBe(node1);

    const red = root.findByTags('red');
    expect(red.length).toBe(2);

    const blueAndFast = root.findByTags('blue', 'fast');
    expect(blueAndFast.length).toBe(1);
    expect(blueAndFast[0]).toBe(node3);

    const redAndBlue = root.findByTags('red', 'blue');
    expect(redAndBlue.length).toBe(0);
  });

  test('findByTags should use AND logic (all tags required)', () => {
    const root = new Root('root');
    const a = new BaseNode('a');
    const b = new BaseNode('b');
    const c = new BaseNode('c');
    const d = new BaseNode('d');

    // a has: tag1, tag2, tag3
    a.addTag('tag1');
    a.addTag('tag2');
    a.addTag('tag3');

    // b has: tag1, tag2
    b.addTag('tag1');
    b.addTag('tag2');

    // c has: tag1, tag3
    c.addTag('tag1');
    c.addTag('tag3');

    // d has: tag1
    d.addTag('tag1');

    root.addChild(a);
    root.addChild(b);
    root.addChild(c);
    root.addChild(d);

    // Only 'a' has ALL three tags
    const result1 = root.findByTags('tag1', 'tag2', 'tag3');
    expect(result1.length).toBe(1);
    expect(result1[0]).toBe(a);

    // 'a' and 'b' have tag1 AND tag2
    const result2 = root.findByTags('tag1', 'tag2');
    expect(result2.length).toBe(2);
    expect(result2).toContain(a);
    expect(result2).toContain(b);

    // All nodes have tag1
    const result3 = root.findByTags('tag1');
    expect(result3.length).toBe(4);

    // No node has tag1 AND tag4
    const result4 = root.findByTags('tag1', 'tag4');
    expect(result4.length).toBe(0);
  });

  test('should update tag cache when tags are added/removed', () => {
    const root = new Root('root');
    const node = new BaseNode('node');
    root.addChild(node);

    // Add tag after node is in tree
    node.addTag('dynamic');
    let found = root.findByTag('dynamic');
    expect(found.length).toBe(1);
    expect(found[0]).toBe(node);

    // Remove tag
    node.removeTag('dynamic');
    found = root.findByTag('dynamic');
    expect(found.length).toBe(0);

    // Add multiple tags
    node.addTag('tag1');
    node.addTag('tag2');
    node.addTag('tag3');

    expect(root.findByTag('tag1').length).toBe(1);
    expect(root.findByTag('tag2').length).toBe(1);
    expect(root.findByTag('tag3').length).toBe(1);

    // Clear all tags
    const cleared = node.clearTags();
    expect(cleared).toBe(3);
    expect(root.findByTag('tag1').length).toBe(0);
    expect(root.findByTag('tag2').length).toBe(0);
    expect(root.findByTag('tag3').length).toBe(0);
  });

  test('should handle tags on nodes added with existing tags', () => {
    const root = new Root('root');
    const node = new BaseNode('node');

    // Add tags before adding to tree
    node.addTag('preexisting');
    node.addTag('tagged');

    root.addChild(node);

    // Tags should be indexed
    const found1 = root.findByTag('preexisting');
    expect(found1.length).toBe(1);
    expect(found1[0]).toBe(node);

    const found2 = root.findByTag('tagged');
    expect(found2.length).toBe(1);
    expect(found2[0]).toBe(node);
  });

  test('should unregister tags when node is removed', () => {
    const root = new Root('root');
    const node = new BaseNode('node');

    node.addTag('temp');
    root.addChild(node);

    expect(root.findByTag('temp').length).toBe(1);

    root.removeChild(node);

    expect(root.findByTag('temp').length).toBe(0);
  });

  test('should handle tags on deeply nested nodes', () => {
    const root = new Root('root');
    const parent = new BaseNode('parent');
    const child = new BaseNode('child');
    const grandChild = new BaseNode('grandchild');

    root.addChild(parent);
    parent.addChild(child);
    child.addChild(grandChild);

    grandChild.addTag('deep');

    const found = root.findByTag('deep');
    expect(found.length).toBe(1);
    expect(found[0]).toBe(grandChild);
  });

  test('nodes can query tags via root', () => {
    const root = new Root('root');
    const node1 = new BaseNode('node1');
    const node2 = new BaseNode('node2');

    node1.addTag('special');
    node2.addTag('special');

    root.addChild(node1);
    root.addChild(node2);

    // Any node can query tags via root
    const found = node1.findByTag('special');
    expect(found.length).toBe(2);
    expect(found).toContain(node1);
    expect(found).toContain(node2);
  });

  test('getAllTags should return all unique tags', () => {
    const root = new Root('root');
    const node1 = new BaseNode('node1');
    const node2 = new BaseNode('node2');

    node1.addTag('tag1');
    node1.addTag('tag2');
    node2.addTag('tag2');
    node2.addTag('tag3');

    root.addChild(node1);
    root.addChild(node2);

    const allTags = root.getAllTags();
    expect(allTags.length).toBe(3);
    expect(allTags).toContain('tag1');
    expect(allTags).toContain('tag2');
    expect(allTags).toContain('tag3');
  });
});
