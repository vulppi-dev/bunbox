import { BaseNode } from '@bunbox/tree';
import type { EventMap, MergeEventMaps } from '@bunbox/utils';
import type { InputsEventMap } from '../events';

/**
 * Base scene-graph node.
 *
 * Extends the tree AbstractNode and mixes SDL event map into the event system.
 * Derive specialized nodes (2D/3D/Window/etc) from this class and override
 * lifecycle hooks as needed.
 */
export class Node<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends BaseNode<P, M, MergeEventMaps<InputsEventMap, T>> {
  /**
   * Game logic/update hook running as frequently as possible (event loop).
   * Use for input, AI, timers, etc.
   * @param deltaTime Elapsed time since last tick in milliseconds.
   */
  _process(_deltaTime: number): void {
    // Override in subclasses
  }
}
