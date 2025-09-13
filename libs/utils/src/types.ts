export type FixedArray<
  T,
  N extends number,
  R extends T[] = [],
> = R['length'] extends N ? R : FixedArray<T, N, [...R, T]>;

export type WithName<T, S extends string = string> = T & { name: S };

export type Ctor = new (...args: any[]) => any;
