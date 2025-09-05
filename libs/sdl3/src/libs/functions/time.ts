import type { FFIFunction } from 'bun:ffi';

export const TIME_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DateTimeToTime
   */
  SDL_DateTimeToTime: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentTime
   */
  SDL_GetCurrentTime: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDateTimeLocalePreferences
   */
  SDL_GetDateTimeLocalePreferences: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDayOfWeek
   */
  SDL_GetDayOfWeek: { args: ['i32', 'i32', 'i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDayOfYear
   */
  SDL_GetDayOfYear: { args: ['i32', 'i32', 'i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDaysInMonth
   */
  SDL_GetDaysInMonth: { args: ['i32', 'i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TimeFromWindows
   */
  SDL_TimeFromWindows: { args: ['u32', 'u32'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TimeToDateTime
   */
  SDL_TimeToDateTime: { args: ['i64', 'ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TimeToWindows
   */
  SDL_TimeToWindows: { args: ['i64', 'ptr', 'ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
