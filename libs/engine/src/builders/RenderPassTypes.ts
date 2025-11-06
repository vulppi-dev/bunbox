/**
 * Agnostic types for RenderPass configuration
 * These types use string literals that can be mapped to any graphics backend
 */

/**
 * Image format types
 * Supports common formats across graphics APIs
 */
export type Format =
  // Special token for swapchain format
  | 'swapchain'
  // 8-bit normalized formats
  | 'r8-unorm'
  | 'r8g8-unorm'
  | 'r8g8b8-unorm'
  | 'r8g8b8a8-unorm'
  | 'b8g8r8a8-unorm'
  | 'r8-snorm'
  | 'r8g8-snorm'
  | 'r8g8b8a8-snorm'
  // 16-bit formats
  | 'r16-unorm'
  | 'r16-sfloat'
  | 'r16g16-unorm'
  | 'r16g16-sfloat'
  | 'r16g16b16a16-unorm'
  | 'r16g16b16a16-sfloat'
  // 32-bit formats
  | 'r32-uint'
  | 'r32-sint'
  | 'r32-sfloat'
  | 'r32g32-sfloat'
  | 'r32g32b32-sfloat'
  | 'r32g32b32a32-sfloat'
  // Depth formats
  | 'd16-unorm'
  | 'd32-sfloat'
  // Depth-stencil formats
  | 'd16-unorm-s8-uint'
  | 'd24-unorm-s8-uint'
  | 'd32-sfloat-s8-uint'
  // sRGB formats
  | 'r8g8b8a8-srgb'
  | 'b8g8r8a8-srgb';

/**
 * Sample count for multisampling (MSAA)
 */
export type SampleCount = 1 | 2 | 4 | 8 | 16 | 32 | 64;

/**
 * Load operation at the start of a render pass
 */
export type LoadOp =
  | 'load' // Load existing contents
  | 'clear' // Clear to a specified value
  | 'dont-care'; // Don't care about existing contents

/**
 * Store operation at the end of a render pass
 */
export type StoreOp =
  | 'store' // Store results to memory
  | 'dont-care'; // Don't care about storing results

/**
 * Image layout describing how image data is organized
 */
export type ImageLayout =
  | 'undefined' // Initial state, contents undefined
  | 'general' // General-purpose layout
  | 'color-attachment' // Optimal for color attachment
  | 'depth-stencil-attachment' // Optimal for depth/stencil attachment
  | 'depth-stencil-read-only' // Read-only depth/stencil
  | 'shader-read-only' // Read-only in shaders
  | 'transfer-src' // Source of transfer operation
  | 'transfer-dst' // Destination of transfer operation
  | 'present-src' // Presentable to display
  | 'depth-read-only-stencil-attachment' // Depth read-only, stencil writable
  | 'depth-attachment-stencil-read-only'; // Depth writable, stencil read-only

/**
 * Pipeline stage flags
 */
export type PipelineStage =
  | 'top-of-pipe' // Before any work
  | 'draw-indirect' // Indirect draw command processing
  | 'vertex-input' // Vertex input assembly
  | 'vertex-shader' // Vertex shader execution
  | 'tessellation-control-shader' // Tessellation control shader
  | 'tessellation-evaluation-shader' // Tessellation evaluation shader
  | 'geometry-shader' // Geometry shader execution
  | 'fragment-shader' // Fragment shader execution
  | 'early-fragment-tests' // Early depth/stencil tests
  | 'late-fragment-tests' // Late depth/stencil tests
  | 'color-attachment-output' // Color attachment writes
  | 'compute-shader' // Compute shader execution
  | 'transfer' // Transfer operations
  | 'bottom-of-pipe' // After all work
  | 'all-graphics' // All graphics pipeline stages
  | 'all-commands'; // All command types

/**
 * Memory access type flags
 */
export type AccessFlag =
  | 'none' // No access
  | 'indirect-command-read' // Read indirect command data
  | 'index-read' // Read index buffer
  | 'vertex-attribute-read' // Read vertex attributes
  | 'uniform-read' // Read uniform data
  | 'input-attachment-read' // Read input attachment
  | 'shader-read' // Read in shader
  | 'shader-write' // Write in shader
  | 'color-attachment-read' // Read color attachment
  | 'color-attachment-write' // Write color attachment
  | 'depth-stencil-attachment-read' // Read depth/stencil attachment
  | 'depth-stencil-attachment-write' // Write depth/stencil attachment
  | 'transfer-read' // Read in transfer operation
  | 'transfer-write' // Write in transfer operation
  | 'host-read' // Read by host
  | 'host-write' // Write by host
  | 'memory-read' // Generic memory read
  | 'memory-write'; // Generic memory write

/**
 * Dependency flags for subpass dependencies
 */
export type DependencyFlag =
  | 'by-region' // Dependency is per-region
  | 'view-local' // Dependency is per-view (multiview)
  | 'device-group'; // Dependency across device group

/**
 * Pipeline bind point
 */
export type PipelineBindPoint = 'graphics' | 'compute';

/**
 * Helper type for stage mask (single or array)
 */
export type StageMask = PipelineStage | PipelineStage[];

/**
 * Helper type for access mask (single or array)
 */
export type AccessMask = AccessFlag | AccessFlag[];

/**
 * Utility to check if a format is a depth format
 */
export function isDepthFormat(format: Format): boolean {
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
export function hasStencilComponent(format: Format): boolean {
  return (
    format === 'd16-unorm-s8-uint' ||
    format === 'd24-unorm-s8-uint' ||
    format === 'd32-sfloat-s8-uint'
  );
}

/**
 * Utility to check if a format is a color format
 */
export function isColorFormat(format: Format): boolean {
  return !isDepthFormat(format) && format !== 'swapchain';
}
