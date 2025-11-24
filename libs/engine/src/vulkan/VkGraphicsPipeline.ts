import {
  getInstanceBuffer,
  instantiate,
  ptrAny,
  sizeOf,
  struct,
  u32,
  u64,
} from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VkColorComponentFlagBits,
  VkDynamicState,
  vkGraphicsPipelineCreateInfo,
  VkIndexType,
  vkPipelineColorBlendAttachmentState,
  vkPipelineColorBlendStateCreateInfo,
  vkPipelineDepthStencilStateCreateInfo,
  vkPipelineDynamicStateCreateInfo,
  vkPipelineInputAssemblyStateCreateInfo,
  vkPipelineMultisampleStateCreateInfo,
  vkPipelineRasterizationStateCreateInfo,
  vkPipelineShaderStageCreateInfo,
  vkPipelineVertexInputStateCreateInfo,
  vkPipelineViewportStateCreateInfo,
  VkResult,
  VkShaderStageFlagBits,
  vkVertexInputAttributeDescription,
  vkVertexInputBindingDescription,
  VkVertexInputRate,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { RenderError } from '../errors';
import type {
  PipelineMaterialLayout,
  SpecializationConstant,
} from '../pipeline/PipelineMaterialLayout';
import type { PipelineReflectionLayout } from '../pipeline/PipelineReflectionLayout';
import { VK_DEBUG } from '../singleton/logger';
import type { VkCommandBuffer } from './VkCommandBuffer';
import type { VkGeometry } from './VkGeometry';
import { VkShaderModule } from './VkShaderModule';

type SpecializationKeepAlive = {
  entriesBuffer: Uint8Array;
  dataBuffer: Uint8Array;
  infoBuffer: Uint8Array;
};

type SpecializationInfoPtr = {
  ptr: bigint;
  keepAlive: SpecializationKeepAlive | null;
};

const vkSpecializationMapEntry = struct({
  constantID: u32(),
  offset: u32(),
  size: u64(),
});

const vkSpecializationInfo = struct({
  mapEntryCount: u32(),
  pMapEntries: ptrAny(),
  dataSize: u64(),
  pData: ptrAny(),
});

export class VkGraphicsPipeline implements Disposable {
  readonly reflection: PipelineReflectionLayout;
  readonly materialLayout: PipelineMaterialLayout;

  private __device: Pointer | null = null;
  private __pipeline: Pointer | null = null;
  private __renderPass: Pointer | null = null;
  private __subpass: number = 0;
  private __shaderModules: VkShaderModule[] = [];

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
    if (this.__pipeline) return;
    if (!this.reflection.pipelineLayout) {
      throw new RenderError(
        'PipelineLayout not prepared before VkGraphicsPipeline.prepare',
        'Vulkan',
      );
    }

    this.__device = device;
    this.__renderPass = renderPass;
    this.__subpass = subpass;

    // Single shader module reused for both stages (WGSL source contains all stages).
    const shaderModule = new VkShaderModule(device, this.reflection.source);
    this.__shaderModules = [shaderModule];

    const specialization = buildSpecializationInfo(
      this.materialLayout.specializationConstants,
    );
    // Keep references alive until pipeline creation completes.
    const specializationKeepAlive = specialization.keepAlive;
    void specializationKeepAlive;

    // --- Shader stages
    const stageSize = sizeOf(vkPipelineShaderStageCreateInfo);
    const stageBuffer = new Uint8Array(
      stageSize * this.reflection.stages.length,
    );
    for (let i = 0; i < this.reflection.stages.length; i++) {
      const stage = this.reflection.stages[i]!;
      const info = instantiate(vkPipelineShaderStageCreateInfo);
      info.stage = mapStage(stage.stage);
      info.module = BigInt(shaderModule.instance);
      info.pName = stage.entryPoint;
      info.pSpecializationInfo = specialization.ptr;
      stageBuffer.set(new Uint8Array(getInstanceBuffer(info)), i * stageSize);
    }

    // --- Vertex input
    const bindings = this.materialLayout.vertexInput.bindings;
    const bindingSize = sizeOf(vkVertexInputBindingDescription);
    const bindingBuffer = new Uint8Array(bindingSize * bindings.length);
    for (let i = 0; i < bindings.length; i++) {
      const b = bindings[i]!;
      const desc = instantiate(vkVertexInputBindingDescription);
      desc.binding = b.binding;
      desc.stride = b.stride;
      desc.inputRate = VkVertexInputRate.VERTEX;
      bindingBuffer.set(
        new Uint8Array(getInstanceBuffer(desc)),
        i * bindingSize,
      );
    }

