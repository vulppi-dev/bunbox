import { App, Window } from '../src/core';
import { Renderer } from '../src/core/Renderer';

const app = new App();
const win = new Window({
  app,
  title: '2D Square',
  x: 16,
  y: 16,
  features: {
    resizable: true,
    highPixelDensity: true,
  },
});

const renderer = new Renderer();
renderer.clearColor.set(0.06, 0.06, 0.09, 1.0); // dark blue-ish

win.addChild(renderer);

//   const size = Math.floor(Math.min(W, H) * 0.25); // 25% of min dimension
//   const x = (W - size) * 0.5;
//   const y = (H - size) * 0.5;

//   const rect = new SDL_FRect();
//   rect.properties.x = x;
//   rect.properties.y = y;
//   rect.properties.w = size;
//   rect.properties.h = size;

//   SDL.SDL_SetRenderDrawColor(renderer, 64, 180, 255, 255); // fg: cyan-ish
//   SDL.SDL_RenderFillRect(renderer, rect.bunPointer);

await win.startLooper();
