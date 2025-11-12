import { isWgslValid, wgslToSpirvBin } from '@bunbox/naga';
import { getInstanceBuffer, instantiate, sizeOf } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  vkPipelineShaderStageCreateInfo,
  VkResult,
  vkShaderModuleCreateInfo,
  VkShaderStageFlagBits,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import type { Material } from '../../builders';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';

export class VkShaderModules implements Disposable {
  private static __normalizeShaderSource(shaderData: Uint8Array) {
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

  private static __createShaderModule(device: Pointer, shaderData: Uint8Array) {
    const createInfo = instantiate(vkShaderModuleCreateInfo);
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
    const shaderModule = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(`Shader module created: 0x${shaderModule.toString(16)}`);
    return shaderModule;
  }

  private __device: Pointer;
  private __material: Material;

  private __vertexModule: Pointer | null = null;
  private __fragmentModule: Pointer | null = null;

  // Shader stage structs
  private __vertexStageInfo = instantiate(vkPipelineShaderStageCreateInfo);
  private __fragmentStageInfo = instantiate(vkPipelineShaderStageCreateInfo);
  private __shaderStages: Uint8Array;

  constructor(device: Pointer, material: Material) {
    this.__device = device;
    this.__material = material;

    VK_DEBUG('Creating Shader module');

    if (Object.keys(material.entries).length !== 2) {
      throw new DynamicLibError(
        'The material must specify both vertex and fragment entry points',
        'Vulkan',
      );
    }

    // Validate and compile vertex shader
    const vertexShader =
      typeof material.shader === 'string'
        ? material.shader
        : material.shader.vertex || '';
    if (
      !vertexShader.includes('@vertex') ||
      !vertexShader.includes(material.entries.vertex!)
    ) {
      throw new DynamicLibError(
        'Vertex shader or entry point not found',
        'Vulkan',
      );
    }
    if (!isWgslValid(vertexShader)) {
      throw new DynamicLibError('Invalid vertex WGSL shader', 'Vulkan');
    }
    const vertexData = VkShaderModules.__normalizeShaderSource(
      wgslToSpirvBin(vertexShader, 'vertex', material.entries.vertex!),
    );

    // Validate and compile fragment shader
    const fragmentShader =
      typeof material.shader === 'string'
        ? material.shader
        : material.shader.fragment || '';
    if (
      !fragmentShader.includes('@fragment') ||
      !fragmentShader.includes(material.entries.fragment!)
    ) {
      throw new DynamicLibError(
        'Fragment shader or entry point not found',
        'Vulkan',
      );
    }
    if (!isWgslValid(fragmentShader)) {
      throw new DynamicLibError('Invalid fragment WGSL shader', 'Vulkan');
    }
    const fragmentData = VkShaderModules.__normalizeShaderSource(
      wgslToSpirvBin(fragmentShader, 'fragment', material.entries.fragment!),
    );

    // Create shader modules
    this.__vertexModule = VkShaderModules.__createShaderModule(
      this.__device,
      vertexData,
    );
    this.__fragmentModule = VkShaderModules.__createShaderModule(
      this.__device,
      fragmentData,
    );

    // Configure shader stages
    this.__vertexStageInfo.stage = VkShaderStageFlagBits.VERTEX_BIT;
    this.__vertexStageInfo.module = BigInt(this.__vertexModule);
    this.__vertexStageInfo.pName = material.entries.vertex!;

    this.__fragmentStageInfo.stage = VkShaderStageFlagBits.FRAGMENT_BIT;
    this.__fragmentStageInfo.module = BigInt(this.__fragmentModule);
    this.__fragmentStageInfo.pName = material.entries.fragment!;

    const stageSize = sizeOf(vkPipelineShaderStageCreateInfo);
    this.__shaderStages = new Uint8Array(stageSize * 2);
    this.__shaderStages.set(
      new Uint8Array(getInstanceBuffer(this.__vertexStageInfo)),
      0,
    );
    this.__shaderStages.set(
      new Uint8Array(getInstanceBuffer(this.__fragmentStageInfo)),
      stageSize,
    );

    VK_DEBUG('Shader modules initialized');
  }

  get stages(): Pointer {
    return ptr(this.__shaderStages);
  }

  get material(): Material {
    return this.__material;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing Shader module');

    if (this.__vertexModule) {
      VK.vkDestroyShaderModule(this.__device, this.__vertexModule, null);
      this.__vertexModule = null;
      VK_DEBUG('Vertex shader module destroyed');
    }

    if (this.__fragmentModule) {
      VK.vkDestroyShaderModule(this.__device, this.__fragmentModule, null);
      this.__fragmentModule = null;
      VK_DEBUG('Fragment shader module destroyed');
    }

    VK_DEBUG('Shader modules disposed');
  }
}
