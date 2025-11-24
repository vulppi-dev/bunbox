import type { Pointer } from 'bun:ffi';
import { EngineError } from '../errors';
import { ShaderStorage, type ShaderHolder } from './ShaderStorage';
import type { Material } from '../material/MaterialBuilder';
import { PipelineMaterialLayout } from '../pipeline/PipelineMaterialLayout';
import { PipelineReflectionLayout } from '../pipeline/PipelineReflectionLayout';
import { VkGraphicsPipeline } from '../vulkan/VkGraphicsPipeline';

export type PipelineKey = {
  shader: ShaderHolder;
  topology: Material['topology'];
  rasterSignature: string;
  overridesSignature: string;
  renderPass: Pointer;
  subpass: number;
};

export class PipelineStorage {
  private __shaderStorage: ShaderStorage;
  private __reflections = new Map<string, PipelineReflectionLayout>();
  private __pipelines = new Map<string, VkGraphicsPipeline>();

  constructor(shaderStorage: ShaderStorage) {
    this.__shaderStorage = shaderStorage;
  }

  getGraphicsPipeline(
    device: Pointer,
    renderPass: Pointer,
    subpass: number,
    material: Material,
  ): VkGraphicsPipeline {
    const pack = this.__shaderStorage.getShaderPack(material.shader);
    if (!pack || pack.type !== 'graphics') {
      throw new EngineError(
        'Material shader is not registered as graphics shader',
        'PipelineStorage',
      );
    }

    const reflectionKey =
      pack.key ?? `${material.shader}:${pack.vEntry}:${pack.fEntry ?? ''}`;
    let reflection = this.__reflections.get(reflectionKey);
    if (!reflection) {
      reflection = new PipelineReflectionLayout({
        shader: material.shader,
        shaderStorage: this.__shaderStorage,
        vertexEntryPoint: pack.vEntry,
        fragmentEntryPoint: pack.fEntry,
      });
      this.__reflections.set(reflectionKey, reflection);
    }

    const key = this.__makePipelineKey(material, renderPass, subpass);
    let pipeline = this.__pipelines.get(key);
    if (!pipeline) {
      const layout = new PipelineMaterialLayout(reflection, material);
      reflection.prepare(device);
      layout.prepare();
      pipeline = new VkGraphicsPipeline(reflection, layout);
      pipeline.prepare(device, renderPass, subpass);
      this.__pipelines.set(key, pipeline);
    }

    return pipeline;
  }

  clear(): void {
    for (const pipeline of this.__pipelines.values()) {
      pipeline.dispose();
    }
    this.__pipelines.clear();
    for (const reflection of this.__reflections.values()) {
      reflection.dispose();
    }
    this.__reflections.clear();
  }

  private __makePipelineKey(
    material: Material,
    renderPass: Pointer,
    subpass: number,
  ): string {
    const raster = material.rasterizationState;
    const rasterSignature = [
      raster.fillMode,
      raster.cull,
      raster.frontFace,
      raster.depthStencil.depthCompare,
      raster.depthStencil.depthWriteEnabled,
      raster.blend.enabled,
      raster.multisample.count,
    ].join(',');
    const overridesSignature = this.__serializeOverrides(
      material.overrides as Record<string, unknown>,
    );
    const key: PipelineKey = {
      shader: material.shader,
      topology: material.topology,
      rasterSignature,
      overridesSignature,
      renderPass,
      subpass,
    };
    return JSON.stringify(key);
  }

  private __serializeOverrides(values: Record<string, unknown>): string {
    const entries = Object.entries(values).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return JSON.stringify(entries);
  }
}
