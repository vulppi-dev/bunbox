import type { Disposable } from '@bunbox/utils';
import {
  VkBlendFactor,
  VkBlendOp,
  VkCompareOp,
  VkCullModeFlagBits,
  VkFormat,
  VkFrontFace,
  VkPolygonMode,
  VkPrimitiveTopology,
  VkSampleCountFlagBits,
  VkStencilOp,
} from '@bunbox/vk';
import { EngineError } from '../errors';
import type { Material } from '../material/MaterialBuilder';
import type { MaterialSchema } from '../material/MaterialSchema';
import type { Rasterizer } from '../resources/Rasterizer';
import {
  type DescriptorBindingInfo,
  type DescriptorSetInfo,
  type ShaderOverrideInfo,
  type VertexAttributeInfo,
} from './ShaderReflection';
import type { PipelineReflectionLayout } from './PipelineReflectionLayout';

export type VertexBindingInfo = {
  binding: number;
  stride: number;
  name: string;
};

export type VertexAttributeBinding = {
  location: number;
  binding: number;
  format: number;
  offset: number;
  name: string;
};

export type VertexInputState = {
  bindings: VertexBindingInfo[];
  attributes: VertexAttributeBinding[];
};

export type SpecializationConstant = {
  id: number;
  name: string;
  type: string | null;
  value: unknown;
};

export type UniformBinding = {
  name: string;
  set: number;
  binding: number;
  descriptorType: number;
};

export type StorageBinding = {
  name: string;
  set: number;
  binding: number;
  descriptorType: number;
};

export type RasterStateMeta = {
  polygonMode: number;
  cullMode: number;
  frontFace: number;
  depthCompare: number;
  depthWriteEnabled: boolean;
  stencil: {
    front: StencilStateMeta;
    back: StencilStateMeta;
    readMask: number;
    writeMask: number;
  };
  blend: {
    enabled: boolean;
    color: BlendComponentMeta;
    alpha: BlendComponentMeta;
    writeMask: number;
  };
  sampleCount: number;
};

export type BlendComponentMeta = {
  srcFactor: number;
  dstFactor: number;
  operation: number;
};

export type StencilStateMeta = {
  compare: number;
  failOp: number;
  depthFailOp: number;
  passOp: number;
};

export class PipelineMaterialLayout implements Disposable {
  readonly reflection: PipelineReflectionLayout;
  readonly material: Material;
  readonly topology: number;
  readonly vertexInput: VertexInputState;
  readonly specializationConstants: SpecializationConstant[];
  readonly uniformBindings: UniformBinding[];
  readonly storageBindings: StorageBinding[];
  readonly rasterState: RasterStateMeta;

  constructor(
    reflection: PipelineReflectionLayout,
    material: Material,
    customVertexInput?: VertexInputState,
  ) {
    this.reflection = reflection;
    this.material = material;
    this.topology = mapTopology(material.topology);
    this.vertexInput =
      customVertexInput ?? buildDefaultVertexInput(reflection.vertexInputs);
    this.specializationConstants = buildSpecialization(
      reflection.overrides,
      material.overrides as Record<string, unknown>,
    );
    this.uniformBindings = mapUniforms(
      reflection.descriptorSets,
      material.schema,
    );
    this.storageBindings = mapStorages(
      reflection.descriptorSets,
      material.schema,
    );
    this.rasterState = mapRasterizer(material.rasterizationState);
  }

  prepare(): void {
    validateUniforms(this.uniformBindings, this.material.schema);
    validateStorages(this.storageBindings, this.material.schema);
  }

  release(): void {}

  dispose(): void {
    this.release();
  }
}

function buildDefaultVertexInput(
  attributes: VertexAttributeInfo[],
): VertexInputState {
  const bindings: VertexBindingInfo[] = [];
  const attributeBindings: VertexAttributeBinding[] = [];

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i]!;
    const stride = guessFormatStride(attr.vkFormat);
    bindings.push({
      binding: i,
      stride,
      name: attr.name,
    });
    attributeBindings.push({
      name: attr.name,
      location: attr.location,
      binding: i,
      format: attr.vkFormat,
      offset: 0,
    });
  }

  return { bindings, attributes: attributeBindings };
}

function buildSpecialization(
  overrides: ShaderOverrideInfo[],
  values: Record<string, unknown>,
): SpecializationConstant[] {
  return overrides.map((ov) => ({
    id: ov.id,
    name: ov.name,
    type: ov.type,
    value: values[ov.name],
  }));
}

function validateUniforms(
  bindings: UniformBinding[],
  schema: MaterialSchema,
): void {
  const uniforms = Object.keys(schema.uniforms ?? {});
  for (const uniformName of uniforms) {
    const hasBinding = bindings.some((b) => b.name === uniformName);
    if (!hasBinding) {
      throw new EngineError(
        `Uniform "${uniformName}" not found in shader layout`,
        'PipelineMaterialLayout',
      );
    }
  }
}

function validateStorages(
  bindings: StorageBinding[],
  schema: MaterialSchema,
): void {
  const storages = Object.keys(schema.storages ?? {});
  for (const storageName of storages) {
    const hasBinding = bindings.some((b) => b.name === storageName);
    if (!hasBinding) {
      throw new EngineError(
        `Storage "${storageName}" not found in shader layout`,
        'PipelineMaterialLayout',
      );
    }
  }
}

