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
  ShaderSources,
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
  #label: string;
  #shader: ShaderSources;
  #entries: ShaderEntries;
  #primitive: MaterialPrimitive;
  #rasterizer: Rasterizer;
  #schema: TSchema;
  #constants: Record<string, unknown>;
  #mutables: Record<string, unknown>;
  #hash: string = '';

  constructor(descriptor: MaterialDescriptor<TSchema>) {
    super();

    // Validate schema
    validateSchema(descriptor.schema);

    this.#label = descriptor.label ?? '';
    this.#shader = descriptor.shader;
    this.#entries = descriptor.entries;
    this.#primitive = descriptor.primitive ?? 'triangles';
    this.#rasterizer = descriptor.rasterizer ?? new Rasterizer();
    this.#schema = descriptor.schema;

    // Initialize constants with defaults
    this.#constants = this.#initializeProperties(
      this.#schema.constants ?? {},
      descriptor.constants as Record<string, unknown> | undefined,
    );

    // Initialize mutables with defaults
    this.#mutables = this.#initializeProperties(
      this.#schema.mutables ?? {},
      descriptor.mutables as Record<string, unknown> | undefined,
    );

    this.#updateHash();
    this.markAsDirty();
  }

  #initializeProperties(
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

  #updateHash(): void {
    this.#hash = sha(
      JSON.stringify({
        shader: this.#shader,
        entries: this.#entries,
        primitive: this.#primitive,
        rasterizer: this.#rasterizer.hash,
        constants: this.#constants,
      }),
      'hex',
    );
  }

  // Public getters
  get label(): string {
    return this.#label;
  }

  get shader(): ShaderSources {
    return this.#shader;
  }

  get entries(): ShaderEntries {
    return this.#entries;
  }

  get primitive(): MaterialPrimitive {
    return this.#primitive;
  }

  get rasterizer(): Rasterizer {
    return this.#rasterizer;
  }

  get hash(): string {
    return this.#hash;
  }

  get schema(): TSchema {
    return this.#schema;
  }

  /**
   * Get constant properties (read-only)
   */
  get constants(): Readonly<ConstantProperties<TSchema>> {
    return Object.freeze({ ...this.#constants }) as ConstantProperties<TSchema>;
  }

  /**
   * Get mutable properties (read-only snapshot)
   */
  get mutables(): Readonly<MutableProperties<TSchema>> {
    return Object.freeze({ ...this.#mutables }) as MutableProperties<TSchema>;
  }

  // Setters
  set label(value: string) {
    if (this.#label === value) return;
    this.#label = value;
    this.markAsDirty();
  }

  set primitive(value: MaterialPrimitive) {
    if (this.#primitive === value) return;
    this.#primitive = value;
    this.#updateHash();
    this.markAsDirty();
  }

  /**
   * Get a constant property value (type-safe)
   */
  getConstant<K extends keyof ConstantProperties<TSchema>>(
    key: K,
  ): ConstantProperties<TSchema>[K] {
    return this.#constants[key as string] as ConstantProperties<TSchema>[K];
  }

  /**
   * Get a mutable property value (type-safe)
   */
  getMutable<K extends keyof MutableProperties<TSchema>>(
    key: K,
  ): MutableProperties<TSchema>[K] {
    return this.#mutables[key as string] as MutableProperties<TSchema>[K];
  }

  /**
   * Set a mutable property value (type-safe)
   */
  setMutable<K extends keyof MutableProperties<TSchema>>(
    key: K,
    value: MutableProperties<TSchema>[K],
  ): this {
    const definitions = this.#schema.mutables;
    if (!definitions || !(key in definitions)) {
      throw new Error(`Property '${String(key)}' is not a mutable property`);
    }

    const def = definitions[key as string]!;
    if (!validateProperty(def, value)) {
      throw new Error(
        `Invalid value for property '${String(key)}': expected type '${def.type}'`,
      );
    }

    if (this.#mutables[key as string] === value) return this;

    this.#mutables[key as string] = value;
    return this.markAsDirty();
  }

  /**
   * Set multiple mutable properties at once
   */
  setMutables(values: Partial<MutableProperties<TSchema>>): this {
    let changed = false;

    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined) {
        const definitions = this.#schema.mutables;
        if (!definitions || !(key in definitions)) {
          throw new Error(`Property '${key}' is not a mutable property`);
        }

        const def = definitions[key]!;
        if (!validateProperty(def, value)) {
          throw new Error(
            `Invalid value for property '${key}': expected type '${def.type}'`,
          );
        }

        if (this.#mutables[key] !== value) {
          this.#mutables[key] = value;
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
      label: this.#label,
      shader: this.#shader,
      entries: this.#entries,
      primitive: this.#primitive,
      rasterizer: this.#rasterizer.clone(),
      schema: this.#schema,
      constants: { ...this.#constants },
      mutables: { ...this.#mutables },
    } as unknown as MaterialDescriptor<TSchema>);
    cloned.markAsDirty();
    return cloned;
  }

  /**
   * Check equality with another material (based on hash)
   */
  equals(other: Material<TSchema>): boolean {
    return (
      this.#hash === other.#hash &&
      JSON.stringify(this.#mutables) === JSON.stringify(other.#mutables)
    );
  }

  /**
   * Copy values from another material
   */
  copy(other: Material<TSchema>): this {
    if (this.equals(other)) return this;

    this.#label = other.#label;
    this.#primitive = other.#primitive;
    this.#rasterizer.copy(other.#rasterizer);
    this.#mutables = { ...other.#mutables };

    this.#updateHash();
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
