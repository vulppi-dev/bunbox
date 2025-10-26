import type { InferField, StructField } from './fields';
import {
  PTR_SIZE,
  calculateFieldSize,
  readFieldValue,
  writeFieldValue,
  type Bytes,
} from './utils';

declare global {
  namespace globalThis {
    const ___STRUCTS_SETUP___: {
      pack: Bytes;
      stringToPointer: (str: string) => bigint;
      pointerToString: (ptr: bigint) => string;
    } | null;
  }
}

const BASE_STRUCT_PROXY_HANDLERS: ProxyHandler<any> = {
  construct: () => {
    throw new Error('Cannot construct struct instances directly.');
  },
  defineProperty: () => {
    throw new Error('Cannot define properties on struct instances.');
  },
  deleteProperty: () => {
    throw new Error('Cannot delete properties from struct instances.');
  },
  apply: () => {
    throw new Error('Cannot call struct instances directly.');
  },
  getOwnPropertyDescriptor: () => {
    throw new Error('Cannot get property descriptors of struct instances.');
  },
  getPrototypeOf: () => {
    throw new Error('Cannot get prototype of struct instances.');
  },
  setPrototypeOf: () => {
    throw new Error('Cannot set prototype of struct instances.');
  },
  isExtensible: () => {
    throw new Error('Cannot check extensibility of struct instances.');
  },
  preventExtensions: () => {
    throw new Error('Cannot prevent extensions on struct instances.');
  },
};

export function setupStruct({
  pack = PTR_SIZE,
  stringToPointer,
  pointerToString,
}: {
  pack?: Bytes;
  stringToPointer: (str: string) => bigint;
  pointerToString: (ptr: bigint) => string;
}) {
  if (typeof ___STRUCTS_SETUP___ !== 'undefined') {
    ___STRUCTS_SETUP___!.pack = pack;
    ___STRUCTS_SETUP___!.stringToPointer = stringToPointer;
    ___STRUCTS_SETUP___!.pointerToString = pointerToString;
  } else {
    Object.defineProperty(globalThis, '___STRUCTS_SETUP___', {
      value: {
        pack,
        stringToPointer,
        pointerToString,
      },
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }
}

function createNestedStructProxy(
  field: StructField<any>,
  view: DataView,
  baseOffset: number,
  proxyCache: WeakMap<object, any>,
): any {
  const { pack, stringToPointer, pointerToString } = ___STRUCTS_SETUP___!;
  const { offsets } = calculateFieldSize(field, pack);
  const fieldKeys = Object.keys(field.fields);
  const fieldIndexMap = new Map(fieldKeys.map((key, idx) => [key, idx]));

  return new Proxy(
    {},
    {
      ...BASE_STRUCT_PROXY_HANDLERS,
      has(_, prop) {
        return prop in field.fields;
      },
      ownKeys(_) {
        return fieldKeys;
      },
      get(_, prop: string) {
        const fieldIndex = fieldIndexMap.get(prop);
        if (fieldIndex === undefined) return undefined;

        const childField = field.fields[prop]!;
        const absoluteOffset = baseOffset + offsets![fieldIndex]![0];

        const isPointer =
          'isPointer' in childField && childField.isPointer === true;
        if (childField.type === 'struct' && !isPointer) {
          let cachedProxy = proxyCache.get(childField);

          if (!cachedProxy) {
            cachedProxy = createNestedStructProxy(
              childField,
              view,
              absoluteOffset,
              proxyCache,
            );
            proxyCache.set(childField, cachedProxy);
          }

          return cachedProxy;
        }

        return readFieldValue(childField, view, absoluteOffset, {
          pack,
          pointerToString,
        });
      },
      set(_, prop: string, value) {
        const fieldIndex = fieldIndexMap.get(prop);
        if (fieldIndex === undefined) return false;

        const childField = field.fields[prop]!;
        const absoluteOffset = baseOffset + offsets![fieldIndex]![0];

        writeFieldValue(childField, value, view, absoluteOffset, {
          pack,
          stringToPointer,
        });

        const isPointer =
          'isPointer' in childField && childField.isPointer === true;
        if (childField.type === 'struct' && !isPointer) {
          proxyCache.delete(childField);
        }

        return true;
      },
    },
  );
}

export function instantiate<F extends StructField<any>>(
  field: F,
): [InferField<F>, ArrayBuffer] {
  if (typeof ___STRUCTS_SETUP___ === 'undefined') {
    throw new Error('Structs not setup. Please call setupStruct first.');
  }

  const { pack, stringToPointer, pointerToString } = ___STRUCTS_SETUP___!;
  const fieldCopy = structuredClone(field);
  const { size, offsets } = calculateFieldSize(fieldCopy, pack);
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  const proxyCache = new WeakMap<object, any>();
  const fieldKeys = Object.keys(fieldCopy.fields);
  const fieldIndexMap = new Map(fieldKeys.map((key, idx) => [key, idx]));

  const proxy = new Proxy({} as InferField<F>, {
    ...BASE_STRUCT_PROXY_HANDLERS,
    has(_, prop) {
      return prop in fieldCopy.fields;
    },
    ownKeys(_) {
      return fieldKeys;
    },
    get(_, prop: string) {
      const fieldIndex = fieldIndexMap.get(prop);
      if (fieldIndex === undefined) return undefined;

      const childField = fieldCopy.fields[prop]!;
      const offset = offsets![fieldIndex]![0];

      const isPointer =
        'isPointer' in childField && childField.isPointer === true;
      if (childField.type === 'struct' && !isPointer) {
        let cachedProxy = proxyCache.get(childField);

        if (!cachedProxy) {
          cachedProxy = createNestedStructProxy(
            childField,
            view,
            offset,
            proxyCache,
          );
          proxyCache.set(childField, cachedProxy);
        }

        return cachedProxy;
      }

      return readFieldValue(childField, view, offset, {
        pack,
        pointerToString,
      });
    },
    set(_, prop: string, value) {
      const fieldIndex = fieldIndexMap.get(prop);
      if (fieldIndex === undefined) return false;

      const childField = fieldCopy.fields[prop]!;
      const offset = offsets![fieldIndex]![0];

      writeFieldValue(childField, value, view, offset, {
        pack,
        stringToPointer,
      });

      const isPointer =
        'isPointer' in childField && childField.isPointer === true;
      if (childField.type === 'struct' && !isPointer) {
        proxyCache.delete(childField);
      }

      return true;
    },
  });

  return [proxy, buffer];
}

export function sizeOf(field: StructField<any>): number {
  if (typeof ___STRUCTS_SETUP___ === 'undefined') {
    throw new Error('Structs not setup. Please call setupStruct first.');
  }

  const { pack } = ___STRUCTS_SETUP___!;
  const { size } = calculateFieldSize(field, pack);
  return size;
}
