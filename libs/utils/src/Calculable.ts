import type { FixedArray } from './types';
import { DirtyState } from './DirtyState';
import type { Cloneable } from './Cloneable';

export abstract class Calculable<N extends number = 1>
  extends DirtyState
  implements Cloneable
{
  abstract sum(vector: this): this;
  abstract sub(vector: this): this;
  abstract mul(vector: this): this;
  abstract div(vector: this): this;
  abstract mulS(scalar: number): this;
  abstract divS(scalar: number): this;
  abstract dot(vector: this): number;
  abstract copy(vector: this): this;

  abstract set(...args: FixedArray<number, N>): this;
  abstract toArray(): FixedArray<number, N>;
  abstract toBuffer(): Float32Array;
  abstract override toString(): string;

  length(): number {
    const values = this.toArray() as Array<number>;
    return Math.hypot(...values);
  }

  clone(): this {
    const clone = new (this.constructor as new () => this)();
    clone.set(...this.toArray());
    return clone;
  }

  equals(other: this): boolean {
    const a = this.toArray() as Array<number>;
    const b = other.toArray() as Array<number>;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  override valueOf() {
    return this.length();
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === 'string') return this.toString();
    return this.length();
  }
}
