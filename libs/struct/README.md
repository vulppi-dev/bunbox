# @bunbox/struct

TypeScript helpers for **describing C-like structs** and working with **binary data** using predictable, C-compatible memory layouts. Perfect for **WebAssembly interop**, **FFI bindings**, binary file formats, and anywhere you need precise control over raw bytes.

This library uses a **field-based model** with **proxy-based access**: you compose field descriptors (e.g., `u8()`, `string()`, `array()`, `struct()`) and get back a **typed proxy object** that directly reads/writes to an underlying `ArrayBuffer`. No serialization overhead—just direct memory access with TypeScript type safety.

> [!NOTE]
> **Primary Focus: Bun FFI**
>
> This library is primarily designed for use with **[`bun:ffi`](https://bun.sh/docs/api/ffi)** and includes optimized examples for Bun's FFI system with libraries like **GLFW**. However, thanks to the **`setupStruct()`** configuration layer, it remains **completely agnostic** to the FFI implementation—you can use it with any FFI system, WebAssembly, or even custom binary protocols by providing your own string codec and pointer management.

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
  - [sizeOf()](#sizeoffield)
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
  i32,
  f64,
  pointer,
  instantiate,
  setupStruct,
  sizeOf,
} from '@bunbox/struct';

// Define GLFW structs matching C layout
const GLFWvidmode = struct({
  width: i32(),
  height: i32(),
  redBits: i32(),
  greenBits: i32(),
  blueBits: i32(),
  refreshRate: i32(),
});

const WindowConfig = struct({
  width: i32(800),
  height: i32(600),
  title: pointer(i32()), // char* title
  monitor: pointer(i32()), // GLFWmonitor*
  share: pointer(i32()), // GLFWwindow*
});

// Load GLFW library
const glfw = dlopen(`libglfw.${suffix}`, {
  glfwInit: {
    args: [],
    returns: FFIType.i32,
  },
  glfwCreateWindow: {
    args: [
      FFIType.i32,
      FFIType.i32,
      FFIType.cstring,
      FFIType.pointer,
      FFIType.pointer,
    ],
    returns: FFIType.pointer,
  },
  glfwGetPrimaryMonitor: {
    args: [],
    returns: FFIType.pointer,
  },
  glfwGetVideoMode: {
    args: [FFIType.pointer],
    returns: FFIType.pointer,
  },
});

// Setup struct with simple pointer management
setupStruct({
  pack: 8,
  stringToPointer(value: string): bigint {
    // For GLFW, strings are typically stack-allocated or static
    return 0n; // Simplified for example
  },
  pointerToString(pointer: bigint): string {
    return ''; // Simplified for example
  },
});

// Initialize GLFW
if (glfw.symbols.glfwInit() === 0) {
  throw new Error('Failed to initialize GLFW');
}

// Create window config
const [config, configBuffer] = instantiate(WindowConfig);
config.width = 1920;
config.height = 1080;
config.monitor = 0n;
config.share = 0n;

// Get size of structs
console.log('GLFWvidmode size:', sizeOf(GLFWvidmode)); // 24 bytes
console.log('WindowConfig size:', sizeOf(WindowConfig)); // 32 bytes

// Create window
const window = glfw.symbols.glfwCreateWindow(
  config.width,
  config.height,
  'My GLFW Window',
  config.monitor,
  config.share,
);

console.log('Window created:', window !== 0n);
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

### `sizeOf(field)`

Calculates the total size in bytes of a struct, including padding and alignment.

```ts
function sizeOf(field: StructField<any>): number;
```

**Returns:** The size in bytes of the struct layout.

**Example:**

```ts
const Vec3 = struct({
  x: f32(),
  y: f32(),
  z: f32(),
});

const Transform = struct({
  position: Vec3,
  rotation: Vec3,
  scale: Vec3,
});

console.log(sizeOf(Vec3)); // 12 bytes (3 * 4)
console.log(sizeOf(Transform)); // 36 bytes (3 * 12)

// Useful for pre-allocating buffers
const vertexCount = 1000;
const totalBytes = sizeOf(Vec3) * vertexCount;
console.log(`Need ${totalBytes} bytes for ${vertexCount} vertices`);
```

### Serialization with `toJSON()`

All struct proxies include a `toJSON()` method that serializes the struct to a JSON string. This is useful for debugging, logging, or transferring struct data.

```ts
const Player = struct({
  name: string(),
  health: f32(),
  position: struct({
    x: f32(),
    y: f32(),
  }),
  inventory: array(i32(), 3),
});

const [player, buffer] = instantiate(Player);
player.name = 'Hero';
player.health = 100.0;
player.position.x = 10.5;
player.position.y = 20.3;
player.inventory = [1, 2, 3];

// Serialize to JSON string
const json = player.toJSON();
console.log(json);
// Output: {"name":"Hero","health":100,"position":{"x":10.5,"y":20.3},"inventory":[1,2,3]}

// Can also use JSON.stringify (which calls toJSON internally)
console.log(JSON.stringify(player));
```

**Notes:**

- `bigint` values are automatically converted to strings in the JSON output
- Nested structs are recursively serialized
- Arrays are serialized as JSON arrays
- The method returns a JSON **string**, not an object

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

### FFI Integration with GLFW (Recommended)

```ts
import { dlopen, FFIType, suffix, CString } from 'bun:ffi';

// For GLFW, most strings are passed directly without special allocation
// But here's a complete example with string management:

const stringMap = new Map<string, bigint>();
let nextPtr = 1n;

setupStruct({
  pack: 8,
  stringToPointer(str: string): bigint {
    if (!str) return 0n;
    // For GLFW window titles and similar, strings are typically stack-allocated
    // or managed by the caller. This is a simple mapping approach:
    if (!stringMap.has(str)) {
      stringMap.set(str, nextPtr++);
    }
    return stringMap.get(str)!;
  },
  pointerToString(ptr: bigint): string {
    if (ptr === 0n) return '';
    const entry = [...stringMap.entries()].find(([_, p]) => p === ptr);
    return entry ? entry[0] : '';
  },
});

// Alternative: If you have custom string allocation in native code
const lib = dlopen(`libcustom.${suffix}`, {
  allocString: {
    args: [FFIType.cstring],
    returns: FFIType.pointer,
  },
  readString: {
    args: [FFIType.pointer],
    returns: FFIType.cstring,
  },
  freeString: {
    args: [FFIType.pointer],
    returns: FFIType.void,
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

### GLFW Integration

```ts
import { dlopen, FFIType, suffix } from 'bun:ffi';
import {
  struct,
  i32,
  f64,
  pointer,
  instantiate,
  setupStruct,
} from '@bunbox/struct';

// Load GLFW library
const glfw = dlopen(`libglfw.${suffix}`, {
  glfwInit: {
    args: [],
    returns: FFIType.i32,
  },
  glfwCreateWindow: {
    args: [
      FFIType.i32,
      FFIType.i32,
      FFIType.cstring,
      FFIType.pointer,
      FFIType.pointer,
    ],
    returns: FFIType.pointer,
  },
  glfwWindowHint: {
    args: [FFIType.i32, FFIType.i32],
    returns: FFIType.void,
  },
  glfwGetWindowSize: {
    args: [FFIType.pointer, FFIType.pointer, FFIType.pointer],
    returns: FFIType.void,
  },
  glfwGetCursorPos: {
    args: [FFIType.pointer, FFIType.pointer, FFIType.pointer],
    returns: FFIType.void,
  },
});

// Define struct for window properties
const WindowProps = struct({
  width: i32(),
  height: i32(),
  cursorX: f64(),
  cursorY: f64(),
});

// Setup structs
setupStruct({
  pack: 8,
  stringToPointer: (s) => 0n,
  pointerToString: (p) => '',
});

// Initialize GLFW
glfw.symbols.glfwInit();

// Set window hints
const GLFW_CONTEXT_VERSION_MAJOR = 0x00022002;
const GLFW_CONTEXT_VERSION_MINOR = 0x00022003;
glfw.symbols.glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
glfw.symbols.glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);

