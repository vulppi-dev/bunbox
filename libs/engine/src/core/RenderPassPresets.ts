import {
  Vk_AttachmentLoadOp,
  Vk_AttachmentStoreOp,
  Vk_Format,
  Vk_ImageLayout,
  Vk_PipelineStageFlagBits,
  Vk_AccessFlagBits,
} from '../dynamic-libs';
import { RenderPassBuilder } from './RenderPassBuilder';
import type { RenderPassConfig } from './RenderPassConfig';

/**
 * Preset render pass configurations for common use cases
 */
export class RenderPassPresets {
  /**
   * Standard forward rendering pass with color and depth
   * Renders directly to swapchain
   *
   * @example
   * ```typescript
   * const config = RenderPassPresets.forward();
   * const pass = new CustomRenderPass(config);
   * ```
   */
  static forward(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Forward Rendering')
      .addColorAttachment({
        format: 'swapchain',
        loadOp: Vk_AttachmentLoadOp.CLEAR,
        storeOp: Vk_AttachmentStoreOp.STORE,
        finalLayout: Vk_ImageLayout.PRESENT_SRC_KHR,
      })
      .addSubpass({
        colorAttachments: [
          RenderPassBuilder.createAttachmentRef(
            0,
            Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
          ),
        ],
      })
      .addDependency({
        srcSubpass: 'external',
        dstSubpass: 0,
        srcStageMask: Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
        dstStageMask: Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
        srcAccessMask: 0,
        dstAccessMask: Vk_AccessFlagBits.COLOR_ATTACHMENT_WRITE_BIT,
      })
      .build();
  }

  /**
   * Deferred rendering with G-Buffer
   * Creates multiple render targets for position, normal, albedo, etc.
   * Uses 2 subpasses: geometry pass and lighting pass
   *
   * @example
   * ```typescript
   * const config = RenderPassPresets.deferred();
   * const pass = new CustomRenderPass(config);
   * ```
   */
  static deferred(): RenderPassConfig {
    return (
      new RenderPassBuilder()
        .setName('Deferred Rendering (G-Buffer)')
        // Attachment 0: Position (RGB32F)
        .addColorAttachment({
          format: Vk_Format.R32G32B32A32_SFLOAT,
          loadOp: Vk_AttachmentLoadOp.CLEAR,
          storeOp: Vk_AttachmentStoreOp.STORE,
          finalLayout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        })
        // Attachment 1: Normal (RGB16F)
        .addColorAttachment({
          format: Vk_Format.R16G16B16A16_SFLOAT,
          loadOp: Vk_AttachmentLoadOp.CLEAR,
          storeOp: Vk_AttachmentStoreOp.STORE,
          finalLayout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        })
        // Attachment 2: Albedo + Specular (RGBA8)
        .addColorAttachment({
          format: Vk_Format.R8G8B8A8_UNORM,
          loadOp: Vk_AttachmentLoadOp.CLEAR,
          storeOp: Vk_AttachmentStoreOp.STORE,
          finalLayout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        })
        // Attachment 3: Depth
        .addDepthAttachment({
          format: Vk_Format.D32_SFLOAT,
          loadOp: Vk_AttachmentLoadOp.CLEAR,
          storeOp: Vk_AttachmentStoreOp.DONT_CARE,
        })
        // Attachment 4: Final color output
        .addColorAttachment({
          format: 'swapchain',
          loadOp: Vk_AttachmentLoadOp.DONT_CARE,
          storeOp: Vk_AttachmentStoreOp.STORE,
          finalLayout: Vk_ImageLayout.PRESENT_SRC_KHR,
        })
        // Subpass 0: Geometry pass (write G-Buffer)
        .addSubpass({
          colorAttachments: [
            RenderPassBuilder.createAttachmentRef(
              0,
              Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
            ),
            RenderPassBuilder.createAttachmentRef(
              1,
              Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
            ),
            RenderPassBuilder.createAttachmentRef(
              2,
              Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
            ),
          ],
          depthStencilAttachment: RenderPassBuilder.createAttachmentRef(
            3,
            Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
          ),
        })
        // Subpass 1: Lighting pass (read G-Buffer, write final)
        .addSubpass({
          colorAttachments: [
            RenderPassBuilder.createAttachmentRef(
              4,
              Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
            ),
          ],
          inputAttachments: [
            RenderPassBuilder.createAttachmentRef(
              0,
              Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL,
            ),
            RenderPassBuilder.createAttachmentRef(
              1,
              Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL,
            ),
            RenderPassBuilder.createAttachmentRef(
              2,
              Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL,
            ),
          ],
        })
        // Dependency: Geometry → Lighting
        .addDependency({
          srcSubpass: 0,
          dstSubpass: 1,
          srcStageMask: Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
          dstStageMask: Vk_PipelineStageFlagBits.FRAGMENT_SHADER_BIT,
          srcAccessMask: Vk_AccessFlagBits.COLOR_ATTACHMENT_WRITE_BIT,
          dstAccessMask: Vk_AccessFlagBits.INPUT_ATTACHMENT_READ_BIT,
        })
        .build()
    );
  }

