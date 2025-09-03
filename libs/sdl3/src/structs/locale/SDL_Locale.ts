import { BunStruct, type StructSchema } from '../_struct';

const SDL_LocaleSchema = {
  language: {
    order: 0,
    type: 'string',
  } /**< A language name, like "en" for English. */,
  country: {
    order: 1,
    type: 'string',
  } /**< A country, like "US" for America. Can be NULL. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Locale
 */
export class SDL_Locale extends BunStruct<typeof SDL_LocaleSchema> {
  constructor() {
    super(SDL_LocaleSchema);
  }
}
