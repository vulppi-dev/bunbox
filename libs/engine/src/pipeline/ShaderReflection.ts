import {
  ResourceType,
  WgslReflect,
  type FunctionInfo,
  type TypeInfo,
  type VariableInfo,
} from 'wgsl_reflect';
import { VkDescriptorType, VkFormat, VkShaderStageFlagBits } from '@bunbox/vk';
import { EngineError } from '../errors';

export type ShaderStage = 'vertex' | 'fragment' | 'compute';

export type ShaderStageInfo = {
  stage: ShaderStage;
  entryPoint: string;
};

export type VertexAttributeInfo = {
  name: string;
  location: number;
  wgslType: string;
  vkFormat: number;
};

export type DescriptorBindingInfo = {
  set: number;
  binding: number;
  descriptorType: number;
  stageFlags: number;
  name: string;
};

export type DescriptorSetInfo = {
  setIndex: number;
  bindings: DescriptorBindingInfo[];
};

export type ShaderOverrideInfo = {
  name: string;
  id: number;
  type: string | null;
};

export type ShaderReflectionData = {
  vertexAttributes: VertexAttributeInfo[];
  descriptorSets: DescriptorSetInfo[];
  stages: ShaderStageInfo[];
  overrides: ShaderOverrideInfo[];
};

type ReflectionOptions = {
  vertexEntryPoint: string;
  fragmentEntryPoint?: string;
  reflectInstance?: WgslReflect;
};

const STAGE_TO_MASK: Record<ShaderStage, number> = {
  vertex: VkShaderStageFlagBits.VERTEX_BIT,
  fragment: VkShaderStageFlagBits.FRAGMENT_BIT,
  compute: VkShaderStageFlagBits.COMPUTE_BIT,
};

function normalizeTypeName(type: TypeInfo | null): string {
  if (!type) return 'unknown';
  // getTypeName exists on TypeInfo and yields canonical WGSL name.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return typeof (type as any).getTypeName === 'function'
    ? (type as any).getTypeName()
    : type.name;
}

function mapStageToMask(stage: ShaderStage): number {
  return STAGE_TO_MASK[stage];
}

function mapResourceToDescriptor(resource: VariableInfo): number {
  switch (resource.resourceType) {
    case ResourceType.Uniform:
      return VkDescriptorType.UNIFORM_BUFFER;
    case ResourceType.Storage:
      return VkDescriptorType.STORAGE_BUFFER;
    case ResourceType.Texture:
      return VkDescriptorType.SAMPLED_IMAGE;
    case ResourceType.Sampler:
      return VkDescriptorType.SAMPLER;
    case ResourceType.StorageTexture:
      return VkDescriptorType.STORAGE_IMAGE;
    default:
      return VkDescriptorType.UNIFORM_BUFFER;
  }
}

function parseVectorType(typeName: string): {
  components: number;
  scalar: 'float' | 'int' | 'uint';
} {
  const lowered = typeName.replace(/\s+/g, '').toLowerCase();
  let components = 1;
  let scalarRaw = lowered;

  const vecMatch = lowered.match(/^vec(\d)/);
  if (vecMatch) {
    components = Number(vecMatch[1]);
    if (lowered.includes('<')) {
      const inner = lowered.slice(lowered.indexOf('<') + 1, lowered.indexOf('>'));
      scalarRaw = inner;
    } else {
      scalarRaw = lowered.replace(/^vec\d/, '');
    }
  }

  if (scalarRaw.startsWith('u')) return { components, scalar: 'uint' };
  if (scalarRaw.startsWith('i')) return { components, scalar: 'int' };
  return { components, scalar: 'float' };
}