function mapUniforms(
  descriptorSets: DescriptorSetInfo[],
  schema: MaterialSchema,
): UniformBinding[] {
  const uniforms = schema.uniforms ?? {};
  const bindings: UniformBinding[] = [];

  for (const uniformName of Object.keys(uniforms)) {
    const bindingInfo = findBinding(descriptorSets, uniformName);
    if (bindingInfo) {
      bindings.push({
        name: uniformName,
        set: bindingInfo.set,
        binding: bindingInfo.binding,
        descriptorType: bindingInfo.descriptorType,
      });
    }
  }

  return bindings;
}

function mapStorages(
  descriptorSets: DescriptorSetInfo[],
  schema: MaterialSchema,
): StorageBinding[] {
  const storages = schema.storages ?? {};
  const bindings: StorageBinding[] = [];

  for (const storageName of Object.keys(storages)) {
    const bindingInfo = findBinding(descriptorSets, storageName);
    if (bindingInfo) {
      bindings.push({
        name: storageName,
        set: bindingInfo.set,
        binding: bindingInfo.binding,
        descriptorType: bindingInfo.descriptorType,
      });
    }
  }

  return bindings;
}

function findBinding(
  descriptorSets: DescriptorSetInfo[],
  name: string,
): DescriptorBindingInfo | null {
  for (const set of descriptorSets) {
    for (const binding of set.bindings) {
      if (binding.name === name) return binding;
    }
  }
  return null;
}

function mapTopology(topology: Material['topology']): number {
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

function mapRasterizer(rasterizer: Rasterizer): RasterStateMeta {
  const depth = rasterizer.depthStencil;
  const blend = rasterizer.blend;
  const stencilFront = depth.stencilFront;
  const stencilBack = depth.stencilBack;
  return {
    polygonMode: mapPolygonMode(rasterizer.fillMode),
    cullMode: mapCullMode(rasterizer.cull),
    frontFace: mapFrontFace(rasterizer.frontFace),
    depthCompare: mapCompare(depth.depthCompare),
    depthWriteEnabled: depth.depthWriteEnabled,
    stencil: {
      front: mapStencil(stencilFront),
      back: mapStencil(stencilBack),
      readMask: depth.stencilReadMask.get(),
      writeMask: depth.stencilWriteMask.get(),
    },
    blend: {
      enabled: blend.enabled,
      color: mapBlendComponent(blend.color),
      alpha: mapBlendComponent(blend.alpha),
      writeMask: blend.writeMask.get(),
    },
    sampleCount: mapSampleCount(rasterizer.multisample.count),
  };
}

function mapPolygonMode(mode: Rasterizer['fillMode']): number {
  switch (mode) {
    case 'line':
      return VkPolygonMode.LINE;
    case 'point':
      return VkPolygonMode.POINT;
    case 'fill':
    default:
      return VkPolygonMode.FILL;
  }
}

function mapCullMode(mode: Rasterizer['cull']): number {
  switch (mode) {
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

function mapFrontFace(face: Rasterizer['frontFace']): number {
  return face === 'counter-clockwise'
    ? VkFrontFace.COUNTER_CLOCKWISE
    : VkFrontFace.CLOCKWISE;
}

function mapCompare(
  compare: Rasterizer['depthStencil']['depthCompare'],
): number {
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

function mapStencil(
  face: Rasterizer['depthStencil']['stencilFront'],
): StencilStateMeta {
  return {
    compare: mapCompare(face.compare),
    failOp: mapStencilOp(face.failOp),
    depthFailOp: mapStencilOp(face.depthFailOp),
    passOp: mapStencilOp(face.passOp),
  };
}

function mapStencilOp(
  op: Rasterizer['depthStencil']['stencilFront']['failOp'],
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

function mapBlendComponent(
  component: Rasterizer['blend']['color'],
): BlendComponentMeta {
  return {
    srcFactor: mapBlendFactor(component.srcFactor),
    dstFactor: mapBlendFactor(component.dstFactor),
    operation: mapBlendOp(component.operation),
  };
}

function mapBlendFactor(
  factor: Rasterizer['blend']['color']['srcFactor'],
): number {
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
      return VkBlendFactor.ONE_MINUS_CONSTANT_COLOR;
    default:
      return VkBlendFactor.ONE;
  }
}

function mapBlendOp(
  operation: Rasterizer['blend']['color']['operation'],
): number {
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
      return VkBlendOp.MAX;
    default:
      return VkBlendOp.ADD;
  }
}

function mapSampleCount(count: Rasterizer['multisample']['count']): number {
  const map: Record<number, number> = {
    1: VkSampleCountFlagBits.COUNT_1_BIT,
    2: VkSampleCountFlagBits.COUNT_2_BIT,
    4: VkSampleCountFlagBits.COUNT_4_BIT,
    8: VkSampleCountFlagBits.COUNT_8_BIT,
    16: VkSampleCountFlagBits.COUNT_16_BIT,
    32: VkSampleCountFlagBits.COUNT_32_BIT,
    64: VkSampleCountFlagBits.COUNT_64_BIT,
  };
  return map[count] ?? VkSampleCountFlagBits.COUNT_1_BIT;
}

function guessFormatStride(format: number): number {
  switch (format) {
    case VkFormat.R32_SFLOAT:
    case VkFormat.R32_SINT:
    case VkFormat.R32_UINT:
      return 4;
    case VkFormat.R32G32_SFLOAT:
    case VkFormat.R32G32_SINT:
    case VkFormat.R32G32_UINT:
      return 8;
    case VkFormat.R32G32B32_SFLOAT:
    case VkFormat.R32G32B32_SINT:
    case VkFormat.R32G32B32_UINT:
      return 12;
    case VkFormat.R32G32B32A32_SFLOAT:
    case VkFormat.R32G32B32A32_SINT:
    case VkFormat.R32G32B32A32_UINT:
      return 16;
    default:
      return 0;
  }
}
