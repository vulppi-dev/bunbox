/**
 * Type-safe material builder with agnostic property system.
 * Provides compile-time type checking for property assignments.
 */

import { DirtyState } from '@bunbox/utils';
import type { ShaderHolder } from '../core';
import { Rasterizer } from '../resources/Rasterizer';
import type {
  PropertyDefinition,
  PropertyTypeMap,
} from './MaterialPropertyTypes';
import { validateProperty } from './MaterialPropertyTypes';
import type {
  MaterialDescriptor,
  MaterialSchema,
  OverrideProperties,
  PrimitiveTopology,
  UniformProperties,
} from './MaterialSchema';
import { validateSchema } from './MaterialSchema';

/**
 * Type-safe material with overrides and uniforms.
 */
export class Material<
  TSchema extends MaterialSchema = MaterialSchema,
> extends DirtyState {
  private __label: string;
  private __shader: ShaderHolder;
  private __topology: PrimitiveTopology;
  private __rasterizationState: Rasterizer;
  private __schema: TSchema;
  private __overrides: Record<string, unknown>;
  private __uniforms: Record<string, unknown>;

  constructor(descriptor: MaterialDescriptor<TSchema>) {
    super();

    // Validate schema
    validateSchema(descriptor.schema);

    this.__label = descriptor.label ?? '';
    this.__shader = descriptor.shader;
    this.__topology = descriptor.topology ?? 'triangle-list';
    this.__rasterizationState =
      descriptor.rasterizationState ?? new Rasterizer();
    this.__schema = descriptor.schema;

    // Initialize overrides with defaults
    this.__overrides = this.__initializeProperties(
      this.__schema.overrides ?? {},
      descriptor.overrides as Record<string, unknown> | undefined,
    );

    // Initialize uniforms with defaults
    this.__uniforms = this.__initializeProperties(
      this.__schema.uniforms ?? {},
      descriptor.uniforms as Record<string, unknown> | undefined,
    );

    this.markAsDirty();
  }

  /**
   * Start building a new material.
   */
  static builder(shader: ShaderHolder): MaterialBuilder {
    return new MaterialBuilder(shader);
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

  // Public getters
  get label(): string {
    return this.__label;
  }

  get shader(): ShaderHolder {
    return this.__shader;
  }

  get topology(): PrimitiveTopology {
    return this.__topology;
  }

  get rasterizationState(): Rasterizer {
    return this.__rasterizationState;
  }

  get schema(): TSchema {
    return this.__schema;
  }

  /**
   * Get override properties (read-only)
   */
  get overrides(): Readonly<OverrideProperties<TSchema>> {
    return Object.freeze({
      ...this.__overrides,
    }) as OverrideProperties<TSchema>;
  }

  /**
   * Get uniform properties (read-only snapshot)
   */
  get uniforms(): Readonly<UniformProperties<TSchema>> {
    return Object.freeze({ ...this.__uniforms }) as UniformProperties<TSchema>;
  }

  // Setters
  set label(value: string) {
    if (this.__label === value) return;
    this.__label = value;
    this.markAsDirty();
  }

  set topology(value: PrimitiveTopology) {
    if (this.__topology === value) return;
    this.__topology = value;
    this.markAsDirty();
  }

  /**
   * Get an override property value (type-safe)
   */
  getOverride<K extends keyof OverrideProperties<TSchema>>(
    key: K,
  ): OverrideProperties<TSchema>[K] {
    return this.__overrides[key as string] as OverrideProperties<TSchema>[K];
  }

  /**
   * Get a uniform property value (type-safe)
   */
  getUniform<K extends keyof UniformProperties<TSchema>>(
    key: K,
  ): UniformProperties<TSchema>[K] {
    return this.__uniforms[key as string] as UniformProperties<TSchema>[K];
  }

  /**
   * Set a uniform property value (type-safe)
   */
  setUniform<K extends keyof UniformProperties<TSchema>>(
    key: K,
    value: UniformProperties<TSchema>[K],
  ): this {
    const definitions = this.__schema.uniforms;
    if (!definitions || !(key in definitions)) {
      throw new Error(`Property '${String(key)}' is not a uniform property`);
    }

    const def = definitions[key as string]!;
    if (!validateProperty(def, value)) {
      throw new Error(
        `Invalid value for property '${String(key)}': expected type '${def.type}'`,
      );
    }

    if (this.__uniforms[key as string] === value) return this;

    this.__uniforms[key as string] = value;
    return this.markAsDirty();
  }

  /**
   * Set multiple uniform properties at once
   */
  setUniforms(values: Partial<UniformProperties<TSchema>>): this {
    let changed = false;

    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined) {
        const definitions = this.__schema.uniforms;
        if (!definitions || !(key in definitions)) {
          throw new Error(`Property '${key}' is not a uniform property`);
        }

        const def = definitions[key]!;
        if (!validateProperty(def, value)) {
          throw new Error(
            `Invalid value for property '${key}': expected type '${def.type}'`,
          );
        }

        if (this.__uniforms[key] !== value) {
          this.__uniforms[key] = value;
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
      topology: this.__topology,
      rasterizationState: this.__rasterizationState.clone(),
      schema: this.__schema,
      overrides: { ...this.__overrides },
      uniforms: { ...this.__uniforms },
    } as unknown as MaterialDescriptor<TSchema>);
    cloned.markAsDirty();
    return cloned;
  }

  /**
   * Copy values from another material
   */
  copy(other: Material<TSchema>): this {
    this.__label = other.__label;
    this.__topology = other.__topology;
    this.__rasterizationState.copy(other.__rasterizationState);
    this.__uniforms = { ...other.__uniforms };

    return this.markAsDirty();
  }
}

