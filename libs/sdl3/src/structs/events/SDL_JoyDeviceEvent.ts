import { SDL_EventType } from '../../enum/events';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_JoyDeviceEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_JOYSTICK_ADDED or SDL_EVENT_JOYSTICK_REMOVED or SDL_EVENT_JOYSTICK_UPDATE_COMPLETE */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_JoyDeviceEvent
 */
export class SDL_JoyDeviceEvent extends BunStruct<
  typeof SDL_JoyDeviceEventSchema
> {
  constructor() {
    super(SDL_JoyDeviceEventSchema);
  }
}
