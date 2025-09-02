import {
  AbstractStruct,
  type Bytes,
  type PrimitiveLabel,
  type StructSchema,
} from '@bunbox/struct'
import { CString, ptr, read, type Pointer } from 'bun:ffi'

export type { PrimitiveLabel, StructSchema } from '@bunbox/struct'

export abstract class BunStruct<
  TSchema extends StructSchema,
> extends AbstractStruct<TSchema> {
  protected override _ptr(
    buffer: ArrayBufferLike | NodeJS.TypedArray<ArrayBufferLike>,
  ): bigint {
    return BigInt(ptr(buffer))
  }

  protected override _read(
    pointer: bigint,
    index: number,
    type: PrimitiveLabel,
  ) {
    const p = Number(pointer) as Pointer

    switch (type) {
      case 'i8':
        return read.i8(p, index)
      case 'u8':
        return read.u8(p, index)
      case 'boolean':
        return !!read.u8(p, index)
      case 'i16':
        return read.i16(p, index)
      case 'u16':
        return read.u16(p, index)
      case 'i32':
        return read.i32(p, index)
      case 'u32':
        return read.u32(p, index)
      case 'f32':
        return read.f32(p, index)
      case 'i64':
        return read.i64(p, index)
      case 'u64':
        return read.u64(p, index)
      case 'f64':
        return read.f64(p, index)
      case 'void':
      case 'string':
        return read.intptr(p, index)
      default:
        throw new Error(`Unsupported type: ${type}`)
    }
  }

  protected override _pack(): Bytes {
    return 8 // x64
  }

  protected override _toString(pointer: bigint): string {
    return new CString(Number(pointer) as Pointer).toString()
  }

  get bunPointer() {
    return Number(this.pointer) as Pointer
  }
}
