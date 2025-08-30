# @bunbox/struct

A TypeScript library for **defining, serializing, and manipulating C-like structs in memory**.
Perfect for **WebAssembly interop, FFI bindings, and low-level binary data handling** in Node.js or Bun.

---

## ✨ Features

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

## 📦 Installation

```bash
npm install @bunbox/struct
# or
bun add @bunbox/struct
```

Requirements:

- **Node.js >= 22** or **Bun >= 1.2**

---

## 🚀 Example

```ts
import { AbstractStruct, Pointer, cstr } from '@bunbox/struct'

/* Define a schema */
const UserSchema = {
  id: { order: 1, type: 'u32' },
  age: { order: 2, type: 'u8' },
  name: { order: 3, type: 'string' },
} as const

/* Create a struct from the schema */
class UserStruct extends AbstractStruct<typeof UserSchema> {
  constructor() {
    super(UserSchema)
  }

  protected _ptr(buffer: ArrayBufferLike): Pointer {
    return buffer as any as Pointer // runtime-specific
  }

  protected _read(ptr: Pointer, index: number, type: any): any {
    throw new Error('Not implemented') // connect to external memory
  }

  protected _ptrToCstr(ptr: Pointer): string {
    return 'mock' // connect to external memory
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

## 📖 API Overview

### `AbstractStruct<TSchema>`

Base class for defining typed structs.

- `set(key, value)` → set a field value
- `get(key)` → get a field value
- `copyTo(buffer, start, length)` → Copy struct data to external buffer
- `copyFrom(buffer, start, length)` → Copy data from external buffer to struct
- `flush()` → write values into buffer
- `read()` → read values from buffer
- `buffer` → `Uint8Array` with serialized data
- `pointer` → pointer to the struct (runtime-specific)

### Utility functions

- `cstr(str: string): ArrayBufferLike`
  Converts a JS string into a null-terminated **C string** (`\0`).

---

## 🛠️ Pointer Implementation

`AbstractStruct` is **abstract** because pointer handling depends on your runtime (Node FFI, Bun, WebAssembly, etc.).
You must implement:

- `_ptr(buffer)` → return a pointer for a given buffer
- `_read(ptr, index, type)` → read external memory
- `_ptrToCstr(ptr)` → convert pointer to a JS string

---

## 📜 License

[MIT](./LICENSE) © Renato Rodrigues
