# @bunbox/struct

TypeScript helpers for **describing C-like structs** and for **serializing / deserializing** their values with predictable, C-compatible layouts. Works great for **WebAssembly interop**, **FFI bindings**, binary file formats, and anywhere you need to reason about raw bytes.

This version introduces a field-based model: you compose **field descriptors** (e.g. `u8()`, `string()`, `array(...)`, `struct(...)`) and feed them into the `toBuffer` and `toObject` helpers. There are no base classes to extend—just define layouts and plug them into your runtime.

---

## Installation

```bash
bun add @bunbox/struct
```

Requirements:

- **Node.js ≥ 22** or **Bun ≥ 1.2**

---

## Quick start

```ts
import { struct, u8, bool, string, toBuffer, toObject } from '@bunbox/struct';

// Compose the layout using field helpers
const Person = struct({
  name: string(),
  age: u8(),
  active: bool(),
});

// Provide string handlers so the serializer knows how to translate
// JS strings and native pointers.
const handlers = {
  stringToPointer(value: string): bigint {
    // Allocate or look up the pointer inside your runtime.
    if (!value) return 0n;
    return BigInt(value.length); // placeholder
  },
  pointerToString(pointer: bigint): string {
    // Resolve the pointer back to a JS string.
    if (pointer === 0n) return '';
    return `ptr:${pointer.toString(16)}`;
  },
};

// Serialize values into a Uint8Array
const buffer = toBuffer(
  Person,
  { name: 'Alice', age: 42, active: true },
  handlers,
);

// Read them back later
const decoded = toObject(Person, buffer, handlers);
```

The resulting `Uint8Array` is laid out just like a C struct with the same fields, ready to pass to native code or to store on disk.

---

## Field helpers

All field builders live in `@bunbox/struct/fields`.

| Helper                            | Description                         |
| --------------------------------- | ----------------------------------- |
| `u8()`, `u16()`, `u32()`, `u64()` | Unsigned integers                   |
| `i8()`, `i16()`, `i32()`, `i64()` | Signed integers                     |
| `f32()`, `f64()`                  | IEEE floats                         |
| `bool()`                          | Boolean (`u8` under the hood)       |
| `string()`                        | Pointer to a UTF-8 / C-style string |
| `ptrAny()`                        | Generic pointer-sized slot          |
| `array(to, options?)`             | Inline or pointer arrays            |
| `struct(fields, options?)`        | Inline struct                       |
| `union(fields, options?)`         | Union / overlay                     |

Every field accepts an optional `meta` object with:

- `default`: default value for missing fields during serialization
- `isPointer`: force the field to be stored as a pointer-size slot (even if the primitive suggests otherwise)
- Additional properties depend on the helper (e.g. `length` for inline arrays)

### Arrays

```ts
const InlineVec3 = array(f32(), { length: 3 }); // inline, contiguous
const BufferPtr = array(u8()); // pointer, no inline length
```

- Provide `length` to store an inline, fixed-size payload.
- Omit `length` for pointer arrays (stores only a pointer value).
- Pointer arrays cannot also set `isPointer`. A runtime guard prevents accidental misuse.

### Nested structs and unions

```ts
const Vec2 = struct({ x: f32(), y: f32() });
const Transform = struct({
  origin: Vec2,
  direction: Vec2,
});

const Variant = union({
  scalar: f32(),
  index: u32(),
});
```

- Nested `struct` descriptors inline their fields into the parent layout.
- `union` overlays all child fields at offset `0`; the size is the maximum of the members.

---

## Serialization API

### `toBuffer(field, value, options)`

- `field`: the descriptor created with the helpers
- `value`: object / primitive matching `InferField<typeof field>`; missing values fall back to defaults or zeros
- `options`: `{ stringToPointer, pointerToString?, pack? }`
  - `stringToPointer`: **required**. Convert JS strings to `bigint` pointers.
  - `pointerToString`: optional for serialization, but provide it if you plan to deserialize strings later.
  - `pack`: optional struct packing (1, 2, 4, or 8). Defaults to natural alignment.

Returns a fresh `Uint8Array` sharing the same `ArrayBuffer` as the internal `DataView`.

### `toObject(field, buffer, options)`

- `field`: the same descriptor used for serialization
- `buffer`: a `Uint8Array` (or compatible) containing struct bytes
- `options`: same shape as above; `pointerToString` is **required** when reading string fields

Returns a plain object matching the inferred TypeScript type.

Both helpers share the same layout engine. Struct size and alignment are computed once per call, respecting packing rules and natural alignments.

---

## String handling

Strings are pointer fields. The library cannot manage string lifetimes, so **you must provide conversion callbacks**:

```ts
const handlers = {
  stringToPointer(value: string): bigint {
    return value.length ? runtime.allocString(value) : 0n;
  },
  pointerToString(pointer: bigint): string {
    return pointer === 0n ? '' : runtime.readCString(pointer);
  },
};
```

- Use a pool/cache if you want deterministic pointer reuse.
- Return `0n` for null pointers.
- These hooks run for both standalone `string()` fields and inline string arrays.

---

## Defaults, pointers, and safety

- Primitives default to `0` / `0n` / `false` / `''` when missing.
- Inline arrays default to zero-filled arrays; pointer arrays default to `0n`.
- You can override defaults via `field.meta.default`.
- All pointer-like fields (`string`, `void`, non-inline structs, dynamic arrays, explicit pointer fields) are stored as 64-bit little-endian addresses.

---

## Testing

The package ships with Bun tests covering strings, arrays, nested structs, and pointer semantics. Run them with:

```bash
bun test libs/struct/test/struct.test.ts
```

Use these examples as templates for your own runtime-specific codecs.

---

## License

[MIT](./LICENSE) © Vulppi
