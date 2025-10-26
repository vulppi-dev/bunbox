export type InferField<D extends AllFields> = D extends { isPointer: true }
  ? bigint
  : D extends StructField<infer Desc>
    ? { [K in keyof Desc]: InferField<Desc[K]> } & { toJSON(): string }
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
  | StructField<any>
  | PointerField<any>;

export type FieldType = AllFields['type'];

/*** FIELDS ***/

export type Uint8Field = {
  type: 'u8';
  default?: number;
  isPointer?: boolean;
};

export function u8(defaultValue?: number) {
  return {
    type: 'u8',
    default: defaultValue,
  } satisfies Uint8Field;
}

export type Uint16Field = {
  type: 'u16';
  default?: number;
  isPointer?: boolean;
};

export function u16(defaultValue?: number) {
  return {
    type: 'u16',
    default: defaultValue,
  } satisfies Uint16Field;
}

export type Uint32Field = {
  type: 'u32';
  default?: number;
  isPointer?: boolean;
};

export function u32(defaultValue?: number) {
  return {
    type: 'u32',
    default: defaultValue,
  } satisfies Uint32Field;
}

export type Uint64Field = {
  type: 'u64';
  default?: bigint;
  isPointer?: boolean;
};

export function u64(defaultValue?: bigint) {
  return {
    type: 'u64',
    default: defaultValue,
  } satisfies Uint64Field;
}

export type Int8Field = {
  type: 'i8';
  default?: number;
  isPointer?: boolean;
};

export function i8(defaultValue?: number) {
  return {
    type: 'i8',
    default: defaultValue,
  } satisfies Int8Field;
}

export type Int16Field = {
  type: 'i16';
  default?: number;
  isPointer?: boolean;
};

export function i16(defaultValue?: number) {
  return {
    type: 'i16',
    default: defaultValue,
  } satisfies Int16Field;
}

export type Int32Field = {
  type: 'i32';
  default?: number;
  isPointer?: boolean;
};

export function i32(defaultValue?: number) {
  return {
    type: 'i32',
    default: defaultValue,
  } satisfies Int32Field;
}

export type Int64Field = {
  type: 'i64';
  default?: bigint;
  isPointer?: boolean;
};

export function i64(defaultValue?: bigint) {
  return {
    type: 'i64',
    default: defaultValue,
  } satisfies Int64Field;
}

export type Float32Field = {
  type: 'f32';
  default?: number;
  isPointer?: boolean;
};

export function f32(defaultValue?: number) {
  return {
    type: 'f32',
    default: defaultValue,
  } satisfies Float32Field;
}

export type Float64Field = {
  type: 'f64';
  default?: number;
  isPointer?: boolean;
};

export function f64(defaultValue?: number) {
  return {
    type: 'f64',
    default: defaultValue,
  } satisfies Float64Field;
}

export type BoolField = {
  type: 'bool';
  default?: boolean;
  isPointer?: boolean;
};

export function bool(defaultValue?: boolean) {
  return {
    type: 'bool',
    default: defaultValue,
  } satisfies BoolField;
}

export type StringField = {
  type: 'string';
  default?: string;
  isPointer?: boolean;
};

export function string(defaultValue?: string) {
  return {
    type: 'string',
    default: defaultValue,
  } satisfies StringField;
}

export type PointerAnyField = {
  type: 'void';
  isPointer?: boolean;
};

export function ptrAny() {
  return {
    type: 'void',
  } satisfies PointerAnyField;
}

export type ArrayField<P extends AllFields> = {
  type: 'array';
  to: P;
  length?: number;
  isPointer?: boolean;
};

export function array<P extends AllFields>(to: P, length: number = 1) {
  return {
    type: 'array',
    to,
    length: Math.max(1, length),
  } satisfies ArrayField<P>;
}

export type StructDesc = {
  [key: string]: AllFields;
};

export type StructField<D extends StructDesc> = {
  type: 'struct';
  fields: D;
  isUnion?: boolean;
  isPointer?: boolean;
};

export function struct<D extends StructDesc>(desc: D) {
  return {
    type: 'struct',
    fields: desc,
    isUnion: false,
  } satisfies StructField<D>;
}

export function union<D extends StructDesc>(desc: D) {
  return {
    type: 'struct',
    fields: desc,
    isUnion: true,
  } satisfies StructField<D>;
}

export type PointerField<F extends AllFields> = F & {
  isPointer: true;
};

export function pointer<F extends AllFields>(field: F): PointerField<F> {
  return {
    ...(field as any),
    isPointer: true,
  } as PointerField<F>;
}