    const attributes = this.materialLayout.vertexInput.attributes;
    const attrSize = sizeOf(vkVertexInputAttributeDescription);
    const attrBuffer = new Uint8Array(attrSize * attributes.length);
    for (let i = 0; i < attributes.length; i++) {
      const a = attributes[i]!;
      const desc = instantiate(vkVertexInputAttributeDescription);
      desc.location = a.location;
      desc.binding = a.binding;
      desc.format = a.format;
      desc.offset = a.offset;
      attrBuffer.set(new Uint8Array(getInstanceBuffer(desc)), i * attrSize);
    }

    const vertexInput = instantiate(vkPipelineVertexInputStateCreateInfo);
    vertexInput.flags = 0;
    vertexInput.vertexBindingDescriptionCount = bindings.length;
    vertexInput.pVertexBindingDescriptions =
      bindings.length > 0 ? BigInt(ptr(bindingBuffer)) : 0n;
    vertexInput.vertexAttributeDescriptionCount = attributes.length;
    vertexInput.pVertexAttributeDescriptions =
      attributes.length > 0 ? BigInt(ptr(attrBuffer)) : 0n;

    // --- Input assembly
    const inputAssembly = instantiate(vkPipelineInputAssemblyStateCreateInfo);
    inputAssembly.flags = 0;
    inputAssembly.topology = this.materialLayout.topology;
    inputAssembly.primitiveRestartEnable = 0;

    // --- Viewport/Scissor (dynamic)
    const viewportState = instantiate(vkPipelineViewportStateCreateInfo);
    viewportState.flags = 0;
    viewportState.viewportCount = 1;
    viewportState.pViewports = 0n;
    viewportState.scissorCount = 1;
    viewportState.pScissors = 0n;

    // --- Rasterization
    const rasterStateMeta = this.materialLayout.rasterState;
    const rasterState = instantiate(vkPipelineRasterizationStateCreateInfo);
    rasterState.flags = 0;
    rasterState.depthClampEnable = 0;
    rasterState.rasterizerDiscardEnable = 0;
    rasterState.polygonMode = rasterStateMeta.polygonMode;
    rasterState.cullMode = rasterStateMeta.cullMode;
    rasterState.frontFace = rasterStateMeta.frontFace;
    rasterState.depthBiasEnable = 0;
    rasterState.depthBiasConstantFactor = 0;
    rasterState.depthBiasClamp = 0;
    rasterState.depthBiasSlopeFactor = 0;
    rasterState.lineWidth = 1;

    // --- Multisample
    const multisample = instantiate(vkPipelineMultisampleStateCreateInfo);
    multisample.flags = 0;
    multisample.rasterizationSamples = rasterStateMeta.sampleCount;
    multisample.sampleShadingEnable = 0;
    multisample.minSampleShading = 0;
    multisample.pSampleMask = 0n;
    multisample.alphaToCoverageEnable = 0;
    multisample.alphaToOneEnable = 0;

    // --- Depth/Stencil
    const depthStencil = instantiate(vkPipelineDepthStencilStateCreateInfo);
    depthStencil.flags = 0;
    depthStencil.depthTestEnable = 1;
    depthStencil.depthWriteEnable = rasterStateMeta.depthWriteEnabled ? 1 : 0;
    depthStencil.depthCompareOp = rasterStateMeta.depthCompare;
    depthStencil.depthBoundsTestEnable = 0;
    depthStencil.stencilTestEnable = 0;
    depthStencil.front.failOp = rasterStateMeta.stencil.front.failOp;
    depthStencil.front.passOp = rasterStateMeta.stencil.front.passOp;
    depthStencil.front.depthFailOp = rasterStateMeta.stencil.front.depthFailOp;
    depthStencil.front.compareOp = rasterStateMeta.stencil.front.compare;
    depthStencil.front.compareMask = rasterStateMeta.stencil.readMask;
    depthStencil.front.writeMask = rasterStateMeta.stencil.writeMask;
    depthStencil.front.reference = 0;
    depthStencil.back.failOp = rasterStateMeta.stencil.back.failOp;
    depthStencil.back.passOp = rasterStateMeta.stencil.back.passOp;
    depthStencil.back.depthFailOp = rasterStateMeta.stencil.back.depthFailOp;
    depthStencil.back.compareOp = rasterStateMeta.stencil.back.compare;
    depthStencil.back.compareMask = rasterStateMeta.stencil.readMask;
    depthStencil.back.writeMask = rasterStateMeta.stencil.writeMask;
    depthStencil.back.reference = 0;
    depthStencil.minDepthBounds = 0;
    depthStencil.maxDepthBounds = 1;

