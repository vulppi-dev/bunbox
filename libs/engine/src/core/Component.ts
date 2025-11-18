import { ulid } from 'ulid';

export const COMPONENT_TYPE = Symbol('isComponentType');

export type ComponentProps = { [x: string | symbol]: any };

export type ComponentType<T extends ComponentProps> = {
  id: string;
  name: string;
  props: T;
};

export function defineComponent<T extends ComponentProps>(
  name: string,
  initialProps: T,
): ComponentType<T> {
  const comp = {
    id: ulid(),
    name,
    props: initialProps,
  } as ComponentType<T>;

  Object.defineProperty(comp, COMPONENT_TYPE, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });

  return comp;
}

export function isComponentType<T extends ComponentProps>(
  obj: any,
): obj is ComponentType<T> {
  return Boolean(obj && obj[COMPONENT_TYPE] === true);
}
