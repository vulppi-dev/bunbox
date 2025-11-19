import { Node, Root } from '@bunbox/tree';
import { Color, Cube, Frustum, Matrix4, Rect } from '../math';
import {
  AbstractCamera,
  Light,
  Mesh,
  Node3D,
  type Environment,
} from '../nodes';
import { MaskHelper, type Geometry } from '../resources';
import type { AssetsStorage } from './AssetsStorage';
import type { VkCommandBuffer } from '../vulkan/VkCommandBuffer';
import type { VkDevice } from '../vulkan/VkDevice';
import type { VkSwapchain } from '../vulkan/VkSwapchain';

type Frame = {
  projectionMatrix: Matrix4;
  viewMatrix: Matrix4;
  viewProjectionMatrix: Matrix4;
  frustum: Frustum;
  layer: MaskHelper;
};

type ModelFrame = {
  position: Matrix4;
  geometry: Geometry;
};

type LightFrame = {
  position: Matrix4;
  geometry: Geometry;
};

export class Scene extends Root {
  private __clearColor = new Color();
  private __environment: Environment | null = null;

  private __frames: Map<string, Frame> = new Map();

  constructor() {
    super();

    const unsubscribes = [
      this.subscribe('add-child', (child) => {
        if (!child.isEnabled) return;
        this.__processNode(child, false);
      }),
      this.subscribe('remove-child', (child) => {
        this.__processNode(child, true);
      }),
      this.subscribe('dirty-change', (child) => {
        this.__processNode(child, false);
      }),
      this.subscribe('enabled-change', (child) => {
        this.__processNode(child, !child.isEnabled);
      }),
    ];

    this.on('dispose', () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    });
  }

  get clearColor(): Color {
    return this.__clearColor;
  }

  get environment(): Environment | null {
    return this.__environment;
  }

  set clearColor(color: Color) {
    this.__clearColor.copy(color);
  }

  set environment(env: Environment | null) {
    this.__environment = env;
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
    this._processNodes(delta, time);

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

    commandBuffer.end();
  }

  private __processNode(node: Node, toRemove: boolean): void {
    if (node instanceof AbstractCamera) {
      this.__processCamera(node, toRemove);
    } else if (node instanceof Light) {
      this.__processLight(node, toRemove);
    } else if (node instanceof Mesh) {
      this.__processMesh(node, toRemove);
    }
  }

  private __processCamera(camera: AbstractCamera, toRemove: boolean): void {
    const id = camera.id;
    if (this.__frames.has(id) && toRemove) {
      this.__frames.delete(id);
    }
    if (toRemove) {
      return;
    }

    let toRecalculate = camera.isDirty;
    let parent = camera.parent;
    while (!toRecalculate && parent && parent !== this) {
      if (!parent.isEnabled) {
        this.__frames.delete(id);
        return;
      }

      if (!(parent instanceof Node3D)) {
        parent = parent.parent;
        continue;
      }

      if (parent.isDirty) {
        toRecalculate = true;
        break;
      }
      parent = parent.parent;
    }

    if (!toRecalculate && this.__frames.has(id)) {
      return;
    }

    let frame = this.__frames.get(id) ?? {
      projectionMatrix: new Matrix4(),
      viewMatrix: new Matrix4(),
      viewProjectionMatrix: new Matrix4(),
      frustum: new Frustum(),
      layer: new MaskHelper(),
    };
    this.__frames.set(id, frame);

    const viewMatrix = camera.transform.clone();
    parent = camera.parent;
    while (parent && parent !== this) {
      if (parent instanceof Node3D) {
        viewMatrix.mulL(parent.transform);
      }
      parent = parent.parent;
    }
    viewMatrix.invert();
    frame.viewMatrix.copy(viewMatrix);
    frame.projectionMatrix.copy(camera.projectionMatrix);
    frame.viewProjectionMatrix.copy(
      frame.projectionMatrix.clone().mulL(viewMatrix),
    );
    frame.layer.set(camera.layer.get());
    camera.generateFrustum(frame.viewProjectionMatrix, frame.frustum);

    camera.markAsClean();
  }

  private __processMesh(mesh: Mesh, toRemove: boolean): void {}

  private __processLight(light: Light, toRemove: boolean): void {}
}

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
