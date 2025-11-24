import { getInstanceBuffer, instantiate, sizeOf } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  vkDescriptorSetLayoutBinding,
  vkDescriptorSetLayoutCreateInfo,
  vkPipelineLayoutCreateInfo,
  VkResult,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { EngineError, RenderError } from '../errors';
import { ShaderStorage, type ShaderHolder } from '../storages/ShaderStorage';
import { VK_DEBUG } from '../singleton/logger';
import {
  reflectShaderLayout,
  type DescriptorSetInfo,
  type ShaderOverrideInfo,
  type ShaderReflectionData,
  type ShaderStageInfo,
  type VertexAttributeInfo,
} from './ShaderReflection';

export class PipelineReflectionLayout implements Disposable {
  readonly shader: ShaderHolder;
  readonly vertexEntryPoint: string;
  readonly fragmentEntryPoint?: string;
  readonly source: string;

  readonly vertexInputs: VertexAttributeInfo[];
  readonly descriptorSets: DescriptorSetInfo[];
  readonly stages: ShaderStageInfo[];
  readonly overrides: ShaderOverrideInfo[];

  private __descriptorSetLayouts: BigUint64Array | null = null;
  private __pipelineLayout: Pointer | null = null;
  private __device: Pointer | null = null;

  constructor(options: {
    shader: ShaderHolder;
    shaderStorage: ShaderStorage;
    vertexEntryPoint: string;
    fragmentEntryPoint?: string;
  }) {
    this.shader = options.shader;
    this.vertexEntryPoint = options.vertexEntryPoint;
    this.fragmentEntryPoint = options.fragmentEntryPoint;

    const pack = options.shaderStorage.getShaderPack(options.shader);
    if (!pack || pack.type !== 'graphics') {
      throw new EngineError(
        'ShaderHolder does not reference a graphics shader',
        'PipelineReflection',
      );
    }

    this.source = pack.src;

    const reflection: ShaderReflectionData = reflectShaderLayout(pack.src, {
      vertexEntryPoint: options.vertexEntryPoint ?? pack.vEntry,
      fragmentEntryPoint: options.fragmentEntryPoint ?? pack.fEntry,
      reflectInstance: pack.reflect,
    });

    this.vertexInputs = reflection.vertexAttributes;
    this.descriptorSets = reflection.descriptorSets;
    this.stages = reflection.stages;
    this.overrides = reflection.overrides;
  }

  get pipelineLayout(): Pointer | null {
    return this.__pipelineLayout;
  }

  get descriptorSetLayouts(): BigUint64Array | null {
    return this.__descriptorSetLayouts;
  }

  prepare(device: Pointer): void {
    if (this.__pipelineLayout) return;
    this.__device = device;

    this.__descriptorSetLayouts = new BigUint64Array(
      this.descriptorSets.map((setInfo) => {
        const bindingSize = sizeOf(vkDescriptorSetLayoutBinding);
        const bindingsBuffer = new Uint8Array(
          bindingSize * setInfo.bindings.length,
        );

        for (let i = 0; i < setInfo.bindings.length; i++) {
          const info = setInfo.bindings[i]!;
          const binding = instantiate(vkDescriptorSetLayoutBinding);
          binding.binding = info.binding;
          binding.descriptorType = info.descriptorType;
          binding.descriptorCount = info.descriptorCount;
          binding.stageFlags = info.stageFlags;
          binding.pImmutableSamplers = 0n;
          bindingsBuffer.set(
            new Uint8Array(getInstanceBuffer(binding)),
            i * bindingSize,
          );
        }

        const createInfo = instantiate(vkDescriptorSetLayoutCreateInfo);
        createInfo.flags = 0;
        createInfo.bindingCount = setInfo.bindings.length;
        createInfo.pBindings =
          setInfo.bindings.length > 0 ? BigInt(ptr(bindingsBuffer)) : 0n;

        const layoutHolder = new BigUint64Array(1);
        const result = VK.vkCreateDescriptorSetLayout(
          device,
          ptr(getInstanceBuffer(createInfo)),
          null,
          ptr(layoutHolder),
        );

        if (result !== VkResult.SUCCESS) {
          throw new RenderError(getResultMessage(result), 'Vulkan');
        }

        return layoutHolder[0]!;
      }),
    );

    const pipelineLayoutInfo = instantiate(vkPipelineLayoutCreateInfo);
    pipelineLayoutInfo.flags = 0;
    pipelineLayoutInfo.setLayoutCount = this.__descriptorSetLayouts.length;
    pipelineLayoutInfo.pSetLayouts =
      this.__descriptorSetLayouts.length > 0
        ? BigInt(
            ptr(
              new BigUint64Array(
                this.__descriptorSetLayouts.map((layout) => BigInt(layout)),
              ),
            ),
          )
        : 0n;
    pipelineLayoutInfo.pushConstantRangeCount = 0;
    pipelineLayoutInfo.pPushConstantRanges = 0n;

    const pipelineLayoutHolder = new BigUint64Array(1);
    const result = VK.vkCreatePipelineLayout(
      device,
      ptr(getInstanceBuffer(pipelineLayoutInfo)),
      null,
      ptr(pipelineLayoutHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(result), 'Vulkan');
    }

    this.__pipelineLayout = Number(pipelineLayoutHolder[0]) as Pointer;

    VK_DEBUG(
      `PipelineLayout created for shader ${String(this.shader)} with ${
        this.__descriptorSetLayouts.length
      } set layouts`,
    );
  }

  release(): void {
    if (!this.__device) return;

    if (this.__pipelineLayout) {
      VK.vkDestroyPipelineLayout(this.__device, this.__pipelineLayout, null);
      this.__pipelineLayout = null;
    }

    if (this.__descriptorSetLayouts) {
      for (const layout of this.__descriptorSetLayouts) {
        VK.vkDestroyDescriptorSetLayout(this.__device, layout, null);
      }
      this.__descriptorSetLayouts = null;
    }
  }

  dispose(): void {
    this.release();
    this.__device = null;
  }
}
