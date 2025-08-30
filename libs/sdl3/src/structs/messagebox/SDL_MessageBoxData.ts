import { BunStruct, type StructSchema } from '../_struct'
import { SDL_MessageBoxButtonData } from './SDL_MessageBoxButtonData'
import { SDL_MessageBoxColorScheme } from './SDL_MessageBoxColorScheme'

export const SDL_MessageBoxDataSchema = {
  flags: { order: 0, type: 'u32' },
  window: { order: 1, type: 'void' },
  title: { order: 2, type: 'string' },
  message: { order: 3, type: 'string' },
  numbuttons: { order: 4, type: 'i32' },
  buttons: { order: 5, type: 'struct', schema: SDL_MessageBoxButtonData },
  colorScheme: {
    order: 6,
    type: 'struct',
    schema: SDL_MessageBoxColorScheme,
  } /**< SDL_MessageBoxColorScheme, can be NULL to use system settings */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MessageBoxData
 */
export class SDL_MessageBoxData extends BunStruct<
  typeof SDL_MessageBoxDataSchema
> {
  constructor() {
    super(SDL_MessageBoxDataSchema)
  }
}
