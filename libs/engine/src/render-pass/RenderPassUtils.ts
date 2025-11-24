import type { TextureFormat } from '../resources';

const DEPTH_FORMATS: TextureFormat[] = [
  'depth16-unorm',
  'depth24-plus',
  'depth24-unorm-stencil8',
  'depth32-float',
  'depth32-float-stencil8',
  'depth24-plus-stencil8',
  'stencil8',
];

/**
 * Checks if a format is a depth or depth-stencil format
 */
export function isDepthFormat(format: TextureFormat | number): boolean {
  if (typeof format === 'number') return false;
  return DEPTH_FORMATS.includes(format);
}

/**
 * Checks if a format is a color format
 */
export function isColorFormat(format: TextureFormat | number): boolean {
  if (typeof format === 'number') return true;
  return !isDepthFormat(format);
}
