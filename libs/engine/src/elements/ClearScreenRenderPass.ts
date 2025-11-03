import { Color } from '../math';
import { RenderPass } from './RenderPass';

/**
 * ClearScreenRenderPass - Public API
 *
 * Simple render pass that clears the screen with a solid color.
 * This is the public API that users interact with.
 *
 * The Renderer converts this into a generic VkRenderPass (core/Window/VkRenderPass).
 */
export class ClearScreenRenderPass extends RenderPass {
  constructor() {
    super();
    // Default clear color: black
    this.clearColor = new Color(0, 0, 0, 1);
  }

  render(): void {
    // Rendering is handled by Vulkan implementation
    // This is just the public API
  }

  dispose(): void {
    // Disposal is handled by Vulkan implementation
    // This is just the public API
  }
}
