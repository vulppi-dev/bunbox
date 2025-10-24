export enum BGFX_VendorId {
  /** Autoselect adapter. */
  PCI_ID_NONE = 0x0000,
  /** Software rasterizer. */
  PCI_ID_SOFTWARE_RASTERIZER = 0x0001,
  /** AMD adapter. */
  PCI_ID_AMD = 0x1002,
  /** Apple adapter. */
  PCI_ID_APPLE = 0x106b,
  /** Intel adapter. */
  PCI_ID_INTEL = 0x8086,
  /** nVidia adapter. */
  PCI_ID_NVIDIA = 0x10de,
  /** Microsoft adapter. */
  PCI_ID_MICROSOFT = 0x1414,
  /** ARM adapter. */
  PCI_ID_ARM = 0x13b5,
}

export enum BGFX_Reset {
  /** No reset flags. */
  RESET_NONE = 0x00000000,

  /** Enable 2x MSAA. */
  RESET_MSAA_X2 = 0x00000010,
  /** Enable 4x MSAA. */
  RESET_MSAA_X4 = 0x00000020,
  /** Enable 8x MSAA. */
  RESET_MSAA_X8 = 0x00000030,
  /** Enable 16x MSAA. */
  RESET_MSAA_X16 = 0x00000040,
  RESET_MSAA_SHIFT = 4,
  RESET_MSAA_MASK = 0x00000070,

  /** Not supported yet. */
  RESET_FULLSCREEN = 0x00000001,
  RESET_FULLSCREEN_SHIFT = 0x00000000,
  RESET_FULLSCREEN_MASK = 0x00000001,
  /** Enable V-Sync. */
  RESET_VSYNC = 0x00000080,
  /** Turn on/off max anisotropy. */
  RESET_MAXANISOTROPY = 0x00000100,
  /** Begin screen capture. */
  RESET_CAPTURE = 0x00000200,
  /** Flush rendering after submitting to GPU. */
  RESET_FLUSH_AFTER_RENDER = 0x000002000,

  /** This flag specifies where flip occurs. Default behaviour is that flip occurs before rendering new frame. This flag only has effect when BGFX_CONFIG_MULTITHREADED=0. */
  RESET_FLIP_AFTER_RENDER = 0x00004000,
  /** Enable sRGB backbuffer. */
  RESET_SRGB_BACKBUFFER = 0x00008000,
  /** Enable HDR10 rendering. */
  RESET_HDR10 = 0x00010000,
  /** Enable HiDPI rendering. */
  RESET_HIDPI = 0x00020000,
  /** Enable depth clamp. */
  RESET_DEPTH_CLAMP = 0x00040000,
  /** Suspend rendering. */
  RESET_SUSPEND = 0x00080000,
  /** Transparent backbuffer. Availability depends on: BGFX_CAPS_TRANSPARENT_BACKBUFFER. */
  RESET_TRANSPARENT_BACKBUFFER = 0x00100000,
  RESET_RESERVED_SHIFT = 31,
  RESET_RESERVED_MASK = 0x80000000,
}

