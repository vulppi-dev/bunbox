/* GLFW typedefs */

import type { Pointer } from 'bun:ffi';

// GLFW MARK: Init

/** The function pointer type for error callbacks. */
export type ErrorFunction = (errorCode: number, description: string) => void;

// GLFW MARK: Window

export type Window = Pointer & {};

/** The function pointer type for window position callbacks. */
export type WindowPositionFunction = (
  window: Window,
  xPos: number,
  yPos: number,
) => void;

/** The function pointer type for window size callbacks. */
export type WindowSizeFun = (
  window: Window,
  width: number,
  height: number,
) => void;

/** The function pointer type for window close callbacks. */
export type WindowCloseFunction = (window: Window) => void;

/** The function pointer type for window content refresh callbacks. */
export type WindowRefreshFunction = (window: Window) => void;

/** The function pointer type for window focus callbacks. */
export type WindowFocusFunction = (window: Window, focused: number) => void;

/** The function pointer type for window iconify callbacks. */
export type WindowIconifyFunction = (window: Window, iconified: number) => void;

/** The function pointer type for window maximize callbacks. */
export type WindowMaximizeFunction = (
  window: Window,
  maximized: number,
) => void;

/** The function pointer type for framebuffer size callbacks. */
export type FramebufferSizeFunction = (
  window: Window,
  width: number,
  height: number,
) => void;

/** The function pointer type for window content scale callbacks. */
export type WindowContentScaleFunction = (
  window: Window,
  xScale: number,
  yScale: number,
) => void;

// GLFW MARK: Monitor

/** Opaque monitor object. */
export type Monitor = Pointer & {};

/** The function pointer type for monitor configuration callbacks. */
export type MonitorFunction = (monitor: Monitor, event: number) => void;

// GLFW MARK: Input

/** Opaque cursor object. */
export type Cursor = Pointer & {};

/** The function pointer type for mouse button callbacks. */
export type MouseButtonFunction = (
  window: Window,
  button: number,
  action: number,
  mods: number,
) => void;

/** The function pointer type for cursor position callbacks. */
export type CursorPositionFunction = (
  window: Window,
  xPos: number,
  yPos: number,
) => void;

/** The function pointer type for cursor enter/leave callbacks. */
export type CursorEnterFunction = (window: Window, entered: number) => void;

/** The function pointer type for scroll callbacks. */
export type ScrollFunction = (
  window: Window,
  xOffset: number,
  yOffset: number,
) => void;

/** The function pointer type for keyboard key callbacks. */
export type KeyFunction = (
  window: Window,
  key: number,
  scanCode: number,
  action: number,
  mods: number,
) => void;

/** The function pointer type for Unicode character callbacks. */
export type CharFunction = (window: Window, codePoint: number) => void;

/** The function pointer type for Unicode character with modifiers callbacks. */
export type CharModsFunction = (
  window: Window,
  codePoint: number,
  mods: number,
) => void;

/** The function pointer type for path drop callbacks. */
export type DropFunction = (
  window: Window,
  pathCount: number,
  paths: string[],
) => void;

/** The function pointer type for joystick configuration callbacks. */
export type JoystickFunction = (jid: number, event: number) => void;
