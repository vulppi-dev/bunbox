import { SDL_InitFlags, SDL_LogPriority, SDL_WindowFlags } from '$enum'
import { cstr, SDL } from '$libs'

// ---------- stable C-strings ----------
const STR = {
  title: cstr('SDL3 GPU Vulkan — Stable Triangle'),
  backend: cstr('vulkan'),
  logKey: cstr('SDL_LOGGING'),
  logVal: cstr('gpu=debug,assert=debug,*=info'),
  main: cstr('main'),
}

// --- init ---
if (!SDL.SDL_Init(SDL_InitFlags.SDL_INIT_VIDEO))
  throw new Error('SDL_Init failed')
SDL.SDL_SetLogPriorities(SDL_LogPriority.SDL_LOG_PRIORITY_DEBUG)
SDL.SDL_SetHint(STR.logKey, STR.logVal)

const win = SDL.SDL_CreateWindow(
  cstr('Bun + SDL3 🚀'),
  800,
  600,
  SDL_WindowFlags.SDL_WINDOW_RESIZABLE,
)
if (!win) {
  SDL.SDL_Quit()
  throw new Error('SDL_CreateWindow falhou')
}

SDL.SDL_Delay(4000)

SDL.SDL_DestroyWindow(win)
SDL.SDL_Quit()
