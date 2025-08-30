import type { FFIFunction } from 'bun:ffi';

export const EVENTS_BINDINGS = {
  SDL_PollEvent: { args: ['ptr'], returns: 'i32' },
} as const satisfies Record<string, FFIFunction>;