  /**
   * Shadow map pass (depth-only, off-screen)
   *
   * @example
   * ```typescript
   * const config = RenderPassPresets.shadowMap();
   * const pass = new CustomRenderPass(config);
   * ```
   */
  static shadowMap(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Shadow Map')
      .addDepthAttachment({
        format: Vk_Format.D32_SFLOAT,
        loadOp: Vk_AttachmentLoadOp.CLEAR,
        storeOp: Vk_AttachmentStoreOp.STORE,
        finalLayout: Vk_ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL,
      })
      .addSubpass({
        depthStencilAttachment: RenderPassBuilder.createAttachmentRef(
          0,
          Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
        ),
      })
      .build();
  }

  /**
   * Post-processing pass with multiple effects as subpasses
   * Each subpass reads from previous and writes to next
   *
   * @example
   * ```typescript
   * const config = RenderPassPresets.postProcess();
   * const pass = new CustomRenderPass(config);
   * ```
   */
  static postProcess(): RenderPassConfig {
    return (
      new RenderPassBuilder()
        .setName('Post-Processing Chain')
        // Attachment 0: Input image
        .addColorAttachment({
          format: 'swapchain',
          loadOp: Vk_AttachmentLoadOp.LOAD,
          storeOp: Vk_AttachmentStoreOp.STORE,
          initialLayout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
          finalLayout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        })
        // Attachment 1: Intermediate buffer (ping-pong)
        .addColorAttachment({
          format: 'swapchain',
          loadOp: Vk_AttachmentLoadOp.DONT_CARE,
          storeOp: Vk_AttachmentStoreOp.STORE,
          finalLayout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        })
        // Subpass 0: Bloom/Blur (read 0, write 1)
        .addSubpass({
          colorAttachments: [
            RenderPassBuilder.createAttachmentRef(
              1,
              Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
            ),
          ],
          inputAttachments: [
            RenderPassBuilder.createAttachmentRef(
              0,
              Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL,
            ),
          ],
        })
        // Subpass 1: Tone mapping (read 1, write 0)
        .addSubpass({
          colorAttachments: [
            RenderPassBuilder.createAttachmentRef(
              0,
              Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
            ),
          ],
          inputAttachments: [
            RenderPassBuilder.createAttachmentRef(
              1,
              Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL,
            ),
          ],
        })
        // Dependency: Subpass 0 → Subpass 1
        .addDependency({
          srcSubpass: 0,
          dstSubpass: 1,
          srcStageMask: Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
          dstStageMask: Vk_PipelineStageFlagBits.FRAGMENT_SHADER_BIT,
          srcAccessMask: Vk_AccessFlagBits.COLOR_ATTACHMENT_WRITE_BIT,
          dstAccessMask: Vk_AccessFlagBits.INPUT_ATTACHMENT_READ_BIT,
        })
        .build()
    );
  }

