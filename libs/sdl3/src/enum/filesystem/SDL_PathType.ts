/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PathType
 */
export enum SDL_PathType {
  SDL_PATHTYPE_NONE /**< path does not exist */,
  SDL_PATHTYPE_FILE /**< a normal file */,
  SDL_PATHTYPE_DIRECTORY /**< a directory */,
  SDL_PATHTYPE_OTHER /**< something completely different like a device node (not a symlink, those are always followed) */,
}
