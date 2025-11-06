import { RenderPassBuilder } from './RenderPassBuilder';
import type { RenderPassConfig } from './RenderPassConfig';
import type { Format } from './RenderPassTypes';

/**
 * Preset render pass configurations for common use cases
 */
export class RenderPassPresets {
  /**
   * Standard forward rendering pass with color and depth
   * Renders directly to swapchain
   *
   * Attachments:
   * - 0: Color (swapchain format)
   * - 1: Depth (d32-sfloat)
   *
   * Subpasses:
   * - 0: Graphics pass (renders to color + depth)
   */
  static forward(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Forward Rendering')
      .addColorAttachment({
        format: 'swapchain',
        loadOp: 'clear',
        storeOp: 'store',
        finalLayout: 'present-src',
        clearValue: { color: [0.0, 0.0, 0.0, 1.0] },
      })
      .addDepthAttachment({
        format: 'd32-sfloat',
        loadOp: 'clear',
        storeOp: 'dont-care',
        clearValue: { depthStencil: { depth: 1.0, stencil: 0 } },
      })
      .createDefaultSubpass()
      .addDefaultExternalDependency()
      .build();
  }

  /**
   * Deferred rendering with G-Buffer
   * Creates multiple render targets for position, normal, albedo, etc.
   * Uses 2 subpasses: geometry pass and lighting pass
   *
   * Attachments:
   * - 0: Position (r32g32b32a32-sfloat)
   * - 1: Normal (r16g16b16a16-sfloat)
   * - 2: Albedo (r8g8b8a8-unorm)
   * - 3: Specular (r8g8b8a8-unorm)
   * - 4: Depth (d32-sfloat)
   * - 5: Final color (swapchain)
   *
   * Subpasses:
   * - 0: Geometry pass (writes to G-Buffer)
   * - 1: Lighting pass (reads G-Buffer, writes final color)
   */
  static deferred(): RenderPassConfig {
    return (
      new RenderPassBuilder()
        .setName('Deferred Rendering (G-Buffer)')
        // G-Buffer attachments
        .addColorAttachment({
          format: 'r32g32b32a32-sfloat', // Position
          loadOp: 'clear',
          storeOp: 'store',
          finalLayout: 'shader-read-only',
          clearValue: { color: [0.0, 0.0, 0.0, 0.0] },
        })
        .addColorAttachment({
          format: 'r16g16b16a16-sfloat', // Normal
          loadOp: 'clear',
          storeOp: 'store',
          finalLayout: 'shader-read-only',
          clearValue: { color: [0.0, 0.0, 0.0, 0.0] },
        })
        .addColorAttachment({
          format: 'r8g8b8a8-unorm', // Albedo
          loadOp: 'clear',
          storeOp: 'store',
          finalLayout: 'shader-read-only',
          clearValue: { color: [0.0, 0.0, 0.0, 1.0] },
        })
        .addColorAttachment({
          format: 'r8g8b8a8-unorm', // Specular
          loadOp: 'clear',
          storeOp: 'store',
          finalLayout: 'shader-read-only',
          clearValue: { color: [0.0, 0.0, 0.0, 1.0] },
        })
        .addDepthAttachment({
          format: 'd32-sfloat',
          loadOp: 'clear',
          storeOp: 'store',
          finalLayout: 'shader-read-only',
          clearValue: { depthStencil: { depth: 1.0 } },
        })
        // Final color attachment
        .addColorAttachment({
          format: 'swapchain',
          loadOp: 'clear',
          storeOp: 'store',
          finalLayout: 'present-src',
          clearValue: { color: [0.0, 0.0, 0.0, 1.0] },
        })
        // Subpass 0: Geometry pass
        .addSubpass({
          colorAttachments: [
            { attachment: 0, layout: 'color-attachment' }, // Position
            { attachment: 1, layout: 'color-attachment' }, // Normal
            { attachment: 2, layout: 'color-attachment' }, // Albedo
            { attachment: 3, layout: 'color-attachment' }, // Specular
          ],
          depthStencilAttachment: {
            attachment: 4,
            layout: 'depth-stencil-attachment',
          },
        })
        // Subpass 1: Lighting pass
        .addSubpass({
          colorAttachments: [{ attachment: 5, layout: 'color-attachment' }],
          inputAttachments: [
            { attachment: 0, layout: 'shader-read-only' }, // Position
            { attachment: 1, layout: 'shader-read-only' }, // Normal
            { attachment: 2, layout: 'shader-read-only' }, // Albedo
            { attachment: 3, layout: 'shader-read-only' }, // Specular
            { attachment: 4, layout: 'depth-stencil-read-only' }, // Depth
          ],
        })
        // Dependencies
        .addDependency({
          srcSubpass: 0,
          dstSubpass: 1,
          srcStageMask: 'color-attachment-output',
          dstStageMask: 'fragment-shader',
          srcAccessMask: 'color-attachment-write',
          dstAccessMask: 'input-attachment-read',
          dependencyFlags: 'by-region',
        })
        .build()
    );
  }

