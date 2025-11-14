import type { ComponentFormat } from '../resources';

/**
 * Utility to check if a format is a depth format
 */
export function isDepthFormat(format: ComponentFormat): boolean {
  return (
    format === 'd16-unorm' ||
    format === 'd32-sfloat' ||
    format === 'd16-unorm-s8-uint' ||
    format === 'd24-unorm-s8-uint' ||
    format === 'd32-sfloat-s8-uint'
  );
}

/**
 * Utility to check if a format has stencil component
 */
export function hasStencilComponent(format: ComponentFormat): boolean {
  return (
    format === 'd16-unorm-s8-uint' ||
    format === 'd24-unorm-s8-uint' ||
    format === 'd32-sfloat-s8-uint'
  );
}

/**
 * Utility to check if a format is a color format
 */
export function isColorFormat(format: ComponentFormat): boolean {
  return !isDepthFormat(format) && format !== 'swapchain';
}
