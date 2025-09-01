import type { FFIFunction } from 'bun:ffi'

export const LOG_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDefaultLogOutputFunction
   */
  // SDL_GetDefaultLogOutputFunction: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetLogOutputFunction
   */
  // SDL_GetLogOutputFunction: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetLogPriority
   */
  // SDL_GetLogPriority: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Log
   */
  // SDL_Log: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogCritical
   */
  // SDL_LogCritical: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogDebug
   */
  // SDL_LogDebug: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogError
   */
  // SDL_LogError: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogInfo
   */
  // SDL_LogInfo: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogMessage
   */
  // SDL_LogMessage: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogMessageV
   */
  // SDL_LogMessageV: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogTrace
   */
  // SDL_LogTrace: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogVerbose
   */
  // SDL_LogVerbose: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LogWarn
   */
  // SDL_LogWarn: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResetLogPriorities
   */
  // SDL_ResetLogPriorities: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLogOutputFunction
   */
  // SDL_SetLogOutputFunction: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLogPriorities
   */
  SDL_SetLogPriorities: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLogPriority
   */
  // SDL_SetLogPriority: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLogPriorityPrefix
   */
  // SDL_SetLogPriorityPrefix: {},
} as const satisfies Record<string, FFIFunction>
