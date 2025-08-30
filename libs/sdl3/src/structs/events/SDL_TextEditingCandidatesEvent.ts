import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_TextEditingCandidatesEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_TEXT_EDITING_CANDIDATES */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  windowID: {
    order: 3,
    type: 'u32',
  } /**< The window with keyboard focus, if any */,
  candidates: {
    order: 4,
    type: 'array',
    to: 'string',
  } /**< The list of candidates, or NULL if there are no candidates available */,
  num_candidates: {
    order: 5,
    type: 'i32',
  } /**< The number of strings in `candidates` */,
  selected_candidate: {
    order: 6,
    type: 'i32',
  } /**< The index of the selected candidate, or -1 if no candidate is selected */,
  horizontal: {
    order: 7,
    type: 'boolean',
  } /**< true if the list is horizontal, false if it's vertical */,
  padding1: { order: 8, type: 'u8' },
  padding2: { order: 9, type: 'u8' },
  padding3: { order: 10, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TextEditingCandidatesEvent
 */
export class SDL_TextEditingCandidatesEvent extends BunStruct<
  typeof SDL_TextEditingCandidatesEventSchema
> {
  constructor() {
    super(SDL_TextEditingCandidatesEventSchema)
  }
}
