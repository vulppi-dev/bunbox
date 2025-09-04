import type { FFIFunction } from 'bun:ffi';

export const PROCESS_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateProcess
   */
  SDL_CreateProcess: { args: ['ptr', 'bool'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateProcessWithProperties
   */
  SDL_CreateProcessWithProperties: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyProcess
   */
  SDL_DestroyProcess: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetProcessInput
   */
  SDL_GetProcessInput: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetProcessOutput
   */
  SDL_GetProcessOutput: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetProcessProperties
   */
  SDL_GetProcessProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_KillProcess
   */
  SDL_KillProcess: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadProcess
   */
  SDL_ReadProcess: { args: ['ptr', 'ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitProcess
   */
  SDL_WaitProcess: { args: ['ptr', 'bool', 'ptr'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
