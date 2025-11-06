/**
 * Type-safe material property system for agnostic material definitions.
 * Supports modern graphics APIs (Vulkan, WebGPU, Direct3D 12, Metal).
 */

import type { Sampler } from '../resources/Sampler';
import type { TextureImage, TextureCube, Texture3D } from '../resources/index';

/**
 * Scalar value types (float, int, uint, bool)
 */
export type ScalarValue = number | boolean;

/**
 * Vector types with component count
 */
export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];
export type Vec4 = readonly [number, number, number, number];

export type VectorValue = Vec2 | Vec3 | Vec4;

/**
 * Matrix types (column-major layout)
 */
export type Mat2 = readonly [Vec2, Vec2];
export type Mat3 = readonly [Vec3, Vec3, Vec3];
export type Mat4 = readonly [Vec4, Vec4, Vec4, Vec4];

export type MatrixValue = Mat2 | Mat3 | Mat4;

/**
 * Color types (RGB, RGBA)
 */
export type Color3 = readonly [number, number, number];
export type Color4 = readonly [number, number, number, number];
export type ColorValue = Color3 | Color4;

/**
 * Texture types
 */
export type TextureValue = TextureImage | TextureCube | Texture3D;

/**
 * Sampler type
 */
export type SamplerValue = Sampler;

/**
 * Combined texture + sampler binding
 */
export type TextureSamplerBinding = {
  readonly texture: TextureValue;
  readonly sampler: SamplerValue;
};

/**
 * All possible property value types
 */
export type PropertyValue =
  | ScalarValue
  | VectorValue
  | MatrixValue
  | ColorValue
  | TextureValue
  | SamplerValue
  | TextureSamplerBinding;

/**
 * Property type discriminators for runtime type checking
 */
export enum PropertyType {
  Scalar = 'scalar',
  Vec2 = 'vec2',
  Vec3 = 'vec3',
  Vec4 = 'vec4',
  Mat2 = 'mat2',
  Mat3 = 'mat3',
  Mat4 = 'mat4',
  Color3 = 'color3',
  Color4 = 'color4',
  Texture = 'texture',
  Sampler = 'sampler',
  TextureSampler = 'texture-sampler',
}

/**
 * Property type mapping for type inference
 */
export interface PropertyTypeMap {
  [PropertyType.Scalar]: ScalarValue;
  [PropertyType.Vec2]: Vec2;
  [PropertyType.Vec3]: Vec3;
  [PropertyType.Vec4]: Vec4;
  [PropertyType.Mat2]: Mat2;
  [PropertyType.Mat3]: Mat3;
  [PropertyType.Mat4]: Mat4;
  [PropertyType.Color3]: Color3;
  [PropertyType.Color4]: Color4;
  [PropertyType.Texture]: TextureValue;
  [PropertyType.Sampler]: SamplerValue;
  [PropertyType.TextureSampler]: TextureSamplerBinding;
}

/**
 * Property definition with type and default value
 */
export type PropertyDefinition<T extends PropertyType = PropertyType> = {
  readonly type: T;
  readonly defaultValue?: PropertyTypeMap[T];
  readonly label?: string;
};

/**
 * Helper to create property definitions with type inference
 */