    // --- Color blend (single attachment for now)
    const colorAttachment = instantiate(vkPipelineColorBlendAttachmentState);
    colorAttachment.blendEnable = rasterStateMeta.blend.enabled ? 1 : 0;
    colorAttachment.srcColorBlendFactor = rasterStateMeta.blend.color.srcFactor;
    colorAttachment.dstColorBlendFactor = rasterStateMeta.blend.color.dstFactor;
    colorAttachment.colorBlendOp = rasterStateMeta.blend.color.operation;
    colorAttachment.srcAlphaBlendFactor = rasterStateMeta.blend.alpha.srcFactor;
    colorAttachment.dstAlphaBlendFactor = rasterStateMeta.blend.alpha.dstFactor;
    colorAttachment.alphaBlendOp = rasterStateMeta.blend.alpha.operation;
    const writeMask =
      rasterStateMeta.blend.writeMask & 0xf
        ? rasterStateMeta.blend.writeMask & 0xf
        : VkColorComponentFlagBits.R_BIT |
          VkColorComponentFlagBits.G_BIT |
          VkColorComponentFlagBits.B_BIT |
          VkColorComponentFlagBits.A_BIT;
    colorAttachment.colorWriteMask = writeMask;

    const colorState = instantiate(vkPipelineColorBlendStateCreateInfo);
    colorState.flags = 0;
    colorState.logicOpEnable = 0;
    colorState.logicOp = 0;
    colorState.attachmentCount = 1;
    colorState.pAttachments = BigInt(ptr(getInstanceBuffer(colorAttachment)));
    colorState.blendConstants[0] = 0;
    colorState.blendConstants[1] = 0;
    colorState.blendConstants[2] = 0;
    colorState.blendConstants[3] = 0;

    // --- Dynamic state (viewport + scissor)
    const dynamicStates = new Uint32Array([
      VkDynamicState.VIEWPORT,
      VkDynamicState.SCISSOR,
    ]);
    const dynamicState = instantiate(vkPipelineDynamicStateCreateInfo);
    dynamicState.flags = 0;
    dynamicState.dynamicStateCount = dynamicStates.length;
    dynamicState.pDynamicStates = BigInt(ptr(dynamicStates));

    // --- Pipeline create info
    const pipelineInfo = instantiate(vkGraphicsPipelineCreateInfo);
    pipelineInfo.flags = 0;
    pipelineInfo.stageCount = this.reflection.stages.length;
    pipelineInfo.pStages = BigInt(ptr(stageBuffer));
    pipelineInfo.pVertexInputState = BigInt(
      ptr(getInstanceBuffer(vertexInput)),
    );
    pipelineInfo.pInputAssemblyState = BigInt(
      ptr(getInstanceBuffer(inputAssembly)),
    );
    pipelineInfo.pTessellationState = 0n;
    pipelineInfo.pViewportState = BigInt(ptr(getInstanceBuffer(viewportState)));
    pipelineInfo.pRasterizationState = BigInt(
      ptr(getInstanceBuffer(rasterState)),
    );
    pipelineInfo.pMultisampleState = BigInt(
      ptr(getInstanceBuffer(multisample)),
    );
    pipelineInfo.pDepthStencilState = BigInt(
      ptr(getInstanceBuffer(depthStencil)),
    );
    pipelineInfo.pColorBlendState = BigInt(ptr(getInstanceBuffer(colorState)));
    pipelineInfo.pDynamicState = BigInt(ptr(getInstanceBuffer(dynamicState)));
    pipelineInfo.layout = BigInt(this.reflection.pipelineLayout!);
    pipelineInfo.renderPass = BigInt(renderPass);
    pipelineInfo.subpass = subpass;
    pipelineInfo.basePipelineHandle = 0n;
    pipelineInfo.basePipelineIndex = -1;

    const pipelineHolder = new BigUint64Array(1);
    const result = VK.vkCreateGraphicsPipelines(
      device,
      0n,
      1,
      ptr(getInstanceBuffer(pipelineInfo)),
      null,
      ptr(pipelineHolder),
    );

    if (result !== VkResult.SUCCESS) {
      for (const module of this.__shaderModules) {
        module.dispose();
      }
      this.__shaderModules = [];
      throw new RenderError(getResultMessage(result), 'Vulkan');
    }

