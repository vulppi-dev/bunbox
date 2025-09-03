/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Folder
 */
export enum SDL_Folder {
  /**< The folder which contains all of the current user's data, preferences, and documents. It usually contains most of the other folders. If a requested folder does not exist, the home folder can be considered a safe fallback to store a user's documents. */
  SDL_FOLDER_HOME,
  /**< The folder of files that are displayed on the desktop. Note that the existence of a desktop folder does not guarantee that the system does show icons on its desktop; certain GNU/Linux distros with a graphical environment may not have desktop icons. */
  SDL_FOLDER_DESKTOP,
  /**< User document files, possibly application-specific. This is a good place to save a user's projects. */
  SDL_FOLDER_DOCUMENTS,
  /**< Standard folder for user files downloaded from the internet. */
  SDL_FOLDER_DOWNLOADS,
  /**< Music files that can be played using a standard music player (mp3, ogg...). */
  SDL_FOLDER_MUSIC,
  /**< Image files that can be displayed using a standard viewer (png, jpg...). */
  SDL_FOLDER_PICTURES,
  /**< Files that are meant to be shared with other users on the same computer. */
  SDL_FOLDER_PUBLICSHARE,
  /**< Save files for games. */
  SDL_FOLDER_SAVEDGAMES,
  /**< Application screenshots. */
  SDL_FOLDER_SCREENSHOTS,
  /**< Template files to be used when the user requests the desktop environment to create a new file in a certain folder, such as "New Text File.txt".  Any file in the Templates folder can be used as a starting point for a new file. */
  SDL_FOLDER_TEMPLATES,
  /**< Video files that can be played using a standard video player (mp4, webm...). */
  SDL_FOLDER_VIDEOS,
  /**< Total number of types in this enum, not a folder type by itself. */
  SDL_FOLDER_COUNT,
}
