import { SDL_EventType } from '../../enum/events';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_GamepadDeviceEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_GAMEPAD_ADDED, SDL_EVENT_GAMEPAD_REMOVED, or SDL_EVENT_GAMEPAD_REMAPPED, SDL_EVENT_GAMEPAD_UPDATE_COMPLETE or SDL_EVENT_GAMEPAD_STEAM_HANDLE_UPDATED */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GamepadDeviceEvent
 */
export class SDL_GamepadDeviceEvent extends BunStruct<
  typeof SDL_GamepadDeviceEventSchema
> {
  constructor() {
    super(SDL_GamepadDeviceEventSchema);
  }
}
