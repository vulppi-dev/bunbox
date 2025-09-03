import { BunStruct, type StructSchema } from '../_struct';

const SDL_DateTimeSchema = {
  year: { order: 0, type: 'i32' },
  month: { order: 1, type: 'i32' },
  day: { order: 2, type: 'i32' },
  hour: { order: 3, type: 'i32' },
  minute: { order: 4, type: 'i32' },
  second: { order: 5, type: 'i32' },
  nanosecond: { order: 6, type: 'i32' },
  day_of_week: { order: 7, type: 'i32' },
  utc_offset: { order: 8, type: 'i32' },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DateTime
 */
export class SDL_DateTime extends BunStruct<typeof SDL_DateTimeSchema> {
  constructor() {
    super(SDL_DateTimeSchema);
  }
}
