/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GLAttr
 */
export enum SDL_GLAttr {
  /**< the minimum number of bits for the red channel of the color buffer; defaults to 8. */
  SDL_GL_RED_SIZE,
  /**< the minimum number of bits for the green channel of the color buffer; defaults to 8. */
  SDL_GL_GREEN_SIZE,
  /**< the minimum number of bits for the blue channel of the color buffer; defaults to 8. */
  SDL_GL_BLUE_SIZE,
  /**< the minimum number of bits for the alpha channel of the color buffer; defaults to 8. */
  SDL_GL_ALPHA_SIZE,
  /**< the minimum number of bits for frame buffer size; defaults to 0. */
  SDL_GL_BUFFER_SIZE,
  /**< whether the output is single or double buffered; defaults to double buffering on. */
  SDL_GL_DOUBLEBUFFER,
  /**< the minimum number of bits in the depth buffer; defaults to 16. */
  SDL_GL_DEPTH_SIZE,
  /**< the minimum number of bits in the stencil buffer; defaults to 0. */
  SDL_GL_STENCIL_SIZE,
  /**< the minimum number of bits for the red channel of the accumulation buffer; defaults to 0. */
  SDL_GL_ACCUM_RED_SIZE,
  /**< the minimum number of bits for the green channel of the accumulation buffer; defaults to 0. */
  SDL_GL_ACCUM_GREEN_SIZE,
  /**< the minimum number of bits for the blue channel of the accumulation buffer; defaults to 0. */
  SDL_GL_ACCUM_BLUE_SIZE,
  /**< the minimum number of bits for the alpha channel of the accumulation buffer; defaults to 0. */
  SDL_GL_ACCUM_ALPHA_SIZE,
  /**< whether the output is stereo 3D; defaults to off. */
  SDL_GL_STEREO,
  /**< the number of buffers used for multisample anti-aliasing; defaults to 0. */
  SDL_GL_MULTISAMPLEBUFFERS,
  /**< the number of samples used around the current pixel used for multisample anti-aliasing. */
  SDL_GL_MULTISAMPLESAMPLES,
  /**< set to 1 to require hardware acceleration, set to 0 to force software rendering; defaults to allow either. */
  SDL_GL_ACCELERATED_VISUAL,
  /**< not used (deprecated). */
  SDL_GL_RETAINED_BACKING,
  /**< OpenGL context major version. */
  SDL_GL_CONTEXT_MAJOR_VERSION,
  /**< OpenGL context minor version. */
  SDL_GL_CONTEXT_MINOR_VERSION,
  /**< some combination of 0 or more of elements of the SDL_GLContextFlag enumeration; defaults to 0. */
  SDL_GL_CONTEXT_FLAGS,
  /**< type of GL context (Core, Compatibility, ES). See SDL_GLProfile; default value depends on platform. */
  SDL_GL_CONTEXT_PROFILE_MASK,
  /**< OpenGL context sharing; defaults to 0. */
  SDL_GL_SHARE_WITH_CURRENT_CONTEXT,
  /**< requests sRGB capable visual; defaults to 0. */
  SDL_GL_FRAMEBUFFER_SRGB_CAPABLE,
  /**< sets context the release behavior. See SDL_GLContextReleaseFlag; defaults to FLUSH. */
  SDL_GL_CONTEXT_RELEASE_BEHAVIOR,
  /**< set context reset notification. See SDL_GLContextResetNotification; defaults to NO_NOTIFICATION. */
  SDL_GL_CONTEXT_RESET_NOTIFICATION,
  SDL_GL_CONTEXT_NO_ERROR,
  SDL_GL_FLOATBUFFERS,
  SDL_GL_EGL_PLATFORM,
}
