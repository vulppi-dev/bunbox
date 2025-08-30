import {
  AbstractStruct,
  type Pointer,
  type PrimitiveLabel,
  type StructSchema,
} from '@bunbox/struct'

export class NAPIStruct<
  TSchema extends StructSchema,
> extends AbstractStruct<TSchema> {
  protected override _ptr(buffer: ArrayBufferLike): Pointer {
    throw new Error('Method not implemented.')
  }
  protected override _read(
    pointer: Pointer,
    index: number,
    type: PrimitiveLabel,
  ) {
    throw new Error('Method not implemented.')
  }
  protected override _ptrToCstr(pointer: Pointer, length?: number): string {
    throw new Error('Method not implemented.')
  }
}
