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
} from '../elements';

export function parseTextureFormat(format: TextureFormat): number {
  switch (format) {
    case 'rgba8unorm':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UNORM;
    case 'bgra8unorm':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_B8G8R8A8_UNORM;
    case 'rgba16float':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R16G16B16A16_FLOAT;
    case 'r16float':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R16_FLOAT;
    case 'r8unorm':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8_UNORM;
    case 'rgba8uint':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UINT;
    case 'rgba8snorm':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8G8B8A8_SNORM;
    case 'rgba32float':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R32G32B32A32_FLOAT;
    case 'depth24plus':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_D24_UNORM;
    case 'depth24plus-stencil8':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_D24_UNORM_S8_UINT;
    case 'depth32float':
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_D32_FLOAT;
    default:
      // Default to RGBA8 UNORM for unknown formats
      return SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_R8G8B8A8_UNORM;
  }
}

export function parseTextureUsage(usage: readonly TextureUsage[]): number {
  let flags = 0;
  for (const use of usage) {
    switch (use) {
      case 'sampler':
        flags |= SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_SAMPLER;
        break;
      case 'color-target':
        flags |= SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COLOR_TARGET;
        break;
      case 'depth-stencil-target':
        flags |=
          SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_DEPTH_STENCIL_TARGET;
        break;
      case 'graphics-storage-read':
        flags |=
          SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_GRAPHICS_STORAGE_READ;
        break;
      case 'compute-storage-read':
        flags |=
          SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_READ;
        break;
      case 'compute-storage-write':
        flags |=
          SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_WRITE;
        break;
      case 'compute-storage-rw':
        flags |=
          SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_SIMULTANEOUS_READ_WRITE;
        break;
    }
  }
  return flags >>> 0; // Ensure unsigned 32-bit
}

export function parseSampleCount(sampleCount: SampleCount): number {
  switch (sampleCount) {
    case 1:
      return SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1;
    case 2:
      return SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_2;
    case 4:
      return SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_4;
    case 8:
      return SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_8;
    default:
      return SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1;
  }
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