export enum BGFX_TextureFormat {
  /** DXT1 R5G6B5A1. */
  BC1,
  /** DXT3 R5G6B5A4. */
  BC2,
  /** DXT5 R5G6B5A8. */
  BC3,
  /** LATC1/ATI1 R8. */
  BC4,
  /** LATC2/ATI2 RG8. */
  BC5,
  /** BC6H RGB16F. */
  BC6H,
  /** BC7 RGB 4-7 bits per color channel, 0-8 bits alpha. */
  BC7,
  /** ETC1 RGB8. */
  ETC1,
  /** ETC2 RGB8. */
  ETC2,
  /** ETC2 RGBA8. */
  ETC2A,
  /** ETC2 RGB8A1. */
  ETC2A1,
  /** PVRTC1 RGB 2BPP. */
  PTC12,
  /** PVRTC1 RGB 4BPP. */
  PTC14,
  /** PVRTC1 RGBA 2BPP. */
  PTC12A,
  /** PVRTC1 RGBA 4BPP. */
  PTC14A,
  /** PVRTC2 RGBA 2BPP. */
  PTC22,
  /** PVRTC2 RGBA 4BPP. */
  PTC24,
  /** ATC RGB 4BPP. */
  ATC,
  /** ATCE RGBA 8 BPP explicit alpha. */
  ATCE,
  /** ATCI RGBA 8 BPP interpolated alpha. */
  ATCI,
  /** ASTC 4x4 8.0 BPP. */
  ASTC4x4,
  /** ASTC 5x4 6.40 BPP. */
  ASTC5x4,
  /** ASTC 5x5 5.12 BPP. */
  ASTC5x5,
  /** ASTC 6x5 4.27 BPP. */
  ASTC6x5,
  /** ASTC 6x6 3.56 BPP. */
  ASTC6x6,
  /** ASTC 8x5 3.20 BPP. */
  ASTC8x5,
  /** ASTC 8x6 2.67 BPP. */
  ASTC8x6,
  /** ASTC 8x8 2.00 BPP. */
  ASTC8x8,
  /** ASTC 10x5 2.56 BPP. */
  ASTC10x5,
  /** ASTC 10x6 2.13 BPP. */
  ASTC10x6,
  /** ASTC 10x8 1.60 BPP. */
  ASTC10x8,
  /** ASTC 10x10 1.28 BPP. */
  ASTC10x10,
  /** ASTC 12x10 1.07 BPP. */
  ASTC12x10,
  /** ASTC 12x12 0.89 BPP. */
  ASTC12x12,

  Unknown,

  R1,
  A8,
  R8,
  R8I,
  R8U,
  R8S,
  R16,
  R16I,
  R16U,
  R16F,
  R16S,
  R32I,
  R32U,
  R32F,
  RG8,
  RG8I,
  RG8U,
  RG8S,
  RG16,
  RG16I,
  RG16U,
  RG16F,
  RG16S,
  RG32I,
  RG32U,
  RG32F,
  RGB8,
  RGB8I,
  RGB8U,
  RGB8S,
  RGB9E5F,
  BGRA8,
  RGBA8,
  RGBA8I,
  RGBA8U,
  RGBA8S,
  RGBA16,
  RGBA16I,
  RGBA16U,
  RGBA16F,
  RGBA16S,
  RGBA32I,
  RGBA32U,
  RGBA32F,
  B5G6R5,
  R5G6B5,
  BGRA4,
  RGBA4,
  BGR5A1,
  RGB5A1,
  RGB10A2,
  RG11B10F,

  UnknownDepth,

  D16,
  D24,
  D24S8,
  D32,
  D16F,
  D24F,
  D32F,
  D0S8,

  Count,
}

export enum BGFX_DebugFlags {
  /** No debug. */
  DEBUG_NONE,
  /** Enable wireframe for all primitives. */
  DEBUG_WIREFRAME,
  /** Enable infinitely fast hardware test. No draw calls will be submitted to driver. It’s useful when profiling to quickly assess bottleneck between CPU and GPU. */
  DEBUG_IFH = 1 << 1,
  /** Enable statistics display. */
  DEBUG_STATS = 1 << 2,
  /** Enable debug text display. */
  DEBUG_TEXT = 1 << 3,
  /** Enable profiler. This causes per-view statistics to be collected, available through bgfx::Stats::ViewStats. This is unrelated to the profiler functions in bgfx::CallbackI. */
  DEBUG_PROFILER = 1 << 4,
}

export enum BGFX_RenderType {
  /** No rendering. */
  Noop,
  /** AGC. */
  Agc,
  /** Direct3D 11.0. */
  Direct3D11,
  /** Direct3D 12.0. */
  Direct3D12,
  /** GNM. */
  Gnm,
  /** Metal. */
  Metal,
  /** NVN. */
  Nvn,
  /** OpenGL ES 2.0+. */
  OpenGLES,
  /** OpenGL 2.1+. */
  OpenGL,
  /** Vulkan. */
  Vulkan,
  Count,
}

