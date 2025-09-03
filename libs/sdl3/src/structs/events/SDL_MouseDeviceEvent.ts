import { SDL_EventType } from '../../enum/events';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_MouseDeviceEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_MOUSE_DEVICE_ADDED or SDL_EVENT_MOUSE_DEVICE_REMOVED */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MouseDeviceEvent
 */
export class SDL_MouseDeviceEvent extends BunStruct<
  typeof SDL_MouseDeviceEventSchema
> {
  constructor() {
    super(SDL_MouseDeviceEventSchema);
  }
}
