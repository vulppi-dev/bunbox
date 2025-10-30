export class DirtyState {
  #isDirty: boolean = false;

  get isDirty(): boolean {
    return this.#isDirty;
  }

  markAsDirty(): this {
    this.#isDirty = true;
    return this;
  }

  markAsClean(): this {
    this.#isDirty = false;
    return this;
  }
}
