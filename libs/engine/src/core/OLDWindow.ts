import { wgsl_to_msl_bin, wgsl_to_spirv_bin } from '@bunbox/naga';
import { type Pointer } from 'bun:ffi';
import { type FunctionInfo, ResourceType, WgslReflect } from 'wgsl_reflect';
import {
  BACKGROUND_RENDERING,
  POINTER_KEY_DEVICE,
  USING_VULKAN,
} from '../constants';
import type { Geometry, Material } from '../elements';
import { Color, type Matrix, Vector2, Vector3 } from '../math';
import { AbstractCamera, AbstractLight, Node3D, Viewport } from '../nodes';
import { Mesh } from '../nodes/Mesh';
import { POINTERS_MAP } from '../stores/global';
import type { WindowsFeature, WindowsFeaturesOptions } from '../types';
import { pointerToBuffer } from '../utils/buffer';
import { Node } from './Node';

export type WindowOptions = {
  title: string;
  /** @default 800 */
  width?: number;
  /** @default 600 */
  height?: number;
  features?: WindowsFeaturesOptions;
};

export class Window extends Viewport {
  #winPtr: Pointer;
  #devicePtr: Pointer;
  #winId: number;
  #enableVSync: boolean = true;
  #swapFormat: number = 0;

  #features: WindowsFeaturesOptions;
  #stack: Node[] = [];
  #meshStack: Mesh[] = [];
  #lightStack: AbstractLight[] = [];
  #cameraStack: AbstractCamera[] = [];
  #scheduleDirty: boolean = true;

  #clearColor = new Color();

  // Helpers
  #renderDelayCount: number;

  // Pointers & Structs
  #displayMode: SDL_DisplayMode;
  #widthPtr: Int32Array;
  #heightPtr: Int32Array;
  #xPtr: Int32Array;
  #yPtr: Int32Array;

  #currentCmd: Pointer | null = null;
  #swapTexPtr = new BigUint64Array(1);
  #swapWidthPtr = new Uint32Array(1);
  #swapHeightPtr = new Uint32Array(1);

  #clearColorStruct = new SDL_FColor();

  #textureTouch: Set<Pointer> = new Set();
  #textureMap: Map<string, Pointer> = new Map();
  #resolveTextureMap: Map<string, Pointer> = new Map();
  #textureMetaMap: Map<
    string,
    { width: number; height: number; hash: string; sampleCount: number }
  > = new Map();
  #viewportCompositionQueue: Set<{
    texture: Pointer;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = new Set();

  // Pipeline cache
  #pipelineCache: Map<string, Pointer> = new Map();
  #shaderCache: Map<string, Pointer> = new Map();
  #reflectionCache: Map<string, WgslReflect> = new Map();

  // Geometry buffer cache
  #vertexBufferCache: Map<string, Pointer> = new Map();
  #indexBufferCache: Map<string, Pointer> = new Map();

  static #getFeaturesFlags(features: WindowsFeaturesOptions): number {
    let flags = USING_VULKAN
      ? SDL_WindowFlags.SDL_WINDOW_VULKAN
      : SDL_WindowFlags.SDL_WINDOW_METAL;
    for (const [key, value] of Object.entries(features)) {
      flags |= value ? (WINDOW_FEATURES_MAP[key as WindowsFeature] ?? 0) : 0;
    }

