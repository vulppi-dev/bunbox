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
 * Material primitive topology types (string-based for API agnosticism)
 */
export type MaterialPrimitive = 'triangles' | 'lines' | 'points';

/**
 * Schema defining both constant and mutable properties
 */
export type MaterialSchema = {
  /** Properties that cannot change after material creation */
  readonly constants?: Record<string, PropertyDefinition>;
  /** Properties that can be modified during runtime */
  readonly mutables?: Record<string, PropertyDefinition>;
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
  /** Shader source code (WGSL, GLSL, etc.) - can be a single string or per-stage */
  shader: ShaderHolder;
  /** Primitive topology */
  primitive?: MaterialPrimitive;
  /** Rasterizer state (depth, stencil, blend, etc.) */
  rasterizer?: Rasterizer;
  /** Material property schema */
  schema: TSchema;
} & (TSchema['constants'] extends Record<string, PropertyDefinition>
  ? {
      /** Constant property values (required if schema defines constants) */
      constants: Partial<SchemaPropertyValues<TSchema['constants']>>;
    }
  : {
      constants?: never;
    }) &
  (TSchema['mutables'] extends Record<string, PropertyDefinition>
    ? {
        /** Initial mutable property values (optional, uses defaults) */
        mutables?: Partial<SchemaPropertyValues<TSchema['mutables']>>;
      }
    : {
        mutables?: never;
      });

/**
 * Type-safe property accessor for constants
 */
export type ConstantProperties<TSchema extends MaterialSchema> =
  TSchema['constants'] extends Record<string, PropertyDefinition>
    ? Readonly<SchemaPropertyValues<TSchema['constants']>>
    : Record<string, never>;

/**
 * Type-safe property accessor for mutables
 */
export type MutableProperties<TSchema extends MaterialSchema> =
  TSchema['mutables'] extends Record<string, PropertyDefinition>
    ? SchemaPropertyValues<TSchema['mutables']>
    : Record<string, never>;

/**
 * Helper to define material schema with type inference
 */
export function defineSchema<
  TConstants extends Record<string, PropertyDefinition> = Record<
    string,
    PropertyDefinition
  >,
  TMutables extends Record<string, PropertyDefinition> = Record<
    string,
    PropertyDefinition
  >,
>(schema: {
  constants?: TConstants;
  mutables?: TMutables;
}): MaterialSchema & { constants?: TConstants; mutables?: TMutables } {
  return schema;
}

/**
 * Validate schema property definitions
 */
export function validateSchema(schema: MaterialSchema): boolean {
  const allKeys = [
    ...Object.keys(schema.constants ?? {}),
    ...Object.keys(schema.mutables ?? {}),
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
