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
  VkFormat,
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
  vkPipelineVertexInputStateCreateInfo,
  vkPipelineViewportStateCreateInfo,
  VkPolygonMode,
  VkPrimitiveTopology,
  VkResult,
  VkSampleCountFlagBits,
  VkShaderStageFlagBits,
  VkStencilOp,
  vkVertexInputAttributeDescription,
  vkVertexInputBindingDescription,
  VkVertexInputRate,
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
  SampleCount,
  StencilOperation,
} from '../../resources';
import { VK_DEBUG } from '../../singleton/logger';
import type { VkShaderModule } from './VkShaderModule';

export class VkGraphicsPipeline implements Disposable {
  private static __getVkTopology(primitive: MaterialPrimitive) {
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

  private static __getVkPolygonMode(fillMode: RasterizerFillMode) {
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

  private static __getVkCullMode(cull: RasterizerCullMode) {
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

  private static __getVkFrontFace(frontFace: RasterizerFrontFace) {
    switch (frontFace) {
      case 'counter-clockwise':
        return VkFrontFace.COUNTER_CLOCKWISE;
      case 'clockwise':
      default:
        return VkFrontFace.CLOCKWISE;
    }
  }

  private static __getVkCompareOp(compare: CompareFunction) {
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

  private static __getVkStencilOp(op: StencilOperation) {
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

  private static __getVkSampleCount(count: SampleCount) {
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

  private static __getVkDescriptorType(
    propertyType: PropertyType,
  ): VkDescriptorType {
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

  private static __getVkBlendFactor(factor: BlendFactor) {
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

  private static __getVkBlendOp(operation: BlendOperation) {
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

  private __device: Pointer;
  private __material: Material;

  private __stages: BigUint64Array<ArrayBuffer>;

  private __pipelineInstance: Pointer | null = null;
  private __pipelineLayout: Pointer | null = null;
  private __descriptorSetLayout: Pointer | null = null;

  private __dynamicStages: Uint32Array;
  private __dynamicInfo = instantiate(vkPipelineDynamicStateCreateInfo);
  private __viewportInfo = instantiate(vkPipelineViewportStateCreateInfo);
  private __inputAssemblyInfo = instantiate(
    vkPipelineInputAssemblyStateCreateInfo,
  );
  private __rasterizationInfo = instantiate(
    vkPipelineRasterizationStateCreateInfo,
  );
  private __multisampleInfo = instantiate(vkPipelineMultisampleStateCreateInfo);
  private __colorBlendAttachment = instantiate(
    vkPipelineColorBlendAttachmentState,
  );
  private __colorBlendInfo = instantiate(vkPipelineColorBlendStateCreateInfo);
  private __depthStencilInfo = instantiate(
    vkPipelineDepthStencilStateCreateInfo,
  );

  private __vertexInputInfo = instantiate(vkPipelineVertexInputStateCreateInfo);
  private __pipelineConfigInfo = instantiate(vkGraphicsPipelineCreateInfo);

  private __vertexBindings: InferField<
    typeof vkVertexInputBindingDescription
  >[] = [];
  private __vertexAttributes: InferField<
    typeof vkVertexInputAttributeDescription
  >[] = [];

  constructor(
    device: Pointer,
    renderPass: Pointer,
    modules: VkShaderModule[],
    material: Material,
  ) {
    this.__device = device;
    this.__stages = new BigUint64Array(modules.map((m) => BigInt(m.instance)));
    this.__material = material;

    VK_DEBUG('Creating graphics pipeline');

    this.__dynamicStages = new Uint32Array([
      VkDynamicState.VIEWPORT,
      VkDynamicState.SCISSOR,
    ]);
    this.__dynamicInfo.dynamicStateCount = this.__dynamicStages.length;
    this.__dynamicInfo.pDynamicStates = BigInt(ptr(this.__dynamicStages));

    this.__viewportInfo.viewportCount = 1;
    this.__viewportInfo.scissorCount = 1;

    // Configure vertex input based on VkGeometry standard layout
    this.__configureVertexInput();

    // Bind pointers between structs
    this.__bindPointers();

    // Create pipeline layout
    this.__createLayout();

    // Create pipeline
    this.__createPipeline(renderPass);

    VK_DEBUG('Graphics pipeline initialized');
  }

  get instance(): Pointer {
    return this.__pipelineInstance!;
  }

  /**
   * Bind pointers between Vulkan structs
   */
  private __bindPointers(): void {
    this.__colorBlendInfo.pAttachments = BigInt(
      ptr(getInstanceBuffer(this.__colorBlendAttachment)),
    );

    this.__pipelineConfigInfo.pDynamicState = BigInt(
      ptr(getInstanceBuffer(this.__dynamicInfo)),
    );
    this.__pipelineConfigInfo.pViewportState = BigInt(
      ptr(getInstanceBuffer(this.__viewportInfo)),
    );
    this.__pipelineConfigInfo.pInputAssemblyState = BigInt(
      ptr(getInstanceBuffer(this.__inputAssemblyInfo)),
    );
    this.__pipelineConfigInfo.pRasterizationState = BigInt(
      ptr(getInstanceBuffer(this.__rasterizationInfo)),
    );
    this.__pipelineConfigInfo.pMultisampleState = BigInt(
      ptr(getInstanceBuffer(this.__multisampleInfo)),
    );
    this.__pipelineConfigInfo.pColorBlendState = BigInt(
      ptr(getInstanceBuffer(this.__colorBlendInfo)),
    );
    this.__pipelineConfigInfo.pDepthStencilState = BigInt(
      ptr(getInstanceBuffer(this.__depthStencilInfo)),
    );
    this.__pipelineConfigInfo.pVertexInputState = BigInt(
      ptr(getInstanceBuffer(this.__vertexInputInfo)),
    );
    this.__pipelineConfigInfo.stageCount = 2;
    this.__pipelineConfigInfo.pStages = BigInt(ptr(this.__stages));
  }

  /**
   * Configure vertex input state based on VkGeometry standard layout
   *
   * Standard layout from VkGeometry:
   * - Binding 0: Vertex positions (vec3 - 3 floats)
   * - Binding 1: Vertex normals (vec3 - 3 floats)
   * - Binding 2+: UV coordinates (vec2 - 2 floats per layer)
   */
  private __configureVertexInput(): void {
    VK_DEBUG('Configuring vertex input state for standard geometry layout');

    let location = 0;
    let binding = 0;

    // Binding 0: Vertex positions (location 0)
    const vertexBinding = instantiate(vkVertexInputBindingDescription);
    vertexBinding.binding = binding;
    vertexBinding.stride = 3 * Float32Array.BYTES_PER_ELEMENT; // vec3
    vertexBinding.inputRate = VkVertexInputRate.VERTEX;
    this.__vertexBindings.push(vertexBinding);

    const vertexAttr = instantiate(vkVertexInputAttributeDescription);
    vertexAttr.location = location++;
    vertexAttr.binding = binding++;
    vertexAttr.format = VkFormat.R32G32B32_SFLOAT; // vec3
    vertexAttr.offset = 0;
    this.__vertexAttributes.push(vertexAttr);

    // Binding 1: Vertex normals (location 1)
    const normalBinding = instantiate(vkVertexInputBindingDescription);
    normalBinding.binding = binding;
    normalBinding.stride = 3 * Float32Array.BYTES_PER_ELEMENT; // vec3
    normalBinding.inputRate = VkVertexInputRate.VERTEX;
    this.__vertexBindings.push(normalBinding);

    const normalAttr = instantiate(vkVertexInputAttributeDescription);
    normalAttr.location = location++;
    normalAttr.binding = binding++;
    normalAttr.format = VkFormat.R32G32B32_SFLOAT; // vec3
    normalAttr.offset = 0;
    this.__vertexAttributes.push(normalAttr);

    // Binding 2+: UV coordinates (location 2+)
    // Note: VkGeometry can have multiple UV layers, but we'll configure
    // a reasonable default (1 UV layer). Add more if needed.
    const uvBinding = instantiate(vkVertexInputBindingDescription);
    uvBinding.binding = binding;
    uvBinding.stride = 2 * Float32Array.BYTES_PER_ELEMENT; // vec2
    uvBinding.inputRate = VkVertexInputRate.VERTEX;
    this.__vertexBindings.push(uvBinding);

    const uvAttr = instantiate(vkVertexInputAttributeDescription);
    uvAttr.location = location++;
    uvAttr.binding = binding++;
    uvAttr.format = VkFormat.R32G32_SFLOAT; // vec2
    uvAttr.offset = 0;
    this.__vertexAttributes.push(uvAttr);

    VK_DEBUG(
      `Vertex input configured: ${this.__vertexBindings.length} bindings, ${this.__vertexAttributes.length} attributes`,
    );

    // Set binding and attribute arrays in vertex input state
    const bindingsArray = new BigUint64Array(this.__vertexBindings.length);
    for (let i = 0; i < this.__vertexBindings.length; i++) {
      bindingsArray[i] = BigInt(
        ptr(getInstanceBuffer(this.__vertexBindings[i]!)),
      );
    }

    const attributesArray = new BigUint64Array(this.__vertexAttributes.length);
    for (let i = 0; i < this.__vertexAttributes.length; i++) {
      attributesArray[i] = BigInt(
        ptr(getInstanceBuffer(this.__vertexAttributes[i]!)),
      );
    }

    this.__vertexInputInfo.vertexBindingDescriptionCount =
      this.__vertexBindings.length;
    this.__vertexInputInfo.pVertexBindingDescriptions = BigInt(
      ptr(bindingsArray),
    );
    this.__vertexInputInfo.vertexAttributeDescriptionCount =
      this.__vertexAttributes.length;
    this.__vertexInputInfo.pVertexAttributeDescriptions = BigInt(
      ptr(attributesArray),
    );
  }

  /**
   * Create descriptor set layout and pipeline layout from material schema
   */
  private __createLayout(): void {
    VK_DEBUG('Creating pipeline layout from material schema');

    // Collect all bindings from material schema
    const bindings: InferField<typeof vkDescriptorSetLayoutBinding>[] = [];
    let bindingIndex = 0;

    // Process constants
    const constants = this.__material.schema.constants;
    if (constants) {
      for (const [key, definition] of Object.entries(constants)) {
        const binding = instantiate(vkDescriptorSetLayoutBinding);
        binding.binding = bindingIndex++;
        binding.descriptorType = VkGraphicsPipeline.__getVkDescriptorType(
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
    const mutables = this.__material.schema.mutables;
    if (mutables) {
      for (const [key, definition] of Object.entries(mutables)) {
        const binding = instantiate(vkDescriptorSetLayoutBinding);
        binding.binding = bindingIndex++;
        binding.descriptorType = VkGraphicsPipeline.__getVkDescriptorType(
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
        this.__device,
        ptr(getInstanceBuffer(emptyLayoutInfo)),
        null,
        ptr(pointerHolder),
      );

      if (result !== VkResult.SUCCESS) {
        throw new DynamicLibError(getResultMessage(result), 'Vulkan');
      }

      this.__pipelineLayout = Number(pointerHolder[0]!) as Pointer;
      this.__pipelineConfigInfo.layout = BigInt(this.__pipelineLayout);
      VK_DEBUG(
        `Empty pipeline layout created: 0x${this.__pipelineLayout.toString(16)}`,
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
      this.__device,
      ptr(getInstanceBuffer(layoutInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.__descriptorSetLayout = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(
      `Descriptor set layout created: 0x${this.__descriptorSetLayout.toString(16)}`,
    );

    // Create pipeline layout
    const setLayouts = new BigUint64Array([BigInt(this.__descriptorSetLayout)]);
    const pipelineLayoutInfo = instantiate(vkPipelineLayoutCreateInfo);
    pipelineLayoutInfo.setLayoutCount = 1;
    pipelineLayoutInfo.pSetLayouts = BigInt(ptr(setLayouts));
    pipelineLayoutInfo.pushConstantRangeCount = 0;
    pipelineLayoutInfo.pPushConstantRanges = 0n;

    pointerHolder = new BigUint64Array(1);
    result = VK.vkCreatePipelineLayout(
      this.__device,
      ptr(getInstanceBuffer(pipelineLayoutInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.__pipelineLayout = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(
      `Pipeline layout created: 0x${this.__pipelineLayout.toString(16)}`,
    );

    // Set pipeline layout in config
    this.__pipelineConfigInfo.layout = BigInt(this.__pipelineLayout);
  }

  /**
   * Create graphics pipeline with current configuration
   */
  private __createPipeline(renderPass: Pointer): void {
    VK_DEBUG(`Creating graphics pipeline`);

    // Configure topology
    this.__inputAssemblyInfo.topology = VkGraphicsPipeline.__getVkTopology(
      this.__material.primitive,
    );
    this.__inputAssemblyInfo.primitiveRestartEnable = VK_TRUE;

    // Configure rasterizer
    const rasterizer = this.__material.rasterizer;
    this.__rasterizationInfo.depthClampEnable = VK_FALSE;
    this.__rasterizationInfo.rasterizerDiscardEnable = VK_FALSE;
    this.__rasterizationInfo.polygonMode =
      VkGraphicsPipeline.__getVkPolygonMode(rasterizer.fillMode);
    this.__rasterizationInfo.cullMode = VkGraphicsPipeline.__getVkCullMode(
      rasterizer.cull,
    );
    this.__rasterizationInfo.frontFace = VkGraphicsPipeline.__getVkFrontFace(
      rasterizer.frontFace,
    );
    this.__rasterizationInfo.depthBiasEnable =
      rasterizer.depthStencil.depthBias !== 0 ? VK_TRUE : VK_FALSE;
    this.__rasterizationInfo.depthBiasConstantFactor =
      rasterizer.depthStencil.depthBias;
    this.__rasterizationInfo.depthBiasClamp =
      rasterizer.depthStencil.depthBiasClamp;
    this.__rasterizationInfo.depthBiasSlopeFactor =
      rasterizer.depthStencil.depthBiasSlopeScale;
    this.__rasterizationInfo.lineWidth = 1.0;

    // Configure multisample
    const multisample = rasterizer.multisample;
    this.__multisampleInfo.rasterizationSamples =
      VkGraphicsPipeline.__getVkSampleCount(multisample.count);
    this.__multisampleInfo.sampleShadingEnable = VK_FALSE;
    this.__multisampleInfo.minSampleShading = 1.0;
    this.__multisampleInfo.pSampleMask = 0n;
    this.__multisampleInfo.alphaToCoverageEnable =
      multisample.alphaToCoverageEnabled ? VK_TRUE : VK_FALSE;
    this.__multisampleInfo.alphaToOneEnable = VK_FALSE;

    // Configure blend
    const blend = rasterizer.blend;
    this.__colorBlendAttachment.blendEnable = blend.enabled
      ? VK_TRUE
      : VK_FALSE;
    this.__colorBlendAttachment.srcColorBlendFactor =
      VkGraphicsPipeline.__getVkBlendFactor(blend.color.srcFactor);
    this.__colorBlendAttachment.dstColorBlendFactor =
      VkGraphicsPipeline.__getVkBlendFactor(blend.color.dstFactor);
    this.__colorBlendAttachment.colorBlendOp =
      VkGraphicsPipeline.__getVkBlendOp(blend.color.operation);
    this.__colorBlendAttachment.srcAlphaBlendFactor =
      VkGraphicsPipeline.__getVkBlendFactor(blend.alpha.srcFactor);
    this.__colorBlendAttachment.dstAlphaBlendFactor =
      VkGraphicsPipeline.__getVkBlendFactor(blend.alpha.dstFactor);
    this.__colorBlendAttachment.alphaBlendOp =
      VkGraphicsPipeline.__getVkBlendOp(blend.alpha.operation);
    this.__colorBlendAttachment.colorWriteMask =
      (blend.writeMask.has(0) ? VkColorComponentFlagBits.R_BIT : 0) |
      (blend.writeMask.has(1) ? VkColorComponentFlagBits.G_BIT : 0) |
      (blend.writeMask.has(2) ? VkColorComponentFlagBits.B_BIT : 0) |
      (blend.writeMask.has(3) ? VkColorComponentFlagBits.A_BIT : 0);

    this.__colorBlendInfo.logicOpEnable = VK_FALSE;
    this.__colorBlendInfo.logicOp = VkLogicOp.CLEAR;
    this.__colorBlendInfo.attachmentCount = 1;
    this.__colorBlendInfo.blendConstants = [0.0, 0.0, 0.0, 0.0];

    // Configure depth/stencil
    const depthStencil = rasterizer.depthStencil;
    this.__depthStencilInfo.depthTestEnable =
      depthStencil.depthCompare !== 'always' ? VK_TRUE : VK_FALSE;
    this.__depthStencilInfo.depthWriteEnable = depthStencil.depthWriteEnabled
      ? VK_TRUE
      : VK_FALSE;
    this.__depthStencilInfo.depthCompareOp =
      VkGraphicsPipeline.__getVkCompareOp(depthStencil.depthCompare);
    this.__depthStencilInfo.depthBoundsTestEnable = VK_FALSE;
    this.__depthStencilInfo.minDepthBounds = 0.0;
    this.__depthStencilInfo.maxDepthBounds = 1.0;
    this.__depthStencilInfo.stencilTestEnable =
      depthStencil.stencilFront.compare !== 'always' ||
      depthStencil.stencilBack.compare !== 'always'
        ? VK_TRUE
        : VK_FALSE;
    this.__depthStencilInfo.front.failOp = VkGraphicsPipeline.__getVkStencilOp(
      depthStencil.stencilFront.failOp,
    );
    this.__depthStencilInfo.front.passOp = VkGraphicsPipeline.__getVkStencilOp(
      depthStencil.stencilFront.passOp,
    );
    this.__depthStencilInfo.front.depthFailOp =
      VkGraphicsPipeline.__getVkStencilOp(
        depthStencil.stencilFront.depthFailOp,
      );
    this.__depthStencilInfo.front.compareOp =
      VkGraphicsPipeline.__getVkCompareOp(depthStencil.stencilFront.compare);
    this.__depthStencilInfo.front.compareMask =
      depthStencil.stencilReadMask.get();
    this.__depthStencilInfo.front.writeMask =
      depthStencil.stencilWriteMask.get();
    this.__depthStencilInfo.front.reference = 0;
    this.__depthStencilInfo.back.failOp = VkGraphicsPipeline.__getVkStencilOp(
      depthStencil.stencilBack.failOp,
    );
    this.__depthStencilInfo.back.passOp = VkGraphicsPipeline.__getVkStencilOp(
      depthStencil.stencilBack.passOp,
    );
    this.__depthStencilInfo.back.depthFailOp =
      VkGraphicsPipeline.__getVkStencilOp(depthStencil.stencilBack.depthFailOp);
    this.__depthStencilInfo.back.compareOp =
      VkGraphicsPipeline.__getVkCompareOp(depthStencil.stencilBack.compare);
    this.__depthStencilInfo.back.compareMask =
      depthStencil.stencilReadMask.get();
    this.__depthStencilInfo.back.writeMask =
      depthStencil.stencilWriteMask.get();
    this.__depthStencilInfo.back.reference = 0;

    // Set render pass
    this.__pipelineConfigInfo.renderPass = BigInt(renderPass);
    this.__pipelineConfigInfo.subpass = 0;

    // Create pipeline
    VK_DEBUG('Creating Vulkan graphics pipeline');
    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateGraphicsPipelines(
      this.__device,
      0n,
      1,
      ptr(getInstanceBuffer(this.__pipelineConfigInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    this.__pipelineInstance = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(
      `Graphics pipeline created: 0x${this.__pipelineInstance.toString(16)}`,
    );
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing graphics pipeline');

    if (this.__pipelineInstance) {
      VK.vkDestroyPipeline(this.__device, this.__pipelineInstance, null);
      this.__pipelineInstance = null;
      VK_DEBUG('Pipeline destroyed');
    }

    if (this.__pipelineLayout) {
      VK.vkDestroyPipelineLayout(this.__device, this.__pipelineLayout, null);
      this.__pipelineLayout = null;
      VK_DEBUG('Pipeline layout destroyed');
    }

    if (this.__descriptorSetLayout) {
      VK.vkDestroyDescriptorSetLayout(
        this.__device,
        this.__descriptorSetLayout,
        null,
      );
      this.__descriptorSetLayout = null;
      VK_DEBUG('Descriptor set layout destroyed');
    }

    VK_DEBUG('Graphics pipeline disposed');
  }
}