    this.__pipeline = Number(pipelineHolder[0]) as Pointer;
    VK_DEBUG(
      `Graphics pipeline created: 0x${this.__pipeline.toString(
        16,
      )} (subpass ${subpass})`,
    );
  }

  rebuild(device: Pointer, renderPass: Pointer, subpass: number): void {
    this.release();
    this.prepare(device, renderPass, subpass);
  }

  release(): void {
    if (this.__pipeline && this.__device) {
      VK.vkDestroyPipeline(this.__device, this.__pipeline, null);
      VK_DEBUG(
        `Graphics pipeline destroyed: 0x${this.__pipeline.toString(16)}`,
      );
    }
    this.__pipeline = null;
    for (const module of this.__shaderModules) {
      module.dispose();
    }
    this.__shaderModules = [];
    this.__device = null;
    this.__renderPass = null;
  }

  dispose(): void {
    this.release();
  }

  writeMaterialData(
    cmd: VkCommandBuffer,
    _material: unknown,
    _materialGpuContext?: unknown,
  ): void {
    if (!this.__pipeline) {
      throw new RenderError(
        'Pipeline not created before writeMaterialData',
        'Vulkan',
      );
    }
    cmd.bindPipeline(this.__pipeline);
    // TODO: descriptor set binding when material GPU context is available.
  }

  writeGeometryData(cmd: VkCommandBuffer, vkGeometry: VkGeometry): void {
    if (!this.__pipeline) {
      throw new RenderError(
        'Pipeline not created before writeGeometryData',
        'Vulkan',
      );
    }

    const bindings = this.materialLayout.vertexInput.bindings;
    const buffers = [];
    const offsets: bigint[] = [];

    for (const binding of bindings) {
      const bufferInfo = vkGeometry.getAttributeBuffer(binding.name);
      if (!bufferInfo) {
        throw new RenderError(
          `Missing vertex buffer for attribute "${binding.name}"`,
          'Vulkan',
        );
      }
      buffers.push(bufferInfo.vkBuffer);
      offsets.push(BigInt(bufferInfo.byteOffset));
    }

    if (buffers.length > 0) {
      cmd.bindVertexBuffers(0, buffers, offsets);
    }

    const indexInfo = vkGeometry.getIndexBuffer();
    if (indexInfo) {
      const indexType =
        indexInfo.indexType === VkIndexType.UINT16 ? 'uint16' : 'uint32';
      cmd.bindIndexBuffer(
        indexInfo.vkBuffer,
        BigInt(indexInfo.byteOffset),
        indexType,
      );
    }
  }
}

function mapStage(stage: 'vertex' | 'fragment' | 'compute'): number {
  switch (stage) {
    case 'fragment':
      return VkShaderStageFlagBits.FRAGMENT_BIT;
    case 'compute':
      return VkShaderStageFlagBits.COMPUTE_BIT;
    case 'vertex':
    default:
      return VkShaderStageFlagBits.VERTEX_BIT;
  }
}

function buildSpecializationInfo(
  constants: SpecializationConstant[],
): SpecializationInfoPtr {
  const valid = constants.filter((c) => c.value !== undefined);
  if (valid.length === 0) {
    return { ptr: 0n, keepAlive: null };
  }

  const entrySize = sizeOf(vkSpecializationMapEntry);
  const entriesBuffer = new Uint8Array(entrySize * valid.length);
  const dataBuffer = new Uint8Array(valid.length * 4);

  for (let i = 0; i < valid.length; i++) {
    const spec = valid[i]!;
    const entry = instantiate(vkSpecializationMapEntry);
    entry.constantID = spec.id;
    entry.offset = i * 4;
    entry.size = BigInt(4);
    entriesBuffer.set(new Uint8Array(getInstanceBuffer(entry)), i * entrySize);

    let value = spec.value as number;
    if (typeof spec.value === 'boolean') {
      value = spec.value ? 1 : 0;
    } else if (typeof spec.value !== 'number') {
      value = 0;
    }
    new DataView(dataBuffer.buffer).setFloat32(i * 4, value, true);
  }

  const info = instantiate(vkSpecializationInfo);
  info.mapEntryCount = valid.length;
  info.pMapEntries = BigInt(ptr(entriesBuffer));
  info.dataSize = BigInt(dataBuffer.byteLength);
  info.pData = BigInt(ptr(dataBuffer));

  const infoBuffer = new Uint8Array(getInstanceBuffer(info));
  return {
    ptr: BigInt(ptr(infoBuffer)),
    keepAlive: {
      entriesBuffer,
      dataBuffer,
      infoBuffer,
    },
  };
}
