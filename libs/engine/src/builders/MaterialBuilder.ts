/**
 * Type-safe material builder with agnostic property system.
 * Provides compile-time type checking for property assignments.
 */

import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import type {
  MaterialDescriptor,
  MaterialPrimitive,
  MaterialSchema,
  ConstantProperties,
  MutableProperties,
  string,
  ShaderEntries,
} from './MaterialSchema';
import { validateSchema } from './MaterialSchema';
import type { PropertyDefinition } from './MaterialPropertyTypes';
import { validateProperty } from './MaterialPropertyTypes';
import { Rasterizer } from '../resources/Rasterizer';
import { triangleShaderSource } from '../shaders';

/**
 * Type-safe material with constant and mutable properties
 */
export class Material<
  TSchema extends MaterialSchema = MaterialSchema,
> extends DirtyState {
  private __label: string;
  private __shader: string;
  private __entries: ShaderEntries;
  private __primitive: MaterialPrimitive;
  private __rasterizer: Rasterizer;
  private __schema: TSchema;
  private __constants: Record<string, unknown>;
  private __mutables: Record<string, unknown>;
  private __hash: string = '';

  constructor(descriptor: MaterialDescriptor<TSchema>) {
    super();

    // Validate schema
    validateSchema(descriptor.schema);

    this.__label = descriptor.label ?? '';
    this.__shader = descriptor.shader;
    this.__entries = descriptor.entries;
    this.__primitive = descriptor.primitive ?? 'triangles';
    this.__rasterizer = descriptor.rasterizer ?? new Rasterizer();
    this.__schema = descriptor.schema;

    // Initialize constants with defaults
    this.__constants = this.__initializeProperties(
      this.__schema.constants ?? {},
      descriptor.constants as Record<string, unknown> | undefined,
    );

    // Initialize mutables with defaults
    this.__mutables = this.__initializeProperties(
      this.__schema.mutables ?? {},
      descriptor.mutables as Record<string, unknown> | undefined,
    );

    this.__updateHash();
    this.markAsDirty();
  }

  private __initializeProperties(
    definitions: Record<string, PropertyDefinition>,
    values?: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, def] of Object.entries(definitions)) {
      const providedValue = values?.[key];
      const valueToUse = providedValue ?? def.defaultValue;

      if (valueToUse !== undefined) {
        if (!validateProperty(def, valueToUse)) {
          throw new Error(
            `Invalid value for property '${key}': expected type '${def.type}', got ${typeof valueToUse}`,
          );
        }
        result[key] = valueToUse;
      }
    }

    return result;
  }

  private __updateHash(): void {
    this.__hash = sha(
      JSON.stringify({
        shader: this.__shader,
        entries: this.__entries,
        primitive: this.__primitive,
        rasterizer: this.__rasterizer.hash,
        constants: this.__constants,
      }),
      'hex',
    );
  }

  // Public getters
  get label(): string {
    return this.__label;
  }

  get shader(): string {
    return this.__shader;
  }

  get entries(): ShaderEntries {
    return this.__entries;
  }

  get primitive(): MaterialPrimitive {
    return this.__primitive;
  }

  get rasterizer(): Rasterizer {
    return this.__rasterizer;
  }

  get hash(): string {
    return this.__hash;
  }

  get schema(): TSchema {
    return this.__schema;
  }

  /**
   * Get constant properties (read-only)
   */
  get constants(): Readonly<ConstantProperties<TSchema>> {
    return Object.freeze({
      ...this.__constants,
    }) as ConstantProperties<TSchema>;
  }

  /**
   * Get mutable properties (read-only snapshot)
   */
  get mutables(): Readonly<MutableProperties<TSchema>> {
    return Object.freeze({ ...this.__mutables }) as MutableProperties<TSchema>;
  }

  // Setters
  set label(value: string) {
    if (this.__label === value) return;
    this.__label = value;
    this.markAsDirty();
  }

  set primitive(value: MaterialPrimitive) {
    if (this.__primitive === value) return;
    this.__primitive = value;
    this.__updateHash();
    this.markAsDirty();
  }

  /**
   * Get a constant property value (type-safe)
   */
  getConstant<K extends keyof ConstantProperties<TSchema>>(
    key: K,
  ): ConstantProperties<TSchema>[K] {
    return this.__constants[key as string] as ConstantProperties<TSchema>[K];
  }

  /**
   * Get a mutable property value (type-safe)
   */
  getMutable<K extends keyof MutableProperties<TSchema>>(
    key: K,
  ): MutableProperties<TSchema>[K] {
    return this.__mutables[key as string] as MutableProperties<TSchema>[K];
  }

  /**
   * Set a mutable property value (type-safe)
   */
  setMutable<K extends keyof MutableProperties<TSchema>>(
    key: K,
    value: MutableProperties<TSchema>[K],
  ): this {
    const definitions = this.__schema.mutables;
    if (!definitions || !(key in definitions)) {
      throw new Error(`Property '${String(key)}' is not a mutable property`);
    }

    const def = definitions[key as string]!;
    if (!validateProperty(def, value)) {
      throw new Error(
        `Invalid value for property '${String(key)}': expected type '${def.type}'`,
      );
    }

    if (this.__mutables[key as string] === value) return this;

    this.__mutables[key as string] = value;
    return this.markAsDirty();
  }

  /**
   * Set multiple mutable properties at once
   */
  setMutables(values: Partial<MutableProperties<TSchema>>): this {
    let changed = false;

    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined) {
        const definitions = this.__schema.mutables;
        if (!definitions || !(key in definitions)) {
          throw new Error(`Property '${key}' is not a mutable property`);
        }

        const def = definitions[key]!;
        if (!validateProperty(def, value)) {
          throw new Error(
            `Invalid value for property '${key}': expected type '${def.type}'`,
          );
        }

        if (this.__mutables[key] !== value) {
          this.__mutables[key] = value;
          changed = true;
        }
      }
    }

    return changed ? this.markAsDirty() : this;
  }

  /**
   * Create a deep clone of this material
   */
  clone(): Material<TSchema> {
    const cloned = new Material<TSchema>({
      label: this.__label,
      shader: this.__shader,
      entries: this.__entries,
      primitive: this.__primitive,
      rasterizer: this.__rasterizer.clone(),
      schema: this.__schema,
      constants: { ...this.__constants },
      mutables: { ...this.__mutables },
    } as unknown as MaterialDescriptor<TSchema>);
    cloned.markAsDirty();
    return cloned;
  }

  /**
   * Check equality with another material (based on hash)
   */
  equals(other: Material<TSchema>): boolean {
    return (
      this.__hash === other.__hash &&
      JSON.stringify(this.__mutables) === JSON.stringify(other.__mutables)
    );
  }

  /**
   * Copy values from another material
   */
  copy(other: Material<TSchema>): this {
    if (this.equals(other)) return this;

    this.__label = other.__label;
    this.__primitive = other.__primitive;
    this.__rasterizer.copy(other.__rasterizer);
    this.__mutables = { ...other.__mutables };

    this.__updateHash();
    return this.markAsDirty();
  }
}

/**
 * Helper function to create a type-safe material
 */
export function createMaterial<TSchema extends MaterialSchema>(
  descriptor: MaterialDescriptor<TSchema>,
): Material<TSchema> {
  return new Material(descriptor);
}

/**
 * Simple material creation helper with default schema
 */
export function createSimpleMaterial() {
  return new Material({
    label: 'SimpleMaterial',
    shader: triangleShaderSource,
    entries: { vertex: 'vertex_main', fragment: 'fragment_main' },
    schema: {},
    primitive: 'triangles',
  });
}
