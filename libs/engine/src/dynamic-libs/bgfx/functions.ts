import type { FFIFunction } from 'bun:ffi';

// BGFX MARK: Init

/**
 * Fill bgfx::Init struct with default values, before using it to initialize the library.
 *
 * C ref: `void bgfx_init_ctor (bgfx_init_t* _init)`
 */
export const bgfx_init_ctor = {
  args: ['ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Initialize the bgfx library.
 *
 * C ref: `bool bgfx_init (const bgfx_init_t * _init)`
 */
export const bgfx_init = {
  args: ['ptr'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Shutdown bgfx library.
 *
 * C ref: `void bgfx_shutdown (void)`
 */
export const bgfx_shutdown = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset graphic settings and back-buffer size.
 *
 * C ref: `void bgfx_reset (uint32_t _width, uint32_t _height, uint32_t _flags, bgfx_texture_format_t _format)`
 */
export const bgfx_reset = {
  args: ['u32', 'u32', 'u32', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Advance to next frame. When using multithreaded renderer, this call just swaps internal buffers, kicks render thread, and returns.
 *
 * C ref: `uint32_t bgfx_frame (bool _capture)`
 */
export const bgfx_frame = {
  args: ['bool'],
  returns: 'u32',
} as const satisfies FFIFunction;

// BGFX MARK: Renderer

/**
 * Returns current renderer backend API type.
 *
 * C ref: `bgfx_renderer_type_t bgfx_get_renderer_type (void)`
 */
export const bgfx_get_renderer_type = {
  args: [],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Returns renderer capabilities.
 *
 * C ref: `const bgfx_caps_t* bgfx_get_caps (void)`
 */
export const bgfx_get_caps = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns performance counters.
 *
 * C ref: `const bgfx_stats_t* bgfx_get_stats (void)`
 */
export const bgfx_get_stats = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns supported backend API renderers.
 *
 * C ref: `uint8_t bgfx_get_supported_renderers (uint8_t _max, bgfx_renderer_type_t* _enum)`
 */
export const bgfx_get_supported_renderers = {
  args: ['u8', 'ptr'],
  returns: 'u8',
} as const satisfies FFIFunction;

/**
 * Returns name of renderer.
 *
 * C ref: `const char* bgfx_get_renderer_name (bgfx_renderer_type_t _type)`
 */
export const bgfx_get_renderer_name = {
  args: ['u32'],
  returns: 'cstring',
} as const satisfies FFIFunction;

// BGFX MARK: Platform

/**
 * Set platform data.
 *
 * C ref: `void bgfx_set_platform_data (const bgfx_platform_data_t * _data)`
 */
export const bgfx_set_platform_data = {
  args: ['ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Get internal data for interop.
 *
 * C ref: `const bgfx_internal_data_t* bgfx_get_internal_data (void)`
 */
export const bgfx_get_internal_data = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Override internal texture with externally created texture.
 *
 * C ref: `uintptr_t bgfx_override_internal_texture_ptr (bgfx_texture_handle_t _handle, uintptr_t _ptr)`
 */
export const bgfx_override_internal_texture_ptr = {
  args: ['u16', 'u64'],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Override internal texture by creating new texture.
 *
 * C ref: `uintptr_t bgfx_override_internal_texture (bgfx_texture_handle_t _handle, uint16_t _width, uint16_t _height, uint8_t _numMips, bgfx_texture_format_t _format, uint64_t _flags)`
 */
export const bgfx_override_internal_texture = {
  args: ['u16', 'u16', 'u16', 'u8', 'u32', 'u64'],
  returns: 'u64',
} as const satisfies FFIFunction;

// BGFX MARK: Memory

/**
 * Allocate buffer to pass to bgfx calls.
 *
 * C ref: `const bgfx_memory_t* bgfx_alloc (uint32_t _size)`
 */
export const bgfx_alloc = {
  args: ['u32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Allocate buffer and copy data into it.
 *
 * C ref: `const bgfx_memory_t* bgfx_copy (const void* _data, uint32_t _size)`
 */
export const bgfx_copy = {
  args: ['ptr', 'u32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Make reference to data to pass to bgfx.
 *
 * C ref: `const bgfx_memory_t* bgfx_make_ref (const void* _data, uint32_t _size)`
 */
export const bgfx_make_ref = {
  args: ['ptr', 'u32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Make reference to data to pass to bgfx. Release callback will be called when data is no longer needed.
 *
 * C ref: `const bgfx_memory_t* bgfx_make_ref_release (const void* _data, uint32_t _size, bgfx_release_fn_t _releaseFn, void* _userData)`
 */
export const bgfx_make_ref_release = {
  args: ['ptr', 'u32', 'callback', 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

// BGFX MARK: Shader

/**
 * Create shader from memory buffer.
 *
 * C ref: `bgfx_shader_handle_t bgfx_create_shader (const bgfx_memory_t* _mem)`
 */
export const bgfx_create_shader = {
  args: ['ptr'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Returns the number of uniforms and uniform handles used inside a shader.
 *
 * C ref: `uint16_t bgfx_get_shader_uniforms (bgfx_shader_handle_t _handle, bgfx_uniform_handle_t* _uniforms, uint16_t _max)`
 */
export const bgfx_get_shader_uniforms = {
  args: ['u16', 'ptr', 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Destroy shader.
 *
 * C ref: `void bgfx_destroy_shader (bgfx_shader_handle_t _handle)`
 */
export const bgfx_destroy_shader = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Program

/**
 * Create program with vertex and fragment shaders.
 *
 * C ref: `bgfx_program_handle_t bgfx_create_program (bgfx_shader_handle_t _vsh, bgfx_shader_handle_t _fsh, bool _destroyShaders)`
 */
export const bgfx_create_program = {
  args: ['u16', 'u16', 'bool'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create program with compute shader.
 *
 * C ref: `bgfx_program_handle_t bgfx_create_compute_program (bgfx_shader_handle_t _csh, bool _destroyShaders)`
 */
export const bgfx_create_compute_program = {
  args: ['u16', 'bool'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Destroy program.
 *
 * C ref: `void bgfx_destroy_program (bgfx_program_handle_t _handle)`
 */
export const bgfx_destroy_program = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Texture

/**
 * Create texture from memory buffer.
 *
 * C ref: `bgfx_texture_handle_t bgfx_create_texture (const bgfx_memory_t* _mem, uint64_t _flags, uint8_t _skip, bgfx_texture_info_t* _info)`
 */
export const bgfx_create_texture = {
  args: ['ptr', 'u64', 'u8', 'ptr'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create 2D texture.
 *
 * C ref: `bgfx_texture_handle_t bgfx_create_texture_2d (uint16_t _width, uint16_t _height, bool _hasMips, uint16_t _numLayers, bgfx_texture_format_t _format, uint64_t _flags, const bgfx_memory_t* _mem)`
 */
export const bgfx_create_texture_2d = {
  args: ['u16', 'u16', 'bool', 'u16', 'u32', 'u64', 'ptr'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create texture with size based on back-buffer ratio.
 *
 * C ref: `bgfx_texture_handle_t bgfx_create_texture_2d_scaled (bgfx_backbuffer_ratio_t _ratio, bool _hasMips, uint16_t _numLayers, bgfx_texture_format_t _format, uint64_t _flags)`
 */
export const bgfx_create_texture_2d_scaled = {
  args: ['u32', 'bool', 'u16', 'u32', 'u64'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create 3D texture.
 *
 * C ref: `bgfx_texture_handle_t bgfx_create_texture_3d (uint16_t _width, uint16_t _height, uint16_t _depth, bool _hasMips, bgfx_texture_format_t _format, uint64_t _flags, const bgfx_memory_t* _mem)`
 */
export const bgfx_create_texture_3d = {
  args: ['u16', 'u16', 'u16', 'bool', 'u32', 'u64', 'ptr'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create Cube texture.
 *
 * C ref: `bgfx_texture_handle_t bgfx_create_texture_cube (uint16_t _size, bool _hasMips, uint16_t _numLayers, bgfx_texture_format_t _format, uint64_t _flags, const bgfx_memory_t* _mem)`
 */
export const bgfx_create_texture_cube = {
  args: ['u16', 'bool', 'u16', 'u32', 'u64', 'ptr'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Update 2D texture.
 *
 * C ref: `void bgfx_update_texture_2d (bgfx_texture_handle_t _handle, uint16_t _layer, uint8_t _mip, uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height, const bgfx_memory_t* _mem, uint16_t _pitch)`
 */
export const bgfx_update_texture_2d = {
  args: ['u16', 'u16', 'u8', 'u16', 'u16', 'u16', 'u16', 'ptr', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Update 3D texture.
 *
 * C ref: `void bgfx_update_texture_3d (bgfx_texture_handle_t _handle, uint8_t _mip, uint16_t _x, uint16_t _y, uint16_t _z, uint16_t _width, uint16_t _height, uint16_t _depth, const bgfx_memory_t* _mem)`
 */
export const bgfx_update_texture_3d = {
  args: ['u16', 'u8', 'u16', 'u16', 'u16', 'u16', 'u16', 'u16', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Update Cube texture.
 *
 * C ref: `void bgfx_update_texture_cube (bgfx_texture_handle_t _handle, uint16_t _layer, uint8_t _side, uint8_t _mip, uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height, const bgfx_memory_t* _mem, uint16_t _pitch)`
 */
export const bgfx_update_texture_cube = {
  args: ['u16', 'u16', 'u8', 'u8', 'u16', 'u16', 'u16', 'u16', 'ptr', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Read back texture content.
 *
 * C ref: `uint32_t bgfx_read_texture (bgfx_texture_handle_t _handle, void* _data, uint8_t _mip)`
 */
export const bgfx_read_texture = {
  args: ['u16', 'ptr', 'u8'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Destroy texture.
 *
 * C ref: `void bgfx_destroy_texture (bgfx_texture_handle_t _handle)`
 */
export const bgfx_destroy_texture = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Calculate amount of memory required for texture.
 *
 * C ref: `void bgfx_calc_texture_size (bgfx_texture_info_t* _info, uint16_t _width, uint16_t _height, uint16_t _depth, bool _cubeMap, bool _hasMips, uint16_t _numLayers, bgfx_texture_format_t _format)`
 */
export const bgfx_calc_texture_size = {
  args: ['ptr', 'u16', 'u16', 'u16', 'bool', 'bool', 'u16', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Frame Buffer

/**
 * Create frame buffer (simple).
 *
 * C ref: `bgfx_frame_buffer_handle_t bgfx_create_frame_buffer (uint16_t _width, uint16_t _height, bgfx_texture_format_t _format, uint64_t _textureFlags)`
 */
export const bgfx_create_frame_buffer = {
  args: ['u16', 'u16', 'u32', 'u64'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create frame buffer with size based on back-buffer ratio.
 *
 * C ref: `bgfx_frame_buffer_handle_t bgfx_create_frame_buffer_scaled (bgfx_backbuffer_ratio_t _ratio, bgfx_texture_format_t _format, uint64_t _textureFlags)`
 */
export const bgfx_create_frame_buffer_scaled = {
  args: ['u32', 'u32', 'u64'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create MRT frame buffer from texture handles (color attachments).
 *
 * C ref: `bgfx_frame_buffer_handle_t bgfx_create_frame_buffer_from_handles (uint8_t _num, const bgfx_texture_handle_t* _handles, bool _destroyTextures)`
 */
export const bgfx_create_frame_buffer_from_handles = {
  args: ['u8', 'ptr', 'bool'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create MRT frame buffer from texture handles with specific layer and mip level.
 *
 * C ref: `bgfx_frame_buffer_handle_t bgfx_create_frame_buffer_from_attachment (uint8_t _num, const bgfx_attachment_t* _attachment, bool _destroyTextures)`
 */
export const bgfx_create_frame_buffer_from_attachment = {
  args: ['u8', 'ptr', 'bool'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create frame buffer for multiple window rendering.
 *
 * C ref: `bgfx_frame_buffer_handle_t bgfx_create_frame_buffer_from_nwh (void* _nwh, uint16_t _width, uint16_t _height, bgfx_texture_format_t _format, bgfx_texture_format_t _depthFormat)`
 */
export const bgfx_create_frame_buffer_from_nwh = {
  args: ['ptr', 'u16', 'u16', 'u32', 'u32'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Set frame buffer debug name.
 *
 * C ref: `void bgfx_set_frame_buffer_name (bgfx_frame_buffer_handle_t _handle, const char* _name, int32_t _len)`
 */
export const bgfx_set_frame_buffer_name = {
  args: ['u16', 'cstring', 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Obtain texture handle of frame buffer attachment.
 *
 * C ref: `bgfx_texture_handle_t bgfx_get_texture (bgfx_frame_buffer_handle_t _handle, uint8_t _attachment)`
 */
export const bgfx_get_texture = {
  args: ['u16', 'u8'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Destroy frame buffer.
 *
 * C ref: `void bgfx_destroy_frame_buffer (bgfx_frame_buffer_handle_t _handle)`
 */
export const bgfx_destroy_frame_buffer = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Uniform

/**
 * Create shader uniform parameter.
 *
 * C ref: `bgfx_uniform_handle_t bgfx_create_uniform (const char* _name, bgfx_uniform_type_t _type, uint16_t _num)`
 */
export const bgfx_create_uniform = {
  args: ['cstring', 'u32', 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Retrieve uniform info.
 *
 * C ref: `void bgfx_get_uniform_info (bgfx_uniform_handle_t _handle, bgfx_uniform_info_t* _info)`
 */
export const bgfx_get_uniform_info = {
  args: ['u16', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy shader uniform parameter.
 *
 * C ref: `void bgfx_destroy_uniform (bgfx_uniform_handle_t _handle)`
 */
export const bgfx_destroy_uniform = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Vertex Buffer

/**
 * Create vertex layout.
 *
 * C ref: `bgfx_vertex_layout_handle_t bgfx_create_vertex_layout (const bgfx_vertex_layout_t* _layout)`
 */
export const bgfx_create_vertex_layout = {
  args: ['ptr'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Destroy vertex layout.
 *
 * C ref: `void bgfx_destroy_vertex_layout (bgfx_vertex_layout_handle_t _layoutHandle)`
 */
export const bgfx_destroy_vertex_layout = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create static vertex buffer.
 *
 * C ref: `bgfx_vertex_buffer_handle_t bgfx_create_vertex_buffer (const bgfx_memory_t* _mem, const bgfx_vertex_layout_t* _layout, uint16_t _flags)`
 */
export const bgfx_create_vertex_buffer = {
  args: ['ptr', 'ptr', 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Set vertex buffer debug name.
 *
 * C ref: `void bgfx_set_vertex_buffer_name (bgfx_vertex_buffer_handle_t _handle, const char* _name, int32_t _len)`
 */
export const bgfx_set_vertex_buffer_name = {
  args: ['u16', 'cstring', 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy static vertex buffer.
 *
 * C ref: `void bgfx_destroy_vertex_buffer (bgfx_vertex_buffer_handle_t _handle)`
 */
export const bgfx_destroy_vertex_buffer = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create empty dynamic vertex buffer.
 *
 * C ref: `bgfx_dynamic_vertex_buffer_handle_t bgfx_create_dynamic_vertex_buffer (uint32_t _num, const bgfx_vertex_layout_t* _layout, uint16_t _flags)`
 */
export const bgfx_create_dynamic_vertex_buffer = {
  args: ['u32', 'ptr', 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create dynamic vertex buffer and initialize it.
 *
 * C ref: `bgfx_dynamic_vertex_buffer_handle_t bgfx_create_dynamic_vertex_buffer_mem (const bgfx_memory_t* _mem, const bgfx_vertex_layout_t* _layout, uint16_t _flags)`
 */
export const bgfx_create_dynamic_vertex_buffer_mem = {
  args: ['ptr', 'ptr', 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Update dynamic vertex buffer.
 *
 * C ref: `void bgfx_update_dynamic_vertex_buffer (bgfx_dynamic_vertex_buffer_handle_t _handle, uint32_t _startVertex, const bgfx_memory_t* _mem)`
 */
export const bgfx_update_dynamic_vertex_buffer = {
  args: ['u16', 'u32', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy dynamic vertex buffer.
 *
 * C ref: `void bgfx_destroy_dynamic_vertex_buffer (bgfx_dynamic_vertex_buffer_handle_t _handle)`
 */
export const bgfx_destroy_dynamic_vertex_buffer = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Index Buffer

/**
 * Create static index buffer.
 *
 * C ref: `bgfx_index_buffer_handle_t bgfx_create_index_buffer (const bgfx_memory_t* _mem, uint16_t _flags)`
 */
export const bgfx_create_index_buffer = {
  args: ['ptr', 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Set index buffer debug name.
 *
 * C ref: `void bgfx_set_index_buffer_name (bgfx_index_buffer_handle_t _handle, const char* _name, int32_t _len)`
 */
export const bgfx_set_index_buffer_name = {
  args: ['u16', 'cstring', 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy static index buffer.
 *
 * C ref: `void bgfx_destroy_index_buffer (bgfx_index_buffer_handle_t _handle)`
 */
export const bgfx_destroy_index_buffer = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create empty dynamic index buffer.
 *
 * C ref: `bgfx_dynamic_index_buffer_handle_t bgfx_create_dynamic_index_buffer (uint32_t _num, uint16_t _flags)`
 */
export const bgfx_create_dynamic_index_buffer = {
  args: ['u32', 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create dynamic index buffer and initialize it.
 *
 * C ref: `bgfx_dynamic_index_buffer_handle_t bgfx_create_dynamic_index_buffer_mem (const bgfx_memory_t* _mem, uint16_t _flags)`
 */
export const bgfx_create_dynamic_index_buffer_mem = {
  args: ['ptr', 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Update dynamic index buffer.
 *
 * C ref: `void bgfx_update_dynamic_index_buffer (bgfx_dynamic_index_buffer_handle_t _handle, uint32_t _startIndex, const bgfx_memory_t* _mem)`
 */
export const bgfx_update_dynamic_index_buffer = {
  args: ['u16', 'u32', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy dynamic index buffer.
 *
 * C ref: `void bgfx_destroy_dynamic_index_buffer (bgfx_dynamic_index_buffer_handle_t _handle)`
 */
export const bgfx_destroy_dynamic_index_buffer = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Transient Buffers

/**
 * Allocate transient index buffer.
 *
 * C ref: `bool bgfx_alloc_transient_index_buffer (bgfx_transient_index_buffer_t* _tib, uint32_t _num, bool _index32)`
 */
export const bgfx_alloc_transient_index_buffer = {
  args: ['ptr', 'u32', 'bool'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Allocate transient vertex buffer.
 *
 * C ref: `bool bgfx_alloc_transient_vertex_buffer (bgfx_transient_vertex_buffer_t* _tvb, uint32_t _num, const bgfx_vertex_layout_t* _layout)`
 */
export const bgfx_alloc_transient_vertex_buffer = {
  args: ['ptr', 'u32', 'ptr'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Check for required space and allocate transient vertex and index buffers.
 *
 * C ref: `bool bgfx_alloc_transient_buffers (bgfx_transient_vertex_buffer_t* _tvb, const bgfx_vertex_layout_t* _layout, uint32_t _numVertices, bgfx_transient_index_buffer_t* _tib, uint32_t _numIndices, bool _index32)`
 */
export const bgfx_alloc_transient_buffers = {
  args: ['ptr', 'ptr', 'u32', 'ptr', 'u32', 'bool'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Check is requested amount of transient index buffer can be allocated.
 *
 * C ref: `bool bgfx_check_avail_transient_index_buffer (uint32_t _num, bool _index32)`
 */
export const bgfx_check_avail_transient_index_buffer = {
  args: ['u32', 'bool'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Check is requested amount of transient vertex buffer can be allocated.
 *
 * C ref: `bool bgfx_check_avail_transient_vertex_buffer (uint32_t _num, const bgfx_vertex_layout_t* _layout)`
 */
export const bgfx_check_avail_transient_vertex_buffer = {
  args: ['u32', 'ptr'],
  returns: 'bool',
} as const satisfies FFIFunction;

// BGFX MARK: Vertex Layout

/**
 * Start vertex layout.
 *
 * C ref: `bgfx_vertex_layout_t* bgfx_vertex_layout_begin (bgfx_vertex_layout_t* _this, bgfx_renderer_type_t _rendererType)`
 */
export const bgfx_vertex_layout_begin = {
  args: ['ptr', 'u32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Add attribute to vertex layout.
 *
 * C ref: `bgfx_vertex_layout_t* bgfx_vertex_layout_add (bgfx_vertex_layout_t* _this, bgfx_attrib_t _attrib, uint8_t _num, bgfx_attrib_type_t _type, bool _normalized, bool _asInt)`
 */
export const bgfx_vertex_layout_add = {
  args: ['ptr', 'u32', 'u8', 'u32', 'bool', 'bool'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Skip bytes in vertex stream.
 *
 * C ref: `bgfx_vertex_layout_t* bgfx_vertex_layout_skip (bgfx_vertex_layout_t* _this, uint8_t _num)`
 */
export const bgfx_vertex_layout_skip = {
  args: ['ptr', 'u8'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * End vertex layout.
 *
 * C ref: `void bgfx_vertex_layout_end (bgfx_vertex_layout_t* _this)`
 */
export const bgfx_vertex_layout_end = {
  args: ['ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: View

/**
 * Set view name.
 *
 * C ref: `void bgfx_set_view_name (bgfx_view_id_t _id, const char* _name, int32_t _len)`
 */
export const bgfx_set_view_name = {
  args: ['u16', 'cstring', 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view rectangle.
 *
 * C ref: `void bgfx_set_view_rect (bgfx_view_id_t _id, uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height)`
 */
export const bgfx_set_view_rect = {
  args: ['u16', 'u16', 'u16', 'u16', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view scissor.
 *
 * C ref: `void bgfx_set_view_scissor (bgfx_view_id_t _id, uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height)`
 */
export const bgfx_set_view_scissor = {
  args: ['u16', 'u16', 'u16', 'u16', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view clear flags.
 *
 * C ref: `void bgfx_set_view_clear (bgfx_view_id_t _id, uint16_t _flags, uint32_t _rgba, float _depth, uint8_t _stencil)`
 */
export const bgfx_set_view_clear = {
  args: ['u16', 'u16', 'u32', 'f32', 'u8'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view clear flags with different clear color for each frame buffer texture.
 *
 * C ref: `void bgfx_set_view_clear_mrt (bgfx_view_id_t _id, uint16_t _flags, float _depth, uint8_t _stencil, uint8_t _c0, uint8_t _c1, uint8_t _c2, uint8_t _c3, uint8_t _c4, uint8_t _c5, uint8_t _c6, uint8_t _c7)`
 */
export const bgfx_set_view_clear_mrt = {
  args: [
    'u16',
    'u16',
    'f32',
    'u8',
    'u8',
    'u8',
    'u8',
    'u8',
    'u8',
    'u8',
    'u8',
    'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view sorting mode.
 *
 * C ref: `void bgfx_set_view_mode (bgfx_view_id_t _id, bgfx_view_mode_t _mode)`
 */
export const bgfx_set_view_mode = {
  args: ['u16', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view frame buffer.
 *
 * C ref: `void bgfx_set_view_frame_buffer (bgfx_view_id_t _id, bgfx_frame_buffer_handle_t _handle)`
 */
export const bgfx_set_view_frame_buffer = {
  args: ['u16', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view view and projection matrices, all draw primitives in this view will use these matrices.
 *
 * C ref: `void bgfx_set_view_transform (bgfx_view_id_t _id, const void* _view, const void* _proj)`
 */
export const bgfx_set_view_transform = {
  args: ['u16', 'ptr', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset all view settings to default.
 *
 * C ref: `void bgfx_reset_view (bgfx_view_id_t _id)`
 */
export const bgfx_reset_view = {
  args: ['u16'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Encoder

/**
 * Begin submitting draw calls from thread.
 *
 * C ref: `bgfx_encoder_t* bgfx_begin (bool _forThread)`
 */
export const bgfx_begin = {
  args: ['bool'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * End submitting draw calls from thread.
 *
 * C ref: `void bgfx_end (bgfx_encoder_t* _encoder)`
 */
export const bgfx_end = {
  args: ['ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Draw

/**
 * Set render states for draw primitive.
 *
 * C ref: `void bgfx_set_state (uint64_t _state, uint32_t _rgba)`
 */
export const bgfx_set_state = {
  args: ['u64', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set stencil test state.
 *
 * C ref: `void bgfx_set_stencil (uint32_t _fstencil, uint32_t _bstencil)`
 */
export const bgfx_set_stencil = {
  args: ['u32', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set scissor for draw primitive.
 *
 * C ref: `uint16_t bgfx_set_scissor (uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height)`
 */
export const bgfx_set_scissor = {
  args: ['u16', 'u16', 'u16', 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Set model matrix for draw primitive. If it is not called, model will be rendered with identity model matrix.
 *
 * C ref: `uint32_t bgfx_set_transform (const void* _mtx, uint16_t _num)`
 */
export const bgfx_set_transform = {
  args: ['ptr', 'u16'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Set model matrix from matrix cache for draw primitive.
 *
 * C ref: `void bgfx_set_transform_cached (uint32_t _cache, uint16_t _num)`
 */
export const bgfx_set_transform_cached = {
  args: ['u32', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reserve matrices in internal matrix cache.
 *
 * C ref: `uint32_t bgfx_alloc_transform (bgfx_transform_t* _transform, uint16_t _num)`
 */
export const bgfx_alloc_transform = {
  args: ['ptr', 'u16'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Set shader uniform parameter for draw primitive.
 *
 * C ref: `void bgfx_set_uniform (bgfx_uniform_handle_t _handle, const void* _value, uint16_t _num)`
 */
export const bgfx_set_uniform = {
  args: ['u16', 'ptr', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set index buffer for draw primitive.
 *
 * C ref: `void bgfx_set_index_buffer (bgfx_index_buffer_handle_t _handle, uint32_t _firstIndex, uint32_t _numIndices)`
 */
export const bgfx_set_index_buffer = {
  args: ['u16', 'u32', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set index buffer for draw primitive.
 *
 * C ref: `void bgfx_set_dynamic_index_buffer (bgfx_dynamic_index_buffer_handle_t _handle, uint32_t _firstIndex, uint32_t _numIndices)`
 */
export const bgfx_set_dynamic_index_buffer = {
  args: ['u16', 'u32', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set index buffer for draw primitive.
 *
 * C ref: `void bgfx_set_transient_index_buffer (const bgfx_transient_index_buffer_t* _tib, uint32_t _firstIndex, uint32_t _numIndices)`
 */
export const bgfx_set_transient_index_buffer = {
  args: ['ptr', 'u32', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set vertex buffer for draw primitive.
 *
 * C ref: `void bgfx_set_vertex_buffer (uint8_t _stream, bgfx_vertex_buffer_handle_t _handle, uint32_t _startVertex, uint32_t _numVertices, bgfx_vertex_layout_handle_t _layoutHandle)`
 */
export const bgfx_set_vertex_buffer = {
  args: ['u8', 'u16', 'u32', 'u32', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set vertex buffer for draw primitive.
 *
 * C ref: `void bgfx_set_dynamic_vertex_buffer (uint8_t _stream, bgfx_dynamic_vertex_buffer_handle_t _handle, uint32_t _startVertex, uint32_t _numVertices, bgfx_vertex_layout_handle_t _layoutHandle)`
 */
export const bgfx_set_dynamic_vertex_buffer = {
  args: ['u8', 'u16', 'u32', 'u32', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set vertex buffer for draw primitive.
 *
 * C ref: `void bgfx_set_transient_vertex_buffer (uint8_t _stream, const bgfx_transient_vertex_buffer_t* _tvb, uint32_t _startVertex, uint32_t _numVertices, bgfx_vertex_layout_handle_t _layoutHandle)`
 */
export const bgfx_set_transient_vertex_buffer = {
  args: ['u8', 'ptr', 'u32', 'u32', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set number of vertices for auto generated vertices use in conjunction with gl_VertexID.
 *
 * C ref: `void bgfx_set_vertex_count (uint32_t _numVertices)`
 */
export const bgfx_set_vertex_count = {
  args: ['u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set instance data buffer for draw primitive.
 *
 * C ref: `void bgfx_set_instance_data_buffer (const bgfx_instance_data_buffer_t* _idb, uint32_t _start, uint32_t _num)`
 */
export const bgfx_set_instance_data_buffer = {
  args: ['ptr', 'u32', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set texture stage for draw primitive.
 *
 * C ref: `void bgfx_set_texture (uint8_t _stage, bgfx_uniform_handle_t _sampler, bgfx_texture_handle_t _handle, uint32_t _flags)`
 */
export const bgfx_set_texture = {
  args: ['u8', 'u16', 'u16', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive for rendering.
 *
 * C ref: `void bgfx_submit (bgfx_view_id_t _id, bgfx_program_handle_t _program, uint32_t _depth, uint8_t _flags)`
 */
export const bgfx_submit = {
  args: ['u16', 'u16', 'u32', 'u8'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive with occlusion query for rendering.
 *
 * C ref: `void bgfx_submit_occlusion_query (bgfx_view_id_t _id, bgfx_program_handle_t _program, bgfx_occlusion_query_handle_t _occlusionQuery, uint32_t _depth, uint8_t _flags)`
 */
export const bgfx_submit_occlusion_query = {
  args: ['u16', 'u16', 'u16', 'u32', 'u8'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive for rendering with index and instance data info from indirect buffer.
 *
 * C ref: `void bgfx_submit_indirect (bgfx_view_id_t _id, bgfx_program_handle_t _program, bgfx_indirect_buffer_handle_t _indirectHandle, uint32_t _start, uint32_t _num, uint32_t _depth, uint8_t _flags)`
 */
export const bgfx_submit_indirect = {
  args: ['u16', 'u16', 'u16', 'u32', 'u32', 'u32', 'u8'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive for rendering with index and instance data info and draw count from indirect buffers.
 *
 * C ref: `void bgfx_submit_indirect_count (bgfx_view_id_t _id, bgfx_program_handle_t _program, bgfx_indirect_buffer_handle_t _indirectHandle, uint32_t _start, bgfx_index_buffer_handle_t _numHandle, uint32_t _numIndex, uint32_t _numMax, uint32_t _depth, uint8_t _flags)`
 */
export const bgfx_submit_indirect_count = {
  args: ['u16', 'u16', 'u16', 'u32', 'u16', 'u32', 'u32', 'u32', 'u8'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Discard previously set state for draw or compute call.
 *
 * C ref: `void bgfx_discard (uint8_t _flags)`
 */
export const bgfx_discard = {
  args: ['u8'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatch compute.
 *
 * C ref: `void bgfx_dispatch (bgfx_view_id_t _id, bgfx_program_handle_t _program, uint32_t _numX, uint32_t _numY, uint32_t _numZ, uint8_t _flags)`
 */
export const bgfx_dispatch = {
  args: ['u16', 'u16', 'u32', 'u32', 'u32', 'u8'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatch compute indirect.
 *
 * C ref: `void bgfx_dispatch_indirect (bgfx_view_id_t _id, bgfx_program_handle_t _program, bgfx_indirect_buffer_handle_t _indirectHandle, uint32_t _start, uint32_t _num, uint8_t _flags)`
 */
export const bgfx_dispatch_indirect = {
  args: ['u16', 'u16', 'u16', 'u32', 'u32', 'u8'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Blit

/**
 * Blit texture region between two textures.
 *
 * C ref: `void bgfx_blit (bgfx_view_id_t _id, bgfx_texture_handle_t _dst, uint16_t _dstX, uint16_t _dstY, bgfx_texture_handle_t _src, uint16_t _srcX, uint16_t _srcY, uint16_t _width, uint16_t _height)`
 */
export const bgfx_blit = {
  args: ['u16', 'u16', 'u16', 'u16', 'u16', 'u16', 'u16', 'u16', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;
