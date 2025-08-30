/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TextureAccess
 */
export enum SDL_TextureAccess {
  SDL_TEXTUREACCESS_STATIC /**< Changes rarely, not lockable */,
  SDL_TEXTUREACCESS_STREAMING /**< Changes frequently, lockable */,
  SDL_TEXTUREACCESS_TARGET /**< Texture can be used as a render target */,
}
