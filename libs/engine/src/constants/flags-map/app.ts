import { SDL_InitFlags, SDL_LogCategory, SDL_LogPriority } from '@bunbox/sdl3';
import type { AppFeature, AppLogCategory, AppLogPriority } from '../../types';

export const APP_FEATURES_MAP: Record<AppFeature, number> = {
  audio: SDL_InitFlags.SDL_INIT_AUDIO,
  video: SDL_InitFlags.SDL_INIT_VIDEO,
  joystick: SDL_InitFlags.SDL_INIT_JOYSTICK,
  haptic: SDL_InitFlags.SDL_INIT_HAPTIC,
  gamepad: SDL_InitFlags.SDL_INIT_GAMEPAD,
  events: SDL_InitFlags.SDL_INIT_EVENTS,
  sensor: SDL_InitFlags.SDL_INIT_SENSOR,
  camera: SDL_InitFlags.SDL_INIT_CAMERA,
};

export const APP_LOG_PRIORITY_MAP: Record<AppLogPriority, number> = {
  trace: SDL_LogPriority.SDL_LOG_PRIORITY_TRACE,
  verbose: SDL_LogPriority.SDL_LOG_PRIORITY_VERBOSE,
  debug: SDL_LogPriority.SDL_LOG_PRIORITY_DEBUG,
  info: SDL_LogPriority.SDL_LOG_PRIORITY_INFO,
  warn: SDL_LogPriority.SDL_LOG_PRIORITY_WARN,
  error: SDL_LogPriority.SDL_LOG_PRIORITY_ERROR,
  critical: SDL_LogPriority.SDL_LOG_PRIORITY_CRITICAL,
};

export const APP_LOG_CATEGORY_MAP: Record<AppLogCategory, number> = {
  application: SDL_LogCategory.SDL_LOG_CATEGORY_APPLICATION,
  assert: SDL_LogCategory.SDL_LOG_CATEGORY_ASSERT,
  audio: SDL_LogCategory.SDL_LOG_CATEGORY_AUDIO,
  custom: SDL_LogCategory.SDL_LOG_CATEGORY_CUSTOM,
  error: SDL_LogCategory.SDL_LOG_CATEGORY_ERROR,
  gpu: SDL_LogCategory.SDL_LOG_CATEGORY_GPU,
  input: SDL_LogCategory.SDL_LOG_CATEGORY_INPUT,
  render: SDL_LogCategory.SDL_LOG_CATEGORY_RENDER,
  system: SDL_LogCategory.SDL_LOG_CATEGORY_SYSTEM,
  test: SDL_LogCategory.SDL_LOG_CATEGORY_TEST,
  video: SDL_LogCategory.SDL_LOG_CATEGORY_VIDEO,
};
