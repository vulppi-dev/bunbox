import { SDL_Rect } from '$structs';

const rect = new SDL_Rect();
rect.properties.x = 0;
rect.properties.y = 1;
rect.properties.w = 200;
rect.properties.h = 300;

console.log('SDL_FRect:', new Int32Array(rect.view));
