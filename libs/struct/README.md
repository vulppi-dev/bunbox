# @bunbox/struct

TypeScript helpers for **describing C-like structs** and working with **binary data** using predictable, C-compatible memory layouts. Perfect for **WebAssembly interop**, **FFI bindings**, binary file formats, and anywhere you need precise control over raw bytes.

This library uses a **field-based model** with **proxy-based access**: you compose field descriptors (e.g., `u8()`, `string()`, `array()`, `struct()`) and get back a **typed proxy object** that directly reads/writes to an underlying `ArrayBuffer`. No serialization overhead—just direct memory access with TypeScript type safety.

> [!NOTE]
> **Primary Focus: Bun FFI**
>
> This library is primarily designed for use with **[`bun:ffi`](https://bun.sh/docs/api/ffi)** and includes optimized examples for Bun's FFI system. However, thanks to the **`setupStruct()`** configuration layer, it remains **completely agnostic** to the FFI implementation—you can use it with any FFI system, WebAssembly, or even custom binary protocols by providing your own string codec and pointer management.

---

## Installation

```bash
bun add @bunbox/struct
```

Requirements:

- **Node.js ≥ 22** or **Bun ≥ 1.2**
- **64-bit architecture** (pointers are represented as `bigint` - 8 bytes)

> [!CAUTION]
> **64-bit Architecture Only**
>
> This library is designed exclusively for **64-bit architectures**. All pointers are stored as 8-byte values (`bigint` in TypeScript). If you need 32-bit support, you would need to modify the pointer size constants and type definitions.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Field Helpers](#field-helpers)
  - [Primitive Types](#primitive-types)
  - [Complex Types](#complex-types)
    - [Arrays](#arrays)
    - [Structs](#structs)
    - [Unions](#unions)
  - [Pointer Wrapper](#pointer-wrapper)
- [API Reference](#api-reference)
  - [setupStruct()](#setupstructoptions)
  - [instantiate()](#instantiatefield)
- [Memory Layout & Alignment](#memory-layout--alignment)
- [String Handling](#string-handling)
  - [FFI Integration](#ffi-integration-recommended)
  - [Map-based Codec](#simple-map-based-codec-testingdevelopment)
  - [WebAssembly](#webassembly-memory-management)
- [Advanced Examples](#advanced-examples)
  - [Nested Structs with Arrays](#nested-structs-with-arrays)
  - [Tagged Unions](#tagged-unions-discriminated-unions)
  - [Bit Fields](#bit-fields-with-unions)
- [Type Safety](#type-safety)
- [Performance Notes](#performance-notes)
- [Testing](#testing)
- [Common Patterns](#common-patterns)
  - [FFI Integration](#ffi-integration)
  - [Custom C Library](#custom-c-library-integration)
  - [Binary Files](#binary-file-format)
  - [Worker Communication](#shared-memory--worker-communication)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contributing](#contributing)

---

## Quick Start

> [!WARNING]
> **Always call `setupStruct()` before using `instantiate()`!**
>
> The library requires one-time global setup to configure string handling. See the [API Reference](#api-reference) section for details.

```ts
import { dlopen, FFIType, suffix } from 'bun:ffi';
import {
  struct,
  u8,
  bool,
  string,
  instantiate,
  setupStruct,
} from '@bunbox/struct';

// Define the struct layout using field helpers
const Person = struct({
  name: string(),
  age: u8(),
  active: bool(),
});

// Load native library (example with SDL3 or custom C library)
const lib = dlopen(`libmylib.${suffix}`, {
  allocString: {
    args: [FFIType.cstring],
    returns: FFIType.pointer,
  },
  freeString: {
    args: [FFIType.pointer],
    returns: FFIType.void,
  },
  readString: {
    args: [FFIType.pointer],
    returns: FFIType.cstring,
  },
});

// Setup struct with FFI string handlers
setupStruct({
  pack: 8,
  stringToPointer(value: string): bigint {
    if (!value) return 0n;
    return BigInt(lib.symbols.allocString(value));
  },
  pointerToString(pointer: bigint): string {
    if (pointer === 0n) return '';
    return lib.symbols.readString(pointer);
  },
});

// Instantiate the struct - get a proxy and its backing buffer
const [person, buffer] = instantiate(Person);

// Direct property access - no serialization needed!
person.name = 'Alice';
person.age = 42;
person.active = true;

// Read values back
console.log(person.name); // 'Alice'
console.log(person.age); // 42
console.log(person.active); // true

// The buffer contains the raw bytes, ready for FFI/WASM
console.log(new Uint8Array(buffer));
```

The proxy object provides direct, typed access to the underlying binary data—changes are immediately reflected in the `ArrayBuffer`, ready to pass to native code or write to disk.

---

## Field Helpers

All field builders are exported from the main package.

### Primitive Types

| Helper             | C Equivalent | Size    | Default |
| ------------------ | ------------ | ------- | ------- |
| `u8(default?)`     | `uint8_t`    | 1 byte  | `0`     |
| `u16(default?)`    | `uint16_t`   | 2 bytes | `0`     |
| `u32(default?)`    | `uint32_t`   | 4 bytes | `0`     |
| `u64(default?)`    | `uint64_t`   | 8 bytes | `0n`    |
| `i8(default?)`     | `int8_t`     | 1 byte  | `0`     |
| `i16(default?)`    | `int16_t`    | 2 bytes | `0`     |
| `i32(default?)`    | `int32_t`    | 4 bytes | `0`     |
| `i64(default?)`    | `int64_t`    | 8 bytes | `0n`    |
| `f32(default?)`    | `float`      | 4 bytes | `0`     |
| `f64(default?)`    | `double`     | 8 bytes | `0`     |
| `bool(default?)`   | `bool`       | 1 byte  | `false` |
| `string(default?)` | `char*`      | 8 bytes | `''`    |
| `ptrAny()`         | `void*`      | 8 bytes | `0n`    |

**Examples:**

```ts
const flags = u8(); // default: 0
const count = u32(100); // default: 100
const ratio = f32(1.0); // default: 1.0
const enabled = bool(true); // default: true
const name = string('Alice'); // default: 'Alice'
```

### Complex Types

#### Arrays

```ts
// Inline array - fixed size, stored directly in struct
const inlineVec3 = array(f32(), 3); // [f32, f32, f32]

// Dynamic array - stored as pointer
const dynamicBuffer = array(u8()); // u8* (pointer)

// To make any array a pointer explicitly
const ptrArray = pointer(array(u8(), 10));
```

- **With length**: Creates an inline, fixed-size array stored contiguously in memory
- **Without length**: Creates a pointer to an array (8-byte pointer value)
- Use `pointer()` wrapper to force pointer storage for any field

#### Structs

```ts
const Vec2 = struct({
  x: f32(),
  y: f32(),
});

const Transform = struct({
  position: Vec2, // Inline nested struct
  rotation: f32(),
  scale: Vec2,
});

// Struct as pointer
const EntityRef = struct({
  id: u32(),
  data: pointer(
    struct({
      // Store as pointer instead of inline
      health: f32(),
      mana: f32(),
    }),
  ),
});
```

Nested structs are **inlined by default**—their fields are laid out directly in the parent struct. Use `pointer()` to store a reference instead.

#### Unions

```ts
const Value = union({
  asInt: i32(),
  asFloat: f32(),
  asBytes: array(u8(), 4),
});

const [value, buffer] = instantiate(Value);

value.asInt = 0x3f800000;
console.log(value.asFloat); // 1.0 (same bytes, different interpretation)
```

Unions overlay all fields at offset `0`—they share the same memory location. The size is determined by the **largest member** plus alignment padding.

### Pointer Wrapper

```ts
pointer(field);
```

Wraps any field to mark it as a pointer:

```ts
const Config = struct({
  name: string(), // Already a pointer by default
  data: pointer(array(u8(), 256)), // Array stored as pointer instead of inline
  metadata: pointer(
    struct({
      // Nested struct stored as pointer
      version: u32(),
      flags: u32(),
    }),
  ),
});
```

When a field is wrapped with `pointer()`:

- It occupies 8 bytes (pointer size)
- Reading returns a `bigint` pointer value
- You're responsible for managing what the pointer references

---

## API Reference

> [!IMPORTANT]
> **You MUST call `setupStruct()` once before using `instantiate()`**
>
> The setup function configures global string handling and struct packing. Calling `instantiate()` without prior setup will throw an error: `"Structs not setup. Please call setupStruct first."`
>
> ```ts
> // ✅ Correct order
> setupStruct({
>   /* options */
> });
> const [struct, buffer] = instantiate(MyStruct);
>
> // ❌ Will throw error
> const [struct, buffer] = instantiate(MyStruct); // Error!
> ```

### `setupStruct(options)`

**One-time global setup** for struct configuration. Must be called before using `instantiate()`.

```ts
setupStruct({
  pack?: 1 | 2 | 4 | 8,  // Struct packing/alignment (default: 8)
  stringToPointer: (str: string) => bigint,
  pointerToString: (ptr: bigint) => string,
});
```

**Options:**

- `pack`: Controls field alignment (1 = no padding, 8 = natural alignment)
- `stringToPointer`: **Required**. Converts JS strings to pointer values
- `pointerToString`: **Required**. Converts pointer values back to JS strings

**Example:**

```ts
import { dlopen, FFIType, suffix } from 'bun:ffi';

// Load your native library with string management functions
const lib = dlopen(`libnative.${suffix}`, {
  stringAlloc: {
    args: [FFIType.cstring],
    returns: FFIType.pointer,
  },
  stringRead: {
    args: [FFIType.pointer],
    returns: FFIType.cstring,
  },
  stringFree: {
    args: [FFIType.pointer],
    returns: FFIType.void,
  },
});

setupStruct({
  pack: 8,
  stringToPointer(value: string): bigint {
    if (!value) return 0n;
    return BigInt(lib.symbols.stringAlloc(value));
  },
  pointerToString(pointer: bigint): string {
    if (pointer === 0n) return '';
    return lib.symbols.stringRead(pointer);
  },
});
```

### `instantiate(field)`

Creates a new struct instance with a backing buffer.

```ts
function instantiate<F extends StructField<any>>(
  field: F,
): [proxy: InferField<F>, buffer: ArrayBuffer];
```

**Returns:**

- A **tuple** containing:
  1. `proxy`: Typed proxy object for direct property access
  2. `buffer`: Underlying `ArrayBuffer` containing the raw bytes

**Example:**

```ts
const Player = struct({
  name: string(),
  health: f32(),
  position: struct({
    x: f32(),
    y: f32(),
  }),
});

const [player, buffer] = instantiate(Player);

// Direct access - no serialization!
player.name = 'Hero';
player.health = 100.0;
player.position.x = 10.5;
player.position.y = 20.3;

// Pass buffer to native code
sendToWasm(buffer);
```

---

## Memory Layout & Alignment

The library follows C struct layout rules:

- **Alignment**: Each field is aligned to its natural boundary (configurable via `pack`)
- **Padding**: Automatic padding is added between fields and at struct end
- **Little-endian**: All multi-byte values use little-endian byte order
- **Pointer size**: 8 bytes (64-bit architecture only)
- **Unions**: All fields start at offset 0, size = max(members) + padding

**Example Layout:**

```ts
const Example = struct({
  a: u8(), // offset: 0, size: 1
  // padding: 7 bytes (to align next field to 8)
  b: u64(), // offset: 8, size: 8
  c: u16(), // offset: 16, size: 2
  // padding: 6 bytes (struct alignment)
});
// Total size: 24 bytes (with pack=8)
```

---

## String Handling

Strings are **always stored as pointers** (8 bytes). The library doesn't manage string memory—you provide the codec via `setupStruct()`.

**Common patterns:**

### FFI Integration (Recommended)

```ts
import { dlopen, FFIType, suffix } from 'bun:ffi';

const lib = dlopen(`libmylib.${suffix}`, {
  allocString: {
    args: [FFIType.cstring],
    returns: FFIType.pointer,
  },
  readString: {
    args: [FFIType.pointer],
    returns: FFIType.cstring,
  },
});

setupStruct({
  stringToPointer(s) {
    return s ? BigInt(lib.symbols.allocString(s)) : 0n;
  },
  pointerToString(ptr) {
    return ptr ? lib.symbols.readString(ptr) : '';
  },
});
```

### Simple Map-based Codec (Testing/Development)

```ts
const codec = new Map<string, bigint>();
let nextPtr = 1n;

setupStruct({
  stringToPointer(s) {
    if (!s) return 0n;
    if (!codec.has(s)) codec.set(s, nextPtr++);
    return codec.get(s)!;
  },
  pointerToString(ptr) {
    return [...codec].find(([_, p]) => p === ptr)?.[0] ?? '';
  },
});
```

### WebAssembly Memory Management

```ts
import { readFileSync } from 'fs';

const wasm = new WebAssembly.Instance(
  new WebAssembly.Module(readFileSync('./module.wasm')),
);

const memory = wasm.exports.memory as WebAssembly.Memory;
const { malloc, free } = wasm.exports;

setupStruct({
  stringToPointer(s) {
    if (!s) return 0n;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(s + '\0');
    const ptr = malloc(bytes.length);
    new Uint8Array(memory.buffer).set(bytes, Number(ptr));
    return BigInt(ptr);
  },
  pointerToString(ptr) {
    if (ptr === 0n) return '';
    const buf = new Uint8Array(memory.buffer);
    let len = 0;
    while (buf[Number(ptr) + len] !== 0) len++;
    return new TextDecoder().decode(buf.slice(Number(ptr), Number(ptr) + len));
  },
});
```

---

## Advanced Examples

### Nested Structs with Arrays

```ts
const Vertex = struct({
  position: array(f32(), 3), // [x, y, z]
  normal: array(f32(), 3), // [nx, ny, nz]
  uv: array(f32(), 2), // [u, v]
});

const Mesh = struct({
  vertexCount: u32(),
  vertices: pointer(array(Vertex)), // Vertex* (pointer to array)
  indexCount: u32(),
  indices: pointer(array(u16())), // uint16_t* (pointer)
});
```

### Tagged Unions (Discriminated Unions)

```ts
const Message = union({
  asText: struct({
    type: u8(), // 1 = text message
    length: u16(),
    // ... text data pointer
  }),
  asBinary: struct({
    type: u8(), // 2 = binary message
    size: u32(),
    // ... binary data pointer
  }),
});

const [msg, buffer] = instantiate(Message);

// Set as text message
msg.asText.type = 1;
msg.asText.length = 256;

// Read type discriminator
console.log(msg.asText.type); // 1
console.log(msg.asBinary.type); // Also 1 (same memory!)
```

### Bit Fields with Unions

```ts
const Flags = union({
  asU32: u32(),
  asBits: struct({
    flag0: u8(),
    flag1: u8(),
    flag2: u8(),
    flag3: u8(),
  }),
});

const [flags, _] = instantiate(Flags);
flags.asU32 = 0x12345678;
console.log(flags.asBits.flag0); // 0x78 (low byte)
```

---

## Type Safety

The library provides full TypeScript type inference:

```ts
const Player = struct({
  name: string(),
  level: u32(1),
  stats: struct({
    health: f32(100),
    mana: f32(100),
  }),
  inventory: array(u32(), 10),
});

const [player, buffer] = instantiate(Player);

// TypeScript knows all these types!
player.name = 'Hero'; // string
player.level = 50; // number
player.stats.health = 85.5; // number
player.inventory = [1, 2, 3]; // number[]

// TypeScript errors on wrong types
player.level = 'max'; // ❌ Error: Type 'string' is not assignable to type 'number'
player.stats.health = 'full'; // ❌ Error
```

The `InferField<T>` type utility automatically derives the correct TypeScript type for any field descriptor.

---

## Performance Notes

- **Zero-copy**: Proxy objects access memory directly—no serialization/deserialization overhead
- **Efficient nested access**: Nested struct proxies are cached per field to avoid recreation
- **Optimized lookups**: Field access uses pre-computed index maps (O(1) lookups)
- **Memory aligned**: Follows C struct alignment rules for optimal native performance

**Benchmark example:**

```ts
const Point = struct({ x: f32(), y: f32(), z: f32() });
const [point, _] = instantiate(Point);

// Direct memory write - no overhead
for (let i = 0; i < 1_000_000; i++) {
  point.x = i;
  point.y = i * 2;
  point.z = i * 3;
}
```

---

## Testing

The package includes comprehensive tests covering:

- ✅ Primitive types and defaults
- ✅ Inline and pointer arrays
- ✅ Nested structs with proxy caching
- ✅ Union types and memory overlay
- ✅ Tagged unions with discriminators
- ✅ Buffer size calculations and alignment
- ✅ String pointer handling

Run tests:

```bash
bun test
```

All tests validate both memory layout correctness and proxy behavior.

---

## Common Patterns

### FFI Integration

```ts
import { dlopen, FFIType, suffix } from 'bun:ffi';

// Load SDL3 library
const sdl = dlopen(`libSDL3.${suffix}`, {
  SDL_FillRect: {
    args: [FFIType.pointer, FFIType.pointer, FFIType.u32],
    returns: FFIType.i32,
  },
  SDL_Init: {
    args: [FFIType.u32],
    returns: FFIType.i32,
  },
  // ... other SDL functions
});

// Define C struct layout matching SDL_Rect
const SDL_Rect = struct({
  x: i32(),
  y: i32(),
  w: i32(),
  h: i32(),
});

const [rect, buffer] = instantiate(SDL_Rect);
rect.x = 100;
rect.y = 100;
rect.w = 50;
rect.h = 50;

// Pass buffer directly to FFI
sdl.symbols.SDL_FillRect(surfacePtr, buffer, 0xff0000ff);
```

### Custom C Library Integration

```ts
import { dlopen, FFIType, suffix, CString } from 'bun:ffi';

// Define your C struct
const PlayerData = struct({
  name: string(),
  position: struct({
    x: f32(),
    y: f32(),
    z: f32(),
  }),
  health: f32(),
  team: u8(),
});

// Load your game engine library
const engine = dlopen(`libgame.${suffix}`, {
  player_create: {
    args: [FFIType.pointer], // Takes PlayerData*
    returns: FFIType.u32, // Returns player ID
  },
  player_update: {
    args: [FFIType.u32, FFIType.pointer], // ID, PlayerData*
    returns: FFIType.void,
  },
  // String management
  alloc_string: {
    args: [FFIType.cstring],
    returns: FFIType.pointer,
  },
  read_string: {
    args: [FFIType.pointer],
    returns: FFIType.cstring,
  },
});

// Setup with your library's string functions
setupStruct({
  pack: 8,
  stringToPointer: (s) => (s ? BigInt(engine.symbols.alloc_string(s)) : 0n),
  pointerToString: (p) => (p ? engine.symbols.read_string(p) : ''),
});

// Create and use the struct
const [player, buffer] = instantiate(PlayerData);
player.name = 'Hero';
player.position.x = 100.0;
player.position.y = 50.0;
player.position.z = 0.0;
player.health = 100.0;
player.team = 1;

// Send to native code
const playerId = engine.symbols.player_create(buffer);

// Update later
player.health = 85.0;
engine.symbols.player_update(playerId, buffer);
```

### Binary File Format

```ts
const FileHeader = struct({
  magic: array(u8(), 4), // File signature
  version: u32(),
  flags: u32(),
  dataOffset: u64(),
  dataSize: u64(),
});

const [header, buffer] = instantiate(FileHeader);
header.magic = [0x89, 0x50, 0x4e, 0x47]; // PNG magic
header.version = 1;
header.dataOffset = 256n;

// Write to file
await Bun.write('file.dat', buffer);
```

### Shared Memory / Worker Communication

```ts
const SharedState = struct({
  frameCount: u32(),
  isRunning: bool(),
  mouseX: f32(),
  mouseY: f32(),
});

const [state, buffer] = instantiate(SharedState);

// Share buffer with worker
worker.postMessage({ sharedBuffer: buffer }, [buffer]);

// Both threads can read/write
state.frameCount++;
state.mouseX = event.clientX;
```

---

## Migration Guide

If you're coming from the old `toBuffer`/`toObject` API:

**Before:**

```ts
const buffer = toBuffer(Person, { name: 'Alice', age: 42 }, handlers);
const person = toObject(Person, buffer, handlers);
```

**After:**

```ts
setupStruct(handlers); // One-time setup
const [person, buffer] = instantiate(Person);
person.name = 'Alice'; // Direct access, no serialization
person.age = 42;
```

**Key differences:**

- `setupStruct()` is called once globally instead of per operation
- `instantiate()` returns both proxy and buffer as a tuple
- Direct property access replaces `toBuffer`/`toObject` calls
- No more intermediate object creation—work directly with memory

---

## Troubleshooting

### Error: "Structs not setup"

Call `setupStruct()` before using `instantiate()`:

```ts
setupStruct({
  /* options */
});
```

### Incorrect alignment/size

Check the `pack` parameter:

```ts
setupStruct({
  pack: 8, // Try different values: 1, 2, 4, or 8
  // ...
});
```

### String codec issues

Ensure your codec handles empty strings and null pointers:

```ts
stringToPointer(s) {
  if (!s) return 0n;  // Empty string = null pointer
  // ... your allocation logic
}

pointerToString(ptr) {
  if (ptr === 0n) return '';  // Null pointer = empty string
  // ... your resolution logic
}
```

---

## License

[MIT](./LICENSE.md) © Vulppi

---

## Contributing

Contributions are welcome! This library is part of the [Bunbox](https://github.com/vulppi-dev/bunbox) monorepo.

**Development:**

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build
```
