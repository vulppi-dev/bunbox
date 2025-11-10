import { isWgslValid, wgslToSpirvBin } from '@bunbox/naga';
import {
  getInstanceBuffer,
  instantiate,
  type InferField,
} from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VK_FALSE,
  VK_TRUE,
  VkBlendFactor,
  VkBlendOp,
  VkColorComponentFlagBits,
  VkCompareOp,
  VkCullModeFlagBits,
  vkDescriptorSetLayoutBinding,
  vkDescriptorSetLayoutCreateInfo,
  VkDescriptorType,
  VkDynamicState,
  VkFrontFace,
  vkGraphicsPipelineCreateInfo,
  VkLogicOp,
  vkPipelineColorBlendAttachmentState,
  vkPipelineColorBlendStateCreateInfo,
  vkPipelineDepthStencilStateCreateInfo,
  vkPipelineDynamicStateCreateInfo,
  vkPipelineInputAssemblyStateCreateInfo,
  vkPipelineLayoutCreateInfo,
  vkPipelineMultisampleStateCreateInfo,
  vkPipelineRasterizationStateCreateInfo,
  vkPipelineShaderStageCreateInfo,
  vkPipelineVertexInputStateCreateInfo,
  vkPipelineViewportStateCreateInfo,
  VkPolygonMode,
  VkPrimitiveTopology,
  vkRect2D,
  VkResult,
  VkSampleCountFlagBits,
  vkShaderModuleCreateInfo,
  VkShaderStageFlagBits,
  VkStencilOp,
  vkViewport,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import type { Material, MaterialPrimitive } from '../../builders';
import { PropertyType } from '../../builders/MaterialPropertyTypes';
import { DynamicLibError } from '../../errors';
import type {
  BlendFactor,
  BlendOperation,
  CompareFunction,
  RasterizerCullMode,
  RasterizerFillMode,
  RasterizerFrontFace,
  StencilOperation,
} from '../../resources';
import { VK_DEBUG } from '../../singleton/logger';

export class VkGraphicsPipeline implements Disposable {
  static #normalizeShaderSource(shaderData: Uint8Array) {
    const padding = shaderData.byteLength % Uint32Array.BYTES_PER_ELEMENT;
    if (padding === 0) {
      return shaderData;
    }