// Create window
const window = glfw.symbols.glfwCreateWindow(800, 600, 'GLFW Window', 0n, 0n);

// Get window properties
const [props, buffer] = instantiate(WindowProps);
glfw.symbols.glfwGetWindowSize(window, buffer, buffer.byteLength / 2);
glfw.symbols.glfwGetCursorPos(window, buffer, buffer.byteLength / 2);

console.log(`Window: ${props.width}x${props.height}`);
console.log(`Cursor: (${props.cursorX}, ${props.cursorY})`);
```

### Custom C Library Integration with GLFW Callbacks

```ts
import { dlopen, FFIType, suffix, ptr, CString } from 'bun:ffi';
import {
  struct,
  i32,
  f32,
  f64,
  pointer,
  instantiate,
  setupStruct,
  sizeOf,
} from '@bunbox/struct';

// Define GLFW callback data structures
const MouseState = struct({
  x: f64(),
  y: f64(),
  leftButton: i32(),
  rightButton: i32(),
  middleButton: i32(),
});

const KeyState = struct({
  key: i32(),
  scancode: i32(),
  action: i32(),
  mods: i32(),
});

// Load GLFW
const glfw = dlopen(`libglfw.${suffix}`, {
  glfwInit: {
    args: [],
    returns: FFIType.i32,
  },
  glfwCreateWindow: {
    args: [
      FFIType.i32,
      FFIType.i32,
      FFIType.cstring,
      FFIType.pointer,
      FFIType.pointer,
    ],
    returns: FFIType.pointer,
  },
  glfwSetMouseButtonCallback: {
    args: [FFIType.pointer, FFIType.pointer],
    returns: FFIType.pointer,
  },
  glfwSetKeyCallback: {
    args: [FFIType.pointer, FFIType.pointer],
    returns: FFIType.pointer,
  },
  glfwPollEvents: {
    args: [],
    returns: FFIType.void,
  },
});

// Setup structs
setupStruct({
  pack: 8,
  stringToPointer: (s) => 0n,
  pointerToString: (p) => '',
});

// Initialize
glfw.symbols.glfwInit();
const window = glfw.symbols.glfwCreateWindow(800, 600, 'Input Demo', 0n, 0n);

// Create state structs
const [mouseState, mouseBuffer] = instantiate(MouseState);
const [keyState, keyBuffer] = instantiate(KeyState);

console.log('MouseState size:', sizeOf(MouseState)); // 40 bytes
console.log('KeyState size:', sizeOf(KeyState)); // 16 bytes

// Setup callbacks (simplified - in real use, you'd use FFI callbacks)
// ...

// Main loop
while (true) {
  glfw.symbols.glfwPollEvents();

  // Access current state
  if (mouseState.leftButton === 1) {
    console.log(`Mouse clicked at (${mouseState.x}, ${mouseState.y})`);
  }

  if (keyState.action === 1) {
    // GLFW_PRESS
    console.log(`Key pressed: ${keyState.key}`);
  }
}
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

Call `setupStruct()` before using `instantiate()` or `sizeOf()`:

```ts
setupStruct({
  /* options */
});
```

### Error: "Structs have already been setup"

`setupStruct()` can only be called **once** per application lifetime. If you need to change configuration, restart your application or use a different approach for managing multiple configurations.

```ts
// ✅ Correct - call once at startup
setupStruct({
  /* config */
});

// ❌ Error - cannot call again
setupStruct({
  /* different config */
}); // Throws error!
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
