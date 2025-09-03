/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioFormat
 */
export enum SDL_AudioFormat {
  /**< Unspecified audio format */
  SDL_AUDIO_UNKNOWN = 0x0000,
  /**< Unsigned 8-bit samples */
  SDL_AUDIO_U8 = 0x0008,
  /* SDL_DEFINE_AUDIO_FORMAT(0, 0, 0, 8), */
  /**< Signed 8-bit samples */
  SDL_AUDIO_S8 = 0x8008,
  /* SDL_DEFINE_AUDIO_FORMAT(1, 0, 0, 8), */
  /**< Signed 16-bit samples */
  SDL_AUDIO_S16LE = 0x8010,
  /* SDL_DEFINE_AUDIO_FORMAT(1, 0, 0, 16), */
  /**< As above, but big-endian byte order */
  SDL_AUDIO_S16BE = 0x9010,
  /* SDL_DEFINE_AUDIO_FORMAT(1, 1, 0, 16), */
  /**< 32-bit integer samples */
  SDL_AUDIO_S32LE = 0x8020,
  /* SDL_DEFINE_AUDIO_FORMAT(1, 0, 0, 32), */
  /**< As above, but big-endian byte order */
  SDL_AUDIO_S32BE = 0x9020,
  /* SDL_DEFINE_AUDIO_FORMAT(1, 1, 0, 32), */
  /**< 32-bit floating point samples */
  SDL_AUDIO_F32LE = 0x8120,
  /* SDL_DEFINE_AUDIO_FORMAT(1, 0, 1, 32), */
  /**< As above, but big-endian byte order */
  SDL_AUDIO_F32BE = 0x9120,
  /* SDL_DEFINE_AUDIO_FORMAT(1, 1, 1, 32), */

  /* These represent the current system's byteorder. */
  SDL_AUDIO_S16 = SDL_AUDIO_S16LE,
  SDL_AUDIO_S32 = SDL_AUDIO_S32LE,
  SDL_AUDIO_F32 = SDL_AUDIO_F32LE,
}
