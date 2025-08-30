import {
  AbstractStruct,
  type Pointer,
  type PrimitiveLabel,
  type StructSchema,
} from '@bunbox/struct'
import { CString, ptr, read } from 'bun:ffi'

export class BunStruct<
  TSchema extends StructSchema,
> extends AbstractStruct<TSchema> {
  protected override _ptr(
    buffer: ArrayBufferLike | NodeJS.TypedArray<ArrayBufferLike>,
  ): Pointer {
    return ptr(buffer)
  }

  protected override _read(
    pointer: Pointer,
    index: number,
    type: PrimitiveLabel,
  ) {
    switch (type) {
      case 'i8':
        return read.i8(pointer, index)
      case 'u8':
        return read.u8(pointer, index)
      case 'boolean':
        return !!read.u8(pointer, index)
      case 'i16':
        return read.i16(pointer, index)
      case 'u16':
        return read.u16(pointer, index)
      case 'i32':
        return read.i32(pointer, index)
      case 'u32':
        return read.u32(pointer, index)
      case 'f32':
        return read.f32(pointer, index)
      case 'i64':
        return read.i64(pointer, index)
      case 'u64':
        return read.u64(pointer, index)
      case 'f64':
        return read.f64(pointer, index)
      case 'void':
      case 'string':
        return read.ptr(pointer, index)
      default:
        throw new Error(`Unsupported type: ${type}`)
    }
  }

  protected override _ptrToCstr(pointer: Pointer, length?: number): string {
    return new CString(pointer, length).toString()
  }
}