  /**
   * Shadow map pass (depth-only, off-screen)
   *
   * Attachments:
   * - 0: Depth (d32-sfloat)
   *
   * Subpasses:
   * - 0: Shadow rendering (depth-only)
   */
  static shadowMap(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Shadow Map')
      .addDepthAttachment({
        format: 'd32-sfloat',
        loadOp: 'clear',
        storeOp: 'store',
        finalLayout: 'shader-read-only',
        clearValue: { depthStencil: { depth: 1.0 } },
      })
      .addSubpass({
        depthStencilAttachment: {
          attachment: 0,
          layout: 'depth-stencil-attachment',
        },
      })
      .addDependency({
        srcSubpass: 'external',
        dstSubpass: 0,
        srcStageMask: 'fragment-shader',
        dstStageMask: 'early-fragment-tests',
        srcAccessMask: 'shader-read',
        dstAccessMask: 'depth-stencil-attachment-write',
      })
      .build();
  }

  /**
   * Post-processing pass with multiple effects as subpasses
   * Each subpass reads from previous and writes to next
   *
   * Attachments:
   * - 0: Input color (from scene)
   * - 1: Intermediate buffer (ping-pong)
   * - 2: Final output (swapchain)
   *
   * Subpasses:
   * - 0: Effect 1 (reads 0, writes 1)
   * - 1: Effect 2 (reads 1, writes 2)
   */
  static postProcess(): RenderPassConfig {
    return (
      new RenderPassBuilder()
        .setName('Post-Processing Chain')
        // Input texture (from previous render pass)
        .addColorAttachment({
          format: 'r16g16b16a16-sfloat',
          loadOp: 'load',
          storeOp: 'dont-care',
          initialLayout: 'shader-read-only',
          finalLayout: 'shader-read-only',
        })
        // Intermediate buffer
        .addColorAttachment({
          format: 'r16g16b16a16-sfloat',
          loadOp: 'dont-care',
          storeOp: 'store',
          finalLayout: 'shader-read-only',
        })
        // Final output
        .addColorAttachment({
          format: 'swapchain',
          loadOp: 'dont-care',
          storeOp: 'store',
          finalLayout: 'present-src',
        })
        // Subpass 0: First effect
        .addSubpass({
          inputAttachments: [{ attachment: 0, layout: 'shader-read-only' }],
          colorAttachments: [{ attachment: 1, layout: 'color-attachment' }],
        })
        // Subpass 1: Second effect
        .addSubpass({
          inputAttachments: [{ attachment: 1, layout: 'shader-read-only' }],
          colorAttachments: [{ attachment: 2, layout: 'color-attachment' }],
        })
        .addDependency({
          srcSubpass: 0,
          dstSubpass: 1,
          srcStageMask: 'color-attachment-output',
          dstStageMask: 'fragment-shader',
          srcAccessMask: 'color-attachment-write',
          dstAccessMask: 'input-attachment-read',
          dependencyFlags: 'by-region',
        })
        .build()
    );
  }

