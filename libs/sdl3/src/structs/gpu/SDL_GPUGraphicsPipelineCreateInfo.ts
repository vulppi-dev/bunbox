import { SDL_GPUPrimitiveType } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'
import { SDL_GPUDepthStencilState } from './SDL_GPUDepthStencilState'
import { SDL_GPUGraphicsPipelineTargetInfo } from './SDL_GPUGraphicsPipelineTargetInfo'
import { SDL_GPUMultisampleState } from './SDL_GPUMultisampleState'
import { SDL_GPURasterizerState } from './SDL_GPURasterizerState'
import { SDL_GPUVertexInputState } from './SDL_GPUVertexInputState'

const SDL_GPUGraphicsPipelineCreateInfoSchema = {
  vertex_shader: {
    order: 0,
    type: 'void',
  } /**< The vertex shader used by the graphics pipeline. */,
  fragment_shader: {
    order: 1,
    type: 'void',
  } /**< The fragment shader used by the graphics pipeline. */,
  vertex_input_state: {
    order: 2,
    type: 'struct',
    schema: SDL_GPUVertexInputState,
    isInline: true,
  } /**< The vertex layout of the graphics pipeline. */,
  primitive_type: {
    order: 3,
    type: 'enum',
    enum: SDL_GPUPrimitiveType,
  } /**< The primitive topology of the graphics pipeline. */,
  rasterizer_state: {
    order: 4,
    type: 'struct',
    schema: SDL_GPURasterizerState,
    isInline: true,
  } /**< The rasterizer state of the graphics pipeline. */,
  multisample_state: {
    order: 5,
    type: 'struct',
    schema: SDL_GPUMultisampleState,
    isInline: true,
  } /**< The multisample state of the graphics pipeline. */,
  depth_stencil_state: {
    order: 6,
    type: 'struct',
    schema: SDL_GPUDepthStencilState,
    isInline: true,
  } /**< The depth-stencil state of the graphics pipeline. */,
  target_info: {
    order: 7,
    type: 'struct',
    schema: SDL_GPUGraphicsPipelineTargetInfo,
    isInline: true,
  } /**< Formats and blend modes for the render targets of the graphics pipeline. */,
  props: {
    order: 8,
    type: 'u32',
  } /**< A properties ID for extensions. Should be 0 if no extensions are needed. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUGraphicsPipelineCreateInfo
 */
export class SDL_GPUGraphicsPipelineCreateInfo extends BunStruct<
  typeof SDL_GPUGraphicsPipelineCreateInfoSchema
> {
  constructor() {
    super(SDL_GPUGraphicsPipelineCreateInfoSchema)
  }
}
