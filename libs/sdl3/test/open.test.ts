import { SDL_InitFlags } from '$enum'
import { SDL_WindowFlags } from '$enum'
import { cstr } from '$internal'
import { SDL } from '../src/bun-ffi'

if (!SDL.SDL_Init(SDL_InitFlags.SDL_INIT_VIDEO)) {
  throw new Error('SDL_Init falhou')
}

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