export enum BGFX_CapsTextureFormat {
  /** Texture format is not supported. */
  TEXTURE_NONE,
  /** Texture format is supported. */
  TEXTURE_2D = 1 << 0,
  /** Texture as sRGB format is supported. */
  TEXTURE_2D_SRGB = 1 << 1,
  /** Texture format is emulated. */
  TEXTURE_2D_EMULATED = 1 << 2,
  /** Texture format is supported. */
  TEXTURE_3D = 1 << 3,
  /** Texture as sRGB format is supported. */
  TEXTURE_3D_SRGB = 1 << 4,
  /** Texture format is emulated. */
  TEXTURE_3D_EMULATED = 1 << 5,
  /** Texture format is supported. */
  TEXTURE_CUBE = 1 << 6,
  /** Texture as sRGB format is supported. */
  TEXTURE_CUBE_SRGB = 1 << 7,
  /** Texture format is emulated. */
  TEXTURE_CUBE_EMULATED = 1 << 8,
  /** Texture format can be used from vertex shader. */
  TEXTURE_VERTEX = 1 << 9,
  /** Texture format can be used as image and read from. */
  TEXTURE_IMAGE_READ = 1 << 10,
  /** Texture format can be used as image and written to. */
  TEXTURE_IMAGE_WRITE = 1 << 11,
  /** Texture format can be used as frame buffer. */
  TEXTURE_FRAMEBUFFER = 1 << 12,
  /** Texture format can be used as MSAA frame buffer. */
  TEXTURE_FRAMEBUFFER_MSAA = 1 << 13,
  /** Texture can be sampled as MSAA. */
  TEXTURE_MSAA = 1 << 14,
  /** Texture format supports auto-generated mips. */
  TEXTURE_MIP_AUTOGEN = 1 << 15,
}

export const BGFX_AvailableCaps = {
  /** Alpha to coverage is supported. */
  ALPHA_TO_COVERAGE: 1n << 0n,
  /** Blend independent is supported. */
  BLEND_INDEPENDENT: 1n << 1n,
  /** Compute shaders are supported. */
  COMPUTE: 1n << 2n,
  /** Conservative rasterization is supported. */
  CONSERVATIVE_RASTER: 1n << 3n,
  /** Draw indirect is supported. */
  DRAW_INDIRECT: 1n << 4n,
  /** Draw indirect with indirect count is supported. */
  DRAW_INDIRECT_COUNT: 1n << 5n,
  /** Fragment depth is available in fragment shader. */
  FRAGMENT_DEPTH: 1n << 6n,
  /** Fragment ordering is available in fragment shader. */
  FRAGMENT_ORDERING: 1n << 7n,
  /** Graphics debugger is present. */
  GRAPHICS_DEBUGGER: 1n << 8n,
  /** HDR10 rendering is supported. */
  HDR10: 1n << 9n,
  /** HiDPI rendering is supported. */
  HIDPI: 1n << 10n,
  /** Image Read/Write is supported. */
  IMAGE_RW: 1n << 11n,
  /** 32-bit indices are supported. */
  INDEX32: 1n << 12n,
  /** Instancing is supported. */
  INSTANCING: 1n << 13n,
  /** Occlusion query is supported. */
  OCCLUSION_QUERY: 1n << 14n,
  /** Primitive ID is supported. */
  PRIMITIVE_ID: 1n << 15n,
  /** Renderer is on separate thread. */
  RENDERER_MULTITHREADED: 1n << 16n,
  /** Multiple windows are supported. */
  SWAP_CHAIN: 1n << 17n,
  /** Texture blit is supported. */
  TEXTURE_BLIT: 1n << 18n,
  /** Texture compare less equal mode is supported. */
  TEXTURE_COMPARE_LEQUAL: 1n << 19n,
  TEXTURE_COMPARE_RESERVED: 1n << 20n,
  /** Cubemap texture array is supported. */
  TEXTURE_CUBE_ARRAY: 1n << 21n,
  /** CPU direct access to GPU texture memory. */
  TEXTURE_DIRECT_ACCESS: 1n << 22n,
  /** Read-back texture is supported. */
  TEXTURE_READ_BACK: 1n << 23n,
  /** 2D texture array is supported. */
  TEXTURE_2D_ARRAY: 1n << 24n,
  /** 3D textures are supported. */
  TEXTURE_3D: 1n << 25n,
  /** Transparent backbuffer is supported. */
  TRANSPARENT_BACKBUFFER: 1n << 26n,
  /** Vertex attribute half-float is supported. */
  VERTEX_ATTRIB_HALF: 1n << 27n,
  /** Vertex attribute 10_10_10_2 is supported. */
  VERTEX_ATTRIB_UINT10: 1n << 28n,
  /** Rendering with VertexID only is supported. */
  VERTEX_ID: 1n << 29n,
  /** Viewport layer array is supported. */
  VIEWPORT_LAYER_ARRAY: 1n << 30n,
  /** All texture compare modes are supported. */
  get TEXTURE_COMPARE_ALL() {
    return this.TEXTURE_COMPARE_RESERVED | this.TEXTURE_COMPARE_LEQUAL;
  },
};

