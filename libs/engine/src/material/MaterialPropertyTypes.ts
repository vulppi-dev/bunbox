/**
 * Type-safe material property system for agnostic material definitions.
 * Supports modern graphics APIs (Vulkan, WebGPU, Direct3D 12, Metal).
 */

import { Matrix3, Matrix4, Vector2, Vector3, Vector4, Color } from '../math';
import { Sampler, Texture3D, TextureBase, TextureCube } from '../resources';

/**
 * 32-bit floating-point scalar.
 * Maps to `f32` in WGSL.
 */
export type F32 = number;

/**
 * 32-bit signed integer scalar.
 * Maps to `i32` in WGSL.
 */
export type I32 = number;

/**
 * 32-bit unsigned integer scalar.
 * Maps to `u32` in WGSL.
 */
export type U32 = number;

/**
 * Boolean scalar.
 * Maps to `bool` in WGSL.
 */
export type Bool = boolean;

/**
 * 2-component vector of 32-bit floats.
 * Maps to `vec2f` (or `vec2<f32>`) in WGSL.
 */
export type Vec2f = Vector2;

/**
 * 3-component vector of 32-bit floats.
 * Maps to `vec3f` (or `vec3<f32>`) in WGSL.
 */
export type Vec3f = Vector3;

/**
 * 4-component vector of 32-bit floats.
 * Maps to `vec4f` (or `vec4<f32>`) in WGSL.
 */
export type Vec4f = Vector4;

/**
 * 3x3 matrix of 32-bit floats.
 * Maps to `mat3x3f` (or `mat3x3<f32>`) in WGSL.
 */
export type Mat3x3f = Matrix3;

/**
 * 4x4 matrix of 32-bit floats.
 * Maps to `mat4x4f` (or `mat4x4<f32>`) in WGSL.
 */
export type Mat4x4f = Matrix4;

/**
 * RGBA color (4 components).
 * Maps to `vec4f` in WGSL but semantically distinct for color pickers/spaces.
 */
export type ColorValue = Color;

/**
 * 2D Texture.
 * Maps to `texture_2d<f32>` in WGSL.
 */
export type Texture2DValue = TextureBase;

/**
 * 3D Texture.
 * Maps to `texture_3d<f32>` in WGSL.
 */
export type Texture3DValue = Texture3D;

/**
 * Cube Texture.
 * Maps to `texture_cube<f32>` in WGSL.
 */
export type TextureCubeValue = TextureCube;

/**
 * Sampler state.
 * Maps to `sampler` or `sampler_comparison` in WGSL.
 */
export type SamplerValue = Sampler;

/**
 * All possible property value types
 */
export type PropertyValue =
  | F32
  | I32
  | U32
  | Bool
  | Vec2f
  | Vec3f
  | Vec4f
  | Mat3x3f
  | Mat4x4f
  | ColorValue
  | Texture2DValue
  | Texture3DValue
  | TextureCubeValue
  | SamplerValue;

/**
 * Property type discriminators for runtime type checking
 */
export enum PropertyType {
  F32 = 'f32',
  I32 = 'i32',
  U32 = 'u32',
  Bool = 'bool',
  Vec2f = 'vec2f',
  Vec3f = 'vec3f',
  Vec4f = 'vec4f',
  Mat3x3f = 'mat3x3f',
  Mat4x4f = 'mat4x4f',
  Color = 'color',
  Texture2D = 'texture_2d',
  Texture3D = 'texture_3d',
  TextureCube = 'texture_cube',
  Sampler = 'sampler',
}

/**
 * Property type mapping for type inference
 */
