import type { AbstractStruct } from '.';

export interface JSCallback {
  new (...args: any[]): any;
  readonly ptr: bigint | null;
}

export type PrimitiveLabel =
  | 'string'
  | 'i8'
  | 'i16'
  | 'i32'
  | 'i64'
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'f32'
  | 'f64'
  | 'boolean'
  | 'void';

export type Bytes = 1 | 2 | 4 | 8;

export type PtrToPrimitive = {
  type: 'array';
  to: PrimitiveLabel;
  length?: number; // inline array length (if provided)
};

export type PtrToStruct<S extends AbstractStruct<any>> = {
  type: 'struct';
  schema: S | 'self'; // constructor or 'self'
  isInline?: boolean; // inline struct (embedded bytes) vs pointer-to-struct
};

export type PtrToEnum<S> = {
  type: 'enum';
  enum: S;
  /** @default 'u32' */
  bytes?: 'u8' | 'u16' | 'u32' | 'u64';
};

export type PtrToCallback<S extends Function> = {
  type: 'fn';
  fn: S;
};

export type PropertySpec =
  | ({ order: number } & { type: PrimitiveLabel })
  | ({ order: number } & PtrToPrimitive)
  | ({ order: number } & PtrToStruct<any>)
  | ({ order: number } & PtrToEnum<any>)
  | ({ order: number } & PtrToCallback<any>);

export type TAView = ArrayBufferView;

export type TACtor<T extends TAView = TAView> = {
  new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): T;
  readonly BYTES_PER_ELEMENT: number;
};

export type ArrayValue<T extends PrimitiveLabel> = T extends 'string'
  ? string[] | bigint
  : T extends 'boolean'
    ? boolean[] | bigint
    : InstanceType<(typeof ArrayTypes)[T]> | bigint;

export type ValueOfSpec<S, SS extends StructSchema> = S extends {
  type: 'struct';
  schema: infer ST;
  isInline?: infer InLine;
}
  ? ST extends 'self'
    ? AbstractStruct<SS> | bigint
    : ST extends new (...args: any[]) => any
      ? InLine extends true
        ? InstanceType<ST>
        : InstanceType<ST> | bigint
      : bigint
  : S extends { type: 'enum'; enum: infer P }
    ? P extends {}
      ? P[keyof P] | number
      : never
    : S extends { type: 'array'; to: infer P }
      ? P extends PrimitiveLabel
        ? ArrayValue<P>
        : never
      : S extends { type: 'fn'; fn: infer P }
        ? P extends (...args: any[]) => any
          ? (P & JSCallback) | null
          : never
        : S extends { type: infer T }
          ? T extends 'void'
            ? bigint
            : T extends 'string'
              ? string
              : T extends 'i64' | 'u64'
                ? bigint
                : T extends
                      | 'i8'
                      | 'i16'
                      | 'i32'
                      | 'u8'
                      | 'u16'
                      | 'u32'
                      | 'f32'
                      | 'f64'
                  ? number
                  : T extends 'boolean'
                    ? boolean
                    : never
          : never;

export type StructSchema = Readonly<Record<string, PropertySpec>>;

export type PrimitiveBuffers = InstanceType<
  (typeof ArrayTypes)[keyof typeof ArrayTypes]
>;

export const ArrayTypes = {
  string: BigUint64Array<ArrayBufferLike>,
  i8: Int8Array<ArrayBufferLike>,
  i16: Int16Array<ArrayBufferLike>,
  i32: Int32Array<ArrayBufferLike>,
  i64: BigInt64Array<ArrayBufferLike>,
  u8: Uint8Array<ArrayBufferLike>,
  u16: Uint16Array<ArrayBufferLike>,
  u32: Uint32Array<ArrayBufferLike>,
  u64: BigUint64Array<ArrayBufferLike>,
  f32: Float32Array<ArrayBufferLike>,
  f64: Float64Array<ArrayBufferLike>,
  boolean: Uint8Array<ArrayBufferLike>,
  void: BigUint64Array<ArrayBufferLike>,
} as const satisfies Record<PrimitiveLabel, TACtor>;

// Pointer size/alignment (LP64 on x86_64)
export const PTR_SIZE = 8 as const;

export type MetaLabel = PrimitiveLabel | 'enum' | 'struct' | 'fn' | 'array';

export const TYPE_BYTES: Record<MetaLabel, Bytes> = {
  boolean: 1,
  i8: 1,
  i16: 2,
  i32: 4,
  i64: 8,
  u8: 1,
  u16: 2,
  u32: 4,
  u64: 8,
  f32: 4,
  f64: 8,
  enum: 4, // typical; make configurable per field if needed
  string: PTR_SIZE, // pointer to C string
  void: PTR_SIZE, // treated as pointer-sized storage
  struct: PTR_SIZE, // non-inline struct fields are pointers
  fn: PTR_SIZE, // function pointer
  array: PTR_SIZE, // dynamic arrays use a pointer
};