export enum BGFX_Topology {
  /** Triangle list. */
  TriList,
  /** Triangle strip. */
  TriStrip,
  /** Line list. */
  LineList,
  /** Line strip. */
  LineStrip,
  /** Point list. */
  PointList,

  Count,
}

export enum BGFX_RenderFrame {
  NoContext,
  Render,
  Timeout,
  Exiting,

  Count,
}

export enum BGFX_NativeWindowHandlerType {
  /** Platform default handle type (X11 on Linux). */
  Default = 0,
  /** Wayland. */
  Wayland,

  Count,
}

export const BGFX_TextureFlags = {
  /** Texture will be used for MSAA sampling. */
  MSAA_SAMPLE: 0x0000000800000000n,
  /** Render target no MSAA. */
  RT: 0x0000001000000000n,
  /** Texture will be used for compute write. */
  COMPUTE_WRITE: 0x0000100000000000n,
  /** Sample texture as sRGB. */
  SRGB: 0x0000200000000000n,
  /** Texture will be used as blit destination. */
  BLIT_DST: 0x0000400000000000n,
  /** Texture will be used for read back from GPU. */
  READ_BACK: 0x0000800000000000n,

  /** Render target MSAAx2 mode. */
  RT_MSAA_X2: 0x0000002000000000n,
  /** Render target MSAAx4 mode. */
  RT_MSAA_X4: 0x0000003000000000n,
  /** Render target MSAAx8 mode. */
  RT_MSAA_X8: 0x0000004000000000n,
  /** Render target MSAAx16 mode. */
  RT_MSAA_X16: 0x0000005000000000n,
  RT_MSAA_SHIFT: 36n,

  RT_MSAA_MASK: 0x0000007000000000n,

  /** Render target will be used for writing */
  RT_WRITE_ONLY: 0x0000008000000000n,
  RT_SHIFT: 36n,

  RT_MASK: 0x000000f000000000n,
};

export enum BGFX_SamplerFlags {
  /** Wrap U mode: Mirror */
  U_MIRROR = 0x00000001,
  /** Wrap U mode: Clamp */
  U_CLAMP = 0x00000002,
  /** Wrap U mode: Border */
  U_BORDER = 0x00000003,
  U_SHIFT = 0,

  U_MASK = 0x00000003,

  /** Wrap V mode: Mirror */
  V_MIRROR = 0x00000004,
  /** Wrap V mode: Clamp */
  V_CLAMP = 0x00000008,
  /** Wrap V mode: Border */
  V_BORDER = 0x0000000c,
  V_SHIFT = 2,

  V_MASK = 0x0000000c,

  /** Wrap W mode: Mirror */
  W_MIRROR = 0x00000010,
  /** Wrap W mode: Clamp */
  W_CLAMP = 0x00000020,
  /** Wrap W mode: Border */
  W_BORDER = 0x00000030,
  W_SHIFT = 4,

