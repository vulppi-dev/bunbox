import { Root } from '@bunbox/tree';
import { Color, Cube, Rect } from '../math';
import { AbstractCamera, Light, Mesh, type Environment } from '../nodes';
import type { AssetsStorage } from './AssetsStorage';
import type { VkCommandBuffer } from './vulkan/VkCommandBuffer';
import type { VkDevice } from './vulkan/VkDevice';
import type { VkSwapchain } from './vulkan/VkSwapchain';

export class Scene extends Root {
  private _clearColor = new Color();
  private _environment: Environment | null = null;

  get clearColor(): Color {
    return this._clearColor;
  }

  get environment(): Environment | null {
    return this._environment;
  }

  set clearColor(color: Color) {
    this._clearColor.copy(color);
  }

  set environment(env: Environment | null) {
    this._environment = env;
  }

  render(
    device: VkDevice,
    swapchain: VkSwapchain,
    commandBuffer: VkCommandBuffer,
    imageIndex: number,
    assetsStore: AssetsStorage,
    delta: number,
    time: number,
  ): void {
    this._processNodes(delta);
    this.__populateRenderList();

    commandBuffer.begin();
    const renderArea = new Rect(0, 0, swapchain.width, swapchain.height);

    commandBuffer.setViewport(
      new Cube(0, 0, 0, swapchain.width, swapchain.height, 1.0),
    );
    commandBuffer.setScissor(renderArea);

    /*
      TODO: implement scene rendering logic here
      
      steps:
      - Prepare render passes, pipelines, framebuffers, etc. Based on swapchain instance for cache
        - If swapchain changed (image size, format, etc), recreate necessary resources
      - Process the render passes stages in order
        - shadowMapStage
        - depthPrePassStage
        - lightCullingStage
      - Prepare structure passes for forward rendering
        - forwardStage
        - transparencyStage
      - Process custom post-process stages
      - Final composite stage to present to swapchain
    */

    // commandBuffer.beginRenderPass(
    //   stage.renderPass.instance,
    //   framebuffer.instance,
    //   renderArea,
    //   [this._clearColor],
    // );

    // commandBuffer.endRenderPass();

    commandBuffer.end();
  }

  private __populateRenderList(): void {
    const cameras: AbstractCamera[] = [];
    const meshes: Mesh[] = [];
    const lights: Light[] = [];

    this.traverse((node) => {
      if (!node.isEnabled || node.isDisposed) {
        return;
      }

      if (node instanceof AbstractCamera) {
        cameras.push(node);
      } else if (node instanceof Mesh) {
        meshes.push(node);
      } else if (node instanceof Light) {
        lights.push(node);
      }
    });
  }
}

// static forward(
//     samples?: SampleCount,
//     depthLoadOp: 'clear' | 'load' = 'clear',
//     depthStoreOp: 'dont-care' | 'store' = 'dont-care',
//     colorFormat: TextureFormat | 'swapchain' = 'rgba16float',
//     colorFinal: 'color-attachment' | 'shader-read-only' = 'color-attachment',
//   ): RenderPassConfig {
//     return new RenderPassBuilder()
//       .setName('Forward Rendering')
//       .addColorAttachment({
//         format: colorFormat,
//         loadOp: 'clear',
//         storeOp: 'store',
//         finalLayout: colorFinal,
//         clearValue: { color: [0.0, 0.0, 0.0, 1.0] },
//         samples,
//       })
//       .addDepthAttachment({
//         format: 'depth32-float',
//         loadOp: depthLoadOp,
//         storeOp: depthStoreOp,
//         clearValue: { depthStencil: { depth: 1.0, stencil: 0 } },
//         samples,
//       })
//       .build();
//   }
