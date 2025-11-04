# @bunbox/naga

WGSL shader parser and transpiler to SPIR-V using Naga (compiled to WebAssembly).

## Features

- ✅ Validate WGSL shaders
- ✅ Transpile WGSL to SPIR-V binary (for Vulkan)
- ✅ Disassemble SPIR-V binary to human-readable text (for debugging)

## Building

### Prerequisites

- [Docker](https://www.docker.com/get-started)

### Build Command

The project uses Docker to compile Rust to WebAssembly, eliminating the need for local Rust/wasm-pack installation.

```bash
# Windows (PowerShell)
bun run build

# Linux/Mac
bun run build:sh

# Build for web target
bun run build:web
```

The first build will take longer as Docker downloads and prepares the Rust environment. Subsequent builds are faster.

This will generate:
- `dist/naga_wasm.js` - JavaScript bindings
- `dist/naga_wasm_bg.wasm` - WebAssembly binary
- `dist/naga_wasm.d.ts` - TypeScript definitions

### Manual Docker Build

If you prefer to run Docker commands directly:

```bash
# Build the Docker image
docker build -t naga-wasm-builder .

# Compile for Node.js/Bun
docker run --rm \
  -v ./rust:/workspace \
  -v ./dist:/output \
  naga-wasm-builder \
  build --target nodejs --out-dir /output

# Compile for web
docker run --rm \
  -v ./rust:/workspace \
  -v ./dist:/output \
  naga-wasm-builder \
  build --target web --out-dir /output
```

## Usage

```typescript
import { isWgslValid, wgslToSpirvBin, spirvBinToText } from '@bunbox/naga';

// Check if WGSL is valid
const isValid = isWgslValid(`
  @vertex
  fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    return vec4<f32>(0.0, 0.0, 0.0, 1.0);
  }
`);

// Transpile to SPIR-V
const spirvBytes = wgslToSpirvBin(
  wgslSource,
  "vertex",  // or "fragment", "compute"
  "main"     // entry point name
);

// Debug: Convert SPIR-V back to readable format
const readable = spirvBinToText(spirvBytes);
console.log(readable);
```

## API

### `isWgslValid(wgsl: string): boolean`

Validates WGSL shader code and returns `true` if valid, `false` otherwise.

**Parameters:**
- `wgsl` - WGSL shader source code

**Returns:** `boolean`

---

### `validateWgsl(wgsl: string): void`

Validates WGSL shader code and throws an error if invalid.

**Parameters:**
- `wgsl` - WGSL shader source code

**Throws:** Error with validation details

---

### `wgslToSpirvBin(wgsl: string, stage: string, entry: string): Uint8Array`

Transpiles WGSL to SPIR-V binary format.

**Parameters:**
- `wgsl` - WGSL shader source code
- `stage` - Shader stage: `"vertex"`, `"vs"`, `"fragment"`, `"fs"`, `"compute"`, or `"cs"`
- `entry` - Entry point function name (e.g., `"main"`)

**Returns:** `Uint8Array` - SPIR-V binary data

---

### `spirvBinToText(spirvBytes: Uint8Array): string`

Disassembles SPIR-V binary to human-readable WGSL format for debugging.

**Parameters:**
- `spirvBytes` - SPIR-V binary data

**Returns:** `string` - Human-readable shader code

## License

MIT
