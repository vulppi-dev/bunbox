import { i32, struct, string, array, u32, f32 } from '@bunbox/struct';

export const image = struct({
  width: i32(),
  height: i32(),
  pixels: string(),
});

export const videoMode = struct({
  width: i32(),
  height: i32(),
  redBits: i32(),
  greenBits: i32(),
  blueBits: i32(),
  refreshRate: i32(),
});

export const gamepadState = struct({
  buttons: array(u32(), 15),
  axes: array(f32(), 6),
});
