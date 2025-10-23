/// <reference types="@types/bun" />

import { describe, expect, it } from 'bun:test';
import {
  array,
  bool,
  i8,
  pointer,
  string,
  struct,
  u16,
  u8,
  union,
} from '../src/fields';
import { instantiate, setupStruct } from '../src/parser';

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
  // Create a fresh codec for this test suite
  let codec = createStringCodec();

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

    const [proxy, buffer] = instantiate(person);
    proxy.name = 'Alice';
    proxy.age = 42;
    proxy.active = true;

    const view = new DataView(buffer);

    // The pointer should be non-zero (valid string pointer)
    const storedPointer = view.getBigUint64(0, true);
    expect(storedPointer).toBeGreaterThan(0n);
    expect(view.getUint8(8)).toBe(42);
    expect(view.getUint8(9)).toBe(1);

    // Verify we can read back the values correctly
    expect(proxy.name).toBe('Alice');
    expect(proxy.age).toBe(42);
    expect(proxy.active).toBe(true);
  });

  it('falls back to default string pointer when value missing', () => {
    const header = struct({
      title: string(),
      flag: u8(),
    });

    const [proxy, buffer] = instantiate(header);
    proxy.flag = 7;

    const view = new DataView(buffer);

    expect(view.getBigUint64(0, true)).toBe(0n);
    expect(view.getUint8(8)).toBe(7);

    expect(proxy.title).toBe('');
    expect(proxy.flag).toBe(7);
  });

  it('handles inline arrays and nested structs', () => {
    const payloadStruct = struct({
      values: array(u16(), 3),
      meta: struct({
        label: string(),
        count: u8(),
      }),
    });

    const [proxy] = instantiate(payloadStruct);
    proxy.values = [10, 20, 30];
    proxy.meta.label = 'payload';
    proxy.meta.count = 2;

    expect(proxy.values).toEqual([10, 20, 30]);
    expect(proxy.meta.label).toBe('payload');
    expect(proxy.meta.count).toBe(2);
  });

  it('serializes inline string arrays', () => {
    const tagsStruct = struct({
      tags: array(string(), 2),
    });

    const [proxy] = instantiate(tagsStruct);
    proxy.tags = ['alpha', 'beta'];

    expect(proxy.tags).toEqual(['alpha', 'beta']);
  });

  it('handles string field pointer storage and retrieval', () => {
    const message = struct({
      body: string(),
    });

    const [proxy, buffer] = instantiate(message);

    // Assign a string value
    proxy.body = 'hello world';

    const view = new DataView(buffer);

    // String should be stored as a non-zero pointer
    const storedPointer = view.getBigUint64(0, true);
    expect(storedPointer).toBeGreaterThan(0n);

    // Reading back should give us the same string
    expect(proxy.body).toBe('hello world');

    // Assign a different string
    proxy.body = 'goodbye';
    expect(proxy.body).toBe('goodbye');

    // Pointer should have changed
    const newPointer = view.getBigUint64(0, true);
    expect(newPointer).not.toBe(storedPointer);
    expect(newPointer).toBeGreaterThan(0n);
  });

  it('keeps pointer value for dynamic arrays without inline length', () => {
    const pointerArray = struct({
      buffer: pointer(array(u8())),
      label: string(),
    });

    const pointerValue = 0x1fffn;

    const [proxy, buffer] = instantiate(pointerArray);

    // Dynamic arrays as pointers are stored as pointers
    (proxy as any).buffer = pointerValue;
    proxy.label = 'ptr';

    const view = new DataView(buffer);

    expect(view.getBigUint64(0, true)).toBe(pointerValue);

    // Reading should return the pointer as-is
    expect(proxy.buffer).toBe(pointerValue);
    expect(proxy.label).toBe('ptr');
  });

  it('handles deeply nested structs with proxy caching', () => {
    const deepStruct = struct({
      level1: struct({
        value1: u8(),
        level2: struct({
          value2: u16(),
          level3: struct({
            value3: u8(),
            name: string(),
          }),
        }),
      }),
    });

    const [proxy] = instantiate(deepStruct);

    // Access nested structs multiple times to test proxy caching
    proxy.level1.value1 = 10;
    proxy.level1.level2.value2 = 20;
    proxy.level1.level2.level3.value3 = 30;
    proxy.level1.level2.level3.name = 'deep';

    expect(proxy.level1.value1).toBe(10);
    expect(proxy.level1.level2.value2).toBe(20);
    expect(proxy.level1.level2.level3.value3).toBe(30);
    expect(proxy.level1.level2.level3.name).toBe('deep');

    // Verify that accessing the same nested struct returns cached proxy
    const level1_ref1 = proxy.level1;
    const level1_ref2 = proxy.level1;
    expect(level1_ref1).toBe(level1_ref2);
  });

  it('clears cached proxies when nested struct is overwritten', () => {
    const containerStruct = struct({
      nested: struct({
        value: u8(),
      }),
    });

    const [proxy] = instantiate(containerStruct);

    // Set initial value
    proxy.nested.value = 42;
    expect(proxy.nested.value).toBe(42);

    // Overwrite the entire nested struct
    proxy.nested = { value: 100 };
    expect(proxy.nested.value).toBe(100);
  });

  it('supports multiple instances with independent buffers', () => {
    const personStruct = struct({
      name: string(),
      age: u8(),
    });

    const [proxy1, buffer1] = instantiate(personStruct);
    const [proxy2, buffer2] = instantiate(personStruct);

    proxy1.name = 'Alice';
    proxy1.age = 30;

    proxy2.name = 'Bob';
    proxy2.age = 25;

    // Verify independence
    expect(proxy1.name).toBe('Alice');
    expect(proxy1.age).toBe(30);
    expect(proxy2.name).toBe('Bob');
    expect(proxy2.age).toBe(25);

    // Verify different buffers
    expect(buffer1).not.toBe(buffer2);
  });

  it('handles has and ownKeys operations on proxies', () => {
    const dataStruct = struct({
      x: u8(),
      y: u8(),
      z: u8(),
    });

    const [proxy] = instantiate(dataStruct);

    expect('x' in proxy).toBe(true);
    expect('y' in proxy).toBe(true);
    expect('z' in proxy).toBe(true);
    expect('w' in proxy).toBe(false);
  });

  it('returns undefined for non-existent properties', () => {
    const simpleStruct = struct({
      value: u8(),
    });

    const [proxy] = instantiate(simpleStruct);

    expect((proxy as any).nonExistent).toBeUndefined();
  });

  it('handles arrays of nested structs', () => {
    const pointStruct = struct({
      x: u16(),
      y: u16(),
    });

    const polygonStruct = struct({
      points: array(pointStruct, 3),
    });

    const [proxy] = instantiate(polygonStruct);

    proxy.points = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
      { x: 50, y: 60 },
    ];

    const points = proxy.points as Array<{ x: number; y: number }>;
    expect(points[0]).toEqual({ x: 10, y: 20 });
    expect(points[1]).toEqual({ x: 30, y: 40 });
    expect(points[2]).toEqual({ x: 50, y: 60 });
  });
});

