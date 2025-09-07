export class Dirtyable {
  #isDirty: boolean = false;

  get isDirty(): boolean {
    return this.#isDirty;
  }

  markAsDirty(): this {
    this.#isDirty = true;
    return this;
  }

  unmarkAsDirty(): this {
    this.#isDirty = false;
    return this;
  }
}
