// Material Builder System
export type {
  ScalarValue,
  Vec2,
  Vec3,
  Vec4,
  VectorValue,
  Mat2,
  Mat3,
  Mat4,
  MatrixValue,
  Color3,
  Color4,
  ColorValue,
  TextureValue,
  SamplerValue,
  TextureSamplerBinding,
  PropertyValue,
  PropertyDefinition,
  PropertyTypeMap,
} from './MaterialPropertyTypes';

export {
  PropertyType,
  property,
  validateProperty,
} from './MaterialPropertyTypes';

export type {
  MaterialPrimitive,
  MaterialSchema,
  MaterialDescriptor,
  ConstantProperties,
  MutableProperties,
  SchemaPropertyValues,
} from './MaterialSchema';

export {
  defineSchema,
  validateSchema,
  getSchemaDefaults,
  mergeWithDefaults,
} from './MaterialSchema';

export { Material, createMaterial } from './MaterialBuilder';

// RenderPass Types
export type {
  Format,
  SampleCount,
  LoadOp,
  StoreOp,
  ImageLayout,
  PipelineStage,
  AccessFlag,
  DependencyFlag,
  PipelineBindPoint,
  StageMask,
  AccessMask,
} from './RenderPassTypes';

export {
  isDepthFormat,
  hasStencilComponent,
  isColorFormat,
} from './RenderPassTypes';

// RenderPass Configuration
export type {
  AttachmentConfig,
  ClearValue,
  AttachmentReference,
  PreserveAttachment,
  SubpassConfig,
  SubpassDependency,
  RenderPassConfig,
} from './RenderPassConfig';

// RenderPass Builder
export { RenderPassBuilder } from './RenderPassBuilder';

// RenderPass Presets
export { RenderPassPresets } from './RenderPassPresets';
