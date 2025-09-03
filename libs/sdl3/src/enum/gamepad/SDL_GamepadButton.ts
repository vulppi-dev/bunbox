/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GamepadButton
 */
export enum SDL_GamepadButton {
  SDL_GAMEPAD_BUTTON_INVALID = -1,
  /**< Bottom face button (e.g. Xbox A button) */
  SDL_GAMEPAD_BUTTON_SOUTH,
  /**< Right face button (e.g. Xbox B button) */
  SDL_GAMEPAD_BUTTON_EAST,
  /**< Left face button (e.g. Xbox X button) */
  SDL_GAMEPAD_BUTTON_WEST,
  /**< Top face button (e.g. Xbox Y button) */
  SDL_GAMEPAD_BUTTON_NORTH,
  SDL_GAMEPAD_BUTTON_BACK,
  SDL_GAMEPAD_BUTTON_GUIDE,
  SDL_GAMEPAD_BUTTON_START,
  SDL_GAMEPAD_BUTTON_LEFT_STICK,
  SDL_GAMEPAD_BUTTON_RIGHT_STICK,
  SDL_GAMEPAD_BUTTON_LEFT_SHOULDER,
  SDL_GAMEPAD_BUTTON_RIGHT_SHOULDER,
  SDL_GAMEPAD_BUTTON_DPAD_UP,
  SDL_GAMEPAD_BUTTON_DPAD_DOWN,
  SDL_GAMEPAD_BUTTON_DPAD_LEFT,
  SDL_GAMEPAD_BUTTON_DPAD_RIGHT,
  /**< Additional button (e.g. Xbox Series X share button, PS5 microphone button, Nintendo Switch Pro capture button, Amazon Luna microphone button, Google Stadia capture button) */
  SDL_GAMEPAD_BUTTON_MISC1,
  /**< Upper or primary paddle, under your right hand (e.g. Xbox Elite paddle P1, DualSense Edge RB button, Right Joy-Con SR button) */
  SDL_GAMEPAD_BUTTON_RIGHT_PADDLE1,
  /**< Upper or primary paddle, under your left hand (e.g. Xbox Elite paddle P3, DualSense Edge LB button, Left Joy-Con SL button) */
  SDL_GAMEPAD_BUTTON_LEFT_PADDLE1,
  /**< Lower or secondary paddle, under your right hand (e.g. Xbox Elite paddle P2, DualSense Edge right Fn button, Right Joy-Con SL button) */
  SDL_GAMEPAD_BUTTON_RIGHT_PADDLE2,
  /**< Lower or secondary paddle, under your left hand (e.g. Xbox Elite paddle P4, DualSense Edge left Fn button, Left Joy-Con SR button) */
  SDL_GAMEPAD_BUTTON_LEFT_PADDLE2,
  /**< PS4/PS5 touchpad button */
  SDL_GAMEPAD_BUTTON_TOUCHPAD,
  /**< Additional button */
  SDL_GAMEPAD_BUTTON_MISC2,
  /**< Additional button (e.g. Nintendo GameCube left trigger click) */
  SDL_GAMEPAD_BUTTON_MISC3,
  /**< Additional button (e.g. Nintendo GameCube right trigger click) */
  SDL_GAMEPAD_BUTTON_MISC4,
  /**< Additional button */
  SDL_GAMEPAD_BUTTON_MISC5,
  /**< Additional button */
  SDL_GAMEPAD_BUTTON_MISC6,
  SDL_GAMEPAD_BUTTON_COUNT,
}
