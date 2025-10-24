# GLFW + BGFX Integration Example

Este documento demonstra como integrar GLFW com BGFX para criar uma janela com renderização usando o motor de render cross-platform BGFX.

## Visão Geral

BGFX é uma biblioteca de renderização cross-platform que abstrai APIs gráficas como Vulkan, DirectX, Metal e OpenGL. Para usar BGFX com GLFW, precisamos:

1. Criar uma janela GLFW sem contexto OpenGL
2. Obter o handle nativo da janela
3. Inicializar BGFX com esse handle
4. Implementar o loop de renderização

## Exemplo Mínimo

```typescript
import { type Pointer, ptr } from 'bun:ffi';
import { cstr, GLFW, BGFX } from '../src/dynamic-libs';
import { GLFW_ENUMS } from '../src/dynamic-libs';
import { instantiate, struct, u64, u32, u16, u8 } from '@bunbox/struct';

// BGFX Constants
const BGFX_CLEAR_COLOR = 0x0001;
const BGFX_CLEAR_DEPTH = 0x0002;
const BGFX_RESET_VSYNC = 0x00000080;

// Initialize GLFW
GLFW.glfwInit();

// Configure window for BGFX (no OpenGL context)
GLFW.glfwWindowHint(GLFW_ENUMS.WindowMacro.CLIENT_API, 0); // GLFW_NO_API

// Create window
const window = GLFW.glfwCreateWindow(800, 600, cstr('BGFX Window'), null, null);

// Get native window handle (platform-specific)
let nativeHandle: Pointer;
if (process.platform === 'win32') {
  nativeHandle = GLFW.glfwGetWin32Window!(window);
} else if (process.platform === 'linux') {
  nativeHandle = GLFW.glfwGetX11Window!(window);
} else if (process.platform === 'darwin') {
  nativeHandle = GLFW.glfwGetCocoaWindow!(window);
}

// Define bgfx_platform_data_t struct
const platformDataSchema = struct({
  ndt: u64(),
  nwh: u64(),
  context: u64(),
  backBuffer: u64(),
  backBufferDS: u64(),
  session: u64(),
});

// Set platform data
const [pdData, pdBuffer] = instantiate(platformDataSchema);
pdData.nwh = BigInt(nativeHandle as any);
BGFX.bgfx_set_platform_data(ptr(pdBuffer));

// Initialize BGFX
const initSchema = struct({
  type: u32(),
  vendorId: u16(),
  deviceId: u16(),
  capabilities: u64(),
  debug: u8(),
  profile: u8(),
  platformData_ndt: u64(),
  platformData_nwh: u64(),
  platformData_context: u64(),
  platformData_backBuffer: u64(),
  platformData_backBufferDS: u64(),
  platformData_session: u64(),
  resolution_format: u32(),
  resolution_width: u32(),
  resolution_height: u32(),
  resolution_reset: u32(),
  resolution_numBackBuffers: u8(),
  resolution_maxFrameLatency: u8(),
  resolution_debugTextScale: u8(),
  limits_maxEncoders: u16(),
  limits_minResourceCbSize: u32(),
  limits_transientVbSize: u32(),
  limits_transientIbSize: u32(),
  callback: u64(),
  allocator: u64(),
});

const [initData, initBuffer] = instantiate(initSchema);
BGFX.bgfx_init_ctor(ptr(initBuffer));
initData.platformData_nwh = BigInt(nativeHandle as any);
initData.resolution_width = 800;
initData.resolution_height = 600;
initData.resolution_reset = BGFX_RESET_VSYNC;

BGFX.bgfx_init(ptr(initBuffer));

// Reset with window size
BGFX.bgfx_reset(800, 600, BGFX_RESET_VSYNC, 0);

// Setup view 0 (clear to dark blue)
BGFX.bgfx_set_view_clear(
  0, // view id
  BGFX_CLEAR_COLOR | BGFX_CLEAR_DEPTH, // flags
  0x103040ff, // rgba
  1.0, // depth
  0, // stencil
);

// Set viewport
BGFX.bgfx_set_view_rect(0, 0, 0, 800, 600);

// Main render loop
while (GLFW.glfwWindowShouldClose(window) === 0) {
  GLFW.glfwPollEvents();

  // Update viewport
  BGFX.bgfx_set_view_rect(0, 0, 0, 800, 600);

  // Submit (with invalid program handle, just clear)
  BGFX.bgfx_submit(0, 0xffff, 0, 0);

  // Advance frame
  BGFX.bgfx_frame(false);

  await Bun.sleep(16);
}

// Cleanup
BGFX.bgfx_shutdown();
GLFW.glfwDestroyWindow(window);
GLFW.glfwTerminate();
```

## Referências

- [BGFX Documentation](https://bkaradzic.github.io/bgfx/bgfx.html)
- [GLFW Documentation](https://www.glfw.org/docs/latest/)
- [Bun FFI Documentation](https://bun.sh/docs/api/ffi)

## Estruturas Importantes

### bgfx_init_t

Estrutura de inicialização do BGFX que contém configurações de renderização, dados da plataforma e limites do sistema.

### bgfx_platform_data_t

Contém handles nativos da janela específicos da plataforma:

- `nwh`: Native window handle (HWND no Windows, Window no X11, NSWindow no macOS)
- `ndt`: Native display type (usado em algumas plataformas)

## Flags Importantes

### Clear Flags

- `BGFX_CLEAR_NONE` (0x0000): Não limpar nada
- `BGFX_CLEAR_COLOR` (0x0001): Limpar cor
- `BGFX_CLEAR_DEPTH` (0x0002): Limpar profundidade
- `BGFX_CLEAR_STENCIL` (0x0004): Limpar stencil

### Reset Flags

- `BGFX_RESET_VSYNC` (0x00000080): Ativar VSync
- `BGFX_RESET_MSAA_X2` (0x00000010): MSAA 2x
- `BGFX_RESET_MSAA_X4` (0x00000020): MSAA 4x
- `BGFX_RESET_MSAA_X8` (0x00000030): MSAA 8x

## Padrão de Orientação

Conforme definido nas instruções do projeto:

- Padrão de orientação: **right-handed**
- NDC (Normalized Device Coordinates): **[0, 1]** no eixo Z
- Padrão de rotação: **ZYX (Yaw, Pitch, Roll)**
- Unidade de medida: **metro (m)**
- Sistema de matriz: **column-major**
