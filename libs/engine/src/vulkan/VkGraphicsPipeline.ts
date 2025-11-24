import { getInstanceBuffer, instantiate, sizeOf } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  VK,
  vkDescriptorSetLayoutBinding,
  vkDescriptorSetLayoutCreateInfo,
  VkDescriptorType,
  vkPipelineColorBlendAttachmentState,
  vkPipelineColorBlendStateCreateInfo,
  vkPipelineLayoutCreateInfo,
  vkPipelineDepthStencilStateCreateInfo,
  vkPipelineMultisampleStateCreateInfo,
  vkPipelineRasterizationStateCreateInfo,
  vkPipelineShaderStageCreateInfo,
  vkPipelineVertexInputStateCreateInfo,
  vkPipelineViewportStateCreateInfo,
  vkRect2D,
  vkVertexInputAttributeDescription,
  vkVertexInputBindingDescription,
  vkPipelineInputAssemblyStateCreateInfo,
  vkPipelineDynamicStateCreateInfo,
  vkGraphicsPipelineCreateInfo,
  vkViewport,
  VkResult,
  VkBlendOp,
  VkBlendFactor,
  VkColorComponentFlagBits,
  VkCompareOp,
  VkCullModeFlagBits,
  VkFrontFace,
  VkLogicOp,
  VkPolygonMode,
  VkShaderStageFlagBits,
  VkVertexInputRate,
  VkPrimitiveTopology,
  VkDynamicState,
  VkSampleCountFlagBits,
  VkStencilOp,
  VkFormat,
  getResultMessage,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import type { Material } from '../material/MaterialBuilder';
import type { ShaderHolder } from '../core';
import type { ShaderStorage } from '../core/ShaderStorage';
import type {
  Geometry,
  GeometryCustomAttribute,
  VertexAttributeType,
} from '../resources/Geometry';
import { EngineError } from '../errors';
import { WgslReflect, type VariableInfo, ResourceType } from 'wgsl_reflect';
import { VkShaderModule } from './VkShaderModule';
import type { Rasterizer } from '../resources/Rasterizer';
import type { PrimitiveTopology } from '../material/MaterialSchema';
import type {
  DepthStencilState,
  MultisampleState,
  BlendState,
} from '../resources/Rasterizer';
import { mapSampleCountToVk } from './remap';

type ReflectedBindingResource =
  | 'uniform'
  | 'storage'
  | 'texture'
  | 'sampler'
  | 'storage-texture';

export type ReflectedBinding = {
  name: string;
  group: number;
  binding: number;
  resource: ReflectedBindingResource;
  size: number;
  align: number;
  arrayLength?: number | null;
};

export type ReflectedAttribute = {
  name: string;
  location: number | null;
  type: string;
};

type AttributeScalar = 'f32' | 'i32' | 'u32';
type ParsedAttributeType = { scalar: AttributeScalar; components: number };

type PositionBinding = {
  kind: 'position';
  binding: number;
  location: number;
  components: number;
  scalar: AttributeScalar;
  bytesPerComponent: number;
};

type NormalBinding = {
  kind: 'normal';
  binding: number;
  location: number;
  components: number;
  scalar: AttributeScalar;
  bytesPerComponent: number;
};

type UvBinding = {
  kind: 'uv';
  uvIndex: number;
  binding: number;
  location: number;
  components: number;
  scalar: AttributeScalar;
  bytesPerComponent: number;
};

type CustomBinding = {
  kind: 'custom';
  name: string;
  binding: number;
  location: number;
  components: number;
  scalar: AttributeScalar;
  bytesPerComponent: number;
};

export type VertexBindingLayout =
  | PositionBinding
  | NormalBinding
  | UvBinding
  | CustomBinding;

type PendingVertexBinding =
  | Omit<PositionBinding, 'binding'>
  | Omit<NormalBinding, 'binding'>
  | Omit<UvBinding, 'binding'>
  | Omit<CustomBinding, 'binding'>;

export type PipelineReflection = {
  vertexEntry: string;
  fragmentEntry?: string;
  attributes: ReflectedAttribute[];
  bindings: ReflectedBinding[];
  overrides: string[];
};

/**
 * Bridges Material/ShaderStorage with Vulkan pipeline creation.
 * Uses wgsl_reflect to derive bindings/attributes and validates material compatibility.
 */
export class VkGraphicsPipeline implements Disposable {
  private __device: Pointer;
  private __reflection: PipelineReflection;
  private __shaderModule: VkShaderModule;
  private __layout: Pointer | null = null;
  private __descriptorSetLayouts: Pointer[] = [];
  private __pipeline: Pointer | null = null;
  private __vertexBindings: VertexBindingLayout[] = [];