  /**
   * SSAO (Screen Space Ambient Occlusion) pass
   * Two subpasses: occlusion calculation and blur
   *
   * @example
   * ```typescript
   * const config = RenderPassPresets.ssao();
   * const pass = new CustomRenderPass(config);
   * ```
   */
  static ssao(): RenderPassConfig {
    return (
      new RenderPassBuilder()
        .setName('SSAO (Screen Space Ambient Occlusion)')
        // Attachment 0: Occlusion output (single channel)
        .addColorAttachment({
          format: Vk_Format.R8_UNORM,
          loadOp: Vk_AttachmentLoadOp.DONT_CARE,
          storeOp: Vk_AttachmentStoreOp.STORE,
          finalLayout: Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL,
        })
        // Subpass 0: Calculate occlusion
        .addSubpass({
          colorAttachments: [
            RenderPassBuilder.createAttachmentRef(
              0,
              Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
            ),
          ],
        })
        // Subpass 1: Blur occlusion
        .addSubpass({
          colorAttachments: [
            RenderPassBuilder.createAttachmentRef(
              0,
              Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
            ),
          ],
          inputAttachments: [
            RenderPassBuilder.createAttachmentRef(
              0,
              Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL,
            ),
          ],
        })
        // Dependency: Calculate → Blur
        .addDependency({
          srcSubpass: 0,
          dstSubpass: 1,
          srcStageMask: Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
          dstStageMask: Vk_PipelineStageFlagBits.FRAGMENT_SHADER_BIT,
          srcAccessMask: Vk_AccessFlagBits.COLOR_ATTACHMENT_WRITE_BIT,
          dstAccessMask: Vk_AccessFlagBits.INPUT_ATTACHMENT_READ_BIT,
        })
        .build()
    );
  }

  /**
   * Simple off-screen rendering to texture
   *
   * @example
   * ```typescript
   * const config = RenderPassPresets.offscreen(Vk_Format.R8G8B8A8_UNORM);
   * const pass = new CustomRenderPass(config);
   * ```
   */
  static offscreen(
    format: number = Vk_Format.R8G8B8A8_UNORM,
  ): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Off-screen Rendering')
      .addColorAttachment({
        format,
        loadOp: Vk_AttachmentLoadOp.CLEAR,
        storeOp: Vk_AttachmentStoreOp.STORE,
        finalLayout: Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL,
      })
      .addDepthAttachment({
        format: Vk_Format.D32_SFLOAT,
        loadOp: Vk_AttachmentLoadOp.CLEAR,
        storeOp: Vk_AttachmentStoreOp.DONT_CARE,
      })
      .addSubpass({
        colorAttachments: [
          RenderPassBuilder.createAttachmentRef(
            0,
            Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
          ),
        ],
        depthStencilAttachment: RenderPassBuilder.createAttachmentRef(
          1,
          Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
        ),
      })
      .build();
  }

  /**
   * Refraction pass (renders after opaque objects, reads scene color)
   *
   * @example
   * ```typescript
   * const config = RenderPassPresets.refraction();
   * const pass = new CustomRenderPass(config);
   * ```
   */
  static refraction(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Refraction Pass')
      .addColorAttachment({
        format: 'swapchain',
        loadOp: Vk_AttachmentLoadOp.LOAD, // Preserve scene
        storeOp: Vk_AttachmentStoreOp.STORE,
        initialLayout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        finalLayout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
      })
      .addDepthAttachment({
        format: Vk_Format.D32_SFLOAT,
        loadOp: Vk_AttachmentLoadOp.LOAD, // Preserve depth
        storeOp: Vk_AttachmentStoreOp.STORE,
      })
      .addSubpass({
        colorAttachments: [
          RenderPassBuilder.createAttachmentRef(
            0,
            Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
          ),
        ],
        depthStencilAttachment: RenderPassBuilder.createAttachmentRef(
          1,
          Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
        ),
      })
      .build();
  }
}
