import type { Pointer } from 'bun:ffi';

export const RETAIN_MAP = new Map<string, Uint8Array>();

export const POINTERS_MAP = new Map<string | symbol, Pointer>();
