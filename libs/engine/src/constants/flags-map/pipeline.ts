import {
  SDL_GPUBlendFactor,
  SDL_GPUBlendOp,
  SDL_GPUCompareOp,
  SDL_GPUCullMode,
  SDL_GPUFillMode,
  SDL_GPUFrontFace,
  SDL_GPUPrimitiveType,
  SDL_GPUStencilOp,
} from '@bunbox/sdl3';
import type { MaterialPrimitive } from '../../elements';
import type {
  BlendFactor,
  BlendOperation,
  CompareFunction,
  RasterizerCullMode,
  RasterizerFillMode,
  RasterizerFrontFace,
  StencilOperation,
} from '../../elements/Rasterizer';

/**
 * Maps material primitive types to SDL GPU primitive types.
 */
export const PRIMITIVE_TYPE_MAP: Record<MaterialPrimitive, number> = {
  triangles: SDL_GPUPrimitiveType.SDL_GPU_PRIMITIVETYPE_TRIANGLELIST,
  lines: SDL_GPUPrimitiveType.SDL_GPU_PRIMITIVETYPE_LINELIST,
  points: SDL_GPUPrimitiveType.SDL_GPU_PRIMITIVETYPE_POINTLIST,
};

/**
 * Maps rasterizer fill modes to SDL GPU fill modes.
 */
export const FILL_MODE_MAP: Record<RasterizerFillMode, number> = {
  fill: SDL_GPUFillMode.SDL_GPU_FILLMODE_FILL,
  line: SDL_GPUFillMode.SDL_GPU_FILLMODE_LINE,
  point: SDL_GPUFillMode.SDL_GPU_FILLMODE_FILL, // Point mode not directly supported in SDL
};

/**
 * Maps rasterizer cull modes to SDL GPU cull modes.
 */
export const CULL_MODE_MAP: Record<RasterizerCullMode, number> = {
  none: SDL_GPUCullMode.SDL_GPU_CULLMODE_NONE,
  front: SDL_GPUCullMode.SDL_GPU_CULLMODE_FRONT,
  back: SDL_GPUCullMode.SDL_GPU_CULLMODE_BACK,
  all: SDL_GPUCullMode.SDL_GPU_CULLMODE_BACK, // 'all' maps to back as fallback
};

/**
 * Maps rasterizer front face orientation to SDL GPU front face.
 */
export const FRONT_FACE_MAP: Record<RasterizerFrontFace, number> = {
  cw: SDL_GPUFrontFace.SDL_GPU_FRONTFACE_CLOCKWISE,
  ccw: SDL_GPUFrontFace.SDL_GPU_FRONTFACE_COUNTER_CLOCKWISE,
};

/**
 * Maps blend factors to SDL GPU blend factors.
 */
export const BLEND_FACTOR_MAP: Record<BlendFactor, number> = {
  zero: SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ZERO,
  one: SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ONE,
  src: SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_SRC_COLOR,
  'one-minus-src': SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ONE_MINUS_SRC_COLOR,
  'src-alpha': SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_SRC_ALPHA,
  'one-minus-src-alpha':
    SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ONE_MINUS_SRC_ALPHA,
  dst: SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_DST_COLOR,
  'one-minus-dst': SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ONE_MINUS_DST_COLOR,
  'dst-alpha': SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_DST_ALPHA,
  'one-minus-dst-alpha':
    SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ONE_MINUS_DST_ALPHA,
  'src-alpha-saturated':
    SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_SRC_ALPHA_SATURATE,
  constant: SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_CONSTANT_COLOR,
  'one-minus-constant':
    SDL_GPUBlendFactor.SDL_GPU_BLENDFACTOR_ONE_MINUS_CONSTANT_COLOR,
};

/**
 * Maps blend operations to SDL GPU blend operations.
 */
export const BLEND_OPERATION_MAP: Record<BlendOperation, number> = {
  add: SDL_GPUBlendOp.SDL_GPU_BLENDOP_ADD,
  subtract: SDL_GPUBlendOp.SDL_GPU_BLENDOP_SUBTRACT,
  'reverse-subtract': SDL_GPUBlendOp.SDL_GPU_BLENDOP_REVERSE_SUBTRACT,
  min: SDL_GPUBlendOp.SDL_GPU_BLENDOP_MIN,
  max: SDL_GPUBlendOp.SDL_GPU_BLENDOP_MAX,
};

/**
 * Maps compare functions to SDL GPU compare operations.
 */
export const COMPARE_FUNCTION_MAP: Record<CompareFunction, number> = {
  never: SDL_GPUCompareOp.SDL_GPU_COMPAREOP_NEVER,
  less: SDL_GPUCompareOp.SDL_GPU_COMPAREOP_LESS,
  equal: SDL_GPUCompareOp.SDL_GPU_COMPAREOP_EQUAL,
  'less-equal': SDL_GPUCompareOp.SDL_GPU_COMPAREOP_LESS_OR_EQUAL,
  greater: SDL_GPUCompareOp.SDL_GPU_COMPAREOP_GREATER,
  'not-equal': SDL_GPUCompareOp.SDL_GPU_COMPAREOP_NOT_EQUAL,
  'greater-equal': SDL_GPUCompareOp.SDL_GPU_COMPAREOP_GREATER_OR_EQUAL,
  always: SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS,
};

/**
 * Maps stencil operations to SDL GPU stencil operations.
 */
export const STENCIL_OPERATION_MAP: Record<StencilOperation, number> = {
  keep: SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP,
  zero: SDL_GPUStencilOp.SDL_GPU_STENCILOP_ZERO,
  replace: SDL_GPUStencilOp.SDL_GPU_STENCILOP_REPLACE,
  invert: SDL_GPUStencilOp.SDL_GPU_STENCILOP_INVERT,
  'increment-clamp': SDL_GPUStencilOp.SDL_GPU_STENCILOP_INCREMENT_AND_CLAMP,
  'decrement-clamp': SDL_GPUStencilOp.SDL_GPU_STENCILOP_DECREMENT_AND_CLAMP,
  'increment-wrap': SDL_GPUStencilOp.SDL_GPU_STENCILOP_INCREMENT_AND_WRAP,
  'decrement-wrap': SDL_GPUStencilOp.SDL_GPU_STENCILOP_DECREMENT_AND_WRAP,
};
