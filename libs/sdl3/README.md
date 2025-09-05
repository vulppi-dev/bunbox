# @bunbox/sdl3

> WARNING: This is a low-level binding to SDL3 using Bun FFI. Is under development and may change in the future. Use at your own risk.

> WARNING 2: The most binding are auto-generated with AI. Some functions may be have incorrect signatures. Please report issues or contribute fixes.

A Bun package for SDL3 bindings.

## Installation

```bash
bun add @bunbox/sdl3
```

## Usage

Draw a square:

```ts
import {
  cstr,
  ptr,
  SDL,
  SDL_Event,
  SDL_EventType,
  SDL_FRect,
  SDL_InitFlags,
  SDL_LogPriority,
  SDL_Scancode,
  SDL_WindowFlags,
} from '@bunbox/sdl3';

// ---------- stable C-strings ----------
const STR = {
  title: cstr('SDL3 GPU Vulkan — Stable Triangle'),
  backend: cstr('vulkan'),
  logKey: cstr('SDL_LOGGING'),
  logVal: cstr('gpu=debug,assert=debug,*=info'),
  main: cstr('main'),
};

// --- init ---
if (!SDL.SDL_Init(SDL_InitFlags.SDL_INIT_VIDEO))
  throw new Error('SDL_Init failed');
SDL.SDL_SetLogPriorities(SDL_LogPriority.SDL_LOG_PRIORITY_DEBUG);
SDL.SDL_SetHint(STR.logKey, STR.logVal);

const win = SDL.SDL_CreateWindow(
  cstr('SDL3 2D Square'),
  800,
  600,
  SDL_WindowFlags.SDL_WINDOW_RESIZABLE, // 2D; não precisamos do VULKAN aqui
);
if (!win) throw new Error('SDL_CreateWindow falhou');

// NULL (auto) escolhe o melhor renderer disponível (d3d, metal, opengl, etc)
const renderer = SDL.SDL_CreateRenderer(win, STR.backend);
if (!renderer) throw new Error(SDL.SDL_GetError().toString());

// --- main loop ---
let running = true;
while (running) {
  // handle events
  const e = new SDL_Event();
  while (SDL.SDL_PollEvent(e.bunPointer)) {
    const type = e.properties.type;
    if (type === SDL_EventType.SDL_EVENT_QUIT) running = false;
    else if (type === SDL_EventType.SDL_EVENT_KEY_DOWN) {
      if (
        e.properties.key.properties.scancode ===
        SDL_Scancode.SDL_SCANCODE_ESCAPE
      )
        running = false;
    }
  }

  // query render output size in *pixels* (handles HiDPI)
  const outW = new Int32Array(1);
  const outH = new Int32Array(1);
  SDL.SDL_GetRenderOutputSize(renderer, ptr(outW.buffer), ptr(outH.buffer));
  const W = outW[0] || 800;
  const H = outH[0] || 600;

  // compute centered square
  const size = Math.floor(Math.min(W, H) * 0.25); // 25% of min dimension
  const x = (W - size) * 0.5;
  const y = (H - size) * 0.5;

  const rect = new SDL_FRect();
  rect.properties.x = x;
  rect.properties.y = y;
  rect.properties.w = size;
  rect.properties.h = size;

  // clear background
  // Note: you must set the draw color before Clear and before drawing each primitive
  SDL.SDL_SetRenderDrawColor(renderer, 15, 15, 24, 255); // bg: dark blue-ish
  SDL.SDL_RenderClear(renderer);

  // draw filled square
  SDL.SDL_SetRenderDrawColor(renderer, 64, 180, 255, 255); // fg: cyan-ish
  SDL.SDL_RenderFillRect(renderer, rect.bunPointer);

  // present
  SDL.SDL_RenderPresent(renderer);

  await Bun.sleep(0); // yield
}

// --- cleanup ---
SDL.SDL_DestroyRenderer(renderer);
SDL.SDL_DestroyWindow(win);
SDL.SDL_Quit();
```

## Documentation

You can find the full API documentation in SDL's official documentation: [https://wiki.libsdl.org/SDL3/CategoryAPI](https://wiki.libsdl.org/SDL3/CategoryAPI).

## License

[MIT](./LICENSE) © Vulppi
