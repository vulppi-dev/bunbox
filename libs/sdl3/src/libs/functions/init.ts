import type { FFIFunction } from 'bun:ffi';

export const INIT_BINDINGS = {
  SDL_Init: { args: ['u32'], returns: 'i32' },
  SDL_Quit: { args: [], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
