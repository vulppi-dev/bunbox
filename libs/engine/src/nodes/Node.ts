import { BaseNode } from '@bunbox/tree';
import type { EventMap, MergeEventMaps } from '@bunbox/utils';
import type { InputsEventMap } from '../events';
import { EngineError } from '../errors';

export const PROCESS_EVENT = Symbol('_process');

/**
 * Base scene-graph node.
 */
export class Node<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends BaseNode<P, M, MergeEventMaps<InputsEventMap, T>> {
  #plugins: NodePlugin<Node>[] = [];

  addPlugin(plugin: NodePlugin<this>): this {
    const index = this.#plugins.indexOf(plugin);
    if (index !== -1) {
      throw new EngineError(
        `Plugin already added to node on ${index} index`,
        'Node',
      );
    }
    this.#plugins.push(plugin);
    return this;
  }

  removePlugin(plugin: NodePlugin<this>): this {
    const index = this.#plugins.indexOf(plugin);
    if (index === -1) {
      return this;
    }
    this.#plugins.splice(index, 1);
    return this;
  }

  getPlugins(): NodePlugin<Node>[] {
    return [...this.#plugins];
  }

  setPlugins(plugins: NodePlugin<this>[]): this {
    this.#plugins = [];
    for (const plugin of plugins) {
      this.addPlugin(plugin);
    }
    return this;
  }

  /**
   * # INTERNAL METHOD
   * Node processing step called each frame with delta time.
   */
  [PROCESS_EVENT](delta: number): void {
    this._process(delta);
    for (const plugin of this.#plugins) {
      plugin.process(this, delta);
    }
  }

  override dispose(): Promise<void> {
    for (const plugin of this.#plugins) {
      plugin.dispose(this);
    }
    return super.dispose();
  }

  /**
   * If needed, override to implement per-frame processing logic.
   *
   * @param delta
   */
  protected _process(_delta: number): void {
    // Emit process event for plugins
  }
}

export abstract class NodePlugin<Target extends Node> {
  abstract ready(target: Target): void;
  abstract process(target: Target, delta: number): void;
  abstract dispose(target: Target): void;
}
