import { type Disposable } from '@bunbox/utils';
import { Color } from '../math';
import type { TextureImage } from './TextureImage';

/*
⚠️ render() ainda não está conectado ao command buffer recording
⚠️ Não há como passar texturas auxiliares (inputs) de forma explícita
⚠️ VkRenderPass genérico tem configuração fixa (1 color attachment)
*/

/**
 * Abstract RenderPass class for the public API
 *
 * This is the user-facing abstraction that hides all Vulkan implementation details.
 * Users work with TextureImage (elements) for render targets, not VkTexture.
 *
 * The actual Vulkan implementation is in core/Window/VkRenderPass.
 *
 * @example
 * ```typescript
 * const pass = new MyCustomRenderPass();
 *
 * // Set custom render target using elements/TextureImage
 * const renderTexture = new TextureImage({
 *   width: 1024,
 *   height: 1024,
 *   format: 'rgba8unorm',
 *   usage: ['color-target', 'sampler'],
 * });
 *
 * pass.setRenderTarget([renderTexture]);
 * renderer.addRenderPass(pass);
 * ```
 */
export abstract class RenderPass implements Disposable {
  #renderTargets: TextureImage[] | null = null;
  #clearColor: Color = new Color();
  #isActive: boolean = true;

  /**
   * Get current render targets (if any)
   */
  get renderTargets(): readonly TextureImage[] | null {
    return this.#renderTargets ? Object.freeze([...this.#renderTargets]) : null;
  }

  /**
   * Check if this pass has custom render targets
   */
  get hasRenderTargets(): boolean {
    return this.#renderTargets !== null && this.#renderTargets.length > 0;
  }

  /**
   * Get clear color for this render pass
   */
  get clearColor(): Color {
    return this.#clearColor;
  }

  /**
   * Check if this render pass is active
   */
  get isActive(): boolean {
    return this.#isActive;
  }

  /**
   * Set clear color for this render pass
   */
  set clearColor(color: Color) {
    this.#clearColor = color;
  }

  /**
   * Enable or disable this render pass
   */
  set isActive(active: boolean) {
    this.#isActive = active;
  }

  /**
   * Set custom render targets for this pass
   *
   * @param targets - Array of TextureImage to render to
   */
  setRenderTarget(targets: TextureImage[] | null): void {
    this.#renderTargets = targets ? [...targets] : null;
    this._onRenderTargetChanged(targets);
  }

  /**
   * Clear custom render targets (will render to default swapchain)
   */
  clearRenderTarget(): void {
    this.#renderTargets = null;
    this._onRenderTargetChanged(null);
  }

  /**
   * Called when render targets change
   * Subclasses can override to react to changes
   */
  protected _onRenderTargetChanged(_targets: TextureImage[] | null): void {
    // Override in subclasses if needed
  }

  /**
   * Execute rendering logic
   * Subclasses must implement this
   */
  abstract render(): void;

  /**
   * Dispose resources
   */
  abstract dispose(): void | Promise<void>;
}
