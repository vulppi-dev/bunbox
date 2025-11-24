import type { Disposable } from '@bunbox/utils';
import type { Geometry } from '../resources/Geometry';
import type { Material } from '../material/MaterialBuilder';
import type { VkGeometry } from './VkGeometry';

/**
 * Simple placeholder for a GPU-backed model.
 * This will evolve alongside the Vulkan pipeline implementation.
 */
export class VkModel implements Disposable {
  readonly geometry: Geometry;
  readonly material: Material;
  vkGeometry: VkGeometry | null = null;

  constructor(geometry: Geometry, material: Material) {
    this.geometry = geometry;
    this.material = material;
  }

  dispose(): void {
    this.vkGeometry?.dispose?.();
    this.vkGeometry = null;
  }
}
