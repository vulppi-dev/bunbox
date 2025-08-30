/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ChromaLocation
 */
export enum SDL_ChromaLocation {
  SDL_CHROMA_LOCATION_NONE = 0 /**< RGB, no chroma sampling */,
  SDL_CHROMA_LOCATION_LEFT = 1 /**< In MPEG-2, MPEG-4, and AVC, Cb and Cr are taken on midpoint of the left-edge of the 2x2 square. In other words, they have the same horizontal location as the top-left pixel, but is shifted one-half pixel down vertically. */,
  SDL_CHROMA_LOCATION_CENTER = 2 /**< In JPEG/JFIF, H.261, and MPEG-1, Cb and Cr are taken at the center of the 2x2 square. In other words, they are offset one-half pixel to the right and one-half pixel down compared to the top-left pixel. */,
  SDL_CHROMA_LOCATION_TOPLEFT = 3 /**< In HEVC for BT.2020 and BT.2100 content (in particular on Blu-rays), Cb and Cr are sampled at the same location as the group's top-left Y pixel ("co-sited", "co-located"). */,
}
