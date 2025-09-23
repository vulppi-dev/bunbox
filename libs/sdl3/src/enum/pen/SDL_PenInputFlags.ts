/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PenInputFlags
 */
export enum SDL_PenInputFlags {
  /**< pen is pressed down */
  SDL_PEN_INPUT_DOWN = 1 << 0,
  /**< button 1 is pressed */
  SDL_PEN_INPUT_BUTTON_1 = 1 << 1,
  /**< button 2 is pressed */
  SDL_PEN_INPUT_BUTTON_2 = 1 << 2,
  /**< button 3 is pressed */
  SDL_PEN_INPUT_BUTTON_3 = 1 << 3,
  /**< button 4 is pressed */
  SDL_PEN_INPUT_BUTTON_4 = 1 << 4,
  /**< button 5 is pressed */
  SDL_PEN_INPUT_BUTTON_5 = 1 << 5,
  /**< eraser tip is used */
  SDL_PEN_INPUT_ERASER_TIP = 1 << 30,
}
