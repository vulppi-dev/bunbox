import { BunStruct, type StructSchema } from '../_struct';

const SDL_MessageBoxButtonDataSchema = {
  flags: { order: 0, type: 'u32' },
  buttonID: {
    order: 1,
    type: 'i32',
  } /**< User defined button id (value returned via SDL_ShowMessageBox) */,
  text: { order: 2, type: 'string' } /**< The UTF-8 button text */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MessageBoxButtonData
 */
export class SDL_MessageBoxButtonData extends BunStruct<
  typeof SDL_MessageBoxButtonDataSchema
> {
  constructor() {
    super(SDL_MessageBoxButtonDataSchema);
  }
}