  constructor(
    device: Pointer,
    renderPass: Pointer,
    material: Material,
    shaders: ShaderStorage,
    geometry: Geometry,
  ) {
    this.__device = device;

    const pack = this.__getGraphicsPack(material.shader, shaders);
    this.__reflection = this.__reflectPipeline(
      pack.reflect,
      pack.vEntry,
      pack.fEntry,
    );
    this.__validateMaterial(material, this.__reflection);

    this.__shaderModule = new VkShaderModule(device, pack.src);

    this.__descriptorSetLayouts = this.__createDescriptorSetLayouts();
    this.__layout = this.__createPipelineLayout();
    this.__pipeline = this.__createPipeline(
      renderPass,
      material,
      geometry,
      pack.vEntry,
      pack.fEntry,
    );
  }

  get reflection(): PipelineReflection {
    return this.__reflection;
  }

  get layout(): Pointer {
    if (!this.__layout) {
      throw new EngineError(
        'Pipeline layout was not created',
        'VkGraphicsPipeline',
      );
    }
    return this.__layout;
  }

  get shaderModule(): VkShaderModule {
    return this.__shaderModule;
  }

  get vertexBindings(): readonly VertexBindingLayout[] {
    return this.__vertexBindings;
  }

  dispose(): void {
    if (this.__pipeline) {
      VK.vkDestroyPipeline(this.__device, this.__pipeline, null);
      this.__pipeline = null;
    }

    this.__shaderModule.dispose();

    if (this.__descriptorSetLayouts.length > 0) {
      for (const layout of this.__descriptorSetLayouts) {
        if (layout) {
          VK.vkDestroyDescriptorSetLayout(this.__device, layout, null);
        }
      }
      this.__descriptorSetLayouts = [];
    }

    if (this.__layout) {
      VK.vkDestroyPipelineLayout(this.__device, this.__layout, null);
      this.__layout = null;
    }
  }

  private __getGraphicsPack(holder: ShaderHolder, shaders: ShaderStorage) {
    const pack = shaders.getShaderPack(holder);
    if (!pack) {
      throw new EngineError(
        'Shader holder not found in ShaderStorage',
        'VkGraphicsPipeline',
      );
    }
    if (pack.type !== 'graphics') {
      throw new EngineError(
        'Shader holder is not a graphics shader',
        'VkGraphicsPipeline',
      );
    }
    return pack;
  }

  private __reflectPipeline(
    reflect: WgslReflect,
    vertexEntry: string,
    fragmentEntry?: string,
  ): PipelineReflection {
    const vertexInfo = reflect.getFunctionInfo(vertexEntry);
    if (!vertexInfo || vertexInfo.stage !== 'vertex') {
      throw new EngineError(
        `Vertex entry '${vertexEntry}' not found or not a vertex stage`,
        'VkGraphicsPipeline',
      );
    }

    if (fragmentEntry) {
      const fragInfo = reflect.getFunctionInfo(fragmentEntry);
      if (!fragInfo || fragInfo.stage !== 'fragment') {
        throw new EngineError(
          `Fragment entry '${fragmentEntry}' not found or not a fragment stage`,
          'VkGraphicsPipeline',
        );
      }
    }

    const attributes =
      vertexInfo.inputs?.map((input) => ({
        name: input.name,
        location:
          input.locationType === 'location' && typeof input.location === 'number'
            ? input.location
            : null,
        type: input.type?.getTypeName() ?? 'unknown',
      })) ?? [];

    const bindings = this.__mapBindings(reflect.getBindGroups());
    const overrides = reflect.overrides.map((o) => o.name);

    return {
      vertexEntry,
      fragmentEntry,
      attributes,
      bindings,
      overrides,
    };
  }

  private __mapBindings(groups: Array<VariableInfo[]>): ReflectedBinding[] {
    const bindings: ReflectedBinding[] = [];

    for (const group of groups) {
      for (const variable of group) {
        bindings.push({
          name: variable.name,
          group: variable.group,
          binding: variable.binding,
          resource: this.__mapResource(variable.resourceType),
          size: variable.size,
          align: variable.align,
          arrayLength: variable.isArray ? variable.count ?? 1 : 1,
        });
      }
    }

    return bindings;
  }

  private __mapResource(type: ResourceType): ReflectedBindingResource {
    switch (type) {
      case ResourceType.Uniform:
        return 'uniform';
      case ResourceType.Storage:
        return 'storage';
      case ResourceType.Texture:
        return 'texture';
      case ResourceType.Sampler:
        return 'sampler';
      case ResourceType.StorageTexture:
        return 'storage-texture';
      default:
        return 'uniform';
    }
  }

  private __validateMaterial(
    material: Material,
    reflection: PipelineReflection,
  ): void {
    const schemaOverrides = Object.keys(material.schema.overrides ?? {});
    const shaderOverrides = new Set(reflection.overrides);

    this.__checkCompatibility(schemaOverrides, shaderOverrides, 'override');

    const missingOverrideValues = reflection.overrides.filter(
      (name) => (material.overrides as Record<string, unknown>)[name] === undefined,
    );
    if (missingOverrideValues.length > 0) {
      throw new EngineError(
        `Material incompativel com shader (faltando valor para override(s): ${missingOverrideValues.join(', ')})`,
        'VkGraphicsPipeline',
      );
    }

    const shaderUniforms = new Set(
      reflection.bindings
        .filter((b) => b.resource === 'uniform')
        .map((b) => b.name),
    );
    const schemaUniforms = Object.keys(material.schema.uniforms ?? {});
    this.__checkCompatibility(schemaUniforms, shaderUniforms, 'uniform');
  }

