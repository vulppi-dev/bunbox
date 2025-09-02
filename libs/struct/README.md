# @bunbox/struct

A TypeScript library for **defining, serializing, and manipulating C‑like structs in memory**. Perfect for **WebAssembly interop, FFI bindings, and low‑level binary data handling**.

---

## Highlights (what’s new)

- **Property Proxy API**: interact with fields via `struct.properties.<field>`; reads pull from the backing buffer, writes persist immediately.
- **Inline vs pointer-to-struct**: `isInline` embeds child bytes; otherwise a pointer is stored (safe-by-copy on read).
- **Arrays reworked**:

  - Inline arrays (`length`) store contiguous payload.
  - Dynamic arrays store a **pointer**; inline `string[]`/`boolean[]` are supported.

- **Enum width per field** via `bytes: 'u8' | 'u16' | 'u32' | 'u64'`.
- **Union-like overlay**: `new Struct(schema, /*isOverlay=*/true)` places all fields at offset 0; size = max(field).
- **C-style layout** with optional `pack(N)` (override `_pack()` in your runtime subclass).

---

## Installation

```bash
bun add @bunbox/struct
```

Requirements:

- **Node.js ≥ 22** or **Bun ≥ 1.2**

---

## Quick start (Bun FFI)

```ts
import { AbstractStruct, type StructSchema, cstr } from '@bunbox/struct'
import { ptr, read, CString, type Pointer } from 'bun:ffi'

class BunStruct<TSchema extends StructSchema> extends AbstractStruct<TSchema> {
  protected _ptr(
    buffer: ArrayBufferLike | NodeJS.TypedArray<ArrayBufferLike>,
  ): bigint {
    return ptr(buffer)
  }
  protected _read(pointer: bigint, index: number, type: any): any {
    switch (type) {
      case 'i8':
        return read.i8(pointer, index)
      case 'u8':
        return read.u8(pointer, index)
      case 'boolean':
        return !!read.u8(pointer, index)
      case 'i16':
        return read.i16(pointer, index)
      case 'u16':
        return read.u16(pointer, index)
      case 'i32':
        return read.i32(pointer, index)
      case 'u32':
        return read.u32(pointer, index)
      case 'f32':
        return read.f32(pointer, index)
      case 'i64':
        return read.i64(pointer, index)
      case 'u64':
        return read.u64(pointer, index)
      case 'f64':
        return read.f64(pointer, index)
      case 'void':
      case 'string':
        return read.intptr(pointer, index)
      default:
        throw new Error(`Unsupported type: ${type}`)
    }
  }
  protected _pack() {
    return 8 as const
  } // LP64
  protected _toString(p: bigint): string {
    return new CString(Number(p) as Pointer)
  }
}

const UserSchema = {
  id: { order: 1, type: 'u32' },
  age: { order: 2, type: 'u8' },
  name: { order: 3, type: 'string' },
} as const satisfies StructSchema

class UserStruct extends BunStruct<typeof UserSchema> {
  constructor() {
    super(UserSchema)
  }
}

const user = new UserStruct()
user.properties.id = 123
user.properties.age = 42
user.properties.name = 'Alice'

// Backing memory ready for FFI/WASM
const ptrToUser = user.pointer
const bytes = user.buffer // Uint8Array
```

> **Why a Proxy?** Property access remains ergonomic while guaranteeing that values are always synced with the underlying `DataView`.

---

## Defining schemas

```ts
const Person = {
  id: { order: 1, type: 'u32' },
  height: { order: 2, type: 'f32' },
  alive: { order: 3, type: 'boolean' },
  name: { order: 4, type: 'string' }, // stores a pointer to C-string
} as const
```

**Ordering is required** (`order: number`) and defines layout order.

Supported **primitive labels**: `i8, i16, i32, i64, u8, u16, u32, u64, f32, f64, boolean, string, void`.

---

## Inline vs pointer-to-struct

