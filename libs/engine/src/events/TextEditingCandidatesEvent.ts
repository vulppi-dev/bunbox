import { Event, type EventOptions } from './Event';

export type TextEditingCandidatesEventOptions = {} & EventOptions;

export class TextEditingCandidatesEvent extends Event {
  constructor(options: TextEditingCandidatesEventOptions) {
    super(options);
  }
}