describe('union type', () => {
  // Create a fresh codec for this test suite
  let codec = createStringCodec();

  setupStruct({
    pack: 8,
    stringToPointer: codec.handlers.stringToPointer,
    pointerToString: codec.handlers.pointerToString,
  });

  it('overlays all fields at the same memory offset', () => {
    const valueUnion = union({
      asU8: u8(),
      asU16: u16(),
    });

    const [proxy, buffer] = instantiate(valueUnion);

    // Set via u16 field
    proxy.asU16 = 0x1234;

    const view = new DataView(buffer);

    // Both fields should read from the same memory location
    expect(view.getUint16(0, true)).toBe(0x1234);
    expect(view.getUint8(0)).toBe(0x34); // Low byte

    // Reading asU8 should get the low byte
    expect(proxy.asU8).toBe(0x34);
    expect(proxy.asU16).toBe(0x1234);
  });

  it('uses the size of the largest field', () => {
    const sizeUnion = union({
      small: u8(),
      medium: u16(),
    });

    const [_, buffer] = instantiate(sizeUnion);

    // Union should be sized to fit the largest field (u16 = 2 bytes)
    // With alignment, it should be at least 2 bytes
    expect(buffer.byteLength).toBeGreaterThanOrEqual(2);
  });

  it('overwrites previous values when setting different union fields', () => {
    const dataUnion = union({
      asInt: u16(),
      asBytes: array(u8(), 2),
    });

    const [proxy] = instantiate(dataUnion);

    // Set as integer
    proxy.asInt = 0xabcd;
    expect(proxy.asInt).toBe(0xabcd);

    // Read as byte array (should see the same bytes)
    const bytes = proxy.asBytes as number[];
    expect(bytes[0]).toBe(0xcd); // Low byte (little-endian)
    expect(bytes[1]).toBe(0xab); // High byte

    // Modify via byte array
    proxy.asBytes = [0x12, 0x34];

    // Should affect the integer view
    expect(proxy.asInt).toBe(0x3412);
  });

  it('handles unions with string fields', () => {
    const stringUnion = union({
      asString: string(),
      asPointer: u16(), // Using u16 to test overlay (pointer is 8 bytes, but we check overlap)
    });

    const [proxy, buffer] = instantiate(stringUnion);

    proxy.asString = 'test';

    const view = new DataView(buffer);

    // String pointer should be stored at offset 0 and be non-zero
    const stringPtr = view.getBigUint64(0, true);
    expect(stringPtr).toBeGreaterThan(0n);

    // Reading back should return the string
    expect(proxy.asString).toBe('test');
  });

  it('supports nested structs in unions', () => {
    const nestedUnion = union({
      point: struct({
        x: u8(),
        y: u8(),
      }),
      value: u16(),
    });

    const [proxy] = instantiate(nestedUnion);

    // Set via nested struct
    proxy.point.x = 0x12;
    proxy.point.y = 0x34;

    // Reading as u16 should see the combined bytes (little-endian)
    expect(proxy.value).toBe(0x3412);

    // Set via value
    proxy.value = 0xabcd;

    // Should affect nested struct fields
    expect(proxy.point.x).toBe(0xcd);
    expect(proxy.point.y).toBe(0xab);
  });

  it('correctly aligns union fields with different alignments', () => {
    const alignedUnion = union({
      byte: u8(),
      word: u16(),
    });

    const [proxy, buffer] = instantiate(alignedUnion);

    proxy.word = 0xffee;

    const view = new DataView(buffer);

    // All fields start at offset 0 in a union
    expect(view.getUint8(0)).toBe(0xee); // Low byte
    expect(view.getUint8(1)).toBe(0xff); // High byte
    expect(view.getUint16(0, true)).toBe(0xffee);
  });

  it('handles union with boolean and numeric fields', () => {
    const boolUnion = union({
      asBool: bool(),
      asU8: u8(),
    });

    const [proxy] = instantiate(boolUnion);

    proxy.asU8 = 42;
    expect(proxy.asBool).toBe(true); // Non-zero is true

    proxy.asU8 = 0;
    expect(proxy.asBool).toBe(false);

    proxy.asBool = true;
    expect(proxy.asU8).toBe(1);
  });

  it('supports unions within regular structs', () => {
    const containerStruct = struct({
      id: u8(),
      data: union({
        asInt: u16(),
        asFlag: bool(),
      }),
      name: string(),
    });

    const [proxy] = instantiate(containerStruct);

    proxy.id = 10;
    proxy.data.asInt = 0x0100;
    proxy.name = 'container';

    expect(proxy.id).toBe(10);
    expect(proxy.data.asInt).toBe(0x0100);
    expect(proxy.data.asFlag).toBe(false); // Low byte is 0
    expect(proxy.name).toBe('container');
  });

  it('maintains independent state for union proxies', () => {
    const testUnion = union({
      a: u8(),
      b: u16(),
    });

    const [proxy1] = instantiate(testUnion);
    const [proxy2] = instantiate(testUnion);

    proxy1.b = 0x1234;
    proxy2.b = 0x5678;

    expect(proxy1.b).toBe(0x1234);
    expect(proxy2.b).toBe(0x5678);
    expect(proxy1.a).toBe(0x34);
    expect(proxy2.a).toBe(0x78);
  });

  it('caches nested union proxies correctly', () => {
    const outerStruct = struct({
      inner: union({
        x: u8(),
        y: u16(),
      }),
    });

    const [proxy] = instantiate(outerStruct);

    const ref1 = proxy.inner;
    const ref2 = proxy.inner;

    // Should return the same cached proxy
    expect(ref1).toBe(ref2);

    // Modifications through cached reference should work
    ref1.y = 100;
    expect(proxy.inner.y).toBe(100);
    expect(ref2.y).toBe(100);
  });

  it('handles tagged union pattern with common discriminator field', () => {
    // Common pattern: first field is a type tag, rest differs
    const messageUnion = union({
      // Type 1: Text message
      asText: struct({
        type: u8(), // Discriminator at offset 0
        length: u16(), // Text-specific field
        priority: u8(), // Text-specific field
      }),
      // Type 2: Binary message
      asBinary: struct({
        type: u8(), // Same discriminator position
        size: u16(), // Binary-specific field
        flags: u8(), // Binary-specific field
      }),
      // Type 3: Control message
      asControl: struct({
        type: u8(), // Same discriminator position
        command: u16(), // Control-specific field
        reserved: u8(), // Control-specific field
      }),
    });

    const [proxy, buffer] = instantiate(messageUnion);
    const view = new DataView(buffer);

    // Set as text message (type = 1)
    proxy.asText.type = 1;
    proxy.asText.length = 256;
    proxy.asText.priority = 5;

    expect(proxy.asText.type).toBe(1);
    expect(proxy.asText.length).toBe(256);
    expect(proxy.asText.priority).toBe(5);

    // Check that the discriminator is at offset 0
    expect(view.getUint8(0)).toBe(1);

    // Read as binary - type should still be 1 (shared position)
    expect(proxy.asBinary.type).toBe(1);
    // But size and flags read from the same memory as length/priority
    expect(proxy.asBinary.size).toBe(256); // Same as length
    expect(proxy.asBinary.flags).toBe(5); // Same as priority

    // Now switch to binary type (type = 2)
    proxy.asBinary.type = 2;
    proxy.asBinary.size = 1024;
    proxy.asBinary.flags = 0xff;

    // All views should see the new type
    expect(proxy.asText.type).toBe(2);
    expect(proxy.asBinary.type).toBe(2);
    expect(proxy.asControl.type).toBe(2);

    // Binary-specific values
    expect(proxy.asBinary.size).toBe(1024);
    expect(proxy.asBinary.flags).toBe(0xff);

    // Reading as text shows same memory
    expect(proxy.asText.length).toBe(1024);
    expect(proxy.asText.priority).toBe(0xff);

    // Switch to control type (type = 3)
    proxy.asControl.type = 3;
    proxy.asControl.command = 0xabcd;
    proxy.asControl.reserved = 0x42;

    expect(view.getUint8(0)).toBe(3); // Type discriminator
    expect(proxy.asControl.type).toBe(3);
    expect(proxy.asControl.command).toBe(0xabcd);
    expect(proxy.asControl.reserved).toBe(0x42);

    // Other views still share the discriminator
    expect(proxy.asText.type).toBe(3);
    expect(proxy.asBinary.type).toBe(3);
  });

  it('supports discriminated union with different sized structs', () => {
    const variantUnion = union({
      // Small variant - 2 bytes total
      small: struct({
        tag: u8(),
        data: u8(),
      }),
      // Large variant - 4 bytes total (will determine union size)
      large: struct({
        tag: u8(),
        value1: u8(),
        value2: u8(),
        value3: u8(),
      }),
    });

    const [proxy, buffer] = instantiate(variantUnion);

    // Union should be sized for the largest variant
    expect(buffer.byteLength).toBeGreaterThanOrEqual(4);

    // Set as large variant
    proxy.large.tag = 2;
    proxy.large.value1 = 0xaa;
    proxy.large.value2 = 0xbb;
    proxy.large.value3 = 0xcc;

    expect(proxy.large.tag).toBe(2);
    expect(proxy.large.value1).toBe(0xaa);
    expect(proxy.large.value2).toBe(0xbb);
    expect(proxy.large.value3).toBe(0xcc);

    // Reading as small variant
    expect(proxy.small.tag).toBe(2); // Same tag position
    expect(proxy.small.data).toBe(0xaa); // Reads value1's memory

    // Set as small variant
    proxy.small.tag = 1;
    proxy.small.data = 0xff;

    // Large variant sees the changes in overlapping fields
    expect(proxy.large.tag).toBe(1);
    expect(proxy.large.value1).toBe(0xff);
    // value2 and value3 retain old values (not modified by small)
    expect(proxy.large.value2).toBe(0xbb);
    expect(proxy.large.value3).toBe(0xcc);
  });

  it('handles union with incompatible struct layouts after first field', () => {
    // Demonstra padrão de tagged union com estruturas incompatíveis
    // após o campo discriminador
    const eventUnion = union({
      mouseEvent: struct({
        eventType: u8(), // Discriminador comum no offset 0
        x: u16(), // Coordenadas do mouse
        y: u16(),
      }),
      keyEvent: struct({
        eventType: u8(), // Mesmo discriminador
        keyCode: u8(), // Layout diferente após o discriminador
        modifiers: u8(),
      }),
    });

    const [proxy, buffer] = instantiate(eventUnion);
    const view = new DataView(buffer);

    // Configurar como evento de mouse
    const MOUSE_EVENT = 10;
    proxy.mouseEvent.eventType = MOUSE_EVENT;
    proxy.mouseEvent.x = 150;
    proxy.mouseEvent.y = 200;

    // Verificar valores do mouse
    expect(proxy.mouseEvent.eventType).toBe(MOUSE_EVENT);
    expect(proxy.mouseEvent.x).toBe(150);
    expect(proxy.mouseEvent.y).toBe(200);

    // O discriminador é compartilhado
    expect(proxy.keyEvent.eventType).toBe(MOUSE_EVENT);
    expect(view.getUint8(0)).toBe(MOUSE_EVENT);

    // Mudar para evento de teclado
    const KEY_EVENT = 20;
    proxy.keyEvent.eventType = KEY_EVENT;
    proxy.keyEvent.keyCode = 65; // 'A'
    proxy.keyEvent.modifiers = 0b00000011; // Ctrl+Shift

    // Verificar valores do teclado
    expect(proxy.keyEvent.eventType).toBe(KEY_EVENT);
    expect(proxy.keyEvent.keyCode).toBe(65);
    expect(proxy.keyEvent.modifiers).toBe(0b00000011);

    // O discriminador mudou para ambas as views
    expect(proxy.mouseEvent.eventType).toBe(KEY_EVENT);
    expect(view.getUint8(0)).toBe(KEY_EVENT);

    // Demonstrar que memória é compartilhada (overlay)
    // Modificar keyCode afeta a memória que mouseEvent também usa
    proxy.keyEvent.keyCode = 0xab;
    proxy.keyEvent.modifiers = 0xcd;

    expect(proxy.keyEvent.keyCode).toBe(0xab);
    expect(proxy.keyEvent.modifiers).toBe(0xcd);

    // A union garante que todos os campos começam no offset 0
    // mas os structs internos têm layouts próprios
    expect(buffer.byteLength).toBeGreaterThanOrEqual(4);

    // Ambos os structs coexistem na mesma memória
    // O que foi escrito via keyEvent pode ser lido via mouseEvent
    // (embora com interpretação diferente devido aos tipos)
    const mouseX = proxy.mouseEvent.x;
    const mouseY = proxy.mouseEvent.y;

    expect(typeof mouseX).toBe('number');
    expect(typeof mouseY).toBe('number');
  });
});

