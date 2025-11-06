import { BaseNode } from '@bunbox/tree';
import type { EventMap, MergeEventMaps } from '@bunbox/utils';
import type { InputsEventMap } from '../events';
import { EngineError } from '../errors';

/**
 * Internal symbol for the process event.
 * Used to trigger frame updates on nodes.
 */
export const PROCESS_EVENT = Symbol('_process');

/**
 * Base scene-graph node with plugin support and per-frame processing.
 *
 * Extends BaseNode from @bunbox/tree with engine-specific functionality:
 * - Plugin system for extensibility
 * - Per-frame processing via _process() method
 * - Integration with engine input events
 *
 * @template P - Properties type (generic object record)
 * @template M - Metadata type (generic object record)
 * @template T - Additional event map to merge with InputsEventMap
 *
 * @example
 * ```ts
 * class MyNode extends Node {
 *   protected _process(delta: number): void {
 *     // Update logic here
 *   }
 * }
 *
 * const node = new MyNode();
 * node.addPlugin(myPlugin);
 * ```
 */
export class Node<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends BaseNode<P, M, MergeEventMaps<InputsEventMap, T>> {
  #plugins: NodePlugin<Node>[] = [];

  /**
   * Add a plugin to this node.
   *
   * Plugins extend node functionality without inheritance.
   * Each plugin can hook into ready, process, and dispose lifecycles.
   *
   * @param plugin - The plugin to add
   * @returns This node for chaining
   * @throws {EngineError} If plugin is already added
   */
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

  /**
   * Remove a plugin from this node.
   *
   * @param plugin - The plugin to remove
   * @returns This node for chaining
   */
  removePlugin(plugin: NodePlugin<this>): this {
    const index = this.#plugins.indexOf(plugin);
    if (index === -1) {
      return this;
    }
    this.#plugins.splice(index, 1);
    return this;
  }

  /**
   * Get a copy of all plugins attached to this node.
   *
   * @returns Array of plugins (copy, not reference)
   */
  getPlugins(): NodePlugin<Node>[] {
    return [...this.#plugins];
  }

  /**
   * Replace all plugins with a new set.
   *
   * @param plugins - Array of plugins to set
   * @returns This node for chaining
   */
  setPlugins(plugins: NodePlugin<this>[]): this {
    this.#plugins = [];
    for (const plugin of plugins) {
      this.addPlugin(plugin);
    }
    return this;
  }

  /**
   * **INTERNAL METHOD**
   *
   * Node processing step called each frame with delta time.
   * Calls _process() on this node, then all plugin process() methods.
   *
   * @internal
   * @param delta - Time elapsed since last frame in milliseconds
   */
  [PROCESS_EVENT](delta: number): void {
    this._process(delta);
    for (const plugin of this.#plugins) {
      plugin.process(this, delta);
    }
  }

  /**
   * Dispose of this node and all its plugins.
   *
   * Calls dispose() on all plugins before calling parent dispose.
   *
   * @returns Promise that resolves when disposal is complete
   */
  override dispose(): Promise<void> {
    for (const plugin of this.#plugins) {
      plugin.dispose(this);
    }
    return super.dispose();
  }

  /**
   * Override this method to implement per-frame processing logic.
   *
   * Called every frame before plugins are processed.
   *
   * @param _delta - Time elapsed since last frame in milliseconds
   *
   * @example
   * ```ts
   * protected _process(delta: number): void {
   *   this.position.x += this.velocity * delta;
   * }
   * ```
   */
  protected _process(_delta: number): void {
    // Emit process event for plugins
  }
}

/**
 * Abstract base class for node plugins.
 *
 * Plugins provide a way to extend node functionality without inheritance.
 * They hook into the node lifecycle: ready, process (per-frame), and dispose.
 *
 * @template Target - The type of node this plugin can be attached to
 *
 * @example
 * ```ts
 * class RotationPlugin extends NodePlugin<Node3D> {
 *   ready(target: Node3D): void {
 *     console.log('Plugin ready');
 *   }
 *
 *   process(target: Node3D, delta: number): void {
 *     target.rotation.y += delta * 0.001;
 *   }
 *
 *   dispose(target: Node3D): void {
 *     console.log('Plugin disposed');
 *   }
 * }
 * ```
 */
export abstract class NodePlugin<Target extends Node> {
  /**
   * Called when the plugin is first attached to a node.
   *
   * @param target - The node this plugin is attached to
   */
  abstract ready(target: Target): void;

  /**
   * Called every frame to update the plugin's logic.
   *
   * @param target - The node this plugin is attached to
   * @param delta - Time elapsed since last frame in milliseconds
   */
  abstract process(target: Target, delta: number): void;

  /**
   * Called when the plugin is removed or the node is disposed.
   *
   * @param target - The node this plugin is attached to
   */
  abstract dispose(target: Target): void;
}
