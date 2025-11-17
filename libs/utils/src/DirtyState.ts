export class DirtyState {
  private __isDirty: boolean = true;

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