```ts
const Vec2 = {
  x: { order: 1, type: 'f32' },
  y: { order: 2, type: 'f32' },
} as const

const Transform = {
  position: {
    order: 1,
    type: 'struct',
    schema: class V extends BunStruct<typeof Vec2> {
      constructor() {
        super(Vec2)
      }
    },
    isInline: true,
  },
  target: {
    order: 2,
    type: 'struct',
    schema: class V2 extends BunStruct<typeof Vec2> {
      constructor() {
        super(Vec2)
      }
    },
  }, // pointer
} as const
```

- `isInline: true` embeds child bytes directly into the parent.
- Without `isInline`, the field stores a **pointer**. On **read**, the library **copies** from pointed memory into a fresh instance (safe-by-copy).
- Self‑referencing inline (`schema: 'self'` + `isInline`) is **not allowed**.

---

## Arrays (inline & dynamic)

```ts
const Buffers = {
  // Inline numeric array (contiguous payload)
  samples: { order: 1, type: 'array', to: 'f32', length: 256 },

  // Inline pointers to C-strings
  args: { order: 2, type: 'array', to: 'string', length: 3 },

  // Dynamic array: a single pointer stored in the struct
  blob: { order: 3, type: 'array', to: 'u8' },
} as const
```

- **Inline arrays** require `length` and store contiguous bytes; for `string[]` they store an inline table of pointers; for `boolean[]` they pack as `u8` per element.
- **Dynamic arrays** store only a pointer (you pass a TypedArray or `string[]`/`boolean[]`; the library writes the pointer and retains the backing bytes where applicable).

Usage examples:

```ts
s.properties.samples = new Float32Array(256)
s.properties.args = ['hello', 'world', 'SDL']
s.properties.blob = new Uint8Array([1, 2, 3, 4])
```

---

## Enums

```ts
enum Mode {
  Off = 0,
  On = 1,
}
const WithEnum = {
  mode: { order: 1, type: 'enum', enum: Mode, bytes: 'u8' }, // default is u32
} as const
```

- `bytes` controls storage width per field.

---

## Unions & `pack(N)`

- **Union-like overlay**: `new MyStruct(schema, true)` places all fields at offset `0`; the struct size becomes the **max field size**.
- **Packing**: override `_pack()` to limit field alignment to `min(natural, N)`, emulating `#pragma pack(N)`. This affects placement, not the natural size of each type.

---

## Memory model & alignment

- Layout is **C-style**, with natural alignments, then rounded by an optional `pack(N)` cap.
- Pointer-sized fields (`string`, `void`, function pointers, non-inline structs, dynamic arrays) use **LP64** defaults (8 bytes on x86_64).
- `boolean` occupies **1 byte**; when placed in inline arrays, each element is `u8`.

---

## Runtime integration (abstract methods)

`AbstractStruct` is runtime-agnostic. Implement these in your subclass:

- `_ptr(buffer)` → return a pointer (`bigint`) to the given buffer.
- `_read(pointer, index, type)` → read a value from **external memory** (used for safe-by-copy when dereferencing pointers).
- `_pack()` → return the desired packing (`1 | 2 | 4 | 8`).
- `_toString(pointer)` → convert a C-string pointer to a JS string.

---

## Public API (instance)

- `properties` → Proxy of typed fields (get/set syncs with the backing buffer).
- `size` / `alignment` → computed layout info.
- `pointer` → pointer to the struct memory.
- `view` → `ArrayBufferLike` backing store.
- `buffer` → `Uint8Array` view of the bytes.
- `copy(input)` → copy raw bytes into this struct.
- `copyTo(dst, start, length)` / `copyFrom(src, start, length)` → bounded byte copies.

---

## Utilities

- `cstr(str: string): Uint8Array` → create a **null‑terminated C string** buffer.

---

## Limitations & notes

- Function pointers: you can **write** a JS callback with a `ptr` (e.g., produced by your FFI layer). Reading back as a JS function is **not** supported.
- Pointer reads for non-inline structs perform a **copy** into a fresh instance to avoid unsafe live aliasing.

---

## License

[MIT](./LICENSE) © Vulppi