/**
 * Fluent builder for constructing Materials.
 */
export class MaterialBuilder<
  TOverrides extends Record<string, PropertyDefinition> = {},
  TUniforms extends Record<string, PropertyDefinition> = {},
> {
  private __label?: string;
  private __shader: ShaderHolder;
  private __topology: PrimitiveTopology = 'triangle-list';
  private __rasterizationState = new Rasterizer();

  private __overrides: Record<string, PropertyDefinition> = {};
  private __uniforms: Record<string, PropertyDefinition> = {};

  private __overrideValues: Record<string, unknown> = {};
  private __uniformValues: Record<string, unknown> = {};

  constructor(shader: ShaderHolder) {
    this.__shader = shader;
  }

  setLabel(label: string): this {
    this.__label = label;
    return this;
  }

  setTopology(topology: PrimitiveTopology): this {
    this.__topology = topology;
    return this;
  }

  setRasterizationState(state: Rasterizer): this {
    this.__rasterizationState = state;
    return this;
  }

  /**
   * Add a pipeline overridable constant.
   */
  addOverride<K extends string, T extends PropertyDefinition>(
    key: K,
    definition: T,
    value?: PropertyTypeMap[T['type']],
  ): MaterialBuilder<TOverrides & Record<K, T>, TUniforms> {
    this.__overrides[key] = definition;
    if (value !== undefined) {
      this.__overrideValues[key] = value;
    }
    return this as any;
  }

  /**
   * Add a uniform property.
   */
  addUniform<K extends string, T extends PropertyDefinition>(
    key: K,
    definition: T,
    value?: PropertyTypeMap[T['type']],
  ): MaterialBuilder<TOverrides, TUniforms & Record<K, T>> {
    this.__uniforms[key] = definition;
    if (value !== undefined) {
      this.__uniformValues[key] = value;
    }
    return this as any;
  }

  /**
   * Build the Material instance.
   */
  build(): Material<{
    overrides: TOverrides;
    uniforms: TUniforms;
  }> {
    const schema = {
      overrides: this.__overrides,
      uniforms: this.__uniforms,
    } as any;

    return new Material({
      label: this.__label,
      shader: this.__shader,
      topology: this.__topology,
      rasterizationState: this.__rasterizationState,
      schema,
      overrides: this.__overrideValues,
      uniforms: this.__uniformValues,
    });
  }
}
