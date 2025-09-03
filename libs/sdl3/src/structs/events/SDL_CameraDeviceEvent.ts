import { BunStruct, type StructSchema } from '../_struct';

const SDL_CameraDeviceEventSchema = {
  type: { order: 0, type: 'u32' },
  reserved: { order: 1, type: 'u32' },
  timestamp: { order: 2, type: 'u64' },
  which: { order: 3, type: 'u32' },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_CameraDeviceEvent
 */
export class SDL_CameraDeviceEvent extends BunStruct<
  typeof SDL_CameraDeviceEventSchema
> {
  constructor() {
    super(SDL_CameraDeviceEventSchema);
  }
}