function mapTypeToVkFormat(typeName: string): number {
  const { components, scalar } = parseVectorType(typeName);
  if (components === 1) {
    switch (scalar) {
      case 'float':
        return VkFormat.R32_SFLOAT;
      case 'int':
        return VkFormat.R32_SINT;
      case 'uint':
        return VkFormat.R32_UINT;
    }
  }
  if (components === 2) {
    switch (scalar) {
      case 'float':
        return VkFormat.R32G32_SFLOAT;
      case 'int':
        return VkFormat.R32G32_SINT;
      case 'uint':
        return VkFormat.R32G32_UINT;
    }
  }
  if (components === 3) {
    switch (scalar) {
      case 'float':
        return VkFormat.R32G32B32_SFLOAT;
      case 'int':
        return VkFormat.R32G32B32_SINT;
      case 'uint':
        return VkFormat.R32G32B32_UINT;
    }
  }
  if (components === 4) {
    switch (scalar) {
      case 'float':
        return VkFormat.R32G32B32A32_SFLOAT;
      case 'int':
        return VkFormat.R32G32B32A32_SINT;
      case 'uint':
        return VkFormat.R32G32B32A32_UINT;
    }
  }
  return VkFormat.UNDEFINED;
}

function collectResources(
  fn: FunctionInfo | null,
  stage: ShaderStage,
  bindings: Map<string, DescriptorBindingInfo>,
): void {
  if (!fn) return;
  const stageMask = mapStageToMask(stage);
  for (const res of fn.resources) {
    const key = `${res.group}:${res.binding}`;
    const existing = bindings.get(key);
    if (existing) {
      existing.stageFlags |= stageMask;
      continue;
    }
    bindings.set(key, {
      set: res.group,
      binding: res.binding,
      descriptorType: mapResourceToDescriptor(res),
      stageFlags: stageMask,
      name: res.name,
    });
  }
}

function collectOverrides(
  fn: FunctionInfo | null,
  accumulator: Map<string, ShaderOverrideInfo>,
): void {
  if (!fn) return;
  for (const ov of fn.overrides) {
    const entry: ShaderOverrideInfo = {
      id: ov.id,
      name: ov.name,
      type: normalizeTypeName(ov.type),
    };
    const existing = accumulator.get(ov.name);
    if (!existing || existing.id === ov.id) {
      accumulator.set(ov.name, entry);
    }
  }
}

export function reflectShaderLayout(
  wgsl: string,
  options: ReflectionOptions,
): ShaderReflectionData {
  const reflector = options.reflectInstance ?? new WgslReflect(wgsl);

  const vertexFn = reflector.getFunctionInfo(options.vertexEntryPoint);
  if (!vertexFn) {
    throw new EngineError(
      `Vertex entry point not found: ${options.vertexEntryPoint}`,
      'PipelineReflection',
    );
  }
  const fragmentFn = options.fragmentEntryPoint
    ? reflector.getFunctionInfo(options.fragmentEntryPoint)
    : null;

  const stages: ShaderStageInfo[] = [
    { stage: 'vertex', entryPoint: options.vertexEntryPoint },
  ];
  if (fragmentFn && options.fragmentEntryPoint) {
    stages.push({ stage: 'fragment', entryPoint: options.fragmentEntryPoint });
  }

  const vertexAttributes: VertexAttributeInfo[] = vertexFn.inputs
    .filter((input) => input.locationType === 'location')
    .filter((input) => typeof input.location === 'number')
    .map((input) => {
      const typeName = normalizeTypeName(input.type);
      return {
        name: input.name,
        location: input.location as number,
        wgslType: typeName,
        vkFormat: mapTypeToVkFormat(typeName),
      };
    });

  const bindings = new Map<string, DescriptorBindingInfo>();
  collectResources(vertexFn, 'vertex', bindings);
  collectResources(fragmentFn, 'fragment', bindings);

  const sets = new Map<number, DescriptorBindingInfo[]>();
  for (const binding of bindings.values()) {
    const list = sets.get(binding.set) ?? [];
    list.push(binding);
    sets.set(binding.set, list);
  }

  const descriptorSets: DescriptorSetInfo[] = Array.from(sets.entries())
    .sort(([a], [b]) => a - b)
    .map(([setIndex, bindingsList]) => ({
      setIndex,
      bindings: bindingsList.sort((a, b) => a.binding - b.binding),
    }));

  const overrides = new Map<string, ShaderOverrideInfo>();
  collectOverrides(vertexFn, overrides);
  collectOverrides(fragmentFn, overrides);

  return {
    vertexAttributes,
    descriptorSets,
    stages,
    overrides: Array.from(overrides.values()),
  };
}
