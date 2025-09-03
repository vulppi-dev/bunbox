/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TextInputType
 */
export enum SDL_TextInputType {
  /**< The input is text */
  SDL_TEXTINPUT_TYPE_TEXT,
  /**< The input is a person's name */
  SDL_TEXTINPUT_TYPE_TEXT_NAME,
  /**< The input is an e-mail address */
  SDL_TEXTINPUT_TYPE_TEXT_EMAIL,
  /**< The input is a username */
  SDL_TEXTINPUT_TYPE_TEXT_USERNAME,
  /**< The input is a secure password that is hidden */
  SDL_TEXTINPUT_TYPE_TEXT_PASSWORD_HIDDEN,
  /**< The input is a secure password that is visible */
  SDL_TEXTINPUT_TYPE_TEXT_PASSWORD_VISIBLE,
  /**< The input is a number */
  SDL_TEXTINPUT_TYPE_NUMBER,
  /**< The input is a secure PIN that is hidden */
  SDL_TEXTINPUT_TYPE_NUMBER_PASSWORD_HIDDEN,
  /**< The input is a secure PIN that is visible */
  SDL_TEXTINPUT_TYPE_NUMBER_PASSWORD_VISIBLE,
}
