import { isWgslValid, wgslToSpirvBin } from '@bunbox/naga';
import { DynamicLibError } from '../../errors';
import {
  COMPUTE_ENTRY,
  FRAGMENT_ENTRY,
  VERTEX_ENTRY,
} from '../../constants/shader';

type VKPipelineProps = {
  shader: string;
  fragmentEntry: string;
};

export class VkPipeline {
  #vertexData: Uint8Array | null = null;
  #fragmentData: Uint8Array | null = null;
  #computeData: Uint8Array | null = null;

  constructor(shader: string) {
    if (!isWgslValid(shader)) {
      throw new DynamicLibError('Invalid WGSL shader', 'Vulkan');
    }

    if (shader.includes('@vertex') && shader.includes(VERTEX_ENTRY)) {
      this.#vertexData = wgslToSpirvBin(shader, 'vertex', VERTEX_ENTRY);
    }

    if (shader.includes('@fragment') && shader.includes(FRAGMENT_ENTRY)) {
      this.#fragmentData = wgslToSpirvBin(shader, 'fragment', FRAGMENT_ENTRY);
    }

    if (shader.includes('@compute') && shader.includes(COMPUTE_ENTRY)) {
      this.#computeData = wgslToSpirvBin(shader, 'compute', COMPUTE_ENTRY);
    }
  }
}
