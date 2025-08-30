/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HitTestResult
 */
export enum SDL_HitTestResult {
  SDL_HITTEST_NORMAL /**< Region is normal. No special properties. */,
  SDL_HITTEST_DRAGGABLE /**< Region can drag entire window. */,
  SDL_HITTEST_RESIZE_TOPLEFT /**< Region is the resizable top-left corner border. */,
  SDL_HITTEST_RESIZE_TOP /**< Region is the resizable top border. */,
  SDL_HITTEST_RESIZE_TOPRIGHT /**< Region is the resizable top-right corner border. */,
  SDL_HITTEST_RESIZE_RIGHT /**< Region is the resizable right border. */,
  SDL_HITTEST_RESIZE_BOTTOMRIGHT /**< Region is the resizable bottom-right corner border. */,
  SDL_HITTEST_RESIZE_BOTTOM /**< Region is the resizable bottom border. */,
  SDL_HITTEST_RESIZE_BOTTOMLEFT /**< Region is the resizable bottom-left corner border. */,
  SDL_HITTEST_RESIZE_LEFT /**< Region is the resizable left border. */,
}
