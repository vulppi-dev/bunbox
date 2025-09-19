/**
 * @description https://wiki.libsdl.org/SDL3/SDL_WindowProperties
 */
export enum SDL_WindowCreateProperties {
  /** true if the window should be always on top */
  SDL_PROP_WINDOW_CREATE_ALWAYS_ON_TOP_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_ALWAYS_ON_TOP_BOOLEAN',
  /** true if the window has no window decoration */
  SDL_PROP_WINDOW_CREATE_BORDERLESS_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_BORDERLESS_BOOLEAN',
  /** true if the "tooltip" and "menu" window types should be automatically constrained to be entirely within display bounds (default), false if no constraints on the position are desired. */
  SDL_PROP_WINDOW_CREATE_CONSTRAIN_POPUP_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_CONSTRAIN_POPUP_BOOLEAN',
  /** true if the window will be used with an externally managed graphics context. */
  SDL_PROP_WINDOW_CREATE_EXTERNAL_GRAPHICS_CONTEXT_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_EXTERNAL_GRAPHICS_CONTEXT_BOOLEAN',
  /** true if the window should accept keyboard input (defaults true) */
  SDL_PROP_WINDOW_CREATE_FOCUSABLE_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_FOCUSABLE_BOOLEAN',
  /** true if the window should start in fullscreen mode at desktop resolution */
  SDL_PROP_WINDOW_CREATE_FULLSCREEN_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_FULLSCREEN_BOOLEAN',
  /** the height of the window */
  SDL_PROP_WINDOW_CREATE_HEIGHT_NUMBER = 'SDL_PROP_WINDOW_CREATE_HEIGHT_NUMBER',
  /** true if the window should start hidden */
  SDL_PROP_WINDOW_CREATE_HIDDEN_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_HIDDEN_BOOLEAN',
  /** true if the window uses a high pixel density buffer if possible */
  SDL_PROP_WINDOW_CREATE_HIGH_PIXEL_DENSITY_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_HIGH_PIXEL_DENSITY_BOOLEAN',
  /** true if the window should start maximized */
  SDL_PROP_WINDOW_CREATE_MAXIMIZED_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_MAXIMIZED_BOOLEAN',
  /** true if the window is a popup menu */
  SDL_PROP_WINDOW_CREATE_MENU_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_MENU_BOOLEAN',
  /** true if the window will be used with Metal rendering */
  SDL_PROP_WINDOW_CREATE_METAL_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_METAL_BOOLEAN',
  /** true if the window should start minimized */
  SDL_PROP_WINDOW_CREATE_MINIMIZED_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_MINIMIZED_BOOLEAN',
  /** true if the window is modal to its parent */
  SDL_PROP_WINDOW_CREATE_MODAL_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_MODAL_BOOLEAN',
  /** true if the window starts with grabbed mouse focus */
  SDL_PROP_WINDOW_CREATE_MOUSE_GRABBED_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_MOUSE_GRABBED_BOOLEAN',
  /** true if the window will be used with OpenGL rendering */
  SDL_PROP_WINDOW_CREATE_OPENGL_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_OPENGL_BOOLEAN',
  /** an SDL_Window that will be the parent of this window, required for windows with the "tooltip", "menu", and "modal" properties */
  SDL_PROP_WINDOW_CREATE_PARENT_POINTER = 'SDL_PROP_WINDOW_CREATE_PARENT_POINTER',
  /** true if the window should be resizable */
  SDL_PROP_WINDOW_CREATE_RESIZABLE_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_RESIZABLE_BOOLEAN',
  /** the title of the window, in UTF-8 encoding */
  SDL_PROP_WINDOW_CREATE_TITLE_STRING = 'SDL_PROP_WINDOW_CREATE_TITLE_STRING',
  /** true if the window show transparent in the areas with alpha of 0 */
  SDL_PROP_WINDOW_CREATE_TRANSPARENT_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_TRANSPARENT_BOOLEAN',
  /** true if the window is a tooltip */
  SDL_PROP_WINDOW_CREATE_TOOLTIP_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_TOOLTIP_BOOLEAN',
  /** true if the window is a utility window, not showing in the task bar and window list */
  SDL_PROP_WINDOW_CREATE_UTILITY_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_UTILITY_BOOLEAN',
  /** true if the window will be used with Vulkan rendering */
  SDL_PROP_WINDOW_CREATE_VULKAN_BOOLEAN = 'SDL_PROP_WINDOW_CREATE_VULKAN_BOOLEAN',
  /** the width of the window */
  SDL_PROP_WINDOW_CREATE_WIDTH_NUMBER = 'SDL_PROP_WINDOW_CREATE_WIDTH_NUMBER',
  /** the x position of the window, or SDL_WINDOWPOS_CENTERED, defaults to SDL_WINDOWPOS_UNDEFINED. This is relative to the parent for windows with the "tooltip" or "menu" property set. */
  SDL_PROP_WINDOW_CREATE_X_NUMBER = 'SDL_PROP_WINDOW_CREATE_X_NUMBER',
  /** the y position of the window, or SDL_WINDOWPOS_CENTERED, defaults to SDL_WINDOWPOS_UNDEFINED. This is relative to the parent for windows with the "tooltip" or "menu" property set. */
  SDL_PROP_WINDOW_CREATE_Y_NUMBER = 'SDL_PROP_WINDOW_CREATE_Y_NUMBER',
}
