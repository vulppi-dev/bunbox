import { AbstractNode } from '@bunbox/tree';
import type { EventMap, MergeEventMaps } from '@bunbox/utils';
import type { SDL_EventMap } from '../events';

export class Node<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends AbstractNode<P, M, MergeEventMaps<SDL_EventMap, T>> {
  protected override _getType(): string {
    return 'Node';
  }

  _update(deltaTime: number): void {
    // Override in subclasses
  }

  _process(deltaTime: number): void {
    // Override in subclasses
  }
}
