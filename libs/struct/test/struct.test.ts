/// <reference types="@types/bun" />

import { describe, expect, it } from 'bun:test';

import {
  array,
  bool,
  string,
  struct,
  u16,
  u8,
  type InferField,
} from '../src/fields';
import {
  prepareObject,
  setupStruct,
  bufferToObject,
  objectToBuffer,
} from '../src/parser';

function createStringCodec() {
  const byValue = new Map<string, bigint>();
  const byPointer = new Map<bigint, string>();
  let nextPointer = 1n;

  return {
    handlers: {
      stringToPointer(value: string): bigint {
        if (!value) {
          return 0n;
        }

        const cached = byValue.get(value);
        if (cached) {
          return cached;
        }

        const pointer = nextPointer;
        nextPointer += 1n;
        byValue.set(value, pointer);
        byPointer.set(pointer, value);
        return pointer;
      },
      pointerToString(pointer: bigint): string {
        if (pointer === 0n) {
          return '';
        }

        return byPointer.get(pointer) ?? '';
      },
    },
    getPointer(value: string): bigint {
      return byValue.get(value) ?? 0n;
    },
    setPointer(pointer: bigint, value: string): void {
      if (!value) {
        return;
      }

      byPointer.set(pointer, value);
    },
  } as const;
}

describe('struct parser', () => {
  const codec = createStringCodec();
  setupStruct({
    pack: 8,
    stringToPointer: codec.handlers.stringToPointer,
    pointerToString: codec.handlers.pointerToString,
  });

  it('encodes and decodes primitives with string fields', () => {
    const person = struct({
      name: string(),
      age: u8(),
      active: bool(),
    });

    const payload = prepareObject(person);
    payload.name = 'Alice';
    payload.age = 42;
    payload.active = true;

    const buffer = objectToBuffer(person, payload);

    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    expect(view.getBigUint64(0, true)).toBe(codec.getPointer('Alice'));
    expect(view.getUint8(8)).toBe(42);
    expect(view.getUint8(9)).toBe(1);

    const decoded = bufferToObject(person, buffer);
    expect(decoded).toEqual(payload);
  });

  it('falls back to default string pointer when value missing', () => {
    const header = struct({
      title: string(),
      flag: u8(),
    });

    const payload = prepareObject(header);
    payload.flag = 7;

    const buffer = objectToBuffer(header, payload);
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    expect(view.getBigUint64(0, true)).toBe(0n);
    expect(view.getUint8(8)).toBe(7);

    const decoded = bufferToObject(header, buffer);
    expect(decoded).toEqual({ title: '', flag: 7 });
  });

  it('handles inline arrays and nested structs', () => {
    const payloadStruct = struct({
      values: array(u16(), { length: 3 }),
      meta: struct({
        label: string(),
        count: u8(),
      }),
    });

    const payload = {
      values: [10, 20, 30],
      meta: { label: 'payload', count: 2 },
    };

    const buffer = objectToBuffer(payloadStruct, payload);
    const decoded = bufferToObject(payloadStruct, buffer);
    expect(decoded).toEqual(payload);
  });

  it('serializes inline string arrays', () => {
    const tagsStruct = struct({
      tags: array(string(), { length: 2 }),
    });

    const payload = {
      tags: ['alpha', 'beta'],
    };

    const buffer = objectToBuffer(tagsStruct, payload);
    const decoded = bufferToObject(tagsStruct, buffer);
    expect(decoded).toEqual(payload);
  });

  it('preserves externally allocated string pointers', () => {
    const message = struct({
      body: string(),
    });

    const existingPointer = 512n;
    codec.setPointer(existingPointer, 'external');

    const payload: InferField<typeof message> = {
      body: existingPointer,
    };

    const buffer = objectToBuffer(message, payload);

    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    expect(view.getBigUint64(0, true)).toBe(existingPointer);

    const decoded = bufferToObject(message, buffer);
    expect(decoded).toEqual({ body: 'external' });
  });

  it('keeps pointer value for dynamic arrays without inline length', () => {
    const pointerArray = struct({
      buffer: array(u8()),
      label: string(),
    });

    const pointer = 0x1fffn;
    const payload = {
      buffer: pointer,
      label: 'ptr',
    } as const;

    const buffer = objectToBuffer(pointerArray, payload);

    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    expect(view.getBigUint64(0, true)).toBe(pointer);

    const decoded = bufferToObject(pointerArray, buffer);
    expect(decoded).toEqual({ buffer: pointer, label: 'ptr' });
  });
});
