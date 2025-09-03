import type { FFIFunction } from 'bun:ffi'

export const IO_STREAM_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CloseIO
   */
  SDL_CloseIO: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FlushIO
   */
  SDL_FlushIO: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetIOProperties
   */
  SDL_GetIOProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetIOSize
   */
  SDL_GetIOSize: { args: ['ptr'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetIOStatus
   */
  SDL_GetIOStatus: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IOFromConstMem
   */
  SDL_IOFromConstMem: { args: ['ptr', 'u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IOFromDynamicMem
   */
  SDL_IOFromDynamicMem: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IOFromFile
   */
  SDL_IOFromFile: { args: ['cstring', 'cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IOFromMem
   */
  SDL_IOFromMem: { args: ['ptr', 'u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IOprintf
   */
  SDL_IOprintf: { args: ['ptr', 'cstring'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IOvprintf
   */
  SDL_IOvprintf: { args: ['ptr', 'cstring', 'ptr'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadFile
   */
  SDL_LoadFile: { args: ['cstring', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadFile_IO
   */
  SDL_LoadFile_IO: { args: ['ptr', 'ptr', 'bool'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenIO
   */
  SDL_OpenIO: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadIO
   */
  SDL_ReadIO: { args: ['ptr', 'ptr', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadS16BE
   */
  SDL_ReadS16BE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadS16LE
   */
  SDL_ReadS16LE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadS32BE
   */
  SDL_ReadS32BE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadS32LE
   */
  SDL_ReadS32LE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadS64BE
   */
  SDL_ReadS64BE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadS64LE
   */
  SDL_ReadS64LE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadS8
   */
  SDL_ReadS8: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadU16BE
   */
  SDL_ReadU16BE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadU16LE
   */
  SDL_ReadU16LE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadU32BE
   */
  SDL_ReadU32BE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadU32LE
   */
  SDL_ReadU32LE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadU64BE
   */
  SDL_ReadU64BE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadU64LE
   */
  SDL_ReadU64LE: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadU8
   */
  SDL_ReadU8: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SaveFile
   */
  SDL_SaveFile: { args: ['cstring', 'ptr', 'u64'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SaveFile_IO
   */
  SDL_SaveFile_IO: { args: ['ptr', 'ptr', 'u64', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SeekIO
   */
  SDL_SeekIO: { args: ['ptr', 'i64', 'u32'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TellIO
   */
  SDL_TellIO: { args: ['ptr'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteIO
   */
  SDL_WriteIO: { args: ['ptr', 'ptr', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteS16BE
   */
  SDL_WriteS16BE: { args: ['ptr', 'i16'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteS16LE
   */
  SDL_WriteS16LE: { args: ['ptr', 'i16'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteS32BE
   */
  SDL_WriteS32BE: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteS32LE
   */
  SDL_WriteS32LE: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteS64BE
   */
  SDL_WriteS64BE: { args: ['ptr', 'i64'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteS64LE
   */
  SDL_WriteS64LE: { args: ['ptr', 'i64'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteS8
   */
  SDL_WriteS8: { args: ['ptr', 'i8'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteU16BE
   */
  SDL_WriteU16BE: { args: ['ptr', 'u16'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteU16LE
   */
  SDL_WriteU16LE: { args: ['ptr', 'u16'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteU32BE
   */
  SDL_WriteU32BE: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteU32LE
   */
  SDL_WriteU32LE: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteU64BE
   */
  SDL_WriteU64BE: { args: ['ptr', 'u64'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteU64LE
   */
  SDL_WriteU64LE: { args: ['ptr', 'u64'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteU8
   */
  SDL_WriteU8: { args: ['ptr', 'u8'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>
