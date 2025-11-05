import type { FFIFunction } from 'bun:ffi';

// WGPU Callback Types

/**
 * Callback for log messages.
 *
 * C ref: `typedef void (*WGPULogCallback)(WGPULogLevel level, WGPUStringView message, void * userdata)`
 */
export const wgpuLogCallback = {
  args: ['u32', 'ptr', 'ptr'] as [
    level: 'u32',
    message: 'ptr',
    userdata: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for buffer map operations.
 *
 * C ref: `typedef void (*WGPUBufferMapCallback)(WGPUMapAsyncStatus status, WGPUStringView message, void * userdata1, void * userdata2)`
 */
export const wgpuBufferMapCallback = {
  args: ['u32', 'ptr', 'ptr', 'ptr'] as [
    status: 'u32',
    message: 'ptr',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for compilation info requests.
 *
 * C ref: `typedef void (*WGPUCompilationInfoCallback)(WGPUCompilationInfoRequestStatus status, WGPUCompilationInfo const * compilationInfo, void * userdata1, void * userdata2)`
 */
export const wgpuCompilationInfoCallback = {
  args: ['u32', 'ptr', 'ptr', 'ptr'] as [
    status: 'u32',
    compilationInfo: 'ptr',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for async compute pipeline creation.
 *
 * C ref: `typedef void (*WGPUCreateComputePipelineAsyncCallback)(WGPUCreatePipelineAsyncStatus status, WGPUComputePipeline pipeline, WGPUStringView message, void * userdata1, void * userdata2)`
 */
export const wgpuCreateComputePipelineAsyncCallback = {
  args: ['u32', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    status: 'u32',
    pipeline: 'ptr',
    message: 'ptr',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for async render pipeline creation.
 *
 * C ref: `typedef void (*WGPUCreateRenderPipelineAsyncCallback)(WGPUCreatePipelineAsyncStatus status, WGPURenderPipeline pipeline, WGPUStringView message, void * userdata1, void * userdata2)`
 */
export const wgpuCreateRenderPipelineAsyncCallback = {
  args: ['u32', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    status: 'u32',
    pipeline: 'ptr',
    message: 'ptr',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for device lost events.
 *
 * C ref: `typedef void (*WGPUDeviceLostCallback)(WGPUDevice const * device, WGPUDeviceLostReason reason, WGPUStringView message, void * userdata1, void * userdata2)`
 */
export const wgpuDeviceLostCallback = {
  args: ['ptr', 'u32', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    reason: 'u32',
    message: 'ptr',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for error scope pops.
 *
 * C ref: `typedef void (*WGPUPopErrorScopeCallback)(WGPUPopErrorScopeStatus status, WGPUErrorType type, WGPUStringView message, void * userdata1, void * userdata2)`
 */
export const wgpuPopErrorScopeCallback = {
  args: ['u32', 'u32', 'ptr', 'ptr', 'ptr'] as [
    status: 'u32',
    type: 'u32',
    message: 'ptr',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for queue work done events.
 *
 * C ref: `typedef void (*WGPUQueueWorkDoneCallback)(WGPUQueueWorkDoneStatus status, void * userdata1, void * userdata2)`
 */
export const wgpuQueueWorkDoneCallback = {
  args: ['u32', 'ptr', 'ptr'] as [
    status: 'u32',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for adapter requests.
 *
 * C ref: `typedef void (*WGPURequestAdapterCallback)(WGPURequestAdapterStatus status, WGPUAdapter adapter, WGPUStringView message, void * userdata1, void * userdata2)`
 */
export const wgpuRequestAdapterCallback = {
  args: ['u32', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    status: 'u32',
    adapter: 'ptr',
    message: 'ptr',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for device requests.
 *
 * C ref: `typedef void (*WGPURequestDeviceCallback)(WGPURequestDeviceStatus status, WGPUDevice device, WGPUStringView message, void * userdata1, void * userdata2)`
 */
export const wgpuRequestDeviceCallback = {
  args: ['u32', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    status: 'u32',
    device: 'ptr',
    message: 'ptr',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Callback for uncaptured errors.
 *
 * C ref: `typedef void (*WGPUUncapturedErrorCallback)(WGPUDevice const * device, WGPUErrorType type, WGPUStringView message, void * userdata1, void * userdata2)`
 */
export const wgpuUncapturedErrorCallback = {
  args: ['ptr', 'u32', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    type: 'u32',
    message: 'ptr',
    userdata1: 'ptr',
    userdata2: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;