export interface PropertyTypeMap {
  [PropertyType.F32]: F32;
  [PropertyType.I32]: I32;
  [PropertyType.U32]: U32;
  [PropertyType.Bool]: Bool;
  [PropertyType.Vec2f]: Vec2f;
  [PropertyType.Vec3f]: Vec3f;
  [PropertyType.Vec4f]: Vec4f;
  [PropertyType.Mat3x3f]: Mat3x3f;
  [PropertyType.Mat4x4f]: Mat4x4f;
  [PropertyType.Color]: ColorValue;
  [PropertyType.Texture2D]: Texture2DValue;
  [PropertyType.Texture3D]: Texture3DValue;
  [PropertyType.TextureCube]: TextureCubeValue;
  [PropertyType.Sampler]: SamplerValue;
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
  /**
   * Defines a 32-bit floating-point scalar property.
   * @param defaultValue Default value (number)
   * @param label Optional label for UI
   */
  f32: (
    defaultValue?: F32,
    label?: string,
  ): PropertyDefinition<PropertyType.F32> => ({
    type: PropertyType.F32,
    defaultValue,
    label,
  }),

  /**
   * Defines a 32-bit signed integer scalar property.
   * @param defaultValue Default value (integer number)
   * @param label Optional label for UI
   */
  i32: (
    defaultValue?: I32,
    label?: string,
  ): PropertyDefinition<PropertyType.I32> => ({
    type: PropertyType.I32,
    defaultValue,
    label,
  }),

  /**
   * Defines a 32-bit unsigned integer scalar property.
   * @param defaultValue Default value (positive integer number)
   * @param label Optional label for UI
   */
  u32: (
    defaultValue?: U32,
    label?: string,
  ): PropertyDefinition<PropertyType.U32> => ({
    type: PropertyType.U32,
    defaultValue,
    label,
  }),

  /**
   * Defines a boolean property.
   * @param defaultValue Default value (boolean)
   * @param label Optional label for UI
   */
  bool: (
    defaultValue?: Bool,
    label?: string,
  ): PropertyDefinition<PropertyType.Bool> => ({
    type: PropertyType.Bool,
    defaultValue,
    label,
  }),

  /**
   * Defines a 2-component float vector property.
   * @param defaultValue Default value (Vector2)
   * @param label Optional label for UI
   */
  vec2f: (
    defaultValue?: Vec2f,
    label?: string,
  ): PropertyDefinition<PropertyType.Vec2f> => ({
    type: PropertyType.Vec2f,
    defaultValue,
    label,
  }),

  /**
   * Defines a 3-component float vector property.
   * @param defaultValue Default value (Vector3)
   * @param label Optional label for UI
   */
  vec3f: (
    defaultValue?: Vec3f,
    label?: string,
  ): PropertyDefinition<PropertyType.Vec3f> => ({
    type: PropertyType.Vec3f,
    defaultValue,
    label,
  }),

  /**
   * Defines a 4-component float vector property.
   * @param defaultValue Default value (Vector4)
   * @param label Optional label for UI
   */
  vec4f: (
    defaultValue?: Vec4f,
    label?: string,
  ): PropertyDefinition<PropertyType.Vec4f> => ({
    type: PropertyType.Vec4f,
    defaultValue,
    label,
  }),

  /**
   * Defines a 3x3 float matrix property.
   * @param defaultValue Default value (Matrix3)
   * @param label Optional label for UI
   */
  mat3x3f: (
    defaultValue?: Mat3x3f,
    label?: string,
  ): PropertyDefinition<PropertyType.Mat3x3f> => ({
    type: PropertyType.Mat3x3f,
    defaultValue,
    label,
  }),

  /**
   * Defines a 4x4 float matrix property.
   * @param defaultValue Default value (Matrix4)
   * @param label Optional label for UI
   */
  mat4x4f: (
    defaultValue?: Mat4x4f,
    label?: string,
  ): PropertyDefinition<PropertyType.Mat4x4f> => ({
    type: PropertyType.Mat4x4f,
    defaultValue,
    label,
  }),

  /**
   * Defines a color property (RGBA).
   * @param defaultValue Default value (Color)
   * @param label Optional label for UI
   */
  color: (
    defaultValue?: ColorValue,
    label?: string,
  ): PropertyDefinition<PropertyType.Color> => ({
    type: PropertyType.Color,
    defaultValue,
    label,
  }),

