/* BGFX typedefs */

import type { Pointer } from 'bun:ffi';

// BGFX MARK: Handles

export type ViewID = number;

export type DynamicIndexBufferHandle = Pointer & {
  _brand: 'DynamicIndexBuffer';
};
export type DynamicVertexBufferHandle = Pointer & {
  _brand: 'DynamicVertexBuffer';
};
export type FrameBufferHandle = Pointer & { _brand: 'FrameBuffer' };
export type IndexBufferHandle = Pointer & { _brand: 'IndexBuffer' };
export type IndirectBufferHandle = Pointer & { _brand: 'IndirectBuffer' };
export type OcclusionQueryHandle = Pointer & { _brand: 'OcclusionQuery' };
export type ProgramHandle = Pointer & { _brand: 'Program' };
export type ShaderHandle = Pointer & { _brand: 'Shader' };
export type TextureHandle = Pointer & { _brand: 'Texture' };
export type UniformHandle = Pointer & { _brand: 'Uniform' };
export type VertexBufferHandle = Pointer & { _brand: 'VertexBuffer' };
export type VertexLayoutHandle = Pointer & { _brand: 'VertexLayout' };

// BGFX MARK: Callback Types

/** The function pointer type for fatal callback. */
export type FatalFunction = (
  thisPtr: Pointer,
  filePath: string,
  line: number,
  code: number,
  message: string,
) => void;

/** The function pointer type for trace callback. */
export type TraceFunction = (
  thisPtr: Pointer,
  filePath: string,
  line: number,
  format: string,
  args: Pointer,
) => void;

/** The function pointer type for profiler begin callback. */
export type ProfilerBeginFunction = (
  thisPtr: Pointer,
  name: string,
  abgr: number,
  filePath: string,
  line: number,
) => void;

/** The function pointer type for profiler begin literal callback. */
export type ProfilerBeginLiteralFunction = (
  thisPtr: Pointer,
  name: string,
  abgr: number,
  filePath: string,
  line: number,
) => void;

/** The function pointer type for profiler end callback. */
export type ProfilerEndFunction = (thisPtr: Pointer) => void;

/** The function pointer type for cache read size callback. */
export type CacheReadSizeFunction = (thisPtr: Pointer, id: bigint) => number;

/** The function pointer type for cache read callback. */
export type CacheReadFunction = (
  thisPtr: Pointer,
  id: bigint,
  data: Pointer,
  size: number,
) => boolean;

/** The function pointer type for cache write callback. */
export type CacheWriteFunction = (
  thisPtr: Pointer,
  id: bigint,
  data: Pointer,
  size: number,
) => void;

/** The function pointer type for screen shot callback. */
export type ScreenShotFunction = (
  thisPtr: Pointer,
  filePath: string,
  width: number,
  height: number,
  pitch: number,
  data: Pointer,
  size: number,
  yFlip: boolean,
) => void;

/** The function pointer type for capture begin callback. */
export type CaptureBeginFunction = (
  thisPtr: Pointer,
  width: number,
  height: number,
  pitch: number,
  format: number,
  yFlip: boolean,
) => void;

/** The function pointer type for capture end callback. */
export type CaptureEndFunction = (thisPtr: Pointer) => void;

/** The function pointer type for capture frame callback. */
export type CaptureFrameFunction = (
  thisPtr: Pointer,
  data: Pointer,
  size: number,
) => void;

/** Memory release callback. */
export type ReleaseFn = (ptr: Pointer, userData: Pointer) => void;
