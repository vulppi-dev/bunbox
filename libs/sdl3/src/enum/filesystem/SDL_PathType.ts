/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PathType
 */
export enum SDL_PathType {
  /**< path does not exist */
  SDL_PATHTYPE_NONE,
  /**< a normal file */
  SDL_PATHTYPE_FILE,
  /**< a directory */
  SDL_PATHTYPE_DIRECTORY,
  /**< something completely different like a device node (not a symlink, those are always followed) */
  SDL_PATHTYPE_OTHER,
}
