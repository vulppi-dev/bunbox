import { SDL_EventType } from '../../enum/events';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_QuitEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_QUIT */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_QuitEvent
 */
export class SDL_QuitEvent extends BunStruct<typeof SDL_QuitEventSchema> {
  constructor() {
    super(SDL_QuitEventSchema);
  }
}
