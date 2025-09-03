/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TextureAccess
 */
export enum SDL_TextureAccess {
  /**< Changes rarely, not lockable */
  SDL_TEXTUREACCESS_STATIC,
  /**< Changes frequently, lockable */
  SDL_TEXTUREACCESS_STREAMING,
  /**< Texture can be used as a render target */
  SDL_TEXTUREACCESS_TARGET,
}