describe('buffer size calculation', () => {
  let codec = createStringCodec();

  setupStruct({
    pack: 8,
    stringToPointer: codec.handlers.stringToPointer,
    pointerToString: codec.handlers.pointerToString,
  });

  it('calculates size for primitive types correctly', () => {
    const primitives = struct({
      byte: u8(),
      word: u16(),
    });

    const [_, buffer] = instantiate(primitives);

    // u8 (1 byte) + padding (1 byte) + u16 (2 bytes) = 4 bytes
    // With pack=8 alignment, u16 aligns to 2-byte boundary
    expect(buffer.byteLength).toBe(4);
  });

  it('calculates size with 8-byte aligned fields', () => {
    const aligned = struct({
      name: string(), // 8 bytes (pointer)
      age: u8(), // 1 byte
    });

    const [_, buffer] = instantiate(aligned);

    // string pointer (8 bytes) + u8 (1 byte) + padding (7 bytes) = 16 bytes
    // The struct is padded to align to the largest field (8 bytes)
    expect(buffer.byteLength).toBe(16);
  });

  it('calculates size for nested structs correctly', () => {
    const nested = struct({
      id: u8(),
      data: struct({
        x: u8(),
        y: u8(),
      }),
    });

    const [_, buffer] = instantiate(nested);

    // id (1 byte) + data.x (1 byte) + data.y (1 byte) + padding = aligned
    expect(buffer.byteLength).toBeGreaterThanOrEqual(3);
  });

  it('calculates size for inline arrays correctly', () => {
    const withArray = struct({
      count: u8(),
      values: array(u16(), 4),
    });

    const [_, buffer] = instantiate(withArray);

    // u8 (1 byte) + padding (1 byte) + array of 4 u16 (8 bytes) = 10 bytes
    // Plus alignment padding
    expect(buffer.byteLength).toBeGreaterThanOrEqual(10);
  });

  it('calculates size for unions using largest field', () => {
    const testUnion = union({
      small: u8(), // 1 byte
      medium: u16(), // 2 bytes
      large: string(), // 8 bytes (pointer)
    });

    const [_, buffer] = instantiate(testUnion);

    // Union size should match the largest field (string pointer = 8 bytes)
    expect(buffer.byteLength).toBe(8);
  });

  it('calculates size for union with nested structs', () => {
    const unionWithStructs = union({
      small: struct({
        a: u8(),
        b: u8(),
      }),
      large: struct({
        x: u16(),
        y: u16(),
        z: u16(),
      }),
    });

    const [_, buffer] = instantiate(unionWithStructs);

    // Should use size of largest struct
    // large: 3 * u16 = 6 bytes, aligned to 2 bytes = 6 bytes
    expect(buffer.byteLength).toBe(6);
  });

  it('aligns struct to largest field alignment', () => {
    const mixed = struct({
      flag: u8(), // 1 byte, align 1
      ptr: string(), // 8 bytes, align 8
      value: u8(), // 1 byte, align 1
    });

    const [_, buffer] = instantiate(mixed);

    // flag (1 byte) + padding (7 bytes) + ptr (8 bytes) + value (1 byte) + padding (7 bytes)
    // Total aligned to 8 bytes = 24 bytes
    expect(buffer.byteLength).toBe(24);
  });

  it('calculates size with multiple nested levels', () => {
    const deepNested = struct({
      level1: struct({
        a: u8(),
        level2: struct({
          b: u16(),
          level3: struct({
            c: u8(),
          }),
        }),
      }),
    });

    const [_, buffer] = instantiate(deepNested);

    // Minimum: u8 (1) + padding (1) + u16 (2) + u8 (1) + padding = at least 5 bytes
    expect(buffer.byteLength).toBeGreaterThanOrEqual(5);
  });

  it('handles empty struct edge case', () => {
    const empty = struct({});

    const [_, buffer] = instantiate(empty);

    // Empty struct should have minimal size
    expect(buffer.byteLength).toBeGreaterThanOrEqual(0);
  });

  it('calculates size for array of structs', () => {
    const arrayOfStructs = struct({
      points: array(
        struct({
          x: u16(),
          y: u16(),
        }),
        3,
      ),
    });

    const [_, buffer] = instantiate(arrayOfStructs);

    // 3 structs * (2 u16s = 4 bytes each) = 12 bytes minimum
    expect(buffer.byteLength).toBeGreaterThanOrEqual(12);
  });

  it('respects pack alignment parameter', () => {
    // This test verifies the struct respects the global pack setting (8)
    const packed = struct({
      a: u8(),
      b: string(), // Should align to min(8, 8) = 8 bytes
      c: u8(),
    });

    const [_, buffer] = instantiate(packed);

    // a (1 byte) + padding (7 bytes) + b (8 bytes) + c (1 byte) + padding (7 bytes)
    // With pack=8, total should be 24 bytes
    expect(buffer.byteLength).toBe(24);
  });

  it('calculates size for complex nested union', () => {
    const complexUnion = union({
      variant1: struct({
        type: u8(),
        data: array(u8(), 10),
      }),
      variant2: struct({
        type: u8(),
        value: string(),
      }),
    });

    const [_, buffer] = instantiate(complexUnion);

    // variant1: u8 (1) + array of 10 u8 (10) = 11 bytes
    // variant2: u8 (1) + padding (7) + string pointer (8) = 16 bytes
    // Union should use the larger: 16 bytes
    expect(buffer.byteLength).toBe(16);
  });

  it('handles consecutive same-size fields efficiently', () => {
    const consecutive = struct({
      a: u8(),
      b: u8(),
      c: u8(),
      d: u8(),
    });

    const [_, buffer] = instantiate(consecutive);

    // 4 consecutive u8s = 4 bytes (no padding between same-aligned fields)
    expect(buffer.byteLength).toBe(4);
  });

  it('calculates size with bool fields correctly', () => {
    const withBools = struct({
      flag1: bool(),
      flag2: bool(),
      flag3: bool(),
      value: u16(),
    });

    const [_, buffer] = instantiate(withBools);

    // 3 bools (3 bytes) + padding (1 byte) + u16 (2 bytes) = 6 bytes
    expect(buffer.byteLength).toBeGreaterThanOrEqual(6);
  });

  it('ensures proper alignment for string pointers', () => {
    const stringStruct = struct({
      str1: string(),
      str2: string(),
      str3: string(),
    });

    const [_, buffer] = instantiate(stringStruct);

    // 3 string pointers * 8 bytes = 24 bytes
    expect(buffer.byteLength).toBe(24);
  });

  it('calculates size for mixed inline and dynamic arrays', () => {
    const mixedArrays = struct({
      inlineArray: array(u8(), 5),
      dynamicArray: pointer(array(u8())), // pointer
      count: u8(),
    });

    const [_, buffer] = instantiate(mixedArrays);

    // inline array (5 bytes) + padding (3 bytes) + pointer (8 bytes) + u8 (1 byte) + padding (7 bytes)
    // Total = 24 bytes
    expect(buffer.byteLength).toBe(24);
  });
});
