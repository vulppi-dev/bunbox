import type { FFIFunction } from 'bun:ffi';

export const RECT_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRectAndLineIntersection
   */
  SDL_GetRectAndLineIntersection: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRectAndLineIntersectionFloat
   */
  SDL_GetRectAndLineIntersectionFloat: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRectEnclosingPoints
   */
  SDL_GetRectEnclosingPoints: {
    args: ['ptr', 'i32', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRectEnclosingPointsFloat
   */
  SDL_GetRectEnclosingPointsFloat: {
    args: ['ptr', 'i32', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRectIntersection
   */
  SDL_GetRectIntersection: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRectIntersectionFloat
   */
  SDL_GetRectIntersectionFloat: {
    args: ['ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRectUnion
   */
  SDL_GetRectUnion: { args: ['ptr', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRectUnionFloat
   */
  SDL_GetRectUnionFloat: { args: ['ptr', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasRectIntersection
   */
  SDL_HasRectIntersection: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasRectIntersectionFloat
   */
  SDL_HasRectIntersectionFloat: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PointInRect
   */
  // SDL_PointInRect: { args: ['ptr', 'ptr'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PointInRectFloat
   */
  // SDL_PointInRectFloat: { args: ['ptr', 'ptr'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RectEmpty
   */
  // SDL_RectEmpty: { args: ['ptr'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RectEmptyFloat
   */
  // SDL_RectEmptyFloat: { args: ['ptr'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RectsEqual
   */
  // SDL_RectsEqual: { args: ['ptr', 'ptr'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RectsEqualEpsilon
   */
  // SDL_RectsEqualEpsilon: { args: ['ptr', 'ptr', 'f32'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RectsEqualFloat
   */
  // SDL_RectsEqualFloat: { args: ['ptr', 'ptr'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RectToFRect
   */
  // SDL_RectToFRect: { args: ['ptr', 'ptr'], returns: 'void' }, --- NOT FOUND ---
} as const satisfies Record<string, FFIFunction>;
