import type { FFIFunction } from 'bun:ffi';

export const TIMER_BINDINGS = {
  SDL_Delay: { args: ['u32'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
