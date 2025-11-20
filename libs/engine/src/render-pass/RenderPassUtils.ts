import type { TextureFormat } from '../resources';

/**
 * Utility to check if a format is a depth format
 */
export function isDepthFormat(format: TextureFormat | 'swapchain'): boolean {
  return (
    format === 'depth16-unorm' ||
    format === 'depth32-float' ||
    format === 'depth24-unorm-stencil8' ||
    format === 'depth24-plus' ||
    format === 'depth32-float-stencil8' ||
    format === 'depth24-plus-stencil8'
  );
}

/**
 * Utility to check if a format has stencil component
 */
export function hasStencilComponent(
  format: TextureFormat | 'swapchain',
): boolean {
  return (
    format === 'depth24-unorm-stencil8' ||
    format === 'depth24-plus' ||
    format === 'depth32-float-stencil8' ||
    format === 'depth24-plus-stencil8' ||
    format === 'stencil8'
  );
}

/**
 * Utility to check if a format is a color format
 */
export function isColorFormat(format: TextureFormat | 'swapchain'): boolean {
  return !isDepthFormat(format) && format !== 'swapchain';
}
