import type { FFIFunction } from 'bun:ffi';

export const LOG_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDefaultLogOutputFunction
   */
  SDL_GetDefaultLogOutputFunction: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetLogOutputFunction
   */
  SDL_GetLogOutputFunction: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetLogPriority
   */
  SDL_GetLogPriority: { args: ['u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Log
   */
  SDL_Log: { args: ['cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogCritical
   */
  SDL_LogCritical: { args: ['u32', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogDebug
   */
  SDL_LogDebug: { args: ['u32', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogError
   */
  SDL_LogError: { args: ['u32', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogInfo
   */
  SDL_LogInfo: { args: ['u32', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogMessage
   */
  SDL_LogMessage: { args: ['u32', 'u32', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogMessageV
   */
  SDL_LogMessageV: { args: ['u32', 'u32', 'cstring', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogTrace
   */
  SDL_LogTrace: { args: ['u32', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogVerbose
   */
  SDL_LogVerbose: { args: ['u32', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogWarn
   */
  SDL_LogWarn: { args: ['u32', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResetLogPriorities
   */
  SDL_ResetLogPriorities: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLogOutputFunction
   */
  SDL_SetLogOutputFunction: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLogPriorities
   */
  SDL_SetLogPriorities: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLogPriority
   */
  SDL_SetLogPriority: { args: ['u32', 'u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLogPriorityPrefix
   */
  SDL_SetLogPriorityPrefix: { args: ['u32', 'cstring'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