export const property = {
  scalar: (
    defaultValue?: ScalarValue,
    label?: string,
  ): PropertyDefinition<PropertyType.Scalar> => ({
    type: PropertyType.Scalar,
    defaultValue,
    label,
  }),

  vec2: (
    defaultValue?: Vec2,
    label?: string,
  ): PropertyDefinition<PropertyType.Vec2> => ({
    type: PropertyType.Vec2,
    defaultValue,
    label,
  }),

  vec3: (
    defaultValue?: Vec3,
    label?: string,
  ): PropertyDefinition<PropertyType.Vec3> => ({
    type: PropertyType.Vec3,
    defaultValue,
    label,
  }),

  vec4: (
    defaultValue?: Vec4,
    label?: string,
  ): PropertyDefinition<PropertyType.Vec4> => ({
    type: PropertyType.Vec4,
    defaultValue,
    label,
  }),

  mat2: (
    defaultValue?: Mat2,
    label?: string,
  ): PropertyDefinition<PropertyType.Mat2> => ({
    type: PropertyType.Mat2,
    defaultValue,
    label,
  }),

  mat3: (
    defaultValue?: Mat3,
    label?: string,
  ): PropertyDefinition<PropertyType.Mat3> => ({
    type: PropertyType.Mat3,
    defaultValue,
    label,
  }),

  mat4: (
    defaultValue?: Mat4,
    label?: string,
  ): PropertyDefinition<PropertyType.Mat4> => ({
    type: PropertyType.Mat4,
    defaultValue,
    label,
  }),

  color3: (
    defaultValue?: Color3,
    label?: string,
  ): PropertyDefinition<PropertyType.Color3> => ({
    type: PropertyType.Color3,
    defaultValue,
    label,
  }),

  color4: (
    defaultValue?: Color4,
    label?: string,
  ): PropertyDefinition<PropertyType.Color4> => ({
    type: PropertyType.Color4,
    defaultValue,
    label,
  }),

  texture: (
    defaultValue?: TextureValue,
    label?: string,
  ): PropertyDefinition<PropertyType.Texture> => ({
    type: PropertyType.Texture,
    defaultValue,
    label,
  }),

  sampler: (
    defaultValue?: SamplerValue,
    label?: string,
  ): PropertyDefinition<PropertyType.Sampler> => ({
    type: PropertyType.Sampler,
    defaultValue,
    label,
  }),

  textureSampler: (
    defaultValue?: TextureSamplerBinding,
    label?: string,
  ): PropertyDefinition<PropertyType.TextureSampler> => ({
    type: PropertyType.TextureSampler,
    defaultValue,
    label,
  }),
};

/**
 * Runtime type validators
 */
export const isScalar = (value: unknown): value is ScalarValue =>
  typeof value === 'number' || typeof value === 'boolean';

export const isVec2 = (value: unknown): value is Vec2 =>
  Array.isArray(value) &&
  value.length === 2 &&
  value.every((v) => typeof v === 'number');

export const isVec3 = (value: unknown): value is Vec3 =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every((v) => typeof v === 'number');

export const isVec4 = (value: unknown): value is Vec4 =>
  Array.isArray(value) &&
  value.length === 4 &&
  value.every((v) => typeof v === 'number');

export const isColor3 = (value: unknown): value is Color3 => isVec3(value);

export const isColor4 = (value: unknown): value is Color4 => isVec4(value);

export const isTexture = (value: unknown): value is TextureValue =>
  value instanceof Object &&
  ('width' in value || 'height' in value || 'format' in value);

export const isSampler = (value: unknown): value is SamplerValue =>
  value instanceof Object && 'minFilter' in value && 'magFilter' in value;

export const isTextureSampler = (
  value: unknown,
): value is TextureSamplerBinding =>
  value !== null &&
  typeof value === 'object' &&
  'texture' in value &&
  'sampler' in value &&
  isTexture((value as TextureSamplerBinding).texture) &&
  isSampler((value as TextureSamplerBinding).sampler);

/**
 * Validate property value against its type definition
 */
export function validateProperty<T extends PropertyType>(
  definition: PropertyDefinition<T>,
  value: unknown,
): value is PropertyTypeMap[T] {
  switch (definition.type) {
    case PropertyType.Scalar:
      return isScalar(value);
    case PropertyType.Vec2:
      return isVec2(value);
    case PropertyType.Vec3:
      return isVec3(value);
    case PropertyType.Vec4:
      return isVec4(value);
    case PropertyType.Color3:
      return isColor3(value);
    case PropertyType.Color4:
      return isColor4(value);
    case PropertyType.Texture:
      return isTexture(value);
    case PropertyType.Sampler:
      return isSampler(value);
    case PropertyType.TextureSampler:
      return isTextureSampler(value);
    default:
      return false;
  }
}
