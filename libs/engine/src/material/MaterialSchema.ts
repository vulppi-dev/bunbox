/**
 * Material schema definition system separating constant (immutable) and
 * mutable properties with full type inference support.
 */

import type {
  PropertyDefinition,
  PropertyTypeMap,
} from './MaterialPropertyTypes';
import type { Rasterizer } from '../resources/Rasterizer';
import type { ShaderHolder } from '../core';

/**
 * Material primitive topology types.
 * Maps to `primitive` state in pipeline descriptor.
 */
export type PrimitiveTopology =
  | 'point-list'
  | 'line-list'
  | 'line-strip'
  | 'triangle-list'
  | 'triangle-strip';

/**
 * Schema defining material properties.
 */
export type MaterialSchema = {
  /**
   * Pipeline overridable constants.
   * These are constant values specialized at pipeline creation time.
   */
  readonly overrides?: Record<string, PropertyDefinition>;

  /**
   * Uniform buffer properties.
   * These can be updated efficiently during runtime.
   */
  readonly uniforms?: Record<string, PropertyDefinition>;

  /**
   * Push constants.
   * Small amount of data (usually 128 bytes max) that can be updated very frequently (per draw call).
   */
  readonly pushConstants?: Record<string, PropertyDefinition>;
};

/**
 * Extract property value types from schema
 */
export type SchemaPropertyValues<T extends Record<string, PropertyDefinition>> =
  {
    [K in keyof T]: PropertyTypeMap[T[K]['type']];
  };

/**
 * Material descriptor for creating materials with full type inference
 */
export type MaterialDescriptor<
  TSchema extends MaterialSchema = MaterialSchema,
> = {
  /** Optional label for debugging */
  label?: string;
  /** Shader source code */
  shader: ShaderHolder;
  /** Primitive topology */
  topology?: PrimitiveTopology;
  /** Rasterizer state */
  rasterizationState?: Rasterizer;
  /** Material property schema */
  schema: TSchema;
} & (TSchema['overrides'] extends Record<string, PropertyDefinition>
  ? {
      /** Override values (required if schema defines overrides) */
      overrides: Partial<SchemaPropertyValues<TSchema['overrides']>>;
    }
  : {
      overrides?: never;
    }) &
  (TSchema['uniforms'] extends Record<string, PropertyDefinition>
    ? {
        /** Initial uniform values (optional, uses defaults) */
        uniforms?: Partial<SchemaPropertyValues<TSchema['uniforms']>>;
      }
    : {
        uniforms?: never;
      }) &
  (TSchema['pushConstants'] extends Record<string, PropertyDefinition>
    ? {
        /** Initial push constant values (optional, uses defaults) */
        pushConstants?: Partial<SchemaPropertyValues<TSchema['pushConstants']>>;
      }
    : {
        pushConstants?: never;
      });

/**
 * Type-safe property accessor for overrides
 */
export type OverrideProperties<TSchema extends MaterialSchema> =
  TSchema['overrides'] extends Record<string, PropertyDefinition>
    ? Readonly<SchemaPropertyValues<TSchema['overrides']>>
    : Record<string, never>;

/**
 * Type-safe property accessor for uniforms
 */
export type UniformProperties<TSchema extends MaterialSchema> =
  TSchema['uniforms'] extends Record<string, PropertyDefinition>
    ? SchemaPropertyValues<TSchema['uniforms']>
    : Record<string, never>;

/**
 * Type-safe property accessor for push constants
 */
export type PushConstantProperties<TSchema extends MaterialSchema> =
  TSchema['pushConstants'] extends Record<string, PropertyDefinition>
    ? SchemaPropertyValues<TSchema['pushConstants']>
    : Record<string, never>;

/**
 * Helper to define material schema with type inference
 */
export function defineSchema<
  TOverrides extends Record<string, PropertyDefinition> = Record<
    string,
    PropertyDefinition
  >,
  TUniforms extends Record<string, PropertyDefinition> = Record<
    string,
    PropertyDefinition
  >,
  TPushConstants extends Record<string, PropertyDefinition> = Record<
    string,
    PropertyDefinition
  >,
>(schema: {
  overrides?: TOverrides;
  uniforms?: TUniforms;
  pushConstants?: TPushConstants;
}): MaterialSchema & {
  overrides?: TOverrides;
  uniforms?: TUniforms;
  pushConstants?: TPushConstants;
} {
  return schema;
}

/**
 * Validate schema property definitions
 */
export function validateSchema(schema: MaterialSchema): boolean {
  const allKeys = [
    ...Object.keys(schema.overrides ?? {}),
    ...Object.keys(schema.uniforms ?? {}),
    ...Object.keys(schema.pushConstants ?? {}),
  ];
  const uniqueKeys = new Set(allKeys);

  if (uniqueKeys.size !== allKeys.length) {
    throw new Error('Schema contains duplicate property names');
  }

  return true;
}

/**
 * Get default values for schema properties
 */
export function getSchemaDefaults<T extends Record<string, PropertyDefinition>>(
  definitions: T,
): Partial<SchemaPropertyValues<T>> {
  const defaults: Record<string, unknown> = {};

  for (const [key, def] of Object.entries(definitions)) {
    if (def.defaultValue !== undefined) {
      defaults[key] = def.defaultValue;
    }
  }

  return defaults as Partial<SchemaPropertyValues<T>>;
}

/**
 * Merge provided values with defaults
 */
export function mergeWithDefaults<T extends Record<string, PropertyDefinition>>(
  definitions: T,
  values?: Partial<SchemaPropertyValues<T>>,
): SchemaPropertyValues<T> {
  const defaults = getSchemaDefaults(definitions);
  return { ...defaults, ...values } as SchemaPropertyValues<T>;
}
