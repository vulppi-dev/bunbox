import { BunStruct, type StructSchema } from '../_struct'

const SDL_AudioDeviceEventSchema = {
  type: { order: 0, type: 'u32' },
  reserved: { order: 1, type: 'u32' },
  timestamp: { order: 2, type: 'u64' },
  which: { order: 3, type: 'u32' },
  recording: { order: 4, type: 'boolean' },
  padding1: { order: 5, type: 'u8' },
  padding2: { order: 6, type: 'u8' },
  padding3: { order: 7, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioDeviceEvent
 */
export class SDL_AudioDeviceEvent extends BunStruct<
  typeof SDL_AudioDeviceEventSchema
> {
  constructor() {
    super(SDL_AudioDeviceEventSchema)
  }
}
