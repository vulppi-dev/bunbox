import { Calculable } from '@bunbox/utils';

export abstract class AbstractVector<N extends number = 1> extends Calculable<N> {
  normalize(): this {
    const len = this.length();
    if (len === 0) {
      return this;
    }
    return this.divS(len);
  }
}