  /**
   * SSAO (Screen Space Ambient Occlusion) pass
   * Two subpasses: occlusion calculation and blur
   *
   * Attachments:
   * - 0: Occlusion buffer (r8-unorm)
   * - 1: Blurred occlusion (r8-unorm)
   *
   * Subpasses:
   * - 0: Calculate occlusion
   * - 1: Blur occlusion
   */
  static ssao(): RenderPassConfig {
    return (
      new RenderPassBuilder()
        .setName('SSAO (Screen Space Ambient Occlusion)')
        // Raw occlusion
        .addColorAttachment({
          format: 'r8-unorm',
          loadOp: 'dont-care',
          storeOp: 'store',
          finalLayout: 'shader-read-only',
        })
        // Blurred result
        .addColorAttachment({
          format: 'r8-unorm',
          loadOp: 'dont-care',
          storeOp: 'store',
          finalLayout: 'shader-read-only',
        })
        // Subpass 0: Calculate occlusion
        .addSubpass({
          colorAttachments: [{ attachment: 0, layout: 'color-attachment' }],
        })
        // Subpass 1: Blur
        .addSubpass({
          inputAttachments: [{ attachment: 0, layout: 'shader-read-only' }],
          colorAttachments: [{ attachment: 1, layout: 'color-attachment' }],
        })
        .addDependency({
          srcSubpass: 0,
          dstSubpass: 1,
          srcStageMask: 'color-attachment-output',
          dstStageMask: 'fragment-shader',
          srcAccessMask: 'color-attachment-write',
          dstAccessMask: 'input-attachment-read',
          dependencyFlags: 'by-region',
        })
        .build()
    );
  }

  /**
   * Simple off-screen rendering to texture
   *
   * @param format Color attachment format
   * @param withDepth Whether to include depth attachment
   */
  static offscreen(format: Format, withDepth = true): RenderPassConfig {
    const builder = new RenderPassBuilder()
      .setName('Off-screen Rendering')
      .addColorAttachment({
        format,
        loadOp: 'clear',
        storeOp: 'store',
        finalLayout: 'shader-read-only',
        clearValue: { color: [0.0, 0.0, 0.0, 1.0] },
      });

    if (withDepth) {
      builder.addDepthAttachment({
        format: 'd32-sfloat',
        loadOp: 'clear',
        storeOp: 'dont-care',
        clearValue: { depthStencil: { depth: 1.0 } },
      });
    }

    return builder.createDefaultSubpass().build();
  }

  /**
   * Refraction pass (renders after opaque objects, reads scene color)
   *
   * Attachments:
   * - 0: Scene color (input from previous pass)
   * - 1: Output color (swapchain)
   * - 2: Depth (shared with previous pass)
   *
   * Subpasses:
   * - 0: Render refractive objects
   */
  static refraction(): RenderPassConfig {
    return (
      new RenderPassBuilder()
        .setName('Refraction Pass')
        // Input scene color
        .addColorAttachment({
          format: 'r16g16b16a16-sfloat',
          loadOp: 'load',
          storeOp: 'dont-care',
          initialLayout: 'shader-read-only',
          finalLayout: 'shader-read-only',
        })
        // Output color
        .addColorAttachment({
          format: 'swapchain',
          loadOp: 'load', // Preserve previous content
          storeOp: 'store',
          initialLayout: 'color-attachment',
          finalLayout: 'present-src',
        })
        // Depth buffer
        .addDepthAttachment({
          format: 'd32-sfloat',
          loadOp: 'load',
          storeOp: 'store',
          initialLayout: 'depth-stencil-attachment',
          finalLayout: 'depth-stencil-attachment',
        })
        .addSubpass({
          inputAttachments: [{ attachment: 0, layout: 'shader-read-only' }],
          colorAttachments: [{ attachment: 1, layout: 'color-attachment' }],
          depthStencilAttachment: {
            attachment: 2,
            layout: 'depth-stencil-attachment',
          },
        })
        .build()
    );
  }
}
