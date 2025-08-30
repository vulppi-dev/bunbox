/**
 * @description https://wiki.libsdl.org/SDL3/SDL_InitFlags
 */
export enum SDL_InitFlags {
  SDL_INIT_AUDIO = 0x00000010 /**< `SDL_INIT_AUDIO` implies `SDL_INIT_EVENTS` */,
  SDL_INIT_VIDEO = 0x00000020 /**< `SDL_INIT_VIDEO` implies `SDL_INIT_EVENTS`, should be initialized on the main thread */,
  SDL_INIT_JOYSTICK = 0x00000200 /**< `SDL_INIT_JOYSTICK` implies `SDL_INIT_EVENTS` */,
  SDL_INIT_HAPTIC = 0x00001000,
  SDL_INIT_GAMEPAD = 0x00002000 /**< `SDL_INIT_GAMEPAD` implies `SDL_INIT_JOYSTICK` */,
  SDL_INIT_EVENTS = 0x00004000,
  SDL_INIT_SENSOR = 0x00008000 /**< `SDL_INIT_SENSOR` implies `SDL_INIT_EVENTS` */,
  SDL_INIT_CAMERA = 0x00010000 /**< `SDL_INIT_CAMERA` implies `SDL_INIT_EVENTS` */,
}
