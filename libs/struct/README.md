# @bunbox/struct

A TypeScript library for **defining, serializing, and manipulating C-like structs in memory**.
Perfect for **WebAssembly interop, FFI bindings, and low-level binary data handling**.

---

## Features

- Typed schema definitions for structs
- Automatic alignment & padding (C-style layout)
- Supports:

  - **Primitives** (`i8`, `u32`, `f64`, `boolean`, `string`, etc.)
  - **Nested structs** (inline or pointer-to-struct)
  - **Enums** with configurable storage size
  - **Inline and dynamic arrays**
  - **Function pointers / callbacks**

- Serialization & deserialization via **`ArrayBuffer` / `DataView`**
- **Union-like behavior** (`isOverlay`) and `pack(N)` alignment

---

## Installation

```bash
bun add @bunbox/struct
```

Requirements:

- **Node.js >= 22** or **Bun >= 1.2**

---

## Example in Bun

```ts
import { AbstractStruct, Pointer, StructSchema, cstr } from '@bunbox/struct'
import { ptr, read } from 'bun:ffi'

/* Create a struct for bun ffi */
class BunStruct<TSchema extends StructSchema> extends AbstractStruct<TSchema> {
  protected _ptr(buffer: ArrayBufferLike): Pointer {
    return ptr(buffer)
  }

  protected _read(pointer: Pointer, index: number, type: any): any {
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

  protected override _pack(): Bytes {
    return 8 // x64
  }
}

/* Define a schema */
const UserSchema = {
  id: { order: 1, type: 'u32' },
  age: { order: 2, type: 'u8' },
  name: { order: 3, type: 'string' },
} as const satisfies StructSchema

/* Create a struct class */
class UserStruct extends BunStruct<typeof UserSchema> {
  constructor() {
    super(UserSchema)
  }
}

/* Usage */
const user = new UserStruct()
user.set('id', 123)
user.set('age', 42)
user.set('name', 'Alice')

user.flush() // write values into internal buffer
console.log(user.buffer) // Uint8Array ready for FFI/WASM
```

---

## API Overview

### `AbstractStruct<TSchema>`

Base class for defining typed structs.

- `set(key, value)` → set a field value
- `get(key)` → get a field value
- `copyTo(buffer, start, length)` → Copy struct data to external buffer
- `copyFrom(buffer, start, length)` → Copy data from external buffer to struct
- `flush()` → write values into buffer
- `read()` → read values from buffer
- `buffer` → `Uint8Array` with serialized data
- `view` → `ArrayBufferLike` for creating views
- `pointer` → pointer to the struct (runtime-specific)

### Utility functions

- `cstr(str: string): NodeJS.TypedArray<ArrayBufferLike>`
  Converts a JS string into a null-terminated **C string** (`\0`).

---

## Pointer Implementation

`AbstractStruct` is **abstract** because pointer handling depends on your runtime (Node FFI, Bun, WebAssembly, etc.).
You must implement:

- `_ptr(buffer)` → return a pointer for a given buffer
- `_read(ptr, index, type)` → read external memory
- `_ptrToCstr(ptr)` → convert pointer to a JS string

---

## License

[MIT](./LICENSE) © Vulppi
