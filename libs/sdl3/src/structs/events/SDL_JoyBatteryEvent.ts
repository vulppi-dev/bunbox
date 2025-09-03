import { SDL_EventType } from '../../enum/events';
import { SDL_PowerState } from '../../enum/power';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_JoyBatteryEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_JOYSTICK_BATTERY_UPDATED */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
  state: {
    order: 4,
    type: 'enum',
    enum: SDL_PowerState,
  } /**< The joystick battery state */,
  percent: {
    order: 5,
    type: 'u8',
  } /**< The joystick battery percent charge remaining */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_JoyBatteryEvent
 */
export class SDL_JoyBatteryEvent extends BunStruct<
  typeof SDL_JoyBatteryEventSchema
> {
  constructor() {
    super(SDL_JoyBatteryEventSchema);
  }
}
