type FieldOptions<D> = {
  /**
   * Indicates whether the field is stored as a pointer in the underlying structure.
   *
   * @default false
   */
  isPointer?: boolean;
  default?: D;
};

export type InferField<D extends AllFields> = D extends { type: 'struct' }
  ? { [K in keyof D['fields']]: InferField<D['fields'][K]> }
  : D extends { type: 'array'; to: infer P }
    ? P extends AllFields
      ? InferField<P>[]
      : never
    : D extends {
          type: 'u8' | 'u16' | 'u32' | 'i8' | 'i16' | 'i32' | 'f32' | 'f64';
        }
      ? number
      : D extends { type: 'u64' | 'i64' }
        ? bigint
        : D extends { type: 'bool' }
          ? boolean
          : D extends { type: 'string' }
            ? string
            : D extends { type: 'void' }
              ? bigint
              : never;

export type AllFields =
  | Uint8Field
  | Uint16Field
  | Uint32Field
  | Uint64Field
  | Int8Field
  | Int16Field
  | Int32Field
  | Int64Field
  | Float32Field
  | Float64Field
  | BoolField
  | StringField
  | PointerAnyField
  | ArrayField<any>
  | StructField<any>;

/*** FIELDS ***/

export type Uint8Field = {
  type: 'u8';
  meta?: FieldOptions<number>;
};

export function u8<O extends FieldOptions<number>>(options?: O) {
  return {
    type: 'u8',
    meta: options,
  } satisfies Uint8Field;
}

export type Uint16Field = {
  type: 'u16';
  meta?: FieldOptions<number>;
};

export function u16<O extends FieldOptions<number>>(options?: O) {
  return {
    type: 'u16',
    meta: options,
  } satisfies Uint16Field;
}

export type Uint32Field = {
  type: 'u32';
  meta?: FieldOptions<number>;
};

export function u32<O extends FieldOptions<number>>(options?: O) {
  return {
    type: 'u32',
    meta: options,
  } satisfies Uint32Field;
}

export type Uint64Field = {
  type: 'u64';
  meta?: FieldOptions<bigint>;
};

export function u64<O extends FieldOptions<bigint>>(options?: O) {
  return {
    type: 'u64',
    meta: options,
  } satisfies Uint64Field;
}

export type Int8Field = {
  type: 'i8';
  meta?: FieldOptions<number>;
};

export function i8<O extends FieldOptions<number>>(options?: O) {
  return {
    type: 'i8',
    meta: options,
  } satisfies Int8Field;
}

export type Int16Field = {
  type: 'i16';
  meta?: FieldOptions<number>;
};

export function i16<O extends FieldOptions<number>>(options?: O) {
  return {
    type: 'i16',
    meta: options,
  } satisfies Int16Field;
}

export type Int32Field = {
  type: 'i32';
  meta?: FieldOptions<number>;
};

export function i32<O extends FieldOptions<number>>(options?: O) {
  return {
    type: 'i32',
    meta: options,
  } satisfies Int32Field;
}

export type Int64Field = {
  type: 'i64';
  meta?: FieldOptions<bigint>;
};

export function i64<O extends FieldOptions<bigint>>(options?: O) {
  return {
    type: 'i64',
    meta: options,
  } satisfies Int64Field;
}

export type Float32Field = {
  type: 'f32';
  meta?: FieldOptions<number>;
};

export function f32<O extends FieldOptions<number>>(options?: O) {
  return {
    type: 'f32',
    meta: options,
  } satisfies Float32Field;
}

export type Float64Field = {
  type: 'f64';
  meta?: FieldOptions<number>;
};

export function f64<O extends FieldOptions<number>>(options?: O) {
  return {
    type: 'f64',
    meta: options,
  } satisfies Float64Field;
}

export type BoolField = {
  type: 'bool';
  meta?: FieldOptions<boolean>;
};

export function bool<O extends FieldOptions<boolean>>(options?: O) {
  return {
    type: 'bool',
    meta: options,
  } satisfies BoolField;
}

export type StringField = {
  type: 'string';
  meta?: FieldOptions<string>;
};

export function string<O extends FieldOptions<string>>(options?: O) {
  return {
    type: 'string',
    meta: options,
  } satisfies StringField;
}

export type PointerAnyField = {
  type: 'void';
  meta?: FieldOptions<bigint>;
};

export function ptrAny<O extends FieldOptions<bigint>>(options?: O) {
  return {
    type: 'void',
    meta: options,
  } satisfies PointerAnyField;
}

export type ArrayField<P extends AllFields> = {
  type: 'array';
  to: P;
  meta?: FieldOptions<InferField<P>[]>;
};

export function array<
  P extends AllFields,
  O extends FieldOptions<InferField<P>[]>,
>(to: P, options?: O) {
  return {
    type: 'array',
    to,
    meta: options,
  } satisfies ArrayField<P>;
}

export type StructDesc = {
  [key: string]: AllFields;
};

export type StructField<D extends StructDesc> = {
  type: 'struct';
  fields: StructDesc;
  meta?: FieldOptions<InferField<{ type: 'struct'; fields: D }>>;
  isUnion?: boolean;
};

export function struct<
  D extends StructDesc,
  O extends FieldOptions<InferField<{ type: 'struct'; fields: D }>>,
>(desc: D, options: O) {
  return {
    type: 'struct',
    fields: desc,
    meta: options,
    isUnion: false,
  } satisfies StructField<D>;
}

export function union<
  D extends StructDesc,
  O extends FieldOptions<InferField<{ type: 'struct'; fields: D }>>,
>(desc: D, options: O) {
  return {
    type: 'struct',
    fields: desc,
    meta: options,
    isUnion: true,
  } satisfies StructField<D>;
}
