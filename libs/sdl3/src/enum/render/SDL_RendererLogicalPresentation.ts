/**
 * @description https://wiki.libsdl.org/SDL3/SDL_RendererLogicalPresentation
 */
export enum SDL_RendererLogicalPresentation {
  /**< There is no logical size in effect */
  SDL_LOGICAL_PRESENTATION_DISABLED,
  /**< The rendered content is stretched to the output resolution */
  SDL_LOGICAL_PRESENTATION_STRETCH,
  /**< The rendered content is fit to the largest dimension and the other dimension is letterboxed with black bars */
  SDL_LOGICAL_PRESENTATION_LETTERBOX,
  /**< The rendered content is fit to the smallest dimension and the other dimension extends beyond the output bounds */
  SDL_LOGICAL_PRESENTATION_OVERSCAN,
  /**< The rendered content is scaled up by integer multiples to fit the output resolution */
  SDL_LOGICAL_PRESENTATION_INTEGER_SCALE,
}
