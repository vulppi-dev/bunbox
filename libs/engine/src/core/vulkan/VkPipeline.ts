import { isWgslValid, wgslToSpirvBin } from '@bunbox/naga';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import {
  getResultMessage,
  VK,
  VkResult,
  vkShaderModuleCreateInfo,
  VkStructureType,
} from '@bunbox/vk';
import { DynamicLibError } from '../../errors';
import type { VkDevice } from './VkDevice';
import { ptr, type Pointer } from 'bun:ffi';
import type { Disposable } from '@bunbox/utils';

type VKPipelineProps = {
  shader:
    | string
    | {
        vertex?: string;
        fragment?: string;
        compute?: string;
      };
  entries: {
    vertex?: string;
    fragment?: string;
    compute?: string;
  };
};

export class VkPipeline implements Disposable {
  static #normalizeShaderSource(shaderData: Uint8Array) {
    const padding = shaderData.byteLength % Uint32Array.BYTES_PER_ELEMENT;
    if (padding === 0) {
      return shaderData;
    }

    const paddedLength =
      shaderData.byteLength + (Uint32Array.BYTES_PER_ELEMENT - padding);
    const paddedShaderData = new Uint8Array(paddedLength);
    paddedShaderData.set(shaderData);
    return paddedShaderData;
  }

  static #createShaderModule(device: Pointer, shaderData: Uint8Array) {
    const createInfo = instantiate(vkShaderModuleCreateInfo);
    createInfo.sType = VkStructureType.SHADER_MODULE_CREATE_INFO;
    createInfo.codeSize = BigInt(shaderData.byteLength);
    createInfo.pCode = BigInt(ptr(shaderData));

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateShaderModule(
      device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    return Number(pointerHolder[0]!) as Pointer;
  }

  // MARK: Inactive Properties
  #device: Pointer;

  #vertexData: Uint8Array | null = null;
  #fragmentData: Uint8Array | null = null;
  #computeData: Uint8Array | null = null;

  #vertexModule: Pointer | null = null;
  #fragmentModule: Pointer | null = null;
  #computeModule: Pointer | null = null;

  constructor(device: Pointer, props: VKPipelineProps) {
    this.#device = device;

    if (!Object.keys(props.entries).length) {
      throw new DynamicLibError(
        'At least one entry point must be specified',
        'Vulkan',
      );
    }

    if ('vertex' in props.entries) {
      const shader =
        typeof props.shader === 'string'
          ? props.shader
          : props.shader.vertex || '';
      if (
        !shader.includes('@vertex') ||
        !shader.includes(props.entries.vertex!)
      ) {
        throw new DynamicLibError(
          'Vertex shader or entry point not found',
          'Vulkan',
        );
      }
      if (!isWgslValid(shader)) {
        throw new DynamicLibError('Invalid vertex WGSL shader', 'Vulkan');
      }
      this.#vertexData = VkPipeline.#normalizeShaderSource(
        wgslToSpirvBin(shader, 'vertex', props.entries.vertex!),
      );

      this.#vertexModule = VkPipeline.#createShaderModule(
        this.#device,
        this.#vertexData,
      );
    }

    if ('fragment' in props.entries) {
      const shader =
        typeof props.shader === 'string'
          ? props.shader
          : props.shader.fragment || '';
      if (
        !shader.includes('@fragment') ||
        !shader.includes(props.entries.fragment!)
      ) {
        throw new DynamicLibError(
          'Fragment shader or entry point not found',
          'Vulkan',
        );
      }
      if (!isWgslValid(shader)) {
        throw new DynamicLibError('Invalid fragment WGSL shader', 'Vulkan');
      }
      this.#fragmentData = VkPipeline.#normalizeShaderSource(
        wgslToSpirvBin(shader, 'fragment', props.entries.fragment!),
      );

      this.#fragmentModule = VkPipeline.#createShaderModule(
        this.#device,
        this.#fragmentData,
      );
    }

    if ('compute' in props.entries) {
      const shader =
        typeof props.shader === 'string'
          ? props.shader
          : props.shader.compute || '';
      if (
        !shader.includes('@compute') ||
        !shader.includes(props.entries.compute!)
      ) {
        throw new DynamicLibError(
          'Compute shader or entry point not found',
          'Vulkan',
        );
      }
      if (!isWgslValid(shader)) {
        throw new DynamicLibError('Invalid compute WGSL shader', 'Vulkan');
      }
      this.#computeData = VkPipeline.#normalizeShaderSource(
        wgslToSpirvBin(shader, 'compute', props.entries.compute!),
      );

      this.#computeModule = VkPipeline.#createShaderModule(
        this.#device,
        this.#computeData,
      );
    }
  }

  dispose(): void | Promise<void> {
    if (this.#vertexModule) {
      VK.vkDestroyShaderModule(this.#device, this.#vertexModule, null);
      this.#vertexModule = null;
    }
    if (this.#fragmentModule) {
      VK.vkDestroyShaderModule(this.#device, this.#fragmentModule, null);
      this.#fragmentModule = null;
    }
    if (this.#computeModule) {
      VK.vkDestroyShaderModule(this.#device, this.#computeModule, null);
      this.#computeModule = null;
    }
  }
}
