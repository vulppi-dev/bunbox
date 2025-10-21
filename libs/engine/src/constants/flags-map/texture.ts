import {
  SDL_GPUSampleCount,
  SDL_GPUTextureFormat,
  SDL_GPUTextureType,
  SDL_GPUTextureUsageFlags,
} from '@bunbox/sdl3';
import {
  Texture3D,
  TextureCube,
  TextureImage,
  type SampleCount,
  type TextureBase,
  type TextureFormat,
  type TextureUsage,
} from '../../elements';

export const TEXTURE_FORMAT_MAP: Record<TextureFormat, number> = {
  // Color Formats - 8-bit normalized
  rgba8unorm: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UNORM,
  'rgba8unorm-srgb':
    SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UNORM_SRGB,
  bgra8unorm: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_B8G8R8A8_UNORM,
  'bgra8unorm-srgb':
    SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_B8G8R8A8_UNORM_SRGB,
  rgba8snorm: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8G8B8A8_SNORM,

  // Color Formats - 16-bit float
  rgba16float: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R16G16B16A16_FLOAT,
  r16float: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R16_FLOAT,
  rg16float: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R16G16_FLOAT,

  // Color Formats - 32-bit float
  rgba32float: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R32G32B32A32_FLOAT,
  r32float: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R32_FLOAT,

  // Color Formats - packed
  rgb10a2unorm: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R10G10B10A2_UNORM,
  rg11b10float: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R11G11B10_UFLOAT,

  // Single/Dual Channel
  r8unorm: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8_UNORM,
  rg8unorm: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8G8_UNORM,

  // Compressed Formats - BC
  'bc1-rgba-unorm': SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_BC1_RGBA_UNORM,
  'bc1-rgba-unorm-srgb':
    SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_BC1_RGBA_UNORM_SRGB,
  'bc3-rgba-unorm': SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_BC3_RGBA_UNORM,
  'bc3-rgba-unorm-srgb':
    SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_BC3_RGBA_UNORM_SRGB,
  'bc4-r-unorm': SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_BC4_R_UNORM,
  'bc5-rg-unorm': SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_BC5_RG_UNORM,
  'bc7-rgba-unorm': SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_BC7_RGBA_UNORM,
  'bc7-rgba-unorm-srgb':
    SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_BC7_RGBA_UNORM_SRGB,
  'bc6h-rgb-ufloat': SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_BC6H_RGB_UFLOAT,

  // Compressed Formats - ASTC
  'astc-4x4-unorm': SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_ASTC_4x4_UNORM,
  'astc-4x4-unorm-srgb':
    SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_ASTC_4x4_UNORM_SRGB,
  'astc-6x6-unorm': SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_ASTC_6x6_UNORM,
  'astc-8x8-unorm': SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_ASTC_8x8_UNORM,

  // Depth/Stencil Formats
  depth16unorm: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_D16_UNORM,
  depth24plus: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_D24_UNORM,
  depth32float: SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_D32_FLOAT,
  'depth24plus-stencil8':
    SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_D24_UNORM_S8_UINT,
  'depth32float-stencil8':
    SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_D32_FLOAT_S8_UINT,
};

export const TEXTURE_USAGE_MAP: Record<TextureUsage, number> = {
  sampler: SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_SAMPLER,
  'color-target': SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COLOR_TARGET,
  'depth-stencil-target':
    SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_DEPTH_STENCIL_TARGET,
  'graphics-storage-read':
    SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_GRAPHICS_STORAGE_READ,
  'compute-storage-read':
    SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_READ,
  'compute-storage-write':
    SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_WRITE,
  'compute-storage-rw':
    SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_SIMULTANEOUS_READ_WRITE,
};

export const SAMPLE_COUNT_MAP: Record<SampleCount, number> = {
  1: SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1,
  2: SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_2,
  4: SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_4,
  8: SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_8,
};

export function parseTextureFormat(format: TextureFormat): number {
  return (
    TEXTURE_FORMAT_MAP[format] ??
    SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UNORM
  );
}

export function parseTextureUsage(usage: readonly TextureUsage[]): number {
  let flags = 0;
  for (const use of usage) {
    flags |= TEXTURE_USAGE_MAP[use] ?? 0;
  }
  return flags >>> 0; // Ensure unsigned 32-bit
}

export function parseSampleCount(sampleCount: SampleCount): number {
  return (
    SAMPLE_COUNT_MAP[sampleCount] ?? SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1
  );
}

export function parseTextureType(tex: TextureBase): number {
  switch (true) {
    case tex instanceof TextureImage:
      return SDL_GPUTextureType.SDL_GPU_TEXTURETYPE_2D;
    case tex instanceof TextureCube:
      return SDL_GPUTextureType.SDL_GPU_TEXTURETYPE_CUBE;
    case tex instanceof Texture3D:
      return SDL_GPUTextureType.SDL_GPU_TEXTURETYPE_3D;
    default:
      return SDL_GPUTextureType.SDL_GPU_TEXTURETYPE_2D;
  }
}
