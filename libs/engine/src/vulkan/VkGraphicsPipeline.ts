import type { Disposable } from '@bunbox/utils';
import type { Pointer } from 'bun:ffi';
import { RenderError } from '../errors';
import { VK_DEBUG } from '../singleton/logger';
import type { PipelineMaterialLayout } from '../pipeline/PipelineMaterialLayout';
import type { PipelineReflectionLayout } from '../pipeline/PipelineReflectionLayout';
import type { VkCommandBuffer } from './VkCommandBuffer';
import type { VkGeometry } from './VkGeometry';

export class VkGraphicsPipeline implements Disposable {
  readonly reflection: PipelineReflectionLayout;
  readonly materialLayout: PipelineMaterialLayout;

  private __device: Pointer | null = null;
  private __pipeline: Pointer | null = null;
  private __renderPass: Pointer | null = null;
  private __subpass: number = 0;

  constructor(
    reflection: PipelineReflectionLayout,
    materialLayout: PipelineMaterialLayout,
  ) {
    this.reflection = reflection;
    this.materialLayout = materialLayout;
  }

  get pipeline(): Pointer | null {
    return this.__pipeline;
  }

  prepare(device: Pointer, renderPass: Pointer, subpass: number): void {
    this.__device = device;
    this.__renderPass = renderPass;
    this.__subpass = subpass;
    // TODO: Pipeline creation is not implemented yet; keep stub for contract completeness.
    VK_DEBUG(
      'VkGraphicsPipeline.prepare called (stub) - pipeline creation not implemented',
    );
  }

  rebuild(device: Pointer, renderPass: Pointer, subpass: number): void {
    this.release();
    this.prepare(device, renderPass, subpass);
  }

  release(): void {
    // TODO: Actual pipeline destruction not implemented; clear state only.
    this.__pipeline = null;
    this.__device = null;
    this.__renderPass = null;
  }

  dispose(): void {
    this.release();
  }

  writeMaterialData(
    _cmd: VkCommandBuffer,
    _material: unknown,
    _materialGpuContext?: unknown,
  ): void {
    throw new RenderError(
      'writeMaterialData is not implemented for VkGraphicsPipeline yet',
      'Vulkan',
    );
  }

  writeGeometryData(_cmd: VkCommandBuffer, _vkGeometry: VkGeometry): void {
    throw new RenderError(
      'writeGeometryData is not implemented for VkGraphicsPipeline yet',
      'Vulkan',
    );
  }
}