  private __checkCompatibility(
    materialKeys: string[],
    shaderKeys: Set<string>,
    label: string,
  ): void {
    const missing: string[] = [];
    const extras: string[] = [];

    for (const key of materialKeys) {
      if (!shaderKeys.has(key)) {
        extras.push(key);
      }
    }

    for (const key of shaderKeys) {
      if (!materialKeys.includes(key)) {
        missing.push(key);
      }
    }

    if (missing.length || extras.length) {
      const parts: string[] = [];
      if (missing.length) {
        parts.push(`faltando ${label}(s): ${missing.join(', ')}`);
      }
      if (extras.length) {
        parts.push(`extras nao usados pelo shader: ${extras.join(', ')}`);
      }
      throw new EngineError(
        `Material incompativel com shader (${parts.join(' | ')})`,
        'VkGraphicsPipeline',
      );
    }
  }
  private __createDescriptorSetLayouts(): Pointer[] {
    if (this.__reflection.bindings.length === 0) return [];

    const stageFlags =
      VkShaderStageFlagBits.VERTEX_BIT |
      (this.__reflection.fragmentEntry ? VkShaderStageFlagBits.FRAGMENT_BIT : 0);

    const groups = new Map<number, ReflectedBinding[]>();
    for (const binding of this.__reflection.bindings) {
      if (!groups.has(binding.group)) {
        groups.set(binding.group, []);
      }
      groups.get(binding.group)!.push(binding);
    }

    const maxGroup = Math.max(...groups.keys());
    const layouts: Pointer[] = [];
    const bindingSize = sizeOf(vkDescriptorSetLayoutBinding);

    for (let group = 0; group <= maxGroup; group++) {
      const groupBindings = groups.get(group) ?? [];
      groupBindings.sort((a, b) => a.binding - b.binding);

      let bindingsBuffer: Uint8Array | null = null;
      if (groupBindings.length > 0) {
        bindingsBuffer = new Uint8Array(groupBindings.length * bindingSize);
        for (let i = 0; i < groupBindings.length; i++) {
          const b = groupBindings[i]!;
          const layout = instantiate(vkDescriptorSetLayoutBinding);
          layout.binding = b.binding;
          layout.descriptorType = this.__mapDescriptorType(b.resource);
          layout.descriptorCount = Math.max(1, b.arrayLength ?? 1);
          layout.stageFlags = stageFlags;
          layout.pImmutableSamplers = 0n;

          bindingsBuffer.set(
            new Uint8Array(getInstanceBuffer(layout)),
            i * bindingSize,
          );
        }
      }

      const createInfo = instantiate(vkDescriptorSetLayoutCreateInfo);
      createInfo.bindingCount = groupBindings.length;
      createInfo.pBindings =
        groupBindings.length > 0 && bindingsBuffer
          ? BigInt(ptr(bindingsBuffer))
          : 0n;

      const holder = new BigUint64Array(1);
      const result = VK.vkCreateDescriptorSetLayout(
        this.__device,
        ptr(getInstanceBuffer(createInfo)),
        null,
        ptr(holder),
      );

      if (result !== VkResult.SUCCESS) {
        throw new EngineError(getResultMessage(result), 'VkGraphicsPipeline');
      }

      layouts[group] = Number(holder[0]) as Pointer;
    }

    return layouts;
  }

