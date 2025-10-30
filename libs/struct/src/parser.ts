import type { AllFields, InferField, StructField } from './fields';
import {
  PTR_SIZE,
  calculateFieldSize,
  readFieldValue,
  writeFieldValue,
  type Bytes,
  type StructOffsets,
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
    return {
      configurable: false,
      enumerable: true,
      writable: true,
    };
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
    throw new Error('Structs have already been setup.');
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

// WeakMap to store the buffer associated with each proxy instance
const PROXY_BUFFER_MAP = new WeakMap<object, ArrayBuffer>();

// WeakMap to store metadata needed for serialization
const PROXY_METADATA_MAP = new WeakMap<
  object,
  {
    fields: Record<string, AllFields>;
    offsets: StructOffsets;
    view: DataView;
  }
>();

function serializeValue(value: any): any {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }
  if (typeof value === 'object' && value !== null) {
    // Check if it's a struct instance
    const metadata = PROXY_METADATA_MAP.get(value);
    if (metadata) {
      return instanceToObject(
        value,
        metadata.fields,
        metadata.offsets,
        metadata.view,
      );
    }
  }
  return value;
}

function instanceToObject(
  instance: any,
  fields: Record<string, AllFields>,
  offsets: StructOffsets,
  view: DataView,
  baseOffset: number = 0,
): Record<string, any> {
  const { pack, pointerToString } = ___STRUCTS_SETUP___!;
  const result: Record<string, any> = {};
  const fieldKeys = Object.keys(fields);
  const fieldIndexMap = new Map(fieldKeys.map((key, idx) => [key, idx]));

  for (const key of fieldKeys) {
    const fieldIndex = fieldIndexMap.get(key)!;
    const childField = fields[key]!;
    const absoluteOffset = baseOffset + offsets[fieldIndex]![0];

    const isPointer =
      'isPointer' in childField && childField.isPointer === true;

    if (childField.type === 'struct' && !isPointer) {
      // Access the nested struct through the proxy
      const nestedValue = instance[key];
      result[key] = serializeValue(nestedValue);
    } else {
      const value = readFieldValue(childField, view, absoluteOffset, {
        pack,
        pointerToString,
      });
      result[key] = serializeValue(value);
    }
  }

  return result;
}

function createStructProxy(
  fields: Record<string, AllFields>,
  offsets: StructOffsets,
  view: DataView,
  baseOffset: number,
  proxyCache: WeakMap<object, any>,
): any {
  const { pack, stringToPointer, pointerToString } = ___STRUCTS_SETUP___!;
  const fieldKeys = Object.keys(fields);
  const fieldIndexMap = new Map(fieldKeys.map((key, idx) => [key, idx]));

  return new Proxy(
    {},
    {
      ...BASE_STRUCT_PROXY_HANDLERS,
      has(_, prop) {
        return prop in fields;
      },
      ownKeys(_) {
        return fieldKeys;
      },
      get(_, prop: string) {
        const fieldIndex = fieldIndexMap.get(prop);
        if (fieldIndex === undefined) return undefined;

        const childField = fields[prop]!;
        const absoluteOffset = baseOffset + offsets[fieldIndex]![0];

        const isPointer =
          'isPointer' in childField && childField.isPointer === true;
        if (childField.type === 'struct' && !isPointer) {
          let cachedProxy = proxyCache.get(childField);

          if (!cachedProxy) {
            cachedProxy = createStructProxyWrapper(
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

        const childField = fields[prop]!;
        const absoluteOffset = baseOffset + offsets[fieldIndex]![0];

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

function createStructProxyWrapper(
  field: StructField<any>,
  view: DataView,
  baseOffset: number,
  proxyCache: WeakMap<object, any>,
): any {
  const { pack } = ___STRUCTS_SETUP___!;
  const { offsets } = calculateFieldSize(field, pack);

  return createStructProxy(
    field.fields,
    offsets!,
    view,
    baseOffset,
    proxyCache,
  );
}

export function instantiate<F extends StructField<any>>(
  field: F,
): InferField<F> {
  if (typeof ___STRUCTS_SETUP___ === 'undefined') {
    throw new Error('Structs not setup. Please call setupStruct first.');
  }

  const { pack } = ___STRUCTS_SETUP___!;
  const fieldCopy = structuredClone(field);
  const { size, offsets } = calculateFieldSize(fieldCopy, pack);
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  const proxyCache = new WeakMap<object, any>();

  const proxy = createStructProxy(
    fieldCopy.fields,
    offsets!,
    view,
    0,
    proxyCache,
  ) as InferField<F>;

  // Store the buffer and metadata associated with this proxy instance
  PROXY_BUFFER_MAP.set(proxy, buffer);
  PROXY_METADATA_MAP.set(proxy, {
    fields: fieldCopy.fields,
    offsets: offsets!,
    view,
  });

  return proxy;
}

export function getInstanceBuffer(instance: Record<string, any>): ArrayBuffer {
  const buffer = PROXY_BUFFER_MAP.get(instance);
  if (!buffer) {
    throw new Error(
      'Instance buffer not found. Is this a valid struct instance?',
    );
  }
  return buffer;
}

export function instanceToJSON<I extends Record<string, any>>(instance: I): I {
  const metadata = PROXY_METADATA_MAP.get(instance);
  if (!metadata) {
    throw new Error(
      'Instance metadata not found. Is this a valid struct instance?',
    );
  }

  const obj = instanceToObject(
    instance,
    metadata.fields,
    metadata.offsets,
    metadata.view,
  );

  return obj as I;
}

export function sizeOf(field: StructField<any>): number {
  if (typeof ___STRUCTS_SETUP___ === 'undefined') {
    throw new Error('Structs not setup. Please call setupStruct first.');
  }

  const { pack } = ___STRUCTS_SETUP___!;
  const { size } = calculateFieldSize(field, pack);
  return size;
}
