import { AbstractNode } from '@bunbox/tree';
import type { EventMap, MergeEventMaps } from '@bunbox/utils';
import type { InputsEventMap } from '../events';
import type { AppLogLevel } from '../types';

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
> extends AbstractNode<P, M, MergeEventMaps<InputsEventMap, T>> {
  /**
   * Game logic/update hook running as frequently as possible (event loop).
   * Use for input, AI, timers, etc.
   * @param deltaTime Elapsed time since last tick in milliseconds.
   */
  _process(_deltaTime: number): void {
    // Override in subclasses
  }

  loggerCall(message: string, level: AppLogLevel, tag: string): this {
    const root = this.getRoot();
    if (root && root !== this) {
      (root as Node).loggerCall(message, level, tag);
    }
    return this;
  }

  protected override _getType(): string {
    return 'Node';
  }
}
