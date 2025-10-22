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
import { toBuffer, toObject } from '../src/parser';

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
  it('encodes and decodes primitives with string fields', () => {
    const codec = createStringCodec();
    const person = struct({
      name: string(),
      age: u8(),
      active: bool(),
    });

    const payload: InferField<typeof person> = {
      name: 'Alice',
      age: 42,
      active: true,
    };

    const buffer = toBuffer(person, payload, codec.handlers);

    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    expect(view.getBigUint64(0, true)).toBe(codec.getPointer('Alice'));
    expect(view.getUint8(8)).toBe(42);
    expect(view.getUint8(9)).toBe(1);

    const decoded = toObject(person, buffer, codec.handlers);
    expect(decoded).toEqual(payload);
  });

  it('falls back to default string pointer when value missing', () => {
    const codec = createStringCodec();
    const header = struct({
      title: string(),
      flag: u8(),
    });

    const buffer = toBuffer(header, { flag: 7 }, codec.handlers);
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    expect(view.getBigUint64(0, true)).toBe(0n);
    expect(view.getUint8(8)).toBe(7);

    const decoded = toObject(header, buffer, codec.handlers);
    expect(decoded).toEqual({ title: '', flag: 7 });
  });

  it('handles inline arrays and nested structs', () => {
    const codec = createStringCodec();
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

    const buffer = toBuffer(payloadStruct, payload, codec.handlers);
    const decoded = toObject(payloadStruct, buffer, codec.handlers);
    expect(decoded).toEqual(payload);
  });

  it('serializes inline string arrays', () => {
    const codec = createStringCodec();
    const tagsStruct = struct({
      tags: array(string(), { length: 2 }),
    });

    const payload = {
      tags: ['alpha', 'beta'],
    };

    const buffer = toBuffer(tagsStruct, payload, codec.handlers);
    const decoded = toObject(tagsStruct, buffer, codec.handlers);
    expect(decoded).toEqual(payload);
  });

  it('preserves externally allocated string pointers', () => {
    const codec = createStringCodec();
    const message = struct({
      body: string(),
    });

    const existingPointer = 512n;
    codec.setPointer(existingPointer, 'external');

    const payload: InferField<typeof message> = {
      body: existingPointer,
    };

    const buffer = toBuffer(message, payload, codec.handlers);

    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    expect(view.getBigUint64(0, true)).toBe(existingPointer);

    const decoded = toObject(message, buffer, codec.handlers);
    expect(decoded).toEqual({ body: 'external' });
  });

  it('keeps pointer value for dynamic arrays without inline length', () => {
    const codec = createStringCodec();
    const pointerArray = struct({
      buffer: array(u8()),
      label: string(),
    });

    const pointer = 0x1fffn;
    const payload = {
      buffer: pointer,
      label: 'ptr',
    } as const;

    const buffer = toBuffer(pointerArray, payload, codec.handlers);

    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    expect(view.getBigUint64(0, true)).toBe(pointer);

    const decoded = toObject(pointerArray, buffer, codec.handlers);
    expect(decoded).toEqual({ buffer: pointer, label: 'ptr' });
  });
});
