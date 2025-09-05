import type { FFIFunction } from 'bun:ffi';

export const SENSOR_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CloseSensor
   */
  SDL_CloseSensor: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorData
   */
  SDL_GetSensorData: { args: ['ptr', 'ptr', 'int'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorFromID
   */
  SDL_GetSensorFromID: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorID
   */
  SDL_GetSensorID: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorName
   */
  SDL_GetSensorName: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorNameForID
   */
  SDL_GetSensorNameForID: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorNonPortableType
   */
  SDL_GetSensorNonPortableType: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorNonPortableTypeForID
   */
  SDL_GetSensorNonPortableTypeForID: { args: ['u32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorProperties
   */
  SDL_GetSensorProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensors
   */
  SDL_GetSensors: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorType
   */
  SDL_GetSensorType: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSensorTypeForID
   */
  SDL_GetSensorTypeForID: { args: ['u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenSensor
   */
  SDL_OpenSensor: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateSensors
   */
  SDL_UpdateSensors: { args: [], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