  private __createPipelineLayout(): Pointer {
    const layoutInfo = instantiate(vkPipelineLayoutCreateInfo);
    const descriptorLayouts = this.__descriptorSetLayouts.filter(Boolean);
    layoutInfo.setLayoutCount = descriptorLayouts.length;
    layoutInfo.pSetLayouts =
      descriptorLayouts.length > 0
        ? BigInt(
            ptr(
              new BigUint64Array(
                descriptorLayouts.map((layout) => BigInt(layout)),
              ),
            ),
          )
        : 0n;
    layoutInfo.pushConstantRangeCount = 0;
    layoutInfo.pPushConstantRanges = 0n;

    const holder = new BigUint64Array(1);
    const result = VK.vkCreatePipelineLayout(
      this.__device,
      ptr(getInstanceBuffer(layoutInfo)),
      null,
      ptr(holder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new EngineError(getResultMessage(result), 'VkGraphicsPipeline');
    }

    return Number(holder[0]) as Pointer;
  }

  private __createPipeline(
    renderPass: Pointer,
    material: Material,
    geometry: Geometry,
    vertexEntry: string,
    fragmentEntry?: string,
  ): Pointer {
    const specializationInfo = this.__buildSpecializationInfo(material);

    const shaderStages = this.__buildShaderStages(
      this.__shaderModule.instance,
      vertexEntry,
      fragmentEntry,
      specializationInfo,
    );

    const { bindingDesc, attributeDescs, attributeCount, bindingCount } =
      this.__buildVertexInput(this.__reflection.attributes, geometry);

    const vertexInputInfo = instantiate(vkPipelineVertexInputStateCreateInfo);
    vertexInputInfo.vertexBindingDescriptionCount = bindingCount;
    vertexInputInfo.pVertexBindingDescriptions =
      bindingCount > 0 ? BigInt(ptr(bindingDesc)) : 0n;
    vertexInputInfo.vertexAttributeDescriptionCount = attributeCount;
    vertexInputInfo.pVertexAttributeDescriptions =
      attributeCount > 0 ? BigInt(ptr(attributeDescs)) : 0n;

    const inputAssembly = instantiate(vkPipelineInputAssemblyStateCreateInfo);
    inputAssembly.topology = this.__mapTopology(material.topology);
    inputAssembly.primitiveRestartEnable = 0;

    const viewportState = instantiate(vkPipelineViewportStateCreateInfo);
    viewportState.viewportCount = 1;
    viewportState.pViewports = BigInt(
      ptr(getInstanceBuffer(this.__defaultViewport())),
    );
    viewportState.scissorCount = 1;
    viewportState.pScissors = BigInt(
      ptr(getInstanceBuffer(this.__defaultScissor())),
    );

    const rasterizerState = this.__buildRasterizer(material.rasterizationState);
    const multisampleState = this.__buildMultisample(
      material.rasterizationState.multisample,
    );
    const depthStencilState = this.__buildDepthStencil(
      material.rasterizationState.depthStencil,
    );
    const colorBlendState = this.__buildColorBlend(
      material.rasterizationState.blend,
    );

    const dynamicStates = new Uint32Array([
      VkDynamicState.VIEWPORT,
      VkDynamicState.SCISSOR,
    ]);
    const dynamicState = instantiate(vkPipelineDynamicStateCreateInfo);
    dynamicState.dynamicStateCount = dynamicStates.length;
    dynamicState.pDynamicStates = BigInt(ptr(dynamicStates));

    const pipelineInfo = instantiate(vkGraphicsPipelineCreateInfo);
    pipelineInfo.stageCount = shaderStages.count;
    pipelineInfo.pStages = BigInt(ptr(shaderStages.buffer));
    pipelineInfo.pVertexInputState = BigInt(
      ptr(new Uint8Array(getInstanceBuffer(vertexInputInfo))),
    );
    pipelineInfo.pInputAssemblyState = BigInt(
      ptr(new Uint8Array(getInstanceBuffer(inputAssembly))),
    );
    pipelineInfo.pViewportState = BigInt(
      ptr(new Uint8Array(getInstanceBuffer(viewportState))),
    );
    pipelineInfo.pRasterizationState = BigInt(
      ptr(new Uint8Array(getInstanceBuffer(rasterizerState))),
    );
    pipelineInfo.pMultisampleState = BigInt(
      ptr(new Uint8Array(getInstanceBuffer(multisampleState))),
    );
    pipelineInfo.pDepthStencilState = BigInt(
      ptr(new Uint8Array(getInstanceBuffer(depthStencilState))),
    );
    pipelineInfo.pColorBlendState = BigInt(
      ptr(new Uint8Array(getInstanceBuffer(colorBlendState))),
    );
    pipelineInfo.pDynamicState = BigInt(
      ptr(new Uint8Array(getInstanceBuffer(dynamicState))),
    );
    pipelineInfo.layout = BigInt(this.layout);
    pipelineInfo.renderPass = BigInt(renderPass);
    pipelineInfo.subpass = 0;
    pipelineInfo.basePipelineHandle = 0n;
    pipelineInfo.basePipelineIndex = -1;

    const holder = new BigUint64Array(1);
    const result = VK.vkCreateGraphicsPipelines(
      this.__device,
      0n,
      1,
      ptr(getInstanceBuffer(pipelineInfo)),
      null,
      ptr(holder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new EngineError(getResultMessage(result), 'VkGraphicsPipeline');
    }

    return Number(holder[0]) as Pointer;
  }

  private __buildSpecializationInfo(material: Material): bigint {
    void material;
    // TODO: map WGSL overrides to VkSpecializationInfo when bindings are available.
    return 0n;
  }

  private __buildShaderStages(
    module: Pointer,
    vertexEntry: string,
    fragmentEntry?: string,
    specializationInfo: bigint = 0n,
  ): { buffer: Uint8Array; count: number } {
    const stageSize = sizeOf(vkPipelineShaderStageCreateInfo);
    const stages: Uint8Array[] = [];

    const vertexStage = instantiate(vkPipelineShaderStageCreateInfo);
    vertexStage.stage = VkShaderStageFlagBits.VERTEX_BIT;
    vertexStage.module = BigInt(module);
    vertexStage.pName = vertexEntry;
    vertexStage.pSpecializationInfo = specializationInfo;
    stages.push(new Uint8Array(getInstanceBuffer(vertexStage)));

    if (fragmentEntry) {
      const fragStage = instantiate(vkPipelineShaderStageCreateInfo);
      fragStage.stage = VkShaderStageFlagBits.FRAGMENT_BIT;
      fragStage.module = BigInt(module);
      fragStage.pName = fragmentEntry;
      fragStage.pSpecializationInfo = specializationInfo;
      stages.push(new Uint8Array(getInstanceBuffer(fragStage)));
    }

    const buffer = new Uint8Array(stageSize * stages.length);
    for (let i = 0; i < stages.length; i++) {
      buffer.set(stages[i]!, i * stageSize);
    }

    return { buffer, count: stages.length };
  }

  private __buildVertexInput(
    attributes: ReflectedAttribute[],
    geometry: Geometry,
  ) {
    const available = attributes.filter(
      (attr): attr is ReflectedAttribute & { location: number } =>
        attr.location !== null && attr.location !== undefined,
    );

    const resolved: PendingVertexBinding[] = available.map((attr) => {
      const parsedType = this.__parseAttributeType(attr.type);
      return this.__resolveVertexBinding(attr, parsedType, geometry);
    });

    const ordered: PendingVertexBinding[] = [];
    const position = resolved.find(
      (r): r is Extract<PendingVertexBinding, { kind: 'position' }> =>
        r.kind === 'position',
    );
    if (position) ordered.push(position);

    const normal = resolved.find(
      (r): r is Extract<PendingVertexBinding, { kind: 'normal' }> =>
        r.kind === 'normal',
    );
    if (normal) ordered.push(normal);

    const uvBindings = resolved
      .filter(
        (r): r is Extract<PendingVertexBinding, { kind: 'uv' }> =>
          r.kind === 'uv',
      )
      .sort((a, b) => a.uvIndex - b.uvIndex);
    ordered.push(...uvBindings);

    const customBindings = resolved
      .filter(
        (r): r is Extract<PendingVertexBinding, { kind: 'custom' }> =>
          r.kind === 'custom',
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    ordered.push(...customBindings);

    const bindingSize = sizeOf(vkVertexInputBindingDescription);
    const attrSize = sizeOf(vkVertexInputAttributeDescription);

    const bindingDesc = new Uint8Array(ordered.length * bindingSize);
    const attributeDescs = new Uint8Array(ordered.length * attrSize);

    const finalBindings: VertexBindingLayout[] = [];

    for (let i = 0; i < ordered.length; i++) {
      const entry = ordered[i]!;
      const stride = entry.components * entry.bytesPerComponent;

      const binding = instantiate(vkVertexInputBindingDescription);
      binding.binding = i;
      binding.inputRate = VkVertexInputRate.VERTEX;
      binding.stride = stride;
      bindingDesc.set(
        new Uint8Array(getInstanceBuffer(binding)),
        i * bindingSize,
      );

      const attr = instantiate(vkVertexInputAttributeDescription);
      attr.location = entry.location;
      attr.binding = i;
      attr.format = this.__mapAttributeFormat(
        entry.scalar,
        entry.components,
      );
      attr.offset = 0;
      attributeDescs.set(
        new Uint8Array(getInstanceBuffer(attr)),
        i * attrSize,
      );

      finalBindings.push({ ...entry, binding: i } as VertexBindingLayout);
    }

    this.__vertexBindings = finalBindings;

    return {
      bindingDesc,
      bindingCount: ordered.length,
      attributeDescs,
      attributeCount: ordered.length,
    };
  }

  private __resolveVertexBinding(
    attr: ReflectedAttribute,
    parsed: ParsedAttributeType,
    geometry: Geometry,
  ): PendingVertexBinding {
    if (attr.location === null || attr.location === undefined) {
      throw new EngineError(
        `Atributo de vertice '${attr.name}' sem location explicita no WGSL.`,
        'VkGraphicsPipeline',
      );
    }

    const name = attr.name.trim();
    const normalized = name.toLowerCase();
    const location = attr.location as number;

    if (normalized === 'position') {
      this.__assertAttributeCompatibility(
        name,
        attr.type,
        parsed,
        3,
        'float32',
        'f32',
      );
      return {
        kind: 'position',
        location,
        components: 3,
        scalar: 'f32',
        bytesPerComponent: Float32Array.BYTES_PER_ELEMENT,
      };
    }

    if (normalized === 'normal') {
      this.__assertAttributeCompatibility(
        name,
        attr.type,
        parsed,
        3,
        'float32',
        'f32',
      );
      return {
        kind: 'normal',
        location,
        components: 3,
        scalar: 'f32',
        bytesPerComponent: Float32Array.BYTES_PER_ELEMENT,
      };
    }

    const uvMatch = /^uv(\d*)$/.exec(normalized);
    if (uvMatch) {
      const uvIndex = uvMatch[1] === '' ? 0 : Number(uvMatch[1]);
      if (!Number.isFinite(uvIndex) || uvIndex < 0) {
        throw new EngineError(
          `UV index invalido no atributo '${name}'.`,
          'VkGraphicsPipeline',
        );
      }
      if (uvIndex >= geometry.uvLayerCount) {
        throw new EngineError(
          `Geometry nao possui camada de UV para '${name}' (index ${uvIndex}).`,
          'VkGraphicsPipeline',
        );
      }
      this.__assertAttributeCompatibility(
        name,
        attr.type,
        parsed,
        2,
        'float32',
        'f32',
      );
      return {
        kind: 'uv',
        uvIndex,
        location,
        components: 2,
        scalar: 'f32',
        bytesPerComponent: Float32Array.BYTES_PER_ELEMENT,
      };
    }

    const custom = this.__findCustomAttribute(geometry, name);
    if (!custom) {
      throw new EngineError(
        `Atributo de vertice '${name}' nao existe na Geometry (customAttributes).`,
        'VkGraphicsPipeline',
      );
    }

    const { scalar, bytesPerComponent } = this.__geometryTypeInfo(
      custom.type,
      name,
    );

    this.__assertAttributeCompatibility(
      name,
      attr.type,
      parsed,
      custom.components,
      custom.type,
      scalar,
    );

    return {
      kind: 'custom',
      name: custom.name,
      location,
      components: custom.components,
      scalar,
      bytesPerComponent,
    };
  }

  private __parseAttributeType(typeName: string): ParsedAttributeType {
    const normalized = typeName.trim().toLowerCase();
    const vecMatch = /^vec(\d+)<(f32|i32|u32)>$/.exec(normalized);
    if (vecMatch) {
      const components = Number(vecMatch[1]);
      const scalar = vecMatch[2] as AttributeScalar;
      if (components >= 2 && components <= 4) {
        return { scalar, components };
      }
    }

    const scalarMatch = /^(f32|i32|u32)$/.exec(normalized);
    if (scalarMatch) {
      return {
        scalar: scalarMatch[1] as AttributeScalar,
        components: 1,
      };
    }

    throw new EngineError(
      `Tipo de atributo nao suportado para VertexInput: ${typeName}`,
      'VkGraphicsPipeline',
    );
  }

  private __findCustomAttribute(
    geometry: Geometry,
    name: string,
  ): GeometryCustomAttribute | null {
    const key = name.trim();
    return (
      geometry.customAttributes.find((attr) => attr.name === key) ?? null
    );
  }

  private __geometryTypeInfo(
    type: VertexAttributeType,
    attrName: string,
  ): { scalar: AttributeScalar; bytesPerComponent: number } {
    switch (type) {
      case 'float32':
        return {
          scalar: 'f32',
          bytesPerComponent: Float32Array.BYTES_PER_ELEMENT,
        };
      case 'int32':
        return {
          scalar: 'i32',
          bytesPerComponent: Int32Array.BYTES_PER_ELEMENT,
        };
      case 'uint32':
        return {
          scalar: 'u32',
          bytesPerComponent: Uint32Array.BYTES_PER_ELEMENT,
        };
      default:
        throw new EngineError(
          `Atributo '${attrName}' usa tipo ${type}, apenas float32/int32/uint32 sao suportados para VertexInput.`,
          'VkGraphicsPipeline',
        );
    }
  }

  private __assertAttributeCompatibility(
    name: string,
    wgslTypeName: string,
    parsed: ParsedAttributeType,
    expectedComponents: number,
    geometryType: string,
    geometryScalar: AttributeScalar,
  ): void {
    if (
      parsed.components !== expectedComponents ||
      parsed.scalar !== geometryScalar
    ) {
      throw new EngineError(
        `Atributo '${name}' incompativel: shader declara '${wgslTypeName}', mas Geometry fornece ${expectedComponents} componente(s) do tipo ${geometryType}.`,
        'VkGraphicsPipeline',
      );
    }
  }

  private __buildRasterizer(rasterizer: Rasterizer) {
    const state = instantiate(vkPipelineRasterizationStateCreateInfo);
    state.depthClampEnable = 0;
    state.rasterizerDiscardEnable = 0;
    state.polygonMode = this.__mapFillMode(rasterizer.fillMode);
    state.cullMode = this.__mapCullMode(rasterizer.cull);
    state.frontFace = this.__mapFrontFace(rasterizer.frontFace);
    state.depthBiasEnable = rasterizer.depthStencil.depthBias !== 0 ? 1 : 0;
    state.depthBiasConstantFactor = rasterizer.depthStencil.depthBias;
    state.depthBiasClamp = rasterizer.depthStencil.depthBiasClamp;
    state.depthBiasSlopeFactor = rasterizer.depthStencil.depthBiasSlopeScale;
    state.lineWidth = 1;
    return state;
  }

  private __buildMultisample(multisample: MultisampleState) {
    const state = instantiate(vkPipelineMultisampleStateCreateInfo);
    state.rasterizationSamples = mapSampleCountToVk(
      multisample.count,
    ) as VkSampleCountFlagBits;
    state.sampleShadingEnable = 0;
    state.minSampleShading = 1;
    state.pSampleMask = 0n;
    state.alphaToCoverageEnable = multisample.alphaToCoverageEnabled ? 1 : 0;
    state.alphaToOneEnable = 0;
    return state;
  }

  private __buildDepthStencil(depth: DepthStencilState) {
    const depthStencil = instantiate(vkPipelineDepthStencilStateCreateInfo);
    depthStencil.depthTestEnable = depth.depthCompare !== 'always' ? 1 : 0;
    depthStencil.depthWriteEnable = depth.depthWriteEnabled ? 1 : 0;
    depthStencil.depthCompareOp = this.__mapCompare(depth.depthCompare);
    depthStencil.depthBoundsTestEnable = 0;
    depthStencil.stencilTestEnable =
      depth.stencilFront.compare !== 'always' ||
      depth.stencilBack.compare !== 'always'
        ? 1
        : 0;
    depthStencil.front.failOp = this.__mapStencil(depth.stencilFront.failOp);
    depthStencil.front.passOp = this.__mapStencil(depth.stencilFront.passOp);
    depthStencil.front.depthFailOp = this.__mapStencil(
      depth.stencilFront.depthFailOp,
    );
    depthStencil.front.compareOp = this.__mapCompare(
      depth.stencilFront.compare,
    );
    depthStencil.front.compareMask = depth.stencilReadMask.get();
    depthStencil.front.writeMask = depth.stencilWriteMask.get();
    depthStencil.front.reference = 0;

    depthStencil.back.failOp = this.__mapStencil(depth.stencilBack.failOp);
    depthStencil.back.passOp = this.__mapStencil(depth.stencilBack.passOp);
    depthStencil.back.depthFailOp = this.__mapStencil(
      depth.stencilBack.depthFailOp,
    );
    depthStencil.back.compareOp = this.__mapCompare(depth.stencilBack.compare);
    depthStencil.back.compareMask = depth.stencilReadMask.get();
    depthStencil.back.writeMask = depth.stencilWriteMask.get();
    depthStencil.back.reference = 0;

    depthStencil.minDepthBounds = 0;
    depthStencil.maxDepthBounds = 1;

    return depthStencil;
  }

  private __buildColorBlend(blend: BlendState) {
    const attachment = instantiate(vkPipelineColorBlendAttachmentState);
    attachment.blendEnable = blend.enabled ? 1 : 0;
    attachment.srcColorBlendFactor = this.__mapBlendFactor(
      blend.color.srcFactor,
    );
    attachment.dstColorBlendFactor = this.__mapBlendFactor(
      blend.color.dstFactor,
    );
    attachment.colorBlendOp = this.__mapBlendOp(blend.color.operation);
    attachment.srcAlphaBlendFactor = this.__mapBlendFactor(
      blend.alpha.srcFactor,
    );
    attachment.dstAlphaBlendFactor = this.__mapBlendFactor(
      blend.alpha.dstFactor,
    );
    attachment.alphaBlendOp = this.__mapBlendOp(blend.alpha.operation);
    attachment.colorWriteMask = this.__maskToColorWrite(blend.writeMask.get());

    const colorBlend = instantiate(vkPipelineColorBlendStateCreateInfo);
    colorBlend.logicOpEnable = 0;
    colorBlend.logicOp = VkLogicOp.COPY;
    colorBlend.attachmentCount = 1;
    colorBlend.pAttachments = BigInt(ptr(getInstanceBuffer(attachment)));
    colorBlend.blendConstants = [0, 0, 0, 0];

    return colorBlend;
  }

  private __defaultViewport() {
    const vp = instantiate(vkViewport);
    vp.x = 0;
    vp.y = 0;
    vp.width = 1;
    vp.height = 1;
    vp.minDepth = 0;
    vp.maxDepth = 1;
    return vp;
  }

  private __defaultScissor() {
    const sc = instantiate(vkRect2D);
    sc.offset.x = 0;
    sc.offset.y = 0;
    sc.extent.width = 1;
    sc.extent.height = 1;
    return sc;
  }

  private __mapDescriptorType(resource: ReflectedBindingResource): number {
    switch (resource) {
      case 'uniform':
        return VkDescriptorType.UNIFORM_BUFFER;
      case 'storage':
        return VkDescriptorType.STORAGE_BUFFER;
      case 'texture':
        return VkDescriptorType.SAMPLED_IMAGE;
      case 'sampler':
        return VkDescriptorType.SAMPLER;
      case 'storage-texture':
        return VkDescriptorType.STORAGE_IMAGE;
      default:
        return VkDescriptorType.UNIFORM_BUFFER;
    }
  }

  private __mapTopology(topology: PrimitiveTopology): number {
    switch (topology) {
      case 'point-list':
        return VkPrimitiveTopology.POINT_LIST;
      case 'line-list':
        return VkPrimitiveTopology.LINE_LIST;
      case 'line-strip':
        return VkPrimitiveTopology.LINE_STRIP;
      case 'triangle-strip':
        return VkPrimitiveTopology.TRIANGLE_STRIP;
      case 'triangle-list':
      default:
        return VkPrimitiveTopology.TRIANGLE_LIST;
    }
  }

  private __mapFillMode(fill: Rasterizer['fillMode']): number {
    switch (fill) {
      case 'line':
        return VkPolygonMode.LINE;
      case 'point':
        return VkPolygonMode.POINT;
      case 'fill':
      default:
        return VkPolygonMode.FILL;
    }
  }

  private __mapCullMode(cull: Rasterizer['cull']): number {
    switch (cull) {
      case 'front':
        return VkCullModeFlagBits.FRONT_BIT;
      case 'back':
        return VkCullModeFlagBits.BACK_BIT;
      case 'all':
        return VkCullModeFlagBits.FRONT_AND_BACK;
      case 'none':
      default:
        return 0;
    }
  }

  private __mapFrontFace(face: Rasterizer['frontFace']): number {
    return face === 'counter-clockwise'
      ? VkFrontFace.COUNTER_CLOCKWISE
      : VkFrontFace.CLOCKWISE;
  }

  private __mapCompare(compare: DepthStencilState['depthCompare']): number {
    switch (compare) {
      case 'never':
        return VkCompareOp.NEVER;
      case 'less':
        return VkCompareOp.LESS;
      case 'less-equal':
        return VkCompareOp.LESS_OR_EQUAL;
      case 'greater':
        return VkCompareOp.GREATER;
      case 'greater-equal':
        return VkCompareOp.GREATER_OR_EQUAL;
      case 'equal':
        return VkCompareOp.EQUAL;
      case 'not-equal':
        return VkCompareOp.NOT_EQUAL;
      case 'always':
      default:
        return VkCompareOp.ALWAYS;
    }
  }

  private __mapStencil(
    op: DepthStencilState['stencilFront']['failOp'],
  ): number {
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
        return VkStencilOp.DECREMENT_AND_WRAP;
      default:
        return VkStencilOp.KEEP;
    }
  }

  private __mapBlendFactor(f: BlendState['color']['srcFactor']): number {
    switch (f) {
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
        return VkBlendFactor.ONE_MINUS_CONSTANT_COLOR;
      default:
        return VkBlendFactor.ONE;
    }
  }

  private __mapBlendOp(op: BlendState['color']['operation']): number {
    switch (op) {
      case 'add':
        return VkBlendOp.ADD;
      case 'subtract':
        return VkBlendOp.SUBTRACT;
      case 'reverse-subtract':
        return VkBlendOp.REVERSE_SUBTRACT;
      case 'min':
        return VkBlendOp.MIN;
      case 'max':
        return VkBlendOp.MAX;
      default:
        return VkBlendOp.ADD;
    }
  }

  private __maskToColorWrite(mask: number): number {
    let m = 0;
    if (mask & 0x1) m |= VkColorComponentFlagBits.R_BIT;
    if (mask & 0x2) m |= VkColorComponentFlagBits.G_BIT;
    if (mask & 0x4) m |= VkColorComponentFlagBits.B_BIT;
    if (mask & 0x8) m |= VkColorComponentFlagBits.A_BIT;
    return m;
  }

  private __mapAttributeFormat(
    scalar: AttributeScalar,
    components: number,
  ): number {
    switch (scalar) {
      case 'f32':
        switch (components) {
          case 1:
            return VkFormat.R32_SFLOAT;
          case 2:
            return VkFormat.R32G32_SFLOAT;
          case 3:
            return VkFormat.R32G32B32_SFLOAT;
          case 4:
            return VkFormat.R32G32B32A32_SFLOAT;
          default:
            break;
        }
        break;
      case 'i32':
        switch (components) {
          case 1:
            return VkFormat.R32_SINT;
          case 2:
            return VkFormat.R32G32_SINT;
          case 3:
            return VkFormat.R32G32B32_SINT;
          case 4:
            return VkFormat.R32G32B32A32_SINT;
          default:
            break;
        }
        break;
      case 'u32':
        switch (components) {
          case 1:
            return VkFormat.R32_UINT;
          case 2:
            return VkFormat.R32G32_UINT;
          case 3:
            return VkFormat.R32G32B32_UINT;
          case 4:
            return VkFormat.R32G32B32A32_UINT;
          default:
            break;
        }
        break;
      default:
        break;
    }

    throw new EngineError(
      `Tipo de atributo nao suportado para VertexInput: ${components} componente(s) ${scalar}`,
      'VkGraphicsPipeline',
    );
  }
}
