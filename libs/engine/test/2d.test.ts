import {
  SDL,
  SDL_Event,
  SDL_EventType,
  SDL_FRect,
  SDL_Scancode,
  ptr,
} from '@bunbox/sdl3';
import { sleep } from 'bun';
import { App, Window } from '../src/core';
import { Renderer } from '../src/core/Renderer';

// ---------- stable C-strings ----------
const app = new App();
const win = new Window({
  app,
  title: '2D Square',
  x: 16,
  y: 16,
  features: {
    maximized: true,
    borderless: true,
  },
});

const renderer = new Renderer();

win.addChild(renderer);

// // --- main loop ---
// let running = true;
// while (running) {
//   // handle events
//   const e = new SDL_Event();
//   while (SDL.SDL_PollEvent(e.bunPointer)) {
//     const type = e.properties.type;
//     if (type === SDL_EventType.SDL_EVENT_QUIT) running = false;
//     else if (type === SDL_EventType.SDL_EVENT_KEY_DOWN) {
//       if (
//         e.properties.key.properties.scancode ===
//         SDL_Scancode.SDL_SCANCODE_ESCAPE
//       )
//         running = false;
//     }
//   }

//   // query render output size in *pixels* (handles HiDPI)
//   const outW = new Int32Array(1);
//   const outH = new Int32Array(1);
//   SDL.SDL_GetRenderOutputSize(renderer, ptr(outW.buffer), ptr(outH.buffer));
//   const W = outW[0] || 800;
//   const H = outH[0] || 600;

//   // compute centered square
//   const size = Math.floor(Math.min(W, H) * 0.25); // 25% of min dimension
//   const x = (W - size) * 0.5;
//   const y = (H - size) * 0.5;

//   const rect = new SDL_FRect();
//   rect.properties.x = x;
//   rect.properties.y = y;
//   rect.properties.w = size;
//   rect.properties.h = size;

//   // clear background
//   // Note: you must set the draw color before Clear and before drawing each primitive
//   SDL.SDL_SetRenderDrawColor(renderer, 15, 15, 24, 255); // bg: dark blue-ish
//   SDL.SDL_RenderClear(renderer);

//   // draw filled square
//   SDL.SDL_SetRenderDrawColor(renderer, 64, 180, 255, 255); // fg: cyan-ish
//   SDL.SDL_RenderFillRect(renderer, rect.bunPointer);

//   // present
//   SDL.SDL_RenderPresent(renderer);

//   await sleep(0); // yield
// }

// // --- cleanup ---
// SDL.SDL_DestroyRenderer(renderer);
// SDL.SDL_DestroyWindow(win);
// SDL.SDL_Quit();

await win.startLooper();
