import type { FFIFunction } from 'bun:ffi';

export const ASSERT_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAssertionHandler
   */
  SDL_GetAssertionHandler: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAssertionReport
   */
  SDL_GetAssertionReport: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDefaultAssertionHandler
   */
  SDL_GetDefaultAssertionHandler: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReportAssertion
   */
  SDL_ReportAssertion: { args: ['ptr', 'ptr', 'ptr', 'i32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResetAssertionReport
   */
  SDL_ResetAssertionReport: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAssertionHandler
   */
  SDL_SetAssertionHandler: { args: ['ptr', 'ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
