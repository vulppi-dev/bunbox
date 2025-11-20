import { defineSystem, forEachQuery } from '../core';
import { CameraComponent } from '../core/BuiltInComponents';
import { EngineError } from '../errors';
import type { Matrix4 } from '../math';
import type { MaskHelper } from '../resources';
import { CAMERA_PROJECTION_KEY, CAMERA_VIEW_KEY } from './CameraSystem';

export type FrameCamera = {
  id: string;
  view: Matrix4;
  projection: Matrix4;
  layer: MaskHelper;
};

export const RenderSystem = defineSystem(
  'RenderSystem',
  900,
  ({ world, assetsStorage }) => {
    const frameCameras: FrameCamera[] = [];

    forEachQuery(world, [CameraComponent], (entity, camera) => {
      const view = assetsStorage.get<Matrix4>(CAMERA_VIEW_KEY, entity);
      const projection = assetsStorage.get<Matrix4>(
        CAMERA_PROJECTION_KEY,
        entity,
      );

      if (!view || !projection) {
        throw new EngineError(
          `Missing camera matrices for entity ${entity}`,
          'RenderSystem',
        );
      }

      if (!view.isDirty && !projection.isDirty) {
        return;
      }

      frameCameras.push({
        id: entity,
        view,
        projection,
        layer: camera.layer,
      });
      view.markAsClean();
      projection.markAsClean();
    });

    if (!frameCameras.length) {
      return;
    }
  },
);

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