  W_MASK = 0x00000030,

  /** Min sampling mode: Point */
  MIN_POINT = 0x00000040,
  /** Min sampling mode: Anisotropic */
  MIN_ANISOTROPIC = 0x00000080,
  MIN_SHIFT = 6,

  MIN_MASK = 0x000000c0,

  /** Mag sampling mode: Point */
  MAG_POINT = 0x00000100,
  /** Mag sampling mode: Anisotropic */
  MAG_ANISOTROPIC = 0x00000200,
  MAG_SHIFT = 8,

  MAG_MASK = 0x00000300,

  /** Mip sampling mode: Point */
  MIP_POINT = 0x00000400,
  MIP_SHIFT = 10,

  MIP_MASK = 0x00000400,

  /** Compare when sampling depth texture: less. */
  COMPARE_LESS = 0x00010000,
  /** Compare when sampling depth texture: less or equal. */
  COMPARE_LEQUAL = 0x00020000,
  /** Compare when sampling depth texture: equal. */
  COMPARE_EQUAL = 0x00030000,
  /** Compare when sampling depth texture: greater or equal. */
  COMPARE_GEQUAL = 0x00040000,
  /** Compare when sampling depth texture: greater. */
  COMPARE_GREATER = 0x00050000,
  /** Compare when sampling depth texture: not equal. */
  COMPARE_NOTEQUAL = 0x00060000,
  /** Compare when sampling depth texture: never. */
  COMPARE_NEVER = 0x00070000,
  /** Compare when sampling depth texture: always. */
  COMPARE_ALWAYS = 0x00080000,
  COMPARE_SHIFT = 16,

  COMPARE_MASK = 0x000f0000,

  BORDER_COLOR_SHIFT = 24,

  BORDER_COLOR_MASK = 0x0f000000,

  RESERVED_SHIFT = 28,

  RESERVED_MASK = 0xf0000000,

  /** Sample stencil instead of depth. */
  SAMPLE_STENCIL = 0x00100000,
  POINT = MIN_POINT | MAG_POINT | MIP_POINT,
  UVW_MIRROR = U_MIRROR | V_MIRROR | W_MIRROR,
  UVW_CLAMP = U_CLAMP | V_CLAMP | W_CLAMP,
  UVW_BORDER = U_BORDER | V_BORDER | W_BORDER,
  BITS_MASK = U_MASK |
    V_MASK |
    W_MASK |
    MIN_MASK |
    MAG_MASK |
    MIP_MASK |
    COMPARE_MASK,
}

export function BGFX_SamplerNormalizeColor(color: number) {
  return (
    (color << BGFX_SamplerFlags.BORDER_COLOR_SHIFT) &
    BGFX_SamplerFlags.BORDER_COLOR_MASK
  );
}

export enum BGFX_Attributes {
  Position,
  Normal,
  Tangent,
  Bitangent,
  Color0,
  Color1,
  Color2,
  Color3,
  Indices,
  Weight,
  TexCoord0,
  TexCoord1,
  TexCoord2,
  TexCoord3,
  TexCoord4,
  TexCoord5,
  TexCoord6,
  TexCoord7,

  Count,
}

export enum BGFX_AttributesType {
  Uint8,
  /** Uint10, availability depends on: `BGFX_CAPS_VERTEX_ATTRIB_UINT10`. */
  Uint10,
  Int16,
  /** Half, availability depends on: `BGFX_CAPS_VERTEX_ATTRIB_HALF`. */
  Half,
  Float,

  Count,
}

export enum BGFX_BufferFlags {
  COMPUTE_READ = 0x0100,
  COMPUTE_WRITE = 0x0200,
  DRAW_INDIRECT = 0x0400,
  ALLOW_RESIZE = 0x0800,
  INDEX32 = 0x1000,
  COMPUTE_READ_WRITE = COMPUTE_READ | COMPUTE_WRITE,
}

export enum BGFX_OcclusionQuery {
  Invisible,
  Visible,
  NoResult,

  Count,
}
