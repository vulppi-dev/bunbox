import { AbstractNode } from '@bunbox/tree';
import type { EventMap } from '@bunbox/utils';

export class Node<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends AbstractNode<P, M, T> {
  protected override _getType(): string {
    return 'Node';
  }

  _beforeProcess(deltaTime: number): void {
    // Override in subclasses
  }

  _process(deltaTime: number): void {
    // Override in subclasses
  }

  _afterProcess(deltaTime: number): void {
    // Override in subclasses
  }

  _beforeProcessStatic(deltaTime: number): void {
    // Override in subclasses
  }

  _processStatic(deltaTime: number): void {
    // Override in subclasses
  }

  _afterProcessStatic(deltaTime: number): void {
    // Override in subclasses
  }
}
