import type { Node } from '../core';
import type { Ctor } from '../types';

type NodeCtor = new (...args: any[]) => Node;

export function getChildrenStack<C extends NodeCtor>(
  node: Node,
  filter?: C,
): InstanceType<C>[] {
  const stack: InstanceType<C>[] = [];
  if (!filter || node instanceof filter) {
    stack.push(node as InstanceType<C>);
  }

  for (const child of node.children) {
    stack.push(
      ...getChildrenStack(child, filter).filter((n) =>
        filter ? n instanceof filter : true,
      ),
    );
  }
  return stack;
}
