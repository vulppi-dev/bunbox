import type { FFIFunction } from 'bun:ffi';

export const VIDEO_BINDINGS = {
  SDL_CreateWindow: { args: ['cstring', 'i32', 'i32', 'u32'], returns: 'ptr' },
  SDL_DestroyWindow: { args: ['ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
