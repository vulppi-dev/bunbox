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
      .build();
  }

  /**
   * Deferred rendering G-Buffer pass
   * Writes position, normal, albedo, and specular to separate attachments
   *
   * Attachments:
   * - 0: Position (r32g32b32a32-sfloat)
   * - 1: Normal (r16g16b16a16-sfloat)
   * - 2: Albedo (r8g8b8a8-unorm)
   * - 3: Specular (r8g8b8a8-unorm)
   * - 4: Depth (d32-sfloat)
   *
   * Note: Use separate render pass for lighting that reads these textures
   */
  static deferredGeometry(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Deferred G-Buffer Pass')
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
      .build();
  }

  /**
   * Deferred rendering Lighting pass
   * Reads G-Buffer textures as shader resources and outputs final color
   *
   * Attachments:
   * - 0: Final color (swapchain)
   *
   * Note: Bind G-Buffer textures as shader resources before rendering
   */
  static deferredLighting(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Deferred Lighting Pass')
      .addColorAttachment({
        format: 'swapchain',
        loadOp: 'clear',
        storeOp: 'store',
        finalLayout: 'present-src',
        clearValue: { color: [0.0, 0.0, 0.0, 1.0] },
      })
      .build();
  }

  /**
   * Shadow map pass (depth-only, off-screen)
   *
   * Attachments:
   * - 0: Depth (d32-sfloat)
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
      .build();
  }

  /**
   * Post-processing pass
   * Reads from input texture and writes to output
   *
   * Attachments:
   * - 0: Output color
   *
   * Note: Bind input texture as shader resource before rendering
   * For multiple effects, chain multiple render passes together
   */
  static postProcess(outputFormat: Format = 'swapchain'): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Post-Processing Pass')
      .addColorAttachment({
        format: outputFormat,
        loadOp: 'dont-care',
        storeOp: 'store',
        finalLayout:
          outputFormat === 'swapchain' ? 'present-src' : 'shader-read-only',
      })
      .build();
  }

  /**
   * SSAO (Screen Space Ambient Occlusion) calculation pass
   * Outputs occlusion values to a single channel texture
   *
   * Attachments:
   * - 0: Occlusion buffer (r8-unorm)
   *
   * Note: Use separate render pass for blur/composite
   */
  static ssao(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('SSAO Calculation')
      .addColorAttachment({
        format: 'r8-unorm',
        loadOp: 'dont-care',
        storeOp: 'store',
        finalLayout: 'shader-read-only',
      })
      .build();
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

    return builder.build();
  }

  /**
   * Bloom bright pass
   * Extracts bright areas from HDR scene
   *
   * Attachments:
   * - 0: Bright color (r16g16b16a16-sfloat)
   *
   * Note: Bind scene color as shader resource
   */
  static bloomBright(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Bloom Bright Pass')
      .addColorAttachment({
        format: 'r16g16b16a16-sfloat',
        loadOp: 'dont-care',
        storeOp: 'store',
        finalLayout: 'shader-read-only',
      })
      .build();
  }

  /**
   * Gaussian blur pass
   * Can be used for bloom, SSAO blur, etc.
   *
   * Attachments:
   * - 0: Blurred output
   *
   * Note: Bind input texture as shader resource
   * Use two passes (horizontal + vertical) for separable blur
   */
  static blur(format: Format = 'r16g16b16a16-sfloat'): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Blur Pass')
      .addColorAttachment({
        format,
        loadOp: 'dont-care',
        storeOp: 'store',
        finalLayout: 'shader-read-only',
      })
      .build();
  }

  /**
   * Tone mapping and gamma correction pass
   * Final pass that outputs to swapchain
   *
   * Attachments:
   * - 0: Final output (swapchain)
   *
   * Note: Bind HDR scene as shader resource
   */
  static toneMapping(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Tone Mapping')
      .addColorAttachment({
        format: 'swapchain',
        loadOp: 'dont-care',
        storeOp: 'store',
        finalLayout: 'present-src',
      })
      .build();
  }

  /**
   * Depth pre-pass
   * Renders only depth to optimize early-z rejection in forward pass
   *
   * Attachments:
   * - 0: Depth (d32-sfloat)
   *
   * Note: Use this before forward rendering to cull occluded fragments early
   */
  static depthPrePass(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Depth Pre-Pass')
      .addDepthAttachment({
        format: 'd32-sfloat',
        loadOp: 'clear',
        storeOp: 'store',
        finalLayout: 'shader-read-only',
        clearValue: { depthStencil: { depth: 1.0 } },
      })
      .build();
  }

  /**
   * Light culling compute pass target
   * Creates a buffer for visible light indices per tile
   *
   * Attachments:
   * - 0: Light list (r32-uint)
   *
   * Note: Typically used with compute shaders for tiled/clustered lighting
   */
  static lightCulling(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Light Culling')
      .addColorAttachment({
        format: 'r32-uint',
        loadOp: 'dont-care',
        storeOp: 'store',
        finalLayout: 'shader-read-only',
      })
      .build();
  }

  /**
   * Transparency rendering pass
   * Renders transparent objects with alpha blending
   *
   * Attachments:
   * - 0: Color (r16g16b16a16-sfloat)
   * - 1: Depth (d32-sfloat, load existing depth)
   *
   * Note: Should be rendered after opaque geometry with depth testing enabled
   */
  static transparency(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Transparency Pass')
      .addColorAttachment({
        format: 'r16g16b16a16-sfloat',
        loadOp: 'load',
        storeOp: 'store',
        finalLayout: 'shader-read-only',
      })
      .addDepthAttachment({
        format: 'd32-sfloat',
        loadOp: 'load',
        storeOp: 'store',
        finalLayout: 'shader-read-only',
      })
      .build();
  }

  /**
   * Final composition pass to swapchain
   * Combines all previous passes and outputs to presentation
   *
   * Attachments:
   * - 0: Swapchain color
   *
   * Note: Last pass in the render pipeline
   */
  static finalComposite(): RenderPassConfig {
    return new RenderPassBuilder()
      .setName('Final Composite')
      .addColorAttachment({
        format: 'swapchain',
        loadOp: 'clear',
        storeOp: 'store',
        initialLayout: 'undefined',
        finalLayout: 'present-src',
        clearValue: { color: [0.0, 0.0, 0.0, 1.0] },
      })
      .build();
  }
}
