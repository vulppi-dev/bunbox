export class DirtyState {
  private __isDirty: boolean = false;

  get isDirty(): boolean {
    return this.__isDirty;
  }

  markAsDirty(): this {
    this.__isDirty = true;
    return this;
  }

  markAsClean(): this {
    this.__isDirty = false;
    return this;
  }
}
