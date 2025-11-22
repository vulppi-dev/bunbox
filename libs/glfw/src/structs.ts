import { array, f32, i32, pointer, struct, u32, u8 } from '@bunbox/struct';

export const glfwImageStruct = struct({
  width: i32(),
  height: i32(),
  pixels: pointer(array(u8())),
});

export const glfwVideoModeStruct = struct({
  width: i32(),
  height: i32(),
  redBits: i32(),
  greenBits: i32(),
  blueBits: i32(),
  refreshRate: i32(),
});

export const glfwGamepadStateStruct = struct({
  buttons: array(u32(), 15),
  axes: array(f32(), 6),
});