  /**
   * Defines a 2D texture property.
   * @param defaultValue Default value (TextureBase)
   * @param label Optional label for UI
   */
  texture2d: (
    defaultValue?: Texture2DValue,
    label?: string,
  ): PropertyDefinition<PropertyType.Texture2D> => ({
    type: PropertyType.Texture2D,
    defaultValue,
    label,
  }),

  /**
   * Defines a 3D texture property.
   * @param defaultValue Default value (Texture3D)
   * @param label Optional label for UI
   */
  texture3d: (
    defaultValue?: Texture3DValue,
    label?: string,
  ): PropertyDefinition<PropertyType.Texture3D> => ({
    type: PropertyType.Texture3D,
    defaultValue,
    label,
  }),

  /**
   * Defines a cube texture property.
   * @param defaultValue Default value (TextureCube)
   * @param label Optional label for UI
   */
  textureCube: (
    defaultValue?: TextureCubeValue,
    label?: string,
  ): PropertyDefinition<PropertyType.TextureCube> => ({
    type: PropertyType.TextureCube,
    defaultValue,
    label,
  }),

  /**
   * Defines a sampler property.
   * @param defaultValue Default value (Sampler)
   * @param label Optional label for UI
   */
  sampler: (
    defaultValue?: SamplerValue,
    label?: string,
  ): PropertyDefinition<PropertyType.Sampler> => ({
    type: PropertyType.Sampler,
    defaultValue,
    label,
  }),
};

/**
 * Runtime type validators
 */
export const isF32 = (value: unknown): value is F32 =>
  typeof value === 'number';

export const isI32 = (value: unknown): value is I32 =>
  typeof value === 'number' && Number.isInteger(value);

export const isU32 = (value: unknown): value is U32 =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

export const isBool = (value: unknown): value is Bool =>
  typeof value === 'boolean';

export const isVec2f = (value: unknown): value is Vec2f =>
  value instanceof Vector2;

export const isVec3f = (value: unknown): value is Vec3f =>
  value instanceof Vector3;

export const isVec4f = (value: unknown): value is Vec4f =>
  value instanceof Vector4;

export const isMat3x3f = (value: unknown): value is Mat3x3f =>
  value instanceof Matrix3;

export const isMat4x4f = (value: unknown): value is Mat4x4f =>
  value instanceof Matrix4;

export const isColor = (value: unknown): value is ColorValue =>
  value instanceof Color;

export const isTexture2D = (value: unknown): value is Texture2DValue =>
  value instanceof TextureBase && (value as any)._kind() === '2d';

export const isTexture3D = (value: unknown): value is Texture3DValue =>
  value instanceof Texture3D;

export const isTextureCube = (value: unknown): value is TextureCubeValue =>
  value instanceof TextureCube;

export const isSampler = (value: unknown): value is SamplerValue =>
  value instanceof Sampler;

/**
 * Validate property value against its type definition
 */
export function validateProperty<T extends PropertyType>(
  definition: PropertyDefinition<T>,
  value: unknown,
): value is PropertyTypeMap[T] {
  switch (definition.type) {
    case PropertyType.F32:
      return isF32(value);
    case PropertyType.I32:
      return isI32(value);
    case PropertyType.U32:
      return isU32(value);
    case PropertyType.Bool:
      return isBool(value);
    case PropertyType.Vec2f:
      return isVec2f(value);
    case PropertyType.Vec3f:
      return isVec3f(value);
    case PropertyType.Vec4f:
      return isVec4f(value);
    case PropertyType.Mat3x3f:
      return isMat3x3f(value);
    case PropertyType.Mat4x4f:
      return isMat4x4f(value);
    case PropertyType.Color:
      return isColor(value);
    case PropertyType.Texture2D:
      return isTexture2D(value);
    case PropertyType.Texture3D:
      return isTexture3D(value);
    case PropertyType.TextureCube:
      return isTextureCube(value);
    case PropertyType.Sampler:
      return isSampler(value);
    default:
      return false;
  }
}
