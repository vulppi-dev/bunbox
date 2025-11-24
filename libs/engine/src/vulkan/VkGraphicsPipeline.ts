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
  VkPipelineBindPoint,
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
  vkDescriptorPoolCreateInfo,
  vkDescriptorPoolSize,
  vkDescriptorSetAllocateInfo,
  vkDescriptorBufferInfo,
  vkWriteDescriptorSet,
  VkDescriptorType,
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
import { PropertyType } from '../material/MaterialPropertyTypes';
import type { StorageDefinition } from '../material/MaterialSchema';
import { isStorageValue } from '../material/StorageTypes';
import { VK_DEBUG } from '../singleton/logger';
import { Color, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from '../math';
import type { VkCommandBuffer } from './VkCommandBuffer';
import type { VkGeometry } from './VkGeometry';
import { VkBuffer } from './VkBuffer';
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
  private __physicalDevice: Pointer | null = null;
  private __pipeline: Pointer | null = null;
  private __renderPass: Pointer | null = null;
  private __subpass: number = 0;
  private __shaderModules: VkShaderModule[] = [];
  private __descriptorPool: Pointer | null = null;
  private __descriptorSets: BigUint64Array | null = null;
  private __uniformBuffers: Map<string, VkBuffer> = new Map();
  private __storageBuffers: Map<string, VkBuffer[]> = new Map();

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

  prepare(
    device: Pointer,
    renderPass: Pointer,
    subpass: number,
    physicalDevice?: Pointer,
  ): void {
    if (this.__pipeline) return;
    if (!this.reflection.pipelineLayout) {
      this.reflection.prepare(device);
    }

    this.__device = device;
    this.__physicalDevice = physicalDevice ?? this.__physicalDevice;
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

  rebuild(
    device: Pointer,
    renderPass: Pointer,
    subpass: number,
    physicalDevice?: Pointer,
  ): void {
    this.release();
    this.prepare(device, renderPass, subpass, physicalDevice);
  }

  release(): void {
    for (const buffer of this.__uniformBuffers.values()) {
      buffer.dispose();
    }
    this.__uniformBuffers.clear();
    for (const bufferList of this.__storageBuffers.values()) {
      for (const buffer of bufferList) {
        buffer.dispose();
      }
    }
    this.__storageBuffers.clear();

    if (this.__descriptorPool && this.__device) {
      VK.vkDestroyDescriptorPool(this.__device, this.__descriptorPool, null);
    }
    this.__descriptorPool = null;
    this.__descriptorSets = null;

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
    this.__physicalDevice = null;
    this.__renderPass = null;
  }

  dispose(): void {
    this.release();
  }

  writeMaterialData(cmd: VkCommandBuffer): void {
    if (!this.__pipeline) {
      throw new RenderError(
        'Pipeline not created before writeMaterialData',
        'Vulkan',
      );
    }
    if (!this.reflection.descriptorSetLayouts) {
      throw new RenderError(
        'Pipeline reflection missing descriptor set layouts',
        'Vulkan',
      );
    }
    if (!this.reflection.pipelineLayout) {
      throw new RenderError(
        'Pipeline reflection missing pipeline layout',
        'Vulkan',
      );
    }
    if (!this.__device) {
      throw new RenderError('Device not available for pipeline', 'Vulkan');
    }

    this.__ensureDescriptorSets();
    this.__updateUniformDescriptors();
    this.__updateStorageDescriptors();

    cmd.bindPipeline(this.__pipeline);
    if (this.__descriptorSets && this.__descriptorSets.length > 0) {
      VK.vkCmdBindDescriptorSets(
        cmd.instance,
        VkPipelineBindPoint.GRAPHICS,
        this.reflection.pipelineLayout,
        0,
        this.__descriptorSets.length,
        ptr(this.__descriptorSets),
        0,
        null,
      );
    }
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

  /**
   * Read back a storage buffer bound by name.
   * Caller must ensure GPU writes are complete before invoking (fence/sync).
   */
  readStorage(name: string, index = 0): Uint8Array {
    const buffers = this.__storageBuffers.get(name);
    if (!buffers || buffers.length === 0 || index < 0 || index >= buffers.length) {
      throw new RenderError(
        `Storage buffer "${name}" has not been created or bound`,
        'Vulkan',
      );
    }
    return buffers[index]!.read();
  }

  private __ensureDescriptorSets(): void {
    if (this.__descriptorSets) return;
    if (!this.__device) {
      throw new RenderError('Device not available for descriptors', 'Vulkan');
    }
    if (!this.reflection.descriptorSetLayouts) {
      throw new RenderError(
        'Descriptor set layouts not prepared before allocation',
        'Vulkan',
      );
    }

    const layouts = this.reflection.descriptorSetLayouts;
    if (layouts.length === 0) {
      this.__descriptorSets = new BigUint64Array(0);
      return;
    }

    const typeCounts = new Map<number, number>();
    for (const set of this.reflection.descriptorSets) {
      for (const binding of set.bindings) {
        const current = typeCounts.get(binding.descriptorType) ?? 0;
        typeCounts.set(
          binding.descriptorType,
          current + (binding.descriptorCount || 1),
        );
      }
    }

    const poolEntryCount = Math.max(typeCounts.size, 1);
    const poolEntrySize = sizeOf(vkDescriptorPoolSize);
    const poolBuffer = new Uint8Array(poolEntryCount * poolEntrySize);
    const entries =
      typeCounts.size > 0
        ? Array.from(typeCounts.entries())
        : [[VkDescriptorType.UNIFORM_BUFFER, 1]];

    for (let i = 0; i < entries.length; i++) {
      const [type, count] = entries[i]!;
      const poolSize = instantiate(vkDescriptorPoolSize);
      poolSize.type = type!;
      poolSize.descriptorCount = count!;
      poolBuffer.set(
        new Uint8Array(getInstanceBuffer(poolSize)),
        i * poolEntrySize,
      );
    }

    const poolInfo = instantiate(vkDescriptorPoolCreateInfo);
    poolInfo.flags = 0;
    poolInfo.maxSets = layouts.length;
    poolInfo.poolSizeCount = entries.length;
    poolInfo.pPoolSizes = BigInt(ptr(poolBuffer));

    const poolHolder = new BigUint64Array(1);
    const poolResult = VK.vkCreateDescriptorPool(
      this.__device,
      ptr(getInstanceBuffer(poolInfo)),
      null,
      ptr(poolHolder),
    );
    if (poolResult !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(poolResult), 'Vulkan');
    }

    this.__descriptorPool = Number(poolHolder[0]) as Pointer;

    const layoutArray = new BigUint64Array(
      layouts.map((layout) => BigInt(layout)),
    );
    const allocInfo = instantiate(vkDescriptorSetAllocateInfo);
    allocInfo.descriptorPool = BigInt(this.__descriptorPool);
    allocInfo.descriptorSetCount = layoutArray.length;
    allocInfo.pSetLayouts = BigInt(ptr(layoutArray));

    const descriptorSets = new BigUint64Array(layoutArray.length);
    const allocResult = VK.vkAllocateDescriptorSets(
      this.__device,
      ptr(getInstanceBuffer(allocInfo)),
      ptr(descriptorSets),
    );

    if (allocResult !== VkResult.SUCCESS) {
      VK.vkDestroyDescriptorPool(this.__device, this.__descriptorPool, null);
      this.__descriptorPool = null;
      throw new RenderError(getResultMessage(allocResult), 'Vulkan');
    }

    this.__descriptorSets = descriptorSets;
  }

  private __updateUniformDescriptors(): void {
    if (
      !this.__descriptorSets ||
      this.__descriptorSets.length === 0 ||
      this.materialLayout.uniformBindings.length === 0
    ) {
      return;
    }

    if (!this.__device || !this.__physicalDevice) {
      throw new RenderError(
        'Physical device is required to upload uniform buffers',
        'Vulkan',
      );
    }

    const uniforms = this.materialLayout.material.uniforms as Record<
      string,
      unknown
    >;
    const uniformDefs =
      this.materialLayout.material.schema.uniforms ??
      ({} as Record<string, { type: PropertyType }>);

    const writeSize = sizeOf(vkWriteDescriptorSet);
    const writes: Uint8Array[] = [];
    const keepAlive: Array<ArrayBuffer | ArrayBufferView> = [];

    for (const binding of this.materialLayout.uniformBindings) {
      if (binding.descriptorType !== VkDescriptorType.UNIFORM_BUFFER) {
        throw new RenderError(
          `Descriptor type ${binding.descriptorType} not supported for uniform "${binding.name}"`,
          'Vulkan',
        );
      }
      if (binding.descriptorCount > 1) {
        throw new RenderError(
          `Uniform buffer arrays are not supported for "${binding.name}"`,
          'Vulkan',
        );
      }

      const def = uniformDefs[binding.name];
      if (!def) {
        throw new RenderError(
          `Uniform "${binding.name}" not found in schema`,
          'Vulkan',
        );
      }

      const encoded = this.__encodeUniformValue(def, uniforms[binding.name]);

      let buffer = this.__uniformBuffers.get(binding.name);
      if (!buffer || buffer.size < BigInt(encoded.byteLength)) {
        buffer?.dispose();
        buffer = new VkBuffer(
          this.__device,
          this.__physicalDevice,
          encoded.byteLength,
          'uniform',
          encoded,
        );
        this.__uniformBuffers.set(binding.name, buffer);
      } else {
        buffer.upload(encoded);
      }

      const bufferInfo = instantiate(vkDescriptorBufferInfo);
      bufferInfo.buffer = BigInt(buffer.instance);
      bufferInfo.offset = 0n;
      bufferInfo.range = BigInt(encoded.byteLength);
      const bufferInfoRaw = getInstanceBuffer(bufferInfo);

      const write = instantiate(vkWriteDescriptorSet);
      write.dstSet = this.__getDescriptorSetHandle(binding.set);
      write.dstBinding = binding.binding;
      write.dstArrayElement = 0;
      write.descriptorCount = binding.descriptorCount;
      write.descriptorType = binding.descriptorType;
      write.pImageInfo = 0n;
      write.pBufferInfo = BigInt(ptr(bufferInfoRaw));
      write.pTexelBufferView = 0n;

      writes.push(new Uint8Array(getInstanceBuffer(write)));
      keepAlive.push(bufferInfoRaw);
    }

    if (writes.length === 0) return;

    const writeBuffer = new Uint8Array(writeSize * writes.length);
    for (let i = 0; i < writes.length; i++) {
      writeBuffer.set(writes[i]!, i * writeSize);
    }

    VK.vkUpdateDescriptorSets(
      this.__device,
      writes.length,
      ptr(writeBuffer),
      0,
      null,
    );
  }

  private __updateStorageDescriptors(): void {
    if (
      !this.__descriptorSets ||
      this.__descriptorSets.length === 0 ||
      this.materialLayout.storageBindings.length === 0
    ) {
      return;
    }

    if (!this.__device || !this.__physicalDevice) {
      throw new RenderError(
        'Physical device is required to upload storage buffers',
        'Vulkan',
      );
    }

    const storages = this.materialLayout.material.storages as Record<
      string,
      unknown
    >;
    const storageDefs = this.materialLayout.material.schema.storages ?? {};

    const writeSize = sizeOf(vkWriteDescriptorSet);
    const writes: Uint8Array[] = [];
    const keepAlive: Array<ArrayBuffer | ArrayBufferView> = [];

    for (const binding of this.materialLayout.storageBindings) {
      if (binding.descriptorType !== VkDescriptorType.STORAGE_BUFFER) {
        throw new RenderError(
          `Descriptor type ${binding.descriptorType} not supported for storage "${binding.name}"`,
          'Vulkan',
        );
      }

      const def = storageDefs[binding.name] as StorageDefinition | undefined;
      if (!def) {
        throw new RenderError(
          `Storage "${binding.name}" not found in schema`,
          'Vulkan',
        );
      }

      const encoded = this.__encodeStorageValue(
        def,
        storages[binding.name],
        binding.name,
      );

      const encodedArray = Array.isArray(encoded) ? encoded : [encoded];
      if (encodedArray.length > 1 && encodedArray.length !== binding.descriptorCount) {
        throw new RenderError(
          `Storage array "${binding.name}" expects ${binding.descriptorCount} elements but got ${encodedArray.length}`,
          'Vulkan',
        );
      }

      if (encodedArray.some((e) => e.byteLength === 0)) {
        throw new RenderError(
          `Storage "${binding.name}" must have a size greater than zero`,
          'Vulkan',
        );
      }

      const existing = this.__storageBuffers.get(binding.name) ?? [];
      const needed = binding.descriptorCount;
      const buffers: VkBuffer[] = [];

      for (let i = 0; i < needed; i++) {
        const data = encodedArray[i] ?? encodedArray[0]!;
        let buffer = existing[i];
        if (!buffer || buffer.size < BigInt(data.byteLength)) {
          buffer?.dispose();
          buffer = new VkBuffer(
            this.__device,
            this.__physicalDevice,
            data.byteLength,
            'storage',
            data,
          );
        } else {
          buffer.upload(data);
        }
        buffers.push(buffer);
      }
      if (existing.length > needed) {
        for (let i = needed; i < existing.length; i++) {
          existing[i]?.dispose();
        }
      }
      this.__storageBuffers.set(binding.name, buffers);

      const bufferInfos: Uint8Array[] = [];
      for (let i = 0; i < needed; i++) {
        const data = encodedArray[i] ?? encodedArray[0]!;
        const info = instantiate(vkDescriptorBufferInfo);
        info.buffer = BigInt(buffers[i]!.instance);
        info.offset = 0n;
        info.range = BigInt(data.byteLength);
        const raw = getInstanceBuffer(info);
        bufferInfos.push(new Uint8Array(raw));
        keepAlive.push(raw);
      }

      const bufferInfoBlock = new Uint8Array(
        sizeOf(vkDescriptorBufferInfo) * needed,
      );
      for (let i = 0; i < bufferInfos.length; i++) {
        bufferInfoBlock.set(
          bufferInfos[i]!,
          i * sizeOf(vkDescriptorBufferInfo),
        );
      }

      const write = instantiate(vkWriteDescriptorSet);
      write.dstSet = this.__getDescriptorSetHandle(binding.set);
      write.dstBinding = binding.binding;
      write.dstArrayElement = 0;
      write.descriptorCount = needed;
      write.descriptorType = binding.descriptorType;
      write.pImageInfo = 0n;
      write.pBufferInfo = BigInt(ptr(bufferInfoBlock));
      write.pTexelBufferView = 0n;

      writes.push(new Uint8Array(getInstanceBuffer(write)));
    }

    if (writes.length === 0) return;

    const writeBuffer = new Uint8Array(writeSize * writes.length);
    for (let i = 0; i < writes.length; i++) {
      writeBuffer.set(writes[i]!, i * writeSize);
    }

    VK.vkUpdateDescriptorSets(
      this.__device,
      writes.length,
      ptr(writeBuffer),
      0,
      null,
    );
  }

  private __getDescriptorSetHandle(setIndex: number): bigint {
    if (!this.__descriptorSets) {
      throw new RenderError('Descriptor sets not allocated', 'Vulkan');
    }
    const idx = this.reflection.descriptorSets.findIndex(
      (s) => s.setIndex === setIndex,
    );
    if (idx < 0 || idx >= this.__descriptorSets.length) {
      throw new RenderError(
        `Descriptor set index ${setIndex} out of range`,
        'Vulkan',
      );
    }
    return this.__descriptorSets[idx]!;
  }

  private __encodeUniformValue(
    def: { type: PropertyType },
    value: unknown,
  ): ArrayBufferView {
    switch (def.type) {
      case PropertyType.F32:
        return new Float32Array([Number(value) || 0]);
      case PropertyType.I32:
        return new Int32Array([Number(value) | 0]);
      case PropertyType.U32:
        return new Uint32Array([Number(value) >>> 0]);
      case PropertyType.Bool:
        return new Uint32Array([value === true ? 1 : 0]);
      case PropertyType.Vec2f: {
        const vec = value as Vector2 | undefined;
        const arr = vec ? vec.toArray() : [0, 0];
        return new Float32Array(arr);
      }
      case PropertyType.Vec3f: {
        const vec = value as Vector3 | undefined;
        const arr = vec ? vec.toArray() : [0, 0, 0];
        return new Float32Array([arr[0] ?? 0, arr[1] ?? 0, arr[2] ?? 0, 0]);
      }
      case PropertyType.Vec4f: {
        const vec = value as Vector4 | undefined;
        const arr = vec ? vec.toArray() : [0, 0, 0, 0];
        return new Float32Array(arr);
      }
      case PropertyType.Mat3x3f: {
        const mat = value as Matrix3 | undefined;
        const arr = mat ? mat.toArray() : new Array(9).fill(0);
        return new Float32Array([
          arr[0] ?? 0,
          arr[1] ?? 0,
          arr[2] ?? 0,
          0,
          arr[3] ?? 0,
          arr[4] ?? 0,
          arr[5] ?? 0,
          0,
          arr[6] ?? 0,
          arr[7] ?? 0,
          arr[8] ?? 0,
          0,
        ]);
      }
      case PropertyType.Mat4x4f: {
        const mat = value as Matrix4 | undefined;
        const arr = mat ? mat.toArray() : new Array(16).fill(0);
        return new Float32Array(arr);
      }
      case PropertyType.Color: {
        const color = value as Color | undefined;
        const arr = color ? color.toArray() : [0, 0, 0, 1];
        return new Float32Array(arr);
      }
      default:
        throw new RenderError(
          `Uniform type ${String(def.type)} is not supported yet`,
          'Vulkan',
        );
    }
  }

  private __encodeStorageValue(
    def: StorageDefinition,
    value: unknown,
    name: string,
  ): ArrayBufferView | ArrayBufferView[] {
    const hasValue = value !== undefined;
    if (hasValue) {
      const values = Array.isArray(value) ? value : [value];
      const views = values.map((v) => {
        if (!isStorageValue(v)) {
          throw new RenderError(
            `Invalid storage value for "${name}", expected ArrayBuffer or ArrayBufferView`,
            'Vulkan',
          );
        }
        const view =
          v instanceof ArrayBuffer ? new Uint8Array(v) : (v as ArrayBufferView);
        const minSize = def.size ?? 0;
        if (minSize > 0 && view.byteLength < minSize) {
          const padded = new Uint8Array(minSize);
          padded.set(
            new Uint8Array(
              view.buffer,
              view.byteOffset,
              Math.min(view.byteLength, minSize),
            ),
          );
          return padded;
        }
        return view;
      });
      return views.length === 1 ? views[0]! : views;
    }

    if (def.size === undefined || def.size <= 0) {
      throw new RenderError(
        `Storage "${name}" requires either a value or an explicit size`,
        'Vulkan',
      );
    }

    return new Uint8Array(def.size);
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
  const mapped = valid.map((spec) => {
    const mapping = mapOverrideType(spec.type);
    return { spec, ...mapping };
  });
  const totalSize = mapped.reduce((acc, item) => acc + item.size, 0);
  const dataBuffer = new Uint8Array(totalSize);
  const dataView = new DataView(dataBuffer.buffer);

  let currentOffset = 0;
  for (let i = 0; i < mapped.length; i++) {
    const { spec, size, writer } = mapped[i]!;
    const entry = instantiate(vkSpecializationMapEntry);
    entry.constantID = spec.id;
    entry.offset = currentOffset;
    entry.size = BigInt(size);
    entriesBuffer.set(new Uint8Array(getInstanceBuffer(entry)), i * entrySize);

    writer(dataView, currentOffset, spec.value);
    currentOffset += size;
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

function mapOverrideType(type: string | null): {
  size: number;
  writer: (view: DataView, offset: number, value: unknown) => void;
} {
  const normalized = (type ?? '').toLowerCase();
  switch (normalized) {
    case 'bool':
      return {
        size: 4,
        writer: (view, offset, value) =>
          view.setUint32(offset, value === true ? 1 : 0, true),
      };
    case 'u32':
    case 'uint':
    case 'unsigned':
      return {
        size: 4,
        writer: (view, offset, value) =>
          view.setUint32(
            offset,
            typeof value === 'number' ? value >>> 0 : 0,
            true,
          ),
      };
    case 'i32':
    case 'int':
      return {
        size: 4,
        writer: (view, offset, value) =>
          view.setInt32(
            offset,
            typeof value === 'number' ? value | 0 : 0,
            true,
          ),
      };
    case 'f32':
    case 'float':
    default:
      return {
        size: 4,
        writer: (view, offset, value) =>
          view.setFloat32(
            offset,
            typeof value === 'number' ? value : Number(value) || 0,
            true,
          ),
      };
  }
}
