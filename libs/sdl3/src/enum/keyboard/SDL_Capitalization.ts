/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Capitalization
 */
export enum SDL_Capitalization {
  /**< No auto-capitalization will be done */
  SDL_CAPITALIZE_NONE,
  /**< The first letter of sentences will be capitalized */
  SDL_CAPITALIZE_SENTENCES,
  /**< The first letter of words will be capitalized */
  SDL_CAPITALIZE_WORDS,
  /**< All letters will be capitalized */
  SDL_CAPITALIZE_LETTERS,
}
