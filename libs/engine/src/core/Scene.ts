import { Root } from '@bunbox/tree';
import type { VkDevice } from './vulkan/VkDevice';
import type { VkSwapchain } from './vulkan/VkSwapchain';
import type { VkCommandBuffer } from './vulkan/VkCommandBuffer';
import { Color, Cube, Rect } from '../math';
import type { AssetsStorage } from './AssetsStorage';
import type { Environment } from '../nodes';

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
  ): void {
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
}
