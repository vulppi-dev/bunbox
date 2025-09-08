import type { Pointer } from 'bun:ffi';

export type RenderProps = {
  background: 'vulkan' | 'metal';
  swapFormat: number;
  commandBuffer: Pointer;
};
