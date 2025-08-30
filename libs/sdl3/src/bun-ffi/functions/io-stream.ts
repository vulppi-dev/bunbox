import type { FFIFunction } from 'bun:ffi';

export const IO_STREAM_BINDINGS = {
  SDL_LoadFile: { args: ['cstring', 'ptr'], returns: 'ptr' },
} as const satisfies Record<string, FFIFunction>;
