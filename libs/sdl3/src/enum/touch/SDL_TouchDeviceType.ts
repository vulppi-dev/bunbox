/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TouchDeviceType
 */
export enum SDL_TouchDeviceType {
  SDL_TOUCH_DEVICE_INVALID = -1,
  /**< touch screen with window-relative coordinates */
  SDL_TOUCH_DEVICE_DIRECT,
  /**< trackpad with absolute device coordinates */
  SDL_TOUCH_DEVICE_INDIRECT_ABSOLUTE,
  /**< trackpad with screen cursor-relative coordinates */
  SDL_TOUCH_DEVICE_INDIRECT_RELATIVE,
}