    const paddedLength =
      shaderData.byteLength + (Uint32Array.BYTES_PER_ELEMENT - padding);
    const paddedShaderData = new Uint8Array(paddedLength);
    paddedShaderData.set(shaderData);
    return paddedShaderData;
  }

  static #createShaderModule(device: Pointer, shaderData: Uint8Array) {
    const createInfo = instantiate(vkShaderModuleCreateInfo);
    createInfo.codeSize = BigInt(shaderData.byteLength);
    createInfo.pCode = BigInt(ptr(shaderData));

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateShaderModule(
      device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    const shaderModule = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(`Shader module created: 0x${shaderModule.toString(16)}`);
    return shaderModule;
  }

  static #getVkTopology(primitive: MaterialPrimitive) {
    switch (primitive) {
      case 'points':
        return VkPrimitiveTopology.POINT_LIST;
      case 'lines':
        return VkPrimitiveTopology.LINE_LIST;
      case 'triangles':
      default:
        return VkPrimitiveTopology.TRIANGLE_LIST;
    }
  }

  static #getVkPolygonMode(fillMode: RasterizerFillMode) {
    switch (fillMode) {
      case 'point':
        return VkPolygonMode.POINT;
      case 'line':
        return VkPolygonMode.LINE;
      case 'fill':
      default:
        return VkPolygonMode.FILL;
    }
  }

  static #getVkCullMode(cull: RasterizerCullMode) {
    switch (cull) {
      case 'front':
        return VkCullModeFlagBits.FRONT_BIT;
      case 'back':
        return VkCullModeFlagBits.BACK_BIT;
      case 'all':
        return VkCullModeFlagBits.FRONT_AND_BACK;
      case 'none':
      default:
        return VkCullModeFlagBits.NONE;
    }
  }

  static #getVkFrontFace(frontFace: RasterizerFrontFace) {
    switch (frontFace) {
      case 'ccw':
        return VkFrontFace.COUNTER_CLOCKWISE;
      case 'cw':
      default:
        return VkFrontFace.CLOCKWISE;
    }
  }

  static #getVkCompareOp(compare: CompareFunction) {
    switch (compare) {
      case 'never':
        return VkCompareOp.NEVER;
      case 'less':
        return VkCompareOp.LESS;
      case 'equal':
        return VkCompareOp.EQUAL;
      case 'less-equal':
        return VkCompareOp.LESS_OR_EQUAL;
      case 'greater':
        return VkCompareOp.GREATER;
      case 'not-equal':
        return VkCompareOp.NOT_EQUAL;
      case 'greater-equal':
        return VkCompareOp.GREATER_OR_EQUAL;
      case 'always':
      default:
        return VkCompareOp.ALWAYS;
    }
  }

  static #getVkStencilOp(op: StencilOperation) {
    switch (op) {
      case 'keep':
        return VkStencilOp.KEEP;
      case 'zero':
        return VkStencilOp.ZERO;
      case 'replace':
        return VkStencilOp.REPLACE;
      case 'invert':
        return VkStencilOp.INVERT;
      case 'increment-clamp':
        return VkStencilOp.INCREMENT_AND_CLAMP;
      case 'decrement-clamp':
        return VkStencilOp.DECREMENT_AND_CLAMP;
      case 'increment-wrap':
        return VkStencilOp.INCREMENT_AND_WRAP;
      case 'decrement-wrap':
      default:
        return VkStencilOp.DECREMENT_AND_WRAP;
    }
  }

  static #getVkSampleCount(count: 1 | 2 | 4 | 8 | 16) {
    switch (count) {
      case 1:
        return VkSampleCountFlagBits.COUNT_1_BIT;
      case 2:
        return VkSampleCountFlagBits.COUNT_2_BIT;
      case 4:
        return VkSampleCountFlagBits.COUNT_4_BIT;
      case 8:
        return VkSampleCountFlagBits.COUNT_8_BIT;
      case 16:
      default:
        return VkSampleCountFlagBits.COUNT_16_BIT;
    }
  }

  static #getVkDescriptorType(propertyType: PropertyType): VkDescriptorType {
    switch (propertyType) {
      case PropertyType.Texture:
        return VkDescriptorType.SAMPLED_IMAGE;
      case PropertyType.Sampler:
        return VkDescriptorType.SAMPLER;
      case PropertyType.TextureSampler:
        return VkDescriptorType.COMBINED_IMAGE_SAMPLER;
      case PropertyType.Scalar:
      case PropertyType.Vec2:
      case PropertyType.Vec3:
      case PropertyType.Vec4:
      case PropertyType.Mat2:
      case PropertyType.Mat3:
      case PropertyType.Mat4:
      case PropertyType.Color3:
      case PropertyType.Color4:
      default:
        return VkDescriptorType.UNIFORM_BUFFER;
    }
  }

  static #getVkBlendFactor(factor: BlendFactor) {
    switch (factor) {
      case 'zero':
        return VkBlendFactor.ZERO;
      case 'one':
        return VkBlendFactor.ONE;
      case 'src':
        return VkBlendFactor.SRC_COLOR;
      case 'one-minus-src':
        return VkBlendFactor.ONE_MINUS_SRC_COLOR;
      case 'src-alpha':
        return VkBlendFactor.SRC_ALPHA;
      case 'one-minus-src-alpha':
        return VkBlendFactor.ONE_MINUS_SRC_ALPHA;
      case 'dst':
        return VkBlendFactor.DST_COLOR;
      case 'one-minus-dst':
        return VkBlendFactor.ONE_MINUS_DST_COLOR;
      case 'dst-alpha':
        return VkBlendFactor.DST_ALPHA;
      case 'one-minus-dst-alpha':
        return VkBlendFactor.ONE_MINUS_DST_ALPHA;
      case 'src-alpha-saturated':
        return VkBlendFactor.SRC_ALPHA_SATURATE;
      case 'constant':
        return VkBlendFactor.CONSTANT_COLOR;
      case 'one-minus-constant':
      default:
        return VkBlendFactor.ONE_MINUS_CONSTANT_COLOR;
    }
  }

  static #getVkBlendOp(operation: BlendOperation) {
    switch (operation) {
      case 'add':
        return VkBlendOp.ADD;
      case 'subtract':
        return VkBlendOp.SUBTRACT;
      case 'reverse-subtract':
        return VkBlendOp.REVERSE_SUBTRACT;
      case 'min':
        return VkBlendOp.MIN;
      case 'max':
      default:
        return VkBlendOp.MAX;
    }
  }

  #device: Pointer;
  #material: Material;

  #pipelineInstance: Pointer | null = null;
  #pipelineLayout: Pointer | null = null;
  #descriptorSetLayout: Pointer | null = null;

  #vertexModule: Pointer | null = null;
  #fragmentModule: Pointer | null = null;

  // Shader stage structs
  #vertexStageInfo = instantiate(vkPipelineShaderStageCreateInfo);
  #fragmentStageInfo = instantiate(vkPipelineShaderStageCreateInfo);
  #shaderStages: BigUint64Array;

  #dynamicStages: Uint32Array;

  // Config structs
  #dynamicInfo = instantiate(vkPipelineDynamicStateCreateInfo);
  #viewportInfo = instantiate(vkPipelineViewportStateCreateInfo);
  #inputAssemblyInfo = instantiate(vkPipelineInputAssemblyStateCreateInfo);
  #rasterizationInfo = instantiate(vkPipelineRasterizationStateCreateInfo);
  #multisampleInfo = instantiate(vkPipelineMultisampleStateCreateInfo);
  #colorBlendAttachment = instantiate(vkPipelineColorBlendAttachmentState);
  #colorBlendInfo = instantiate(vkPipelineColorBlendStateCreateInfo);
  #depthStencilInfo = instantiate(vkPipelineDepthStencilStateCreateInfo);

  #vertexInputInfo = instantiate(vkPipelineVertexInputStateCreateInfo);
  #pipelineConfigInfo = instantiate(vkGraphicsPipelineCreateInfo);

  constructor(device: Pointer, renderPass: Pointer, material: Material) {
    this.#device = device;
    this.#material = material;

    VK_DEBUG('Creating graphics pipeline');

    if (Object.keys(material.entries).length !== 2) {
      throw new DynamicLibError(
        'The material must specify both vertex and fragment entry points',
        'Vulkan',
      );
    }

    // Validate and compile vertex shader
    const vertexShader =
      typeof material.shader === 'string'
        ? material.shader
        : material.shader.vertex || '';
    if (
      !vertexShader.includes('@vertex') ||
      !vertexShader.includes(material.entries.vertex!)
    ) {
      throw new DynamicLibError(
        'Vertex shader or entry point not found',
        'Vulkan',
      );
    }
    if (!isWgslValid(vertexShader)) {
      throw new DynamicLibError('Invalid vertex WGSL shader', 'Vulkan');
    }
    const vertexData = VkGraphicsPipeline.#normalizeShaderSource(
      wgslToSpirvBin(vertexShader, 'vertex', material.entries.vertex!),
    );

    // Validate and compile fragment shader
    const fragmentShader =
      typeof material.shader === 'string'
        ? material.shader
        : material.shader.fragment || '';
    if (
      !fragmentShader.includes('@fragment') ||
      !fragmentShader.includes(material.entries.fragment!)
    ) {
      throw new DynamicLibError(
        'Fragment shader or entry point not found',
        'Vulkan',
      );
    }
    if (!isWgslValid(fragmentShader)) {
      throw new DynamicLibError('Invalid fragment WGSL shader', 'Vulkan');
    }
    const fragmentData = VkGraphicsPipeline.#normalizeShaderSource(
      wgslToSpirvBin(fragmentShader, 'fragment', material.entries.fragment!),
    );

    // Create shader modules
    this.#vertexModule = VkGraphicsPipeline.#createShaderModule(
      this.#device,
      vertexData,
    );
    this.#fragmentModule = VkGraphicsPipeline.#createShaderModule(
      this.#device,
      fragmentData,
    );

    // Configure shader stages
    this.#vertexStageInfo.stage = VkShaderStageFlagBits.VERTEX_BIT;
    this.#vertexStageInfo.module = BigInt(this.#vertexModule);
    this.#vertexStageInfo.pName = material.entries.vertex!;

    this.#fragmentStageInfo.stage = VkShaderStageFlagBits.FRAGMENT_BIT;
    this.#fragmentStageInfo.module = BigInt(this.#fragmentModule);
    this.#fragmentStageInfo.pName = material.entries.fragment!;

    this.#shaderStages = new BigUint64Array([
      BigInt(ptr(getInstanceBuffer(this.#vertexStageInfo))),
      BigInt(ptr(getInstanceBuffer(this.#fragmentStageInfo))),
    ]);

    this.#dynamicStages = new Uint32Array([
      VkDynamicState.VIEWPORT,
      VkDynamicState.SCISSOR,
    ]);
    this.#dynamicInfo.dynamicStateCount = this.#dynamicStages.length;
    this.#dynamicInfo.pDynamicStates = BigInt(ptr(this.#dynamicStages));

    this.#viewportInfo.viewportCount = 1;
    this.#viewportInfo.scissorCount = 1;

    // Bind pointers between structs
    this.#bindPointers();

    // Create pipeline layout
    this.#createLayout();

    // Create pipeline
    this.#createPipeline(renderPass);

    VK_DEBUG('Graphics pipeline initialized');
  }

  get instance(): Pointer {
    return this.#pipelineInstance!;
  }

  get material(): Material {
    return this.#material;
  }

  /**
   * Bind pointers between Vulkan structs
   */
  #bindPointers(): void {
    this.#colorBlendInfo.pAttachments = BigInt(
      ptr(getInstanceBuffer(this.#colorBlendAttachment)),
    );

    this.#pipelineConfigInfo.pDynamicState = BigInt(
      ptr(getInstanceBuffer(this.#dynamicInfo)),
    );
    this.#pipelineConfigInfo.pViewportState = BigInt(
      ptr(getInstanceBuffer(this.#viewportInfo)),
    );
    this.#pipelineConfigInfo.pInputAssemblyState = BigInt(
      ptr(getInstanceBuffer(this.#inputAssemblyInfo)),
    );
    this.#pipelineConfigInfo.pRasterizationState = BigInt(
      ptr(getInstanceBuffer(this.#rasterizationInfo)),
    );
    this.#pipelineConfigInfo.pMultisampleState = BigInt(
      ptr(getInstanceBuffer(this.#multisampleInfo)),
    );
    this.#pipelineConfigInfo.pColorBlendState = BigInt(
      ptr(getInstanceBuffer(this.#colorBlendInfo)),
    );
    this.#pipelineConfigInfo.pDepthStencilState = BigInt(
      ptr(getInstanceBuffer(this.#depthStencilInfo)),
    );
    this.#pipelineConfigInfo.pVertexInputState = BigInt(
      ptr(getInstanceBuffer(this.#vertexInputInfo)),
    );
    this.#pipelineConfigInfo.stageCount = this.#shaderStages.length;
    this.#pipelineConfigInfo.pStages = BigInt(ptr(this.#shaderStages));
  }

  /**
   * Create descriptor set layout and pipeline layout from material schema
   */
  #createLayout(): void {
    VK_DEBUG('Creating pipeline layout from material schema');

    // Collect all bindings from material schema
    const bindings: InferField<typeof vkDescriptorSetLayoutBinding>[] = [];
    let bindingIndex = 0;

    // Process constants
    const constants = this.#material.schema.constants;
    if (constants) {
      for (const [key, definition] of Object.entries(constants)) {
        const binding = instantiate(vkDescriptorSetLayoutBinding);
        binding.binding = bindingIndex++;
        binding.descriptorType = VkGraphicsPipeline.#getVkDescriptorType(
          definition.type,
        );
        binding.descriptorCount = 1;
        binding.stageFlags =
          VkShaderStageFlagBits.VERTEX_BIT | VkShaderStageFlagBits.FRAGMENT_BIT;
        binding.pImmutableSamplers = 0n;
        bindings.push(binding);
        VK_DEBUG(`  Constant binding ${bindingIndex - 1}: ${key}`);
      }
    }

    // Process mutables
    const mutables = this.#material.schema.mutables;
    if (mutables) {
      for (const [key, definition] of Object.entries(mutables)) {
        const binding = instantiate(vkDescriptorSetLayoutBinding);
        binding.binding = bindingIndex++;
        binding.descriptorType = VkGraphicsPipeline.#getVkDescriptorType(
          definition.type,
        );
        binding.descriptorCount = 1;
        binding.stageFlags =
          VkShaderStageFlagBits.VERTEX_BIT | VkShaderStageFlagBits.FRAGMENT_BIT;
        binding.pImmutableSamplers = 0n;
        bindings.push(binding);
        VK_DEBUG(`  Mutable binding ${bindingIndex - 1}: ${key}`);
      }
    }

    if (bindings.length === 0) {
      VK_DEBUG('No bindings - creating empty pipeline layout');
      const emptyLayoutInfo = instantiate(vkPipelineLayoutCreateInfo);
      emptyLayoutInfo.setLayoutCount = 0;
      emptyLayoutInfo.pSetLayouts = 0n;
      emptyLayoutInfo.pushConstantRangeCount = 0;
      emptyLayoutInfo.pPushConstantRanges = 0n;

      const pointerHolder = new BigUint64Array(1);
      const result = VK.vkCreatePipelineLayout(
        this.#device,
        ptr(getInstanceBuffer(emptyLayoutInfo)),
        null,
        ptr(pointerHolder),
      );

      if (result !== VkResult.SUCCESS) {
        throw new DynamicLibError(getResultMessage(result), 'Vulkan');
      }

      this.#pipelineLayout = Number(pointerHolder[0]!) as Pointer;
      this.#pipelineConfigInfo.layout = BigInt(this.#pipelineLayout);
      VK_DEBUG(
        `Empty pipeline layout created: 0x${this.#pipelineLayout.toString(16)}`,
      );
      return;
    }

    VK_DEBUG(`Total bindings: ${bindings.length}`);

    // Create bindings array
    const bindingsArray = new BigUint64Array(bindings.length);
    for (let i = 0; i < bindings.length; i++) {
      bindingsArray[i] = BigInt(ptr(getInstanceBuffer(bindings[i]!)));
    }

    // Create descriptor set layout
    const layoutInfo = instantiate(vkDescriptorSetLayoutCreateInfo);
    layoutInfo.bindingCount = bindings.length;
    layoutInfo.pBindings = BigInt(ptr(bindingsArray));

    let pointerHolder = new BigUint64Array(1);
    let result = VK.vkCreateDescriptorSetLayout(
      this.#device,
      ptr(getInstanceBuffer(layoutInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.#descriptorSetLayout = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(
      `Descriptor set layout created: 0x${this.#descriptorSetLayout.toString(16)}`,
    );

    // Create pipeline layout
    const setLayouts = new BigUint64Array([BigInt(this.#descriptorSetLayout)]);
    const pipelineLayoutInfo = instantiate(vkPipelineLayoutCreateInfo);
    pipelineLayoutInfo.setLayoutCount = 1;
    pipelineLayoutInfo.pSetLayouts = BigInt(ptr(setLayouts));
    pipelineLayoutInfo.pushConstantRangeCount = 0;
    pipelineLayoutInfo.pPushConstantRanges = 0n;

    pointerHolder = new BigUint64Array(1);
    result = VK.vkCreatePipelineLayout(
      this.#device,
      ptr(getInstanceBuffer(pipelineLayoutInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.#pipelineLayout = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(`Pipeline layout created: 0x${this.#pipelineLayout.toString(16)}`);

    // Set pipeline layout in config
    this.#pipelineConfigInfo.layout = BigInt(this.#pipelineLayout);
  }

  /**
   * Create graphics pipeline with current configuration
   */
  #createPipeline(renderPass: Pointer): void {
    VK_DEBUG(`Creating graphics pipeline`);

    // Configure topology
    this.#inputAssemblyInfo.topology = VkGraphicsPipeline.#getVkTopology(
      this.#material.primitive,
    );
    this.#inputAssemblyInfo.primitiveRestartEnable = VK_TRUE;

    // Configure rasterizer
    const rasterizer = this.#material.rasterizer;
    this.#rasterizationInfo.depthClampEnable = VK_FALSE;
    this.#rasterizationInfo.rasterizerDiscardEnable = VK_FALSE;
    this.#rasterizationInfo.polygonMode = VkGraphicsPipeline.#getVkPolygonMode(
      rasterizer.fillMode,
    );
    this.#rasterizationInfo.cullMode = VkGraphicsPipeline.#getVkCullMode(
      rasterizer.cull,
    );
    this.#rasterizationInfo.frontFace = VkGraphicsPipeline.#getVkFrontFace(
      rasterizer.frontFace,
    );
    this.#rasterizationInfo.depthBiasEnable =
      rasterizer.depthStencil.depthBias !== 0 ? VK_TRUE : VK_FALSE;
    this.#rasterizationInfo.depthBiasConstantFactor =
      rasterizer.depthStencil.depthBias;
    this.#rasterizationInfo.depthBiasClamp =
      rasterizer.depthStencil.depthBiasClamp;
    this.#rasterizationInfo.depthBiasSlopeFactor =
      rasterizer.depthStencil.depthBiasSlopeScale;
    this.#rasterizationInfo.lineWidth = 1.0;

    // Configure multisample
    const multisample = rasterizer.multisample;
    this.#multisampleInfo.rasterizationSamples =
      VkGraphicsPipeline.#getVkSampleCount(multisample.count);
    this.#multisampleInfo.sampleShadingEnable = VK_FALSE;
    this.#multisampleInfo.minSampleShading = 1.0;
    this.#multisampleInfo.pSampleMask = 0n;
    this.#multisampleInfo.alphaToCoverageEnable =
      multisample.alphaToCoverageEnabled ? VK_TRUE : VK_FALSE;
    this.#multisampleInfo.alphaToOneEnable = VK_FALSE;

    // Configure blend
    const blend = rasterizer.blend;
    this.#colorBlendAttachment.blendEnable = blend.enabled ? VK_TRUE : VK_FALSE;
    this.#colorBlendAttachment.srcColorBlendFactor =
      VkGraphicsPipeline.#getVkBlendFactor(blend.color.srcFactor);
    this.#colorBlendAttachment.dstColorBlendFactor =
      VkGraphicsPipeline.#getVkBlendFactor(blend.color.dstFactor);
    this.#colorBlendAttachment.colorBlendOp = VkGraphicsPipeline.#getVkBlendOp(
      blend.color.operation,
    );
    this.#colorBlendAttachment.srcAlphaBlendFactor =
      VkGraphicsPipeline.#getVkBlendFactor(blend.alpha.srcFactor);
    this.#colorBlendAttachment.dstAlphaBlendFactor =
      VkGraphicsPipeline.#getVkBlendFactor(blend.alpha.dstFactor);
    this.#colorBlendAttachment.alphaBlendOp = VkGraphicsPipeline.#getVkBlendOp(
      blend.alpha.operation,
    );
    this.#colorBlendAttachment.colorWriteMask =
      (blend.writeMask.has(0) ? VkColorComponentFlagBits.R_BIT : 0) |
      (blend.writeMask.has(1) ? VkColorComponentFlagBits.G_BIT : 0) |
      (blend.writeMask.has(2) ? VkColorComponentFlagBits.B_BIT : 0) |
      (blend.writeMask.has(3) ? VkColorComponentFlagBits.A_BIT : 0);

    this.#colorBlendInfo.logicOpEnable = VK_FALSE;
    this.#colorBlendInfo.logicOp = VkLogicOp.CLEAR;
    this.#colorBlendInfo.attachmentCount = 1;
    this.#colorBlendInfo.blendConstants = [0.0, 0.0, 0.0, 0.0];

    // Configure depth/stencil
    const depthStencil = rasterizer.depthStencil;
    this.#depthStencilInfo.depthTestEnable =
      depthStencil.depthCompare !== 'always' ? VK_TRUE : VK_FALSE;
    this.#depthStencilInfo.depthWriteEnable = depthStencil.depthWriteEnabled
      ? VK_TRUE
      : VK_FALSE;
    this.#depthStencilInfo.depthCompareOp = VkGraphicsPipeline.#getVkCompareOp(
      depthStencil.depthCompare,
    );
    this.#depthStencilInfo.depthBoundsTestEnable = VK_FALSE;
    this.#depthStencilInfo.minDepthBounds = 0.0;
    this.#depthStencilInfo.maxDepthBounds = 1.0;
    this.#depthStencilInfo.stencilTestEnable =
      depthStencil.stencilFront.compare !== 'always' ||
      depthStencil.stencilBack.compare !== 'always'
        ? VK_TRUE
        : VK_FALSE;
    this.#depthStencilInfo.front.failOp = VkGraphicsPipeline.#getVkStencilOp(
      depthStencil.stencilFront.failOp,
    );
    this.#depthStencilInfo.front.passOp = VkGraphicsPipeline.#getVkStencilOp(
      depthStencil.stencilFront.passOp,
    );
    this.#depthStencilInfo.front.depthFailOp =
      VkGraphicsPipeline.#getVkStencilOp(depthStencil.stencilFront.depthFailOp);
    this.#depthStencilInfo.front.compareOp = VkGraphicsPipeline.#getVkCompareOp(
      depthStencil.stencilFront.compare,
    );
    this.#depthStencilInfo.front.compareMask =
      depthStencil.stencilReadMask.get();
    this.#depthStencilInfo.front.writeMask =
      depthStencil.stencilWriteMask.get();
    this.#depthStencilInfo.front.reference = 0;
    this.#depthStencilInfo.back.failOp = VkGraphicsPipeline.#getVkStencilOp(
      depthStencil.stencilBack.failOp,
    );
    this.#depthStencilInfo.back.passOp = VkGraphicsPipeline.#getVkStencilOp(
      depthStencil.stencilBack.passOp,
    );
    this.#depthStencilInfo.back.depthFailOp =
      VkGraphicsPipeline.#getVkStencilOp(depthStencil.stencilBack.depthFailOp);
    this.#depthStencilInfo.back.compareOp = VkGraphicsPipeline.#getVkCompareOp(
      depthStencil.stencilBack.compare,
    );
    this.#depthStencilInfo.back.compareMask =
      depthStencil.stencilReadMask.get();
    this.#depthStencilInfo.back.writeMask = depthStencil.stencilWriteMask.get();
    this.#depthStencilInfo.back.reference = 0;

    // Set render pass
    this.#pipelineConfigInfo.renderPass = BigInt(renderPass);
    this.#pipelineConfigInfo.subpass = 0;

    // Create pipeline
    VK_DEBUG('Creating Vulkan graphics pipeline');
    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateGraphicsPipelines(
      this.#device,
      null,
      1,
      ptr(getInstanceBuffer(this.#pipelineConfigInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    this.#pipelineInstance = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(
      `Graphics pipeline created: 0x${this.#pipelineInstance.toString(16)}`,
    );
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing graphics pipeline');

    if (this.#pipelineInstance) {
      VK.vkDestroyPipeline(this.#device, this.#pipelineInstance, null);
      this.#pipelineInstance = null;
      VK_DEBUG('Pipeline destroyed');
    }

    if (this.#pipelineLayout) {
      VK.vkDestroyPipelineLayout(this.#device, this.#pipelineLayout, null);
      this.#pipelineLayout = null;
      VK_DEBUG('Pipeline layout destroyed');
    }

    if (this.#descriptorSetLayout) {
      VK.vkDestroyDescriptorSetLayout(
        this.#device,
        this.#descriptorSetLayout,
        null,
      );
      this.#descriptorSetLayout = null;
      VK_DEBUG('Descriptor set layout destroyed');
    }

    if (this.#vertexModule) {
      VK.vkDestroyShaderModule(this.#device, this.#vertexModule, null);
      this.#vertexModule = null;
      VK_DEBUG('Vertex shader module destroyed');
    }

    if (this.#fragmentModule) {
      VK.vkDestroyShaderModule(this.#device, this.#fragmentModule, null);
      this.#fragmentModule = null;
      VK_DEBUG('Fragment shader module destroyed');
    }

    VK_DEBUG('Graphics pipeline disposed');
  }
}
