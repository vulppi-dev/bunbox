/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TextureAddressMode
 */
export enum SDL_TextureAddressMode {
  SDL_TEXTURE_ADDRESS_INVALID = -1,
  SDL_TEXTURE_ADDRESS_AUTO /**< Wrapping is enabled if texture coordinates are outside [0, 1], this is the default */,
  SDL_TEXTURE_ADDRESS_CLAMP /**< Texture coordinates are clamped to the [0, 1] range */,
  SDL_TEXTURE_ADDRESS_WRAP /**< The texture is repeated (tiled) */,
}
