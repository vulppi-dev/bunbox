import { SDL_WindowFlags } from '@bunbox/sdl3';
import type { WindowsFeature } from '../../types/window';

export const WINDOW_FEATURES_MAP: Record<WindowsFeature, number> = {
  fullscreen: SDL_WindowFlags.SDL_WINDOW_FULLSCREEN,
  occluded: SDL_WindowFlags.SDL_WINDOW_OCCLUDED,
  hidden: SDL_WindowFlags.SDL_WINDOW_HIDDEN,
  borderless: SDL_WindowFlags.SDL_WINDOW_BORDERLESS,
  resizable: SDL_WindowFlags.SDL_WINDOW_RESIZABLE,
  minimized: SDL_WindowFlags.SDL_WINDOW_MINIMIZED,
  maximized: SDL_WindowFlags.SDL_WINDOW_MAXIMIZED,
  mouseGrabbed: SDL_WindowFlags.SDL_WINDOW_MOUSE_GRABBED,
  inputFocus: SDL_WindowFlags.SDL_WINDOW_INPUT_FOCUS,
  mouseFocus: SDL_WindowFlags.SDL_WINDOW_MOUSE_FOCUS,
  external: SDL_WindowFlags.SDL_WINDOW_EXTERNAL,
  modal: SDL_WindowFlags.SDL_WINDOW_MODAL,
  highPixelDensity: SDL_WindowFlags.SDL_WINDOW_HIGH_PIXEL_DENSITY,
  mouseCapture: SDL_WindowFlags.SDL_WINDOW_MOUSE_CAPTURE,
  mouseRelativeMode: SDL_WindowFlags.SDL_WINDOW_MOUSE_RELATIVE_MODE,
  alwaysOnTop: SDL_WindowFlags.SDL_WINDOW_ALWAYS_ON_TOP,
  utility: SDL_WindowFlags.SDL_WINDOW_UTILITY,
  tooltip: SDL_WindowFlags.SDL_WINDOW_TOOLTIP,
  popupMenu: SDL_WindowFlags.SDL_WINDOW_POPUP_MENU,
  keyboardGrabbed: SDL_WindowFlags.SDL_WINDOW_KEYBOARD_GRABBED,
  transparent: SDL_WindowFlags.SDL_WINDOW_TRANSPARENT,
  notFocusable: SDL_WindowFlags.SDL_WINDOW_NOT_FOCUSABLE,
};
