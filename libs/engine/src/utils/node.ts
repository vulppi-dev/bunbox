import type { Node } from '../core';

export function getChildrenStack(node: Node): Node[] {
  const stack: Node[] = [node];
  for (const child of node.children) {
    stack.push(...getChildrenStack(child));
  }
  return stack;
}
