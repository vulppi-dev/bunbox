/* GLFW typedefs */

import type { Pointer } from 'bun:ffi';

// GLFW MARK: Window

export type GLFW_Window = Pointer & { __GLFW_WINDOW__: null };

// GLFW MARK: Monitor

/** Opaque monitor object. */
export type GLFW_Monitor = Pointer & { __GLFW_MONITOR__: null };

// GLFW MARK: Input

/** Opaque cursor object. */
export type GLFW_Cursor = Pointer & { __GLFW_CURSOR__: null };
