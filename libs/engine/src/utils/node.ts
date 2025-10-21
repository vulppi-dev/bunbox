import type { AbstractNode } from '@bunbox/tree';

type NodeCtor = new (...args: any[]) => AbstractNode;

export function getChildrenStack<C extends NodeCtor>(
  node: AbstractNode,
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