    return flags;
  }

  constructor({ title, height, width, features }: WindowOptions) {
    super();
    this.#features = features ?? {};

    const initialFlag = SDL.SDL_WasInit(SDL_InitFlags.SDL_INIT_VIDEO);
    if ((initialFlag & SDL_InitFlags.SDL_INIT_VIDEO) === 0) {
      throw new Error(
        'SDL video subsystem is not initialized. Please initialize it by creating an App instance first.',
      );
    }

    const winPointer = SDL.SDL_CreateWindow(
      cstr(title),
      width ?? 800,
      height ?? 600,
      Window.#getFeaturesFlags(this.#features),
    );

    if (!winPointer) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }

    this.#winPtr = winPointer;
    this.#winId = SDL.SDL_GetWindowID(this.#winPtr);
    POINTERS_MAP.set(this.id, this.#winPtr);

    this.#displayMode = new SDL_DisplayMode();
    this.#widthPtr = new Int32Array(1);
    this.#heightPtr = new Int32Array(1);
    this.#xPtr = new Int32Array(1);
    this.#yPtr = new Int32Array(1);
    this.#renderDelayCount = 0;
    const devicePtr = POINTERS_MAP.get(POINTER_KEY_DEVICE);

    if (!devicePtr) {
      throw new Error('Create App node instance before creating Window');
    }
    this.#devicePtr = devicePtr;
    if (!SDL.SDL_ClaimWindowForGPUDevice(this.#devicePtr, this.#winPtr)) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }

    SDL.SDL_GetWindowSizeInPixels(
      this.#winPtr,
      this.#widthPtr,
      this.#heightPtr,
    );
    SDL.SDL_GetWindowPosition(this.#winPtr, this.#xPtr, this.#yPtr);
    this.width = this.#widthPtr[0]!;
    this.height = this.#heightPtr[0]!;
    this.x = this.#xPtr[0]!;
    this.y = this.#yPtr[0]!;
    this.unmarkAsDirty();

    this.#processDisplayMode();
    this.#swapFormat = SDL.SDL_GetGPUSwapchainTextureFormat(
      this.#devicePtr,
      this.#winPtr,
    );

    // If swapchain format is not available yet, use a common default
    if (this.#swapFormat === 0) {
      // Use BGRA8_UNORM (without SRGB) which is more widely supported
      this.#swapFormat =
        SDL_GPUTextureFormat.SDL_GPU_TEXTUREFORMAT_B8G8R8A8_UNORM;
      console.warn(
        `[Window] Swapchain format not available yet, using default: ${this.#swapFormat}`,
      );
    }

    const unsubscribes = [
      this.subscribe('add-child', () => {
        this.#scheduleDirty = true;
      }),
      this.subscribe('remove-child', () => {
        this.#scheduleDirty = true;
      }),
      this.subscribe('enabled-change', () => {
        this.#scheduleDirty = true;
      }),
      this.subscribe('orientation', () => {
        this.#processDisplayMode();
      }),
      this.subscribe('windowDisplayChanged', (ev) => {
        if (ev.windowId !== this.#winId) return;
        this.#processDisplayMode();
      }),
      this.subscribe('windowResize', (ev) => {
        if (ev.windowId !== this.#winId) return;
        this.#processDisplayMode();
      }),
    ];

    this.on('dispose', () => {
      unsubscribes.forEach((fn) => fn());
      this.#stack = [];
      this.#meshStack = [];

      for (const pipeline of this.#pipelineCache.values()) {
        SDL.SDL_ReleaseGPUGraphicsPipeline(this.#devicePtr, pipeline);
      }
      this.#pipelineCache.clear();

      for (const shader of this.#shaderCache.values()) {
        SDL.SDL_ReleaseGPUShader(this.#devicePtr, shader);
      }
      this.#shaderCache.clear();
      this.#reflectionCache.clear();

      for (const buffer of this.#vertexBufferCache.values()) {
        SDL.SDL_ReleaseGPUBuffer(this.#devicePtr, buffer);
      }
      this.#vertexBufferCache.clear();

      for (const buffer of this.#indexBufferCache.values()) {
        SDL.SDL_ReleaseGPUBuffer(this.#devicePtr, buffer);
      }
      this.#indexBufferCache.clear();

      for (const texture of this.#textureMap.values()) {
        SDL.SDL_ReleaseGPUTexture(this.#devicePtr, texture);
      }
      this.#textureMap.clear();

      for (const texture of this.#resolveTextureMap.values()) {
        SDL.SDL_ReleaseGPUTexture(this.#devicePtr, texture);
      }
      this.#resolveTextureMap.clear();

      POINTERS_MAP.delete(this.id);
      SDL.SDL_ReleaseWindowFromGPUDevice(this.#devicePtr, this.#winPtr);
      SDL.SDL_DestroyWindow(this.#winPtr);
    });

    this.#rebuildStacks();
  }

  get windowId() {
    return SDL.SDL_GetWindowID(this.#winPtr);
  }

  get title() {
    return SDL.SDL_GetWindowTitle(this.#winPtr).toString();
  }

  get clearColor() {
    return this.#clearColor;
  }

  get isEnabledVSync() {
    return this.#enableVSync;
  }

  set title(value: string) {
    if (this.isDisposed) {
      throw new Error('Window is disposed');
    }
    SDL.SDL_SetWindowTitle(this.#winPtr, cstr(value));
  }

  set clearColor(value: Color) {
    this.#clearColor = value;
    this.#clearColor.markAsDirty();
  }

  set isEnabledVSync(value: boolean) {
    this.#enableVSync = value;
  }

  getCurrentDisplayFrameRate() {
    return Math.max(this.#displayMode.properties.refresh_rate, 24);
  }

  getCurrentDisplaySize() {
    return new Vector2(
      this.#displayMode.properties.w,
      this.#displayMode.properties.h,
    );
  }

  override _process(deltaTime: number): void {
    this.#renderDelayCount += deltaTime;

    if (this.isDirty) {
      this.#widthPtr[0] = this.width;
      this.#heightPtr[0] = this.height;
      this.#xPtr[0] = this.x;
      this.#yPtr[0] = this.y;

      SDL.SDL_SetWindowSize(
        this.#winPtr,
        this.#widthPtr[0],
        this.#heightPtr[0],
      );
      SDL.SDL_SetWindowPosition(this.#winPtr, this.#xPtr[0], this.#yPtr[0]);

      this.unmarkAsDirty();
    }

    if (this.#enableVSync) {
      const rate = this.getCurrentDisplayFrameRate();
      const delay = 1000 / rate;
      if (this.#renderDelayCount >= delay) {
        this.#callRenderStack(this.#renderDelayCount);
        this.#renderDelayCount = 0;
      }
    } else {
      this.#callRenderStack(this.#renderDelayCount);
      this.#renderDelayCount = 0;
    }
  }

  #processDisplayMode() {
    const displayId = SDL.SDL_GetDisplayForWindow(this.#winPtr);
    const displayModePtr = SDL.SDL_GetCurrentDisplayMode(displayId);

    if (!displayModePtr) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }
    const buffer = pointerToBuffer(displayModePtr, this.#displayMode.size);
    this.#displayMode.copy(buffer);
  }

  #rebuildStacks() {
    const nextStack: Node[] = [];
    const nextMeshStack: Mesh[] = [];
    const nextLightStack: AbstractLight[] = [];
    const nextCameraStack: AbstractCamera[] = [];

    this.traverse((n) => {
      if (n instanceof Node) {
        nextStack.push(n);
      }
      if (n instanceof Mesh) {
        nextMeshStack.push(n);
      }
      if (n instanceof AbstractLight) {
        nextLightStack.push(n);
      }
      if (n instanceof AbstractCamera) {
        nextCameraStack.push(n);
      }
    });

    this.#stack = nextStack;
    this.#meshStack = nextMeshStack;
    this.#lightStack = nextLightStack;
    this.#cameraStack = nextCameraStack;
    this.#scheduleDirty = false;
  }

  #callRenderStack(delta: number) {
    if (this.#scheduleDirty) {
      this.#rebuildStacks();
    }

    for (const node of this.#stack) node._update(delta);
    this.#render();
  }

  #getOrCreateReflection(material: Material): WgslReflect | null {
    const matHash = material.hash;

    const cached = this.#reflectionCache.get(matHash);
    if (cached) {
      return cached;
    }

    try {
      const reflection = new WgslReflect(material.shader);
      this.#reflectionCache.set(matHash, reflection);
      return reflection;
    } catch (err) {
      console.error(`Failed to reflect WGSL shader: ${err}`);
      return null;
    }
  }

  #getOrCreatePipeline(material: Material): Pointer | null {
    const matHash = material.hash;

    const cached = this.#pipelineCache.get(matHash);
    if (cached) {
      return cached;
    }

    const shaderInfo = this.#getOrCreateReflection(material);
    if (!shaderInfo) {
      return null;
    }

    // Validate shader has required entry points
    if (!shaderInfo.entry.vertex || shaderInfo.entry.vertex.length === 0) {
      console.error('Shader missing vertex entry point');
      return null;
    }
    if (!shaderInfo.entry.fragment || shaderInfo.entry.fragment.length === 0) {
      console.error('Shader missing fragment entry point');
      return null;
    }

    const fragmentEntry: FunctionInfo = shaderInfo.entry.fragment[0]!;
    const vertexEntry: FunctionInfo = shaderInfo.entry.vertex[0]!;

    // Step 2: Compile WGSL to backend-specific format (SPIR-V or MSL)
    let fragmentData: Uint8Array;
    let vertexData: Uint8Array;
    const shaderFormat =
      BACKGROUND_RENDERING === 'vulkan'
        ? SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV
        : SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_MSL;

    try {
      if (BACKGROUND_RENDERING === 'vulkan') {
        fragmentData = wgsl_to_spirv_bin(
          material.shader,
          'fragment',
          fragmentEntry.name,
        );
        vertexData = wgsl_to_spirv_bin(
          material.shader,
          'vertex',
          vertexEntry.name,
        );
      } else {
        fragmentData = wgsl_to_msl_bin(
          material.shader,
          'fragment',
          fragmentEntry.name,
        );
        vertexData = wgsl_to_msl_bin(
          material.shader,
          'vertex',
          vertexEntry.name,
        );
      }
    } catch (err) {
      console.error(`Failed to compile shader: ${err}`);
      return null;
    }

    // Validate compiled data
    if (!fragmentData || fragmentData.length === 0) {
      console.error('Fragment shader compilation produced empty output');
      return null;
    }
    if (!vertexData || vertexData.length === 0) {
      console.error('Vertex shader compilation produced empty output');
      return null;
    }

    // Step 3: Count resource bindings from shader reflection
    const countResources = (functionInfo: FunctionInfo) => {
      let samplers = 0;
      let storageTextures = 0;
      let storageBuffers = 0;
      let uniformBuffers = 0;

      // Iterate through all resources in the function
      for (const resource of functionInfo.resources) {
        const typeName = resource.type.name.toLowerCase();

        // Check if it's a sampler
        if (
          typeName.includes('sampler') ||
          typeName.includes('comparison_sampler') ||
          typeName === 'sampler_comparison'
        ) {
          samplers++;
          continue;
        }

        // Check if it's a storage texture
        if (
          typeName.includes('storage') &&
          (typeName.includes('texture') ||
            typeName.startsWith('texture_storage'))
        ) {
          storageTextures++;
          continue;
        }

        // Check if it's a texture (read-only, not storage)
        if (
          typeName.includes('texture') &&
          !typeName.includes('storage') &&
          resource.resourceType !== ResourceType.StorageTexture
        ) {
          // Read-only textures don't count as storage, but we count them
          // This is already handled by not incrementing counters
          continue;
        }

        // Check resource type for storage and uniform buffers
        switch (resource.resourceType) {
          case ResourceType.Storage:
            storageBuffers++;
            break;
          case ResourceType.Uniform:
            uniformBuffers++;
            break;
          case ResourceType.StorageTexture:
            // Already counted above
            break;
          case ResourceType.Sampler:
            // Already counted above
            break;
        }
      }

      return { samplers, storageTextures, storageBuffers, uniformBuffers };
    };

    const vertexResources = countResources(vertexEntry);
    const fragmentResources = countResources(fragmentEntry);

    // Step 4: Create vertex shader
    const vertexShaderInfo = new SDL_GPUShaderCreateInfo();
    vertexShaderInfo.properties.code = vertexData;
    vertexShaderInfo.properties.code_size = BigInt(vertexData.byteLength);
    vertexShaderInfo.properties.entrypoint = vertexEntry.name;
    vertexShaderInfo.properties.format = shaderFormat;
    vertexShaderInfo.properties.stage =
      SDL_GPUShaderStage.SDL_GPU_SHADERSTAGE_VERTEX;
    vertexShaderInfo.properties.num_samplers = vertexResources.samplers;
    vertexShaderInfo.properties.num_storage_textures =
      vertexResources.storageTextures;
    vertexShaderInfo.properties.num_storage_buffers =
      vertexResources.storageBuffers;
    vertexShaderInfo.properties.num_uniform_buffers =
      vertexResources.uniformBuffers;
    vertexShaderInfo.properties.props = 0n;

    const vertexShader = SDL.SDL_CreateGPUShader(
      this.#devicePtr,
      vertexShaderInfo.bunPointer,
    );
    if (!vertexShader) {
      console.error(`Failed to create vertex shader: ${SDL.SDL_GetError()}`);
      return null;
    }

    // Step 5: Create fragment shader
    const fragmentShaderInfo = new SDL_GPUShaderCreateInfo();
    fragmentShaderInfo.properties.code = fragmentData;
    fragmentShaderInfo.properties.code_size = BigInt(fragmentData.byteLength);
    fragmentShaderInfo.properties.entrypoint = fragmentEntry.name;
    fragmentShaderInfo.properties.format = shaderFormat;
    fragmentShaderInfo.properties.stage =
      SDL_GPUShaderStage.SDL_GPU_SHADERSTAGE_FRAGMENT;
    fragmentShaderInfo.properties.num_samplers = fragmentResources.samplers;
    fragmentShaderInfo.properties.num_storage_textures =
      fragmentResources.storageTextures;
    fragmentShaderInfo.properties.num_storage_buffers =
      fragmentResources.storageBuffers;
    fragmentShaderInfo.properties.num_uniform_buffers =
      fragmentResources.uniformBuffers;
    fragmentShaderInfo.properties.props = 0n;

    const fragmentShader = SDL.SDL_CreateGPUShader(
      this.#devicePtr,
      fragmentShaderInfo.bunPointer,
    );
    if (!fragmentShader) {
      console.error(`Failed to create fragment shader: ${SDL.SDL_GetError()}`);
      SDL.SDL_ReleaseGPUShader(this.#devicePtr, vertexShader);
      return null;
    }

    // Step 6: Define vertex input layout from shader reflection
    const vertexAttributes: SDL_GPUVertexAttribute[] = [];
    const vertexInputs = vertexEntry.inputs || [];

    for (const input of vertexInputs) {
      if (input.location === undefined || typeof input.location === 'string')
        continue;

      const attr = new SDL_GPUVertexAttribute();
      attr.properties.location = input.location;
      attr.properties.buffer_slot = 0; // Single interleaved buffer
      attr.properties.offset = 0; // Will be calculated based on stride

      // Map WGSL types to SDL vertex formats
      const formatMap: Record<string, number> = {
        'vec2<f32>':
          SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_FLOAT2,
        'vec3<f32>':
          SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_FLOAT3,
        'vec4<f32>':
          SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_FLOAT4,
        f32: SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_FLOAT,
        'vec2<i32>':
          SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_INT2,
        'vec3<i32>':
          SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_INT3,
        'vec4<i32>':
          SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_INT4,
        i32: SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_INT,
        // Fallback for wgsl_reflect shorthand types (without type parameters)
        vec2: SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_FLOAT2,
        vec3: SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_FLOAT3,
        vec4: SDL_GPUVertexElementFormat.SDL_GPU_VERTEXELEMENTFORMAT_FLOAT4,
      };

      const format = formatMap[input.type?.name || ''];
      if (format === undefined) {
        console.warn(`Unsupported vertex input type: ${input.type?.name}`);
        continue;
      }

      attr.properties.format = format;
      // offset will be calculated after we know all attribute sizes
      vertexAttributes.push(attr);
    }

    // Calculate offsets and stride (pitch) for interleaved vertex attributes
    // Assume 4 bytes per component (f32/i32)
    const getComponentCount = (typeName?: string) => {
      if (!typeName) return 0;
      if (typeName.includes('vec4')) return 4;
      if (typeName.includes('vec3')) return 3;
      if (typeName.includes('vec2')) return 2;
      if (typeName.includes('f32') || typeName === 'f32') return 1;
      if (typeName.includes('i32') || typeName === 'i32') return 1;
      return 0;
    };

    let strideBytes = 0;
    for (let i = 0; i < vertexAttributes.length; i++) {
      const attr = vertexAttributes[i]!;
      const input = vertexInputs[i]!;
      const comps = getComponentCount(input.type?.name);
      attr.properties.offset = strideBytes;
      attr.properties.buffer_slot = 0;
      // Each component is 4 bytes
      strideBytes += comps * 4;
    }

    // Create vertex buffer description (single interleaved buffer)
    const vertexBufferDesc = new SDL_GPUVertexBufferDescription();
    vertexBufferDesc.properties.slot = 0;
    vertexBufferDesc.properties.pitch = strideBytes; // Calculated from attributes
    vertexBufferDesc.properties.input_rate =
      SDL_GPUVertexInputRate.SDL_GPU_VERTEXINPUTRATE_VERTEX;
    vertexBufferDesc.properties.instance_step_rate = 0;

    // Step 7: Configure color target description
    const rasterizer = material.rasterizer;
    const blend = rasterizer.blend;

    const colorTargetDescs: SDL_GPUColorTargetDescription[] = [];
    const colorTargetDesc = new SDL_GPUColorTargetDescription();

    colorTargetDesc.properties.format = parseTextureFormat('rgba8unorm');
    colorTargetDesc.properties.blend_state.properties.src_color_blendfactor =
      BLEND_FACTOR_MAP[blend.color.srcFactor] ??
      SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ONE;
    colorTargetDesc.properties.blend_state.properties.dst_color_blendfactor =
      BLEND_FACTOR_MAP[blend.color.dstFactor] ??
      SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ZERO;
    colorTargetDesc.properties.blend_state.properties.src_alpha_blendfactor =
      BLEND_FACTOR_MAP[blend.alpha.srcFactor] ??
      SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ONE;
    colorTargetDesc.properties.blend_state.properties.dst_alpha_blendfactor =
      BLEND_FACTOR_MAP[blend.alpha.dstFactor] ??
      SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ZERO;
    colorTargetDesc.properties.blend_state.properties.color_blend_op =
      BLEND_OPERATION_MAP[blend.color.operation] ??
      SDL_GPUBlendOp.SDL_GPU_BLENDOP_ADD;
    colorTargetDesc.properties.blend_state.properties.alpha_blend_op =
      BLEND_OPERATION_MAP[blend.alpha.operation] ??
      SDL_GPUBlendOp.SDL_GPU_BLENDOP_ADD;
    colorTargetDesc.properties.blend_state.properties.color_write_mask =
      blend.writeMask.get();
    colorTargetDesc.properties.blend_state.properties.enable_blend =
      blend.enabled;
    colorTargetDesc.properties.blend_state.properties.enable_color_write_mask = true;

    colorTargetDescs.push(colorTargetDesc);

    // Step 8: Map material primitive type to SDL primitive type
    const primitiveType =
      PRIMITIVE_TYPE_MAP[material.primitive] ??
      SDL_GPUPrimitiveType.SDL_GPU_PRIMITIVETYPE_TRIANGLELIST;

    // Vertex input state
    const vertexInputState = new SDL_GPUVertexInputState();
    if (vertexAttributes.length > 0) {
      vertexInputState.properties.vertex_buffer_descriptions =
        new BigUint64Array([BigInt(vertexBufferDesc.bunPointer)]);
      vertexInputState.properties.num_vertex_buffers = 1;
      vertexInputState.properties.vertex_attributes = new BigUint64Array(
        vertexAttributes.map((attr) => BigInt(attr.bunPointer)),
      );
      vertexInputState.properties.num_vertex_attributes =
        vertexAttributes.length;
    } else {
      vertexInputState.properties.num_vertex_buffers = 0;
      vertexInputState.properties.num_vertex_attributes = 0;
    }

    // Rasterizer state
    const rasterizerState = new SDL_GPURasterizerState();

    rasterizerState.properties.fill_mode =
      FILL_MODE_MAP[rasterizer.fillMode] ??
      SDL_GPUFillMode.SDL_GPU_FILLMODE_FILL;
    rasterizerState.properties.cull_mode =
      CULL_MODE_MAP[rasterizer.cull] ?? SDL_GPUCullMode.SDL_GPU_CULLMODE_NONE;
    rasterizerState.properties.front_face =
      FRONT_FACE_MAP[rasterizer.frontFace] ??
      SDL_GPUFrontFace.SDL_GPU_FRONTFACE_CLOCKWISE;
    rasterizerState.properties.depth_bias_constant_factor =
      rasterizer.depthStencil.depthBias;
    rasterizerState.properties.depth_bias_clamp =
      rasterizer.depthStencil.depthBiasClamp;
    rasterizerState.properties.depth_bias_slope_factor =
      rasterizer.depthStencil.depthBiasSlopeScale;
    rasterizerState.properties.enable_depth_bias =
      rasterizer.depthStencil.depthBias !== 0 ||
      rasterizer.depthStencil.depthBiasSlopeScale !== 0;
    rasterizerState.properties.enable_depth_clip = false;
    rasterizerState.properties.padding1 = 0;
    rasterizerState.properties.padding2 = 0;

    // Multisample state
    const multisample = rasterizer.multisample;
    const sampleCountMap: Record<number, number> = {
      1: SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1,
      2: SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_2,
      4: SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_4,
      8: SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_8,
    };

    const multisampleState = new SDL_GPUMultisampleState();

    multisampleState.properties.sample_count =
      sampleCountMap[multisample.count] ??
      SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1;
    multisampleState.properties.sample_mask = multisample.mask.get();
    multisampleState.properties.enable_mask = true;
    multisampleState.properties.enable_alpha_to_coverage =
      multisample.alphaToCoverageEnabled;
    multisampleState.properties.padding2 = 0;
    multisampleState.properties.padding3 = 0;

    // Depth/stencil state
    const depthStencil = rasterizer.depthStencil;
    const depthStencilState = new SDL_GPUDepthStencilState();

    depthStencilState.properties.compare_op =
      COMPARE_FUNCTION_MAP[depthStencil.depthCompare] ??
      SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS;
    const backStencilState = new SDL_GPUStencilOpState();
    backStencilState.properties.compare_op =
      COMPARE_FUNCTION_MAP[depthStencil.stencilBack.compare] ??
      SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS;
    backStencilState.properties.fail_op =
      STENCIL_OPERATION_MAP[depthStencil.stencilBack.failOp] ??
      SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
    backStencilState.properties.pass_op =
      STENCIL_OPERATION_MAP[depthStencil.stencilBack.passOp] ??
      SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
    backStencilState.properties.depth_fail_op =
      STENCIL_OPERATION_MAP[depthStencil.stencilBack.depthFailOp] ??
      SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
    depthStencilState.properties.back_stencil_state = backStencilState;

    const frontStencilState = new SDL_GPUStencilOpState();
    frontStencilState.properties.compare_op =
      COMPARE_FUNCTION_MAP[depthStencil.stencilFront.compare] ??
      SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS;
    frontStencilState.properties.fail_op =
      STENCIL_OPERATION_MAP[depthStencil.stencilFront.failOp] ??
      SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
    frontStencilState.properties.pass_op =
      STENCIL_OPERATION_MAP[depthStencil.stencilFront.passOp] ??
      SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
    frontStencilState.properties.depth_fail_op =
      STENCIL_OPERATION_MAP[depthStencil.stencilFront.depthFailOp] ??
      SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
    depthStencilState.properties.front_stencil_state = frontStencilState;
    depthStencilState.properties.enable_depth_test =
      depthStencil.depthWriteEnabled;
    depthStencilState.properties.enable_depth_write =
      depthStencil.depthWriteEnabled;

    // Detect if stencil is actually used based on material configuration
    const hasActiveStencilOps =
      depthStencil.stencilFront.failOp !== 'keep' ||
      depthStencil.stencilFront.passOp !== 'keep' ||
      depthStencil.stencilFront.depthFailOp !== 'keep' ||
      depthStencil.stencilBack.failOp !== 'keep' ||
      depthStencil.stencilBack.passOp !== 'keep' ||
      depthStencil.stencilBack.depthFailOp !== 'keep';

    const hasActiveStencilCompare =
      depthStencil.stencilFront.compare !== 'always' ||
      depthStencil.stencilBack.compare !== 'always';

    const usesStencil = hasActiveStencilOps && hasActiveStencilCompare;

    depthStencilState.properties.enable_stencil_test = usesStencil;
    depthStencilState.properties.compare_mask =
      depthStencil.stencilReadMask.get();
    depthStencilState.properties.write_mask =
      depthStencil.stencilWriteMask.get();

    // Target info
    const targetInfo = new SDL_GPUGraphicsPipelineTargetInfo();
    targetInfo.properties.color_target_descriptions = new BigUint64Array(
      colorTargetDescs.map((desc) => BigInt(desc.bunPointer)),
    );
    targetInfo.properties.num_color_targets = colorTargetDescs.length;
    targetInfo.properties.depth_stencil_format = 0;
    targetInfo.properties.has_depth_stencil_target = false;
    targetInfo.properties.padding1 = 0;
    targetInfo.properties.padding2 = 0;
    targetInfo.properties.padding3 = 0;

    // Create pipeline info and assign all pointers
    const pipelineInfo = new SDL_GPUGraphicsPipelineCreateInfo();
    pipelineInfo.properties.vertex_shader = BigInt(vertexShader);
    pipelineInfo.properties.fragment_shader = BigInt(fragmentShader);
    pipelineInfo.properties.primitive_type = primitiveType;
    pipelineInfo.properties.vertex_input_state = vertexInputState;
    pipelineInfo.properties.rasterizer_state = rasterizerState;
    pipelineInfo.properties.multisample_state = multisampleState;
    pipelineInfo.properties.depth_stencil_state = depthStencilState;
    pipelineInfo.properties.target_info = targetInfo;

    console.log('vertexInputState:', vertexInputState.buffer);
    console.log('rasterizerState:', rasterizerState.buffer);
    console.log('multisampleState:', multisampleState.buffer);
    console.log('depthStencilState:', depthStencilState.buffer);
    console.log('targetInfo:', targetInfo.buffer);
    console.log('pipelineInfo:', pipelineInfo.buffer);

    const pipeline = SDL.SDL_CreateGPUGraphicsPipeline(
      this.#devicePtr,
      pipelineInfo.bunPointer,
    );

    if (!pipeline) {
      console.error(
        `Failed to create graphics pipeline: ${SDL.SDL_GetError()}`,
      );
      SDL.SDL_ReleaseGPUShader(this.#devicePtr, vertexShader);
      SDL.SDL_ReleaseGPUShader(this.#devicePtr, fragmentShader);
      return null;
    }

    // Store shaders in cache for cleanup
    this.#shaderCache.set(`${matHash}-vertex`, vertexShader);
    this.#shaderCache.set(`${matHash}-fragment`, fragmentShader);

    // Cache the pipeline
    this.#pipelineCache.set(matHash, pipeline);

    return pipeline;
  }

  /**
   * Set material bindings (uniforms, textures) on the render pass.
   * Uses reflection data to discover required bindings and provides fallbacks.
   *
   * SDL3 GPU API uses uniform slots (4 per stage: vertex, fragment, compute).
   * Uniforms are pushed directly to command buffer and persist until changed.
   * For data larger than a few matrices, storage buffers should be used instead.
   */
  #setMaterialBindings(
    pass: Pointer,
    material: Material,
    matrices: {
      modelMatrix: Matrix;
      viewMatrix: Matrix;
      projectionMatrix: Matrix;
    },
  ): void {
    const params = material.params;
    const reflection = this.#getOrCreateReflection(material);

    if (!reflection) {
      console.warn(
        'Failed to get shader reflection, skipping material bindings',
      );
      return;
    }

    // Get entry points (they are arrays, take first one)
    const vertexEntry = reflection.entry.vertex?.[0];
    const fragmentEntry = reflection.entry.fragment?.[0];

    // Analyze shader resources to determine what needs to be bound
    const hasVertexUniforms = this.#hasUniformsInStage(vertexEntry);
    const hasFragmentUniforms = this.#hasUniformsInStage(fragmentEntry);

    // Push vertex uniforms (matrices)
    if (hasVertexUniforms && this.#currentCmd) {
      // Format: projection (16 floats), view (16 floats), model (16 floats)
      // Total: 48 floats = 192 bytes (std140 compliant)
      const matricesData = new Float32Array(48);

      // Copy projection matrix
      const projData = matrices.projectionMatrix.toArray();
      for (let i = 0; i < 16; i++) {
        matricesData[i] = projData[i]!;
      }

      // Copy view matrix
      const viewData = matrices.viewMatrix.toArray();
      for (let i = 0; i < 16; i++) {
        matricesData[16 + i] = viewData[i]!;
      }

      // Copy model matrix
      const modelData = matrices.modelMatrix.toArray();
      for (let i = 0; i < 16; i++) {
        matricesData[32 + i] = modelData[i]!;
      }

      // Push to vertex uniform slot 0
      // Data persists until next push to same slot
      SDL.SDL_PushGPUVertexUniformData(
        this.#currentCmd,
        0, // slot_index
        matricesData,
        matricesData.byteLength,
      );
    }

    // Push fragment uniforms (material parameters)
    if (hasFragmentUniforms && this.#currentCmd) {
      // For now, assuming material params contain a color (vec4<f32>)
      // TODO: Use reflection to dynamically determine uniform layout
      const color = params.color ?? { r: 1, g: 1, b: 1, a: 1 };
      const materialData = new Float32Array([
        color.r,
        color.g,
        color.b,
        color.a,
      ]);

      // Push to fragment uniform slot 0
      SDL.SDL_PushGPUFragmentUniformData(
        this.#currentCmd,
        0, // slot_index
        materialData,
        materialData.byteLength,
      );
    }

    // TODO: Bind textures and samplers
    // SDL.SDL_BindGPUFragmentSamplers(pass, ...);
    // TODO: Bind storage buffers for large datasets
    // SDL.SDL_BindGPUVertexStorageBuffers(pass, ...);
  }

  /**
   * Check if a shader stage has uniform variables that need to be bound.
   */
  #hasUniformsInStage(functionInfo: FunctionInfo | undefined): boolean {
    if (!functionInfo) {
      return false;
    }

    // Check if any uniform variables exist in this stage
    // Uniforms are resources with resourceType === ResourceType.Uniform
    for (const resource of functionInfo.resources) {
      if (resource.resourceType === ResourceType.Uniform) {
        return true;
      }
    }

    return false;
  }

  /**
   * Bind geometry vertex and index buffers to the render pass.
   * Creates GPU buffers on-demand and caches them for reuse.
   */
  #bindGeometry(pass: Pointer, geometry: Geometry): void {
    const geomId = geometry.hash;

    // Get or create vertex buffer
    let vertexBuffer = this.#vertexBufferCache.get(geomId);
    if (!vertexBuffer || geometry.isDirty) {
      // Release old buffer if exists
      if (vertexBuffer) {
        SDL.SDL_ReleaseGPUBuffer(this.#devicePtr, vertexBuffer);
      }

      // Calculate vertex data size (interleaved: position(3) + normal(3) + uv(2) = 8 floats per vertex)
      const vertexCount = geometry.vertexCount;
      const vertexStride = 8; // floats per vertex
      const vertexData = new Float32Array(vertexCount * vertexStride);

      // Interleave vertex attributes
      const positions = geometry.vertex;
      const normals = geometry.normal;
      const uvs = geometry.uvs[0] ?? new Float32Array(vertexCount * 2); // Fallback to zeros

      for (let i = 0; i < vertexCount; i++) {
        const offset = i * vertexStride;
        // Position (3 floats)
        vertexData[offset + 0] = positions[i * 3 + 0] ?? 0;
        vertexData[offset + 1] = positions[i * 3 + 1] ?? 0;
        vertexData[offset + 2] = positions[i * 3 + 2] ?? 0;
        // Normal (3 floats)
        vertexData[offset + 3] = normals[i * 3 + 0] ?? 0;
        vertexData[offset + 4] = normals[i * 3 + 1] ?? 0;
        vertexData[offset + 5] = normals[i * 3 + 2] ?? 0;
        // UV (2 floats)
        vertexData[offset + 6] = uvs[i * 2 + 0] ?? 0;
        vertexData[offset + 7] = uvs[i * 2 + 1] ?? 0;
      }

      // Create GPU buffer for vertices
      const bufferInfo = new SDL_GPUBufferCreateInfo();
      bufferInfo.properties.usage =
        SDL_GPUBufferUsageFlags.SDL_GPU_BUFFERUSAGE_VERTEX;
      bufferInfo.properties.size = vertexData.byteLength;
      bufferInfo.properties.props = 0;

      const createdVertexBuffer = SDL.SDL_CreateGPUBuffer(
        this.#devicePtr,
        bufferInfo.bunPointer,
      );
      if (!createdVertexBuffer) {
        console.error(`Failed to create vertex buffer: ${SDL.SDL_GetError()}`);
        return;
      }
      vertexBuffer = createdVertexBuffer;

      // Upload vertex data using transfer buffer
      const transferInfo = new SDL_GPUTransferBufferCreateInfo();
      transferInfo.properties.usage =
        SDL_GPUTransferBufferUsage.SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD;
      transferInfo.properties.size = vertexData.byteLength;
      transferInfo.properties.props = 0n;

      const transferBuffer = SDL.SDL_CreateGPUTransferBuffer(
        this.#devicePtr,
        transferInfo.bunPointer,
      );
      if (!transferBuffer) {
        console.error(
          `Failed to create transfer buffer: ${SDL.SDL_GetError()}`,
        );
        SDL.SDL_ReleaseGPUBuffer(this.#devicePtr, vertexBuffer);
        return;
      }

      // Map transfer buffer and copy data
      const mappedPtr = SDL.SDL_MapGPUTransferBuffer(
        this.#devicePtr,
        transferBuffer,
        false,
      );
      if (!mappedPtr) {
        console.error(`Failed to map transfer buffer: ${SDL.SDL_GetError()}`);
        SDL.SDL_ReleaseGPUTransferBuffer(this.#devicePtr, transferBuffer);
        SDL.SDL_ReleaseGPUBuffer(this.#devicePtr, vertexBuffer);
        return;
      }

      // Copy vertex data to mapped memory using ptr + memcpy
      const sourceBytes = new Uint8Array(vertexData.buffer);
      const destPtr = new Uint8Array(
        pointerToBuffer(mappedPtr, vertexData.byteLength),
      );
      destPtr.set(sourceBytes);
      SDL.SDL_UnmapGPUTransferBuffer(this.#devicePtr, transferBuffer);

      // Upload to GPU buffer via copy pass
      const copyPass = SDL.SDL_BeginGPUCopyPass(this.#currentCmd);
      const transferLoc = new SDL_GPUTransferBufferLocation();
      transferLoc.properties.transfer_buffer = BigInt(transferBuffer);
      transferLoc.properties.offset = 0;

      const bufferRegion = new SDL_GPUBufferRegion();
      bufferRegion.properties.buffer = BigInt(vertexBuffer);
      bufferRegion.properties.offset = 0;
      bufferRegion.properties.size = vertexData.byteLength;

      SDL.SDL_UploadToGPUBuffer(
        copyPass,
        transferLoc.bunPointer,
        bufferRegion.bunPointer,
        false,
      );
      SDL.SDL_EndGPUCopyPass(copyPass);

      // Release transfer buffer
      SDL.SDL_ReleaseGPUTransferBuffer(this.#devicePtr, transferBuffer);

      // Cache vertex buffer
      this.#vertexBufferCache.set(geomId, vertexBuffer);
      geometry.unmarkAsDirty();
    }

    // Get or create index buffer if geometry has indices
    let indexBuffer: Pointer | null = null;
    if (geometry.indexCount > 0) {
      indexBuffer = this.#indexBufferCache.get(geomId) ?? null;
      if (!indexBuffer || geometry.isDirty) {
        // Release old buffer if exists
        if (indexBuffer) {
          SDL.SDL_ReleaseGPUBuffer(this.#devicePtr, indexBuffer);
        }

        const indices = geometry.indices;

        // Create GPU buffer for indices
        const indexBufferInfo = new SDL_GPUBufferCreateInfo();
        indexBufferInfo.properties.usage =
          SDL_GPUBufferUsageFlags.SDL_GPU_BUFFERUSAGE_INDEX;
        indexBufferInfo.properties.size = indices.byteLength;
        indexBufferInfo.properties.props = 0;

        const createdIndexBuffer = SDL.SDL_CreateGPUBuffer(
          this.#devicePtr,
          indexBufferInfo.bunPointer,
        );
        if (!createdIndexBuffer) {
          console.error(`Failed to create index buffer: ${SDL.SDL_GetError()}`);
          return;
        }
        indexBuffer = createdIndexBuffer;

        // Upload index data using transfer buffer
        const indexTransferInfo = new SDL_GPUTransferBufferCreateInfo();
        indexTransferInfo.properties.usage =
          SDL_GPUTransferBufferUsage.SDL_GPU_TRANSFERBUFFERUSAGE_UPLOAD;
        indexTransferInfo.properties.size = indices.byteLength;
        indexTransferInfo.properties.props = 0n;

        const indexTransferBuffer = SDL.SDL_CreateGPUTransferBuffer(
          this.#devicePtr,
          indexTransferInfo.bunPointer,
        );
        if (!indexTransferBuffer) {
          console.error(
            `Failed to create index transfer buffer: ${SDL.SDL_GetError()}`,
          );
          SDL.SDL_ReleaseGPUBuffer(this.#devicePtr, indexBuffer);
          return;
        }

        // Map transfer buffer and copy index data
        const indexMappedPtr = SDL.SDL_MapGPUTransferBuffer(
          this.#devicePtr,
          indexTransferBuffer,
          false,
        );
        if (!indexMappedPtr) {
          console.error(
            `Failed to map index transfer buffer: ${SDL.SDL_GetError()}`,
          );
          SDL.SDL_ReleaseGPUTransferBuffer(
            this.#devicePtr,
            indexTransferBuffer,
          );
          SDL.SDL_ReleaseGPUBuffer(this.#devicePtr, indexBuffer);
          return;
        }

        // Copy index data to mapped memory using ptr + memcpy
        const indexSourceBytes = new Uint8Array(indices.buffer);
        const indexDestPtr = new Uint8Array(
          pointerToBuffer(indexMappedPtr, indices.byteLength),
        );
        indexDestPtr.set(indexSourceBytes);
        SDL.SDL_UnmapGPUTransferBuffer(this.#devicePtr, indexTransferBuffer);

        // Upload to GPU buffer via copy pass
        const indexCopyPass = SDL.SDL_BeginGPUCopyPass(this.#currentCmd);
        const indexTransferLoc = new SDL_GPUTransferBufferLocation();
        indexTransferLoc.properties.transfer_buffer =
          BigInt(indexTransferBuffer);
        indexTransferLoc.properties.offset = 0;

        const indexBufferRegion = new SDL_GPUBufferRegion();
        indexBufferRegion.properties.buffer = BigInt(indexBuffer);
        indexBufferRegion.properties.offset = 0;
        indexBufferRegion.properties.size = indices.byteLength;

        SDL.SDL_UploadToGPUBuffer(
          indexCopyPass,
          indexTransferLoc.bunPointer,
          indexBufferRegion.bunPointer,
          false,
        );
        SDL.SDL_EndGPUCopyPass(indexCopyPass);

        // Release transfer buffer
        SDL.SDL_ReleaseGPUTransferBuffer(this.#devicePtr, indexTransferBuffer);

        // Cache index buffer
        this.#indexBufferCache.set(geomId, indexBuffer);
      }
    }

    // Bind vertex buffer to render pass
    const vertexBinding = new SDL_GPUBufferBinding();
    vertexBinding.properties.buffer = BigInt(vertexBuffer);
    vertexBinding.properties.offset = 0;

    SDL.SDL_BindGPUVertexBuffers(pass, 0, vertexBinding.bunPointer, 1);

    // Bind index buffer if present
    if (indexBuffer) {
      const indexBinding = new SDL_GPUBufferBinding();
      indexBinding.properties.buffer = BigInt(indexBuffer);
      indexBinding.properties.offset = 0;

      SDL.SDL_BindGPUIndexBuffer(
        pass,
        indexBinding.bunPointer,
        SDL_GPUIndexElementSize.SDL_GPU_INDEXELEMENTSIZE_32BIT,
      );
    }
  }

  #render(): void {
    if (!this.#winPtr || !this.#devicePtr) return;

    this.#currentCmd = SDL.SDL_AcquireGPUCommandBuffer(this.#devicePtr);
    if (!this.#currentCmd) {
      console.warn('SDL_AcquireGPUCommandBuffer failed');
      return;
    }

    const success = SDL.SDL_AcquireGPUSwapchainTexture(
      this.#currentCmd,
      this.#winPtr,
      this.#swapTexPtr,
      this.#swapWidthPtr,
      this.#swapHeightPtr,
    );

    if (
      !success ||
      !this.#swapTexPtr[0] ||
      this.#swapWidthPtr[0] === 0 ||
      this.#swapHeightPtr[0] === 0
    ) {
      SDL.SDL_SubmitGPUCommandBuffer(this.#currentCmd);
      return;
    }

    this.#textureTouch.clear();
    this.#viewportCompositionQueue.clear();
    this.#clearScreen();

    // Render each camera with its visible meshes
    for (const camera of this.#cameraStack) {
      const projectionMatrix = camera.projectionMatrix;
      const viewMatrix = this.#processModelMatrix(camera).invert();
      const frustum = camera.getFrustum(viewMatrix);
      const cameraLayer = this.#processModelLayer(camera);

      // Find viewport for this camera
      let viewport: Viewport | null = null;
      let parent = camera.parent;
      while (parent) {
        if (parent instanceof Viewport) {
          viewport = parent;
          break;
        }
        parent = parent.parent;
      }
      const finalViewport = viewport || this;

      const meshesData = this.#meshStack
        .map((m) => {
          if (!m.geometry) return null;
          const materialHash = m.material ? m.material.hash : 'no-material';
          const modelMatrix = this.#processModelMatrix(m);
          const layer = this.#processModelLayer(m);

          return {
            mesh: m,
            layer,
            materialHash,
            modelMatrix,
          };
        })
        .filter((data) => {
          if (!data) return false;
          if (cameraLayer === 0 || (cameraLayer & data.layer) === 0)
            return false;

          const pos = new Vector3();
          data.modelMatrix.decomposePosition(pos);
          return frustum.intersectsSphere(pos, 10);
        });

      const meshGroups = meshesData.reduce((acc, data) => {
        if (!data) return acc;
        if (!acc.has(data.materialHash)) {
          acc.set(data.materialHash, []);
        }
        acc.get(data.materialHash)!.push([data.modelMatrix, data.mesh]);
        return acc;
      }, new Map<string, [Matrix, Mesh][]>());

      // Begin draw call
      const { texture: viewportTexture, resolveTexture } =
        this.#getViewportTexture(finalViewport);

      const colorTarget = new SDL_GPUColorTargetInfo();
      colorTarget.properties.texture = viewportTexture;
      colorTarget.properties.load_op = SDL_GPULoadOp.SDL_GPU_LOADOP_LOAD;
      colorTarget.properties.store_op = SDL_GPUStoreOp.SDL_GPU_STOREOP_STORE;

      // Set resolve texture if MSAA is enabled
      if (resolveTexture) {
        colorTarget.properties.resolve_texture = resolveTexture;
      }
      const pass = SDL.SDL_BeginGPURenderPass(
        this.#currentCmd,
        colorTarget.bunPointer,
        1,
        null,
      );
      if (!pass) {
        console.warn('SDL_BeginGPURenderPass failed');
        continue;
      }

      for (const [materialHash, meshes] of meshGroups.entries()) {
        for (const [modelMatrix, mesh] of meshes) {
          if (
            !mesh.geometry ||
            !(mesh.material || materialHash === 'no-material')
          )
            continue;
          // TODO: If don't gave material use a fallback material
          if (materialHash === 'no-material') continue;

          const material = mesh.material!;

          const pipeline = this.#getOrCreatePipeline(material);
          if (!pipeline) {
            console.warn(
              `Failed to get pipeline for material ${material.label}`,
            );
            continue;
          }
          SDL.SDL_BindGPUGraphicsPipeline(pass, pipeline);

          this.#setMaterialBindings(pass, material, {
            modelMatrix,
            viewMatrix,
            projectionMatrix,
          });

          this.#bindGeometry(pass, mesh.geometry);

          const indexCount = mesh.geometry.indexCount;
          if (indexCount > 0) {
            SDL.SDL_DrawGPUIndexedPrimitives(pass, indexCount, 1, 0, 0, 0);
          } else {
            const vertexCount = mesh.geometry.vertexCount;
            SDL.SDL_DrawGPUPrimitives(pass, vertexCount, 1, 0, 0);
          }
        }
      }
      SDL.SDL_EndGPURenderPass(pass);
    }

    // Composition: Blit viewport textures to swapchain
    if (this.#viewportCompositionQueue.size > 0) {
      for (const item of this.#viewportCompositionQueue) {
        const blitInfo = new SDL_GPUBlitInfo();

        // Source region (viewport texture)
        const srcRegion = new SDL_GPUBlitRegion();
        srcRegion.properties.texture = BigInt(item.texture);
        srcRegion.properties.x = 0;
        srcRegion.properties.y = 0;
        srcRegion.properties.w = item.width;
        srcRegion.properties.h = item.height;
        srcRegion.properties.mip_level = 0;
        srcRegion.properties.layer_or_depth_plane = 0;

        blitInfo.properties.source = srcRegion;

        // Destination region (swapchain texture)
        const dstRegion = new SDL_GPUBlitRegion();
        dstRegion.properties.texture = this.#swapTexPtr[0]!;
        dstRegion.properties.x = item.x;
        dstRegion.properties.y = item.y;
        dstRegion.properties.w = item.width;
        dstRegion.properties.h = item.height;
        dstRegion.properties.mip_level = 0;
        dstRegion.properties.layer_or_depth_plane = 0;

        blitInfo.properties.destination = dstRegion;

        // Use linear filtering for smooth blits
        blitInfo.properties.filter = SDL_GPUFilter.SDL_GPU_FILTER_LINEAR;
        blitInfo.properties.flip_mode = 0; // No flip
        blitInfo.properties.load_op = SDL_GPULoadOp.SDL_GPU_LOADOP_LOAD;
        blitInfo.properties.clear_color = this.#clearColorStruct;
        blitInfo.properties.cycle = false;
        blitInfo.properties.padding1 = 0;
        blitInfo.properties.padding2 = 0;
        blitInfo.properties.padding3 = 0;

        SDL.SDL_BlitGPUTexture(this.#currentCmd, blitInfo.bunPointer);
      }
    }

    // TODO: Post-processing effects
    // Apply effects like bloom, tone mapping, color grading here

    SDL.SDL_SubmitGPUCommandBuffer(this.#currentCmd);

    const textures = Array.from(this.#textureMap.entries());
    for (const [key, tex] of textures) {
      if (!this.#textureTouch.has(tex)) {
        SDL.SDL_ReleaseGPUTexture(this.#devicePtr, tex);
        this.#textureMap.delete(key);
        this.#textureMetaMap.delete(key);
      }
    }

    this.#currentCmd = null;
    const err = SDL.SDL_GetError().toString();
    if (err) console.error('[SDL ERROR]', err);
  }

  #clearScreen() {
    const colorTarget = new SDL_GPUColorTargetInfo();
    colorTarget.properties.texture = this.#swapTexPtr[0]!;

    if (this.clearColor.isDirty) {
      this.#clearColorStruct.properties.r = this.#clearColor.r;
      this.#clearColorStruct.properties.g = this.#clearColor.g;
      this.#clearColorStruct.properties.b = this.#clearColor.b;
      this.#clearColorStruct.properties.a = this.#clearColor.a;
      this.clearColor.unmarkAsDirty();
    }
    colorTarget.properties.clear_color = this.#clearColorStruct;
    colorTarget.properties.load_op = SDL_GPULoadOp.SDL_GPU_LOADOP_CLEAR;
    colorTarget.properties.store_op = SDL_GPUStoreOp.SDL_GPU_STOREOP_STORE;

    const pass = SDL.SDL_BeginGPURenderPass(
      this.#currentCmd,
      colorTarget.bunPointer,
      1,
      null,
    );
    SDL.SDL_EndGPURenderPass(pass);
  }

  #processModelMatrix(node: Node3D): Matrix {
    const root = node.transform.clone();
    let parent = node.parent;
    while (parent) {
      if (parent === this) break;

      if (parent instanceof Node3D) {
        root.mulR(parent.transform);
      }

      parent = parent.parent;
    }

    return root;
  }

  #processModelLayer(node: Node3D): number {
    let layerFlag = node.layer.get();
    let parent = node.parent;
    while (parent) {
      if (parent === this) break;

      if (parent instanceof Node3D) {
        layerFlag &= parent.layer.get();
      }

      parent = parent.parent;
    }

    return layerFlag >>> 0;
  }

  #getViewportTexture(viewport: Viewport): {
    texture: bigint;
    resolveTexture: bigint | null;
  } {
    // Case 1: Viewport has a target (TextureImage)
    if (viewport.target) {
      const target = viewport.target;
      const targetHash = target.hash;
      const existingMeta = this.#textureMetaMap.get(target.id);

      // Check if we need to recreate the texture
      const needsRecreate =
        !existingMeta ||
        existingMeta.width !== target.width ||
        existingMeta.height !== target.height ||
        existingMeta.hash !== targetHash ||
        existingMeta.sampleCount !== target.sampleCount;

      if (needsRecreate) {
        // Destroy old textures if exist
        const oldTexture = this.#textureMap.get(target.id);
        if (oldTexture) {
          SDL.SDL_ReleaseGPUTexture(this.#devicePtr, oldTexture);
        }

        const oldResolveTexture = this.#resolveTextureMap.get(target.id);
        if (oldResolveTexture) {
          SDL.SDL_ReleaseGPUTexture(this.#devicePtr, oldResolveTexture);
        }

        // Create main texture based on target specifications
        const texInfo = new SDL_GPUTextureCreateInfo();
        texInfo.properties.type = parseTextureType(target);
        texInfo.properties.format = parseTextureFormat(target.format);
        texInfo.properties.usage = parseTextureUsage(target.usage);
        texInfo.properties.width = target.width;
        texInfo.properties.height = target.height;
        texInfo.properties.layer_count_or_depth = target.depth;
        texInfo.properties.num_levels = target.layerCount;
        texInfo.properties.sample_count = parseSampleCount(target.sampleCount);
        texInfo.properties.props = 0n;

        const newTexture = SDL.SDL_CreateGPUTexture(
          this.#devicePtr,
          texInfo.bunPointer,
        );

        if (!newTexture) {
          console.warn(
            `Failed to create GPU texture for target ${target.id}: ${SDL.SDL_GetError()}`,
          );
          return { texture: 0n, resolveTexture: null };
        }

        this.#textureMap.set(target.id, newTexture);
        this.#textureTouch.add(newTexture);

        // Create resolve texture if MSAA is enabled (sampleCount > 1)
        let resolveTexture: Pointer | null = null;

        if (target.sampleCount > 1) {
          const resolveInfo = new SDL_GPUTextureCreateInfo();
          resolveInfo.properties.type = parseTextureType(target);
          resolveInfo.properties.format = parseTextureFormat(target.format);
          resolveInfo.properties.usage = parseTextureUsage(target.usage);
          resolveInfo.properties.width = target.width;
          resolveInfo.properties.height = target.height;
          resolveInfo.properties.layer_count_or_depth = target.depth;
          resolveInfo.properties.num_levels = target.layerCount;
          resolveInfo.properties.sample_count =
            SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1; // Resolve texture always has sampleCount=1
          resolveInfo.properties.props = 0n;

          resolveTexture = SDL.SDL_CreateGPUTexture(
            this.#devicePtr,
            resolveInfo.bunPointer,
          );

          if (!resolveTexture) {
            console.warn(
              `Failed to create resolve texture for target ${target.id}: ${SDL.SDL_GetError()}`,
            );
            // Continue without resolve texture
          } else {
            this.#resolveTextureMap.set(target.id, resolveTexture);
            this.#textureTouch.add(resolveTexture);
          }
        }

        // Update metadata
        this.#textureMetaMap.set(target.id, {
          width: target.width,
          height: target.height,
          hash: targetHash,
          sampleCount: target.sampleCount,
        });

        return {
          texture: BigInt(newTexture),
          resolveTexture: resolveTexture ? BigInt(resolveTexture) : null,
        };
      }

      // Use existing textures
      const tPtr = this.#textureMap.get(target.id)!;
      this.#textureTouch.add(tPtr);

      const rPtr = this.#resolveTextureMap.get(target.id);
      if (rPtr) {
        this.#textureTouch.add(rPtr);
      }

      return {
        texture: BigInt(tPtr),
        resolveTexture: rPtr ? BigInt(rPtr) : null,
      };
    }

    // Case 2: No target - create texture based on viewport dimensions (proportional to swapchain)
    const swapWidth = this.#swapWidthPtr[0]!;
    const swapHeight = this.#swapHeightPtr[0]!;

    // For Window (root viewport), use full swapchain dimensions
    // For child viewports, use proportional dimensions [0..1]
    let texWidth: number;
    let texHeight: number;

    if (viewport === this) {
      // Root window viewport - use full swapchain size
      texWidth = swapWidth;
      texHeight = swapHeight;
    } else {
      // Child viewport - use proportions (assuming width/height are [0..1])
      texWidth = Math.max(1, Math.floor(swapWidth * viewport.width));
      texHeight = Math.max(1, Math.floor(swapHeight * viewport.height));
    }

    const existingMeta = this.#textureMetaMap.get(viewport.id);

    // Check if we need to recreate (swapchain or viewport dimensions changed)
    const needsRecreate =
      !existingMeta ||
      existingMeta.width !== texWidth ||
      existingMeta.height !== texHeight;

    if (needsRecreate) {
      // Destroy old texture if exists
      const oldTexture = this.#textureMap.get(viewport.id);
      if (oldTexture) {
        SDL.SDL_ReleaseGPUTexture(this.#devicePtr, oldTexture);
      }

      // Create new texture
      const texInfo = new SDL_GPUTextureCreateInfo();
      texInfo.properties.type = SDL_GPUTextureType.SDL_GPU_TEXTURETYPE_2D;
      texInfo.properties.format = this.#swapFormat;
      texInfo.properties.usage =
        (SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COLOR_TARGET |
          SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_SAMPLER) >>>
        0;
      texInfo.properties.width = texWidth;
      texInfo.properties.height = texHeight;
      texInfo.properties.layer_count_or_depth = 1;
      texInfo.properties.num_levels = 1;
      texInfo.properties.sample_count =
        SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1;
      texInfo.properties.props = 0n;

      const newTexture = SDL.SDL_CreateGPUTexture(
        this.#devicePtr,
        texInfo.bunPointer,
      );

      if (!newTexture) {
        console.warn(
          `Failed to create GPU texture for viewport ${viewport.id}: ${SDL.SDL_GetError()}`,
        );
        return { texture: 0n, resolveTexture: null };
      }

      this.#textureMap.set(viewport.id, newTexture);
      this.#textureMetaMap.set(viewport.id, {
        width: texWidth,
        height: texHeight,
        hash: '', // No hash for viewport-only textures
        sampleCount: 1,
      });

      this.#textureTouch.add(newTexture);

      // Add to composition queue for final blit to swapchain
      this.#viewportCompositionQueue.add({
        texture: newTexture,
        x: Math.floor(swapWidth * viewport.x),
        y: Math.floor(swapHeight * viewport.y),
        width: texWidth,
        height: texHeight,
      });

      return { texture: BigInt(newTexture), resolveTexture: null };
    }

    const tPtr = this.#textureMap.get(viewport.id)!;
    this.#textureTouch.add(tPtr);

    // Add to composition queue for final blit to swapchain
    this.#viewportCompositionQueue.add({
      texture: tPtr,
      x: Math.floor(swapWidth * viewport.x),
      y: Math.floor(swapHeight * viewport.y),
      width: texWidth,
      height: texHeight,
    });

    return { texture: BigInt(tPtr), resolveTexture: null };
  }

  protected override _getType(): string {
    return 'Window';
  }
}
