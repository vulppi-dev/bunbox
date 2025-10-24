import type { FFIFunction } from 'bun:ffi';

/**
 * This callback is called on unrecoverable errors. It’s not safe to continue (Excluding _code Fatal::DebugCheck), inform the user and terminate the application.
 *
 * C ref: `virtual void fatal(const char *_filePath, uint16_t _line, Fatal::Enum _code, const char *_str)`
 */
export const bgfxFatalCallback = {
  args: ['cstring', 'u16', 'u32', 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Print debug message.
 *
 * C ref: `virtual void traceVargs(const char *_filePath, uint16_t _line, const char *_format, va_list _argList)`
 */
export const bgfxTraceArgsCallback = {
  args: ['cstring', 'u16', 'cstring', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Profiler region begin.
 *
 * C ref: `virtual void profilerBegin(const char *_name, uint32_t _abgr, const char *_filePath, uint16_t _line)`
 */
export const bgfxProfilerBeginCallback = {
  args: ['cstring', 'u32', 'cstring', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Profiler region begin with string literal name.
 *
 * C ref: `virtual void profilerBeginLiteral(const char *_name, uint32_t _abgr, const char *_filePath, uint16_t _line)`
 */
export const bgfxProfilerBeginLiteralCallback = {
  args: ['cstring', 'u32', 'cstring', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Profiler region end.
 *
 * C ref: `virtual void profilerEnd()`
 */
export const bgfxProfilerEndCallback = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the size of a cached item. Returns 0 if no cached item was found.
 *
 * C ref: `virtual uint32_t cacheReadSize(uint64_t _id)`
 */
export const bgfxCacheReadSizeCallback = {
  args: ['u64'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Read cached item.
 *
 * C ref: `virtual bool cacheRead(uint64_t _id, void *_data, uint32_t _size)`
 */
export const bgfxCacheReadCallback = {
  args: ['u64', 'ptr', 'u32'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Write cached item.
 *
 * C ref: `virtual void cacheWrite(uint64_t _id, const void *_data, uint32_t _size)`
 */
export const bgfxCacheWriteCallback = {
  args: ['u64', 'ptr', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Screenshot captured. Screenshot format is always 4-byte BGRA.
 *
 * C ref: `virtual void screenShot(const char *_filePath, uint32_t _width, uint32_t _height, uint32_t _pitch, const void *_data, uint32_t _size, bool _yflip)`
 */
export const bgfxScreenShotCallback = {
  args: ['cstring', 'u32', 'u32', 'u32', 'ptr', 'u32', 'bool'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Called when a video capture begins.
 *
 * C ref: `virtual void captureBegin(uint32_t _width, uint32_t _height, uint32_t _pitch, TextureFormat::Enum _format, bool _yflip)`
 */
export const bgfxCaptureBeginCallback = {
  args: ['u32', 'u32', 'u32', 'u32', 'bool'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Called when a video capture ends.
 *
 * C ref: `virtual void captureEnd()`
 */
export const bgfxCaptureEndCallback = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Captured frame.
 *
 * C ref: `virtual void captureFrame(const void *_data, uint32_t _size)`
 */
export const bgfxCaptureFrameCallback = {
  args: ['ptr', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;
