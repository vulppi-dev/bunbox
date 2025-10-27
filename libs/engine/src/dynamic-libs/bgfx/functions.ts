import type { FFIFunction } from 'bun:ffi';

// BGFX MARK: General

/**
 * Initialize the bgfx library.
 *
 * C ref: `bool bgfx::init (const bgfx_init_t * _init)`
 */
export const bgfx_init = {
  args: ['ptr'] as [init: 'ptr'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Fill bgfx::Init struct with default values, before using it to initialize the library.
 *
 * C ref: `bool bgfx::initCtor (const bgfx_init_t * _init)`
 */
export const bgfx_init_ctor = {
  args: ['ptr'] as [init: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Shutdown bgfx library.
 *
 * C ref: `void bgfx::shutdown (void)`
 */
export const bgfx_shutdown = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset graphic settings and back-buffer size.
 *
 * C ref: `void bgfx::reset(uint32_t _width, uint32_t _height, uint32_t _flags = BGFX_RESET_NONE, TextureFormat::Enum _format = TextureFormat::Count)`
 */
export const bgfx_reset = {
  args: ['u32', 'u32', 'u32', 'u32'] as [
    width: 'u32',
    height: 'u32',
    flags: 'u32',
    format: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Advance to next frame. When using multithreaded renderer, this call just swaps internal buffers, kicks render thread, and returns.
 *
 * C ref: `uint32_t bgfx::frame (bool _capture)`
 */
export const bgfx_frame = {
  args: ['bool'] as [capture: 'bool'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Set debug flags.
 *
 * C ref: `void bgfx::setDebug(uint32_t _debug)`
 */
export const bgfx_set_debug = {
  args: ['u32'] as [debug: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Clear internal debug text buffer.
 *
 * C ref: `void bgfx::dbgTextClear(uint8_t _attr = 0, bool _small = false)`
 */
export const bgfx_dbg_text_clear = {
  args: ['u8', 'bool'] as [attr: 'u8', small: 'bool'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Print into internal debug text character-buffer (VGA-compatible text mode).
 *
 * C ref: `void bgfx::dbgTextPrintf(uint16_t _x, uint16_t _y, uint8_t _attr, const char* _format, ...)`
 */
export const bgfx_dbg_text_printf = {
  args: ['u16', 'u16', 'u8', 'cstring'] as [
    x: 'u16',
    y: 'u16',
    attr: 'u8',
    format: 'cstring',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Print into internal debug text character-buffer (VGA-compatible text mode).
 *
 * C ref: `void bgfx::dbgTextPrintfVargs(uint16_t _x, uint16_t _y, uint8_t _attr, const char *_format, va_list _argList)`
 */
export const bgfx_dbg_text_vprintf = {
  args: ['u16', 'u16', 'u8', 'cstring', 'ptr'] as [
    x: 'u16',
    y: 'u16',
    attr: 'u8',
    format: 'cstring',
    argList: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draw image into internal debug text buffer.
 *
 * C ref: `void bgfx::dbgTextImage(uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height, const void *_data, uint16_t _pitch)`
 */
export const bgfx_dbg_text_image = {
  args: ['u16', 'u16', 'u16', 'u16', 'ptr', 'u16'] as [
    x: 'u16',
    y: 'u16',
    width: 'u16',
    height: 'u16',
    data: 'ptr',
    pitch: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns supported backend API renderers.
 *
 * C ref: `uint8_t bgfx::getSupportedRenderers(uint8_t _max = 0, RendererType::Enum *_enum = NULL)`
 */
export const bgfx_get_supported_renderers = {
  args: ['u8', 'ptr'] as [max: 'u8', enumPtr: 'ptr'],
  returns: 'u8',
} as const satisfies FFIFunction;

/**
 * Returns current renderer backend API type.
 *
 * C ref: `RendererType::Enum bgfx::getRendererType()`
 */
export const bgfx_get_renderer_type = {
  args: [],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Returns renderer capabilities.
 *
 * C ref: `const Caps* bgfx::getCaps()`
 */
export const bgfx_get_caps = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns performance counters.
 *
 * C ref: `const Stats *bgfx::getStats()`
 */
export const bgfx_get_stats = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Render frame.
 *
 * C ref: `RenderFrame::Enum bgfx::renderFrame(int32_t _msecs = -1)`
 */
export const bgfx_render_frame = {
  args: ['i32'] as [msecs: 'i32'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Set platform data.
 *
 * C ref: `void bgfx::setPlatformData(const PlatformData &_data)`
 */
export const bgfx_set_platform_data = {
  args: ['ptr'] as [data: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Get internal data for interop.
 *
 * C ref: `const InternalData *bgfx::getInternalData()`
 */
export const bgfx_get_internal_data = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Override internal texture with externally created texture. Previously created internal texture will released.
 *
 * C ref: `uintptr_t bgfx::overrideInternal(TextureHandle _handle, uintptr_t _ptr)`
 */
export const bgfx_override_internal_texture_ptr = {
  args: ['u16', 'u64'] as [handle: 'u16', ptr: 'u64'],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Override internal texture by creating new texture. Previously created internal texture will released.
 *
 * C ref: `uintptr_t bgfx::overrideInternal(TextureHandle _handle, uint16_t _width, uint16_t _height, uint8_t _numMips, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE)`
 */
export const bgfx_override_internal_texture = {
  args: ['u16', 'u64'] as [handle: 'u16', width: 'u64'],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Pack vertex attribute into vertex stream format.
 *
 * C ref: `void bgfx::vertexPack(const float _input[4], bool _inputNormalized, Attrib::Enum _attr, const VertexLayout &_layout, void *_data, uint32_t _index = 0)`
 */
export const bgfx_vertex_pack = {
  args: ['ptr', 'bool', 'u32', 'ptr', 'ptr', 'u32'] as [
    input: 'ptr',
    inputNormalized: 'bool',
    attr: 'u32',
    layout: 'ptr',
    data: 'ptr',
    index: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Unpack vertex attribute from vertex stream format.
 *
 * C ref: `void bgfx::vertexUnpack(float _output[4], Attrib::Enum _attr, const VertexLayout &_layout, const void *_data, uint32_t _index = 0)`
 */
export const bgfx_vertex_unpack = {
  args: ['ptr', 'u32', 'ptr', 'ptr', 'u32'] as [
    output: 'ptr',
    attr: 'u32',
    layout: 'ptr',
    data: 'ptr',
    index: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Converts vertex stream data from one vertex stream format to another.
 *
 * C ref: `void bgfx::vertexConvert(const VertexLayout &_destLayout, void *_destData, const VertexLayout &_srcLayout, const void *_srcData, uint32_t _num = 1)`
 */
export const bgfx_vertex_convert = {
  args: ['ptr', 'ptr', 'ptr', 'ptr', 'u32'] as [
    destLayout: 'ptr',
    destData: 'ptr',
    srcLayout: 'ptr',
    srcData: 'ptr',
    num: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Weld vertices.
 *
 * C ref: `uint32_t bgfx::weldVertices(void *_output, const VertexLayout &_layout, const void *_data, uint32_t _num, bool _index32, float _epsilon = 0.001f)`
 */
export const bgfx_weld_vertices = {
  args: ['ptr', 'ptr', 'ptr', 'u32', 'bool', 'f32'] as [
    output: 'ptr',
    layout: 'ptr',
    data: 'ptr',
    num: 'u32',
    index32: 'bool',
    epsilon: 'f32',
  ],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Convert index buffer for use with different primitive topologies.
 *
 * C ref: `uint32_t bgfx::topologyConvert(TopologyConvert::Enum _conversion, void *_dst, uint32_t _dstSize, const void *_indices, uint32_t _numIndices, bool _index32)`
 */
export const bgfx_topology_convert = {
  args: ['u32', 'ptr', 'u32', 'ptr', 'u32', 'bool'] as [
    conversion: 'u32',
    dst: 'ptr',
    dstSize: 'u32',
    indices: 'ptr',
    numIndices: 'u32',
    index32: 'bool',
  ],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Sort indices.
 *
 * C ref: `void bgfx::topologySortTriList(TopologySort::Enum _sort, void *_dst, uint32_t _dstSize, const float _dir[3], const float _pos[3], const void *_vertices, uint32_t _stride, const void *_indices, uint32_t _numIndices, bool _index32)`
 */
export const bgfx_topology_sort_tri_list = {
  args: [
    'u32',
    'ptr',
    'u32',
    'ptr',
    'ptr',
    'ptr',
    'u32',
    'ptr',
    'u32',
    'bool',
  ] as [
    sort: 'u32',
    dst: 'ptr',
    dstSize: 'u32',
    dir: 'ptr',
    pos: 'ptr',
    vertices: 'ptr',
    stride: 'u32',
    indices: 'ptr',
    numIndices: 'u32',
    index32: 'bool',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Discard all previously set state for draw or compute call.
 *
 * C ref: `void bgfx::discard(uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_discard = {
  args: ['u8'] as [flags: 'u8'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit an empty primitive for rendering. Uniforms and draw state will be applied but no geometry will be submitted.
 *
 * These empty draw calls will sort before ordinary draw calls.
 *
 * C ref: `void bgfx::touch(ViewId _id)`
 */
export const bgfx_touch = {
  args: ['u16'] as [id: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set palette color value.
 *
 * C ref: `void bgfx::setPaletteColor(uint8_t _index, uint32_t _rgba)`
 */
export const bgfx_set_palette_color = {
  args: ['u8', 'u32'] as [index: 'u8', rgba: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Request screen shot of window back buffer.
 *
 * C ref: `void bgfx::requestScreenShot(FrameBufferHandle _handle, const char *_filePath)`
 */
export const bgfx_request_screen_shot = {
  args: ['i16', 'cstring'] as [handle: 'i16', filePath: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Views

/**
 * Set view name.
 *
 * C ref: `void bgfx::setViewName(ViewId _id, const char *_name, int32_t _len = INT32_MAX)`
 */
export const bgfx_set_view_name = {
  args: ['u16', 'cstring', 'i32'] as [id: 'u16', name: 'cstring', len: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view rectangle. Draw primitive outside view will be clipped.
 *
 * C ref: `void bgfx::setViewRect(ViewId _id, uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height)`
 */
export const bgfx_set_view_rect = {
  args: ['u16', 'u16', 'u16', 'u16', 'u16'] as [
    id: 'u16',
    x: 'u16',
    y: 'u16',
    width: 'u16',
    height: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view rectangle. Draw primitive outside view will be clipped.
 *
 * C ref: `void bgfx::setViewRect(ViewId _id, uint16_t _x, uint16_t _y, BackbufferRatio::Enum _ratio)`
 */
export const bgfx_set_view_rect_ratio = {
  args: ['u16', 'u16', 'u16', 'u16'] as [
    id: 'u16',
    x: 'u16',
    y: 'u16',
    ratio: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view scissor. Draw primitive outside view will be clipped. When _x, _y, _width and _height are set to 0, scissor will be disabled.
 *
 * C ref: `void bgfx::setViewScissor(ViewId _id, uint16_t _x = 0, uint16_t _y = 0, uint16_t _width = 0, uint16_t _height = 0)`
 */
export const bgfx_set_view_scissor = {
  args: ['u16', 'u16', 'u16', 'u16', 'u16'] as [
    id: 'u16',
    x: 'u16',
    y: 'u16',
    width: 'u16',
    height: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view clear flags.
 *
 * C ref: `void bgfx::setViewClear(ViewId _id, uint16_t _flags, uint32_t _rgba = 0x000000ff, float _depth = 1.0f, uint8_t _stencil = 0)`
 */
export const bgfx_set_view_clear = {
  args: ['u16', 'u16', 'u32', 'f32', 'u8'] as [
    id: 'u16',
    flags: 'u16',
    rgba: 'u32',
    depth: 'f32',
    stencil: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view clear flags with different clear color for each frame buffer texture. bgfx::setPaletteColor must be used to set up a clear color palette.
 *
 * C ref: `void bgfx::setViewClear(ViewId _id, uint16_t _flags, float _depth, uint8_t _stencil, uint8_t _0 = UINT8_MAX, uint8_t _1 = UINT8_MAX, uint8_t _2 = UINT8_MAX, uint8_t _3 = UINT8_MAX, uint8_t _4 = UINT8_MAX, uint8_t _5 = UINT8_MAX, uint8_t _6 = UINT8_MAX, uint8_t _7 = UINT8_MAX)`
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
  ] as [
    id: 'u16',
    flags: 'u16',
    depth: 'f32',
    stencil: 'u8',
    _0: 'u8',
    _1: 'u8',
    _2: 'u8',
    _3: 'u8',
    _4: 'u8',
    _5: 'u8',
    _6: 'u8',
    _7: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view sorting mode.
 *
 * C ref: `void bgfx::setViewMode(ViewId _id, ViewMode::Enum _mode = ViewMode::Default)`
 */
export const bgfx_set_view_mode = {
  args: ['u16', 'u32'] as [id: 'u16', mode: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view frame buffer.
 *
 * C ref: `void bgfx::setViewFrameBuffer(ViewId _id, FrameBufferHandle _handle)`
 */
export const bgfx_set_view_frame_buffer = {
  args: ['u16', 'u16'] as [id: 'u16', handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set view’s view matrix and projection matrix, all draw primitives in this view will use these two matrices.
 *
 * C ref: `void bgfx::setViewTransform(ViewId _id, const void *_view, const void *_proj)`
 */
export const bgfx_set_view_transform = {
  args: ['u16', 'ptr', 'ptr'] as [id: 'u16', view: 'ptr', proj: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Post submit view reordering.
 *
 * C ref: `void bgfx::setViewOrder(ViewId _id = 0, uint16_t _num = UINT16_MAX, const ViewId *_remap = NULL)`
 */
export const bgfx_set_view_order = {
  args: ['u16', 'u16', 'ptr'] as [id: 'u16', num: 'u16', remap: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset all view settings to default.
 *
 * C ref: `void bgfx::resetView(ViewId _id)`
 */
export const bgfx_reset_view = {
  args: ['u16'] as [id: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Encoder

/**
 * Begin submitting draw calls from thread.
 *
 * C ref: `Encoder *bgfx::begin(bool _forThread = false)`
 */
export const bgfx_encoder_begin = {
  args: ['bool'] as [forThread: 'bool'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * End submitting draw calls from thread.
 *
 * C ref: `void bgfx::end(Encoder *_encoder)`
 */
export const bgfx_encoder_end = {
  args: ['ptr'] as [encoder: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets a debug marker. This allows you to group graphics calls together for easy browsing in graphics debugging tools.
 *
 * C ref: `void setMarker(const char *_name, int32_t _len = INT32_MAX)`
 */
export const bgfx_encoder_set_marker = {
  args: ['ptr', 'cstring', 'i32'] as [
    encoder: 'ptr',
    name: 'cstring',
    len: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set render states for draw primitive.
 *
 * C ref: `void setState(uint64_t _state, uint32_t _rgba = 0)`
 */
export const bgfx_encoder_set_state = {
  args: ['ptr', 'u64', 'u32'] as [encoder: 'ptr', state: 'u64', rgba: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set condition for rendering.
 *
 * C ref: `void setCondition(OcclusionQueryHandle _handle, bool _visible)`
 */
export const bgfx_encoder_set_condition = {
  args: ['ptr', 'u16', 'bool'] as [
    encoder: 'ptr',
    handle: 'u16',
    visible: 'bool',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set stencil test state.
 *
 * C ref: `void setStencil(uint32_t _fstencil, uint32_t _bstencil = BGFX_STENCIL_NONE)`
 */
export const bgfx_encoder_set_stencil = {
  args: ['ptr', 'u32', 'u32'] as [
    encoder: 'ptr',
    fstencil: 'u32',
    bstencil: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set scissor for draw primitive. To scissor for all primitives in view see bgfx::setViewScissor.
 *
 * C ref: `uint16_t setScissor(uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height)`
 */
export const bgfx_encoder_set_scissor = {
  args: ['ptr', 'u16', 'u16', 'u16', 'u16'] as [
    encoder: 'ptr',
    x: 'u16',
    y: 'u16',
    width: 'u16',
    height: 'u16',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Set scissor for draw primitive.
 *
 * C ref: `void setScissor(uint16_t _cache = UINT16_MAX)`
 */
export const bgfx_encoder_set_scissor_cached = {
  args: ['ptr', 'u16'] as [encoder: 'ptr', cache: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set model matrix for draw primitive. If it is not called, model will be rendered with identity model matrix.
 *
 * C ref: `uint32_t setTransform(const void *_mtx, uint16_t _num = 1)`
 */
export const bgfx_encoder_set_transform = {
  args: ['ptr', 'ptr', 'u16'] as [encoder: 'ptr', mtx: 'ptr', num: 'u16'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Reserve _num matrices in internal matrix cache.
 *
 * C ref: `uint32_t allocTransform(Transform *_transform, uint16_t _num)`
 */
export const bgfx_encoder_alloc_transform = {
  args: ['ptr', 'ptr', 'u16'] as [encoder: 'ptr', transform: 'ptr', num: 'u16'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Set model matrix from matrix cache for draw primitive.
 *
 * C ref: `void setTransform(uint32_t _cache, uint16_t _num = 1)`
 */
export const bgfx_encoder_set_transform_cached = {
  args: ['ptr', 'u32', 'u16'] as [encoder: 'ptr', cache: 'u32', num: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set shader uniform parameter for draw primitive.
 *
 * C ref: `void setUniform(UniformHandle _handle, const void *_value, uint16_t _num = 1)`
 */
export const bgfx_encoder_set_uniform = {
  args: ['ptr', 'u16', 'ptr', 'u16'] as [
    encoder: 'ptr',
    handle: 'u16',
    value: 'ptr',
    num: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set index buffer for draw primitive.
 *
 * C ref: `void setIndexBuffer(IndexBufferHandle _handle, uint32_t _firstIndex, uint32_t _numIndices)`
 */
export const bgfx_encoder_set_index_buffer = {
  args: ['ptr', 'u16', 'u32', 'u32'] as [
    encoder: 'ptr',
    handle: 'u16',
    firstIndex: 'u32',
    numIndices: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set index buffer for draw primitive.
 *
 * C ref: `void setIndexBuffer(DynamicIndexBufferHandle _handle, uint32_t _firstIndex, uint32_t _numIndices)`
 */
export const bgfx_encoder_set_dynamic_index_buffer = {
  args: ['ptr', 'u16', 'u32', 'u32'] as [
    encoder: 'ptr',
    handle: 'u16',
    firstIndex: 'u32',
    numIndices: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set index buffer for draw primitive.
 *
 * C ref: `void setIndexBuffer(const TransientIndexBuffer *_tib, uint32_t _firstIndex, uint32_t _numIndices)`
 */
export const bgfx_encoder_set_transient_index_buffer = {
  args: ['ptr', 'ptr', 'u32', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set vertex buffer for draw primitive.
 *
 * C ref: `void setVertexBuffer(uint8_t _stream, VertexBufferHandle _handle, uint32_t _startVertex, uint32_t _numVertices, VertexLayoutHandle _layoutHandle = BGFX_INVALID_HANDLE)`
 */
export const bgfx_encoder_set_vertex_buffer = {
  args: ['ptr', 'u8', 'u16', 'u32', 'u32', 'u16'] as [
    encoder: 'ptr',
    stream: 'u8',
    handle: 'u16',
    startVertex: 'u32',
    numVertices: 'u32',
    layoutHandle: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set vertex buffer for draw primitive.
 *
 * C ref: `void setVertexBuffer(uint8_t _stream, DynamicVertexBufferHandle _handle, uint32_t _startVertex, uint32_t _numVertices, VertexLayoutHandle _layoutHandle = BGFX_INVALID_HANDLE)`
 */
export const bgfx_encoder_set_dynamic_vertex_buffer = {
  args: ['ptr', 'u8', 'u16', 'u32', 'u32', 'u16'] as [
    encoder: 'ptr',
    stream: 'u8',
    handle: 'u16',
    startVertex: 'u32',
    numVertices: 'u32',
    layoutHandle: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set vertex buffer for draw primitive.
 *
 * C ref: `void setVertexBuffer(uint8_t _stream, const TransientVertexBuffer *_tvb, uint32_t _startVertex, uint32_t _numVertices, VertexLayoutHandle _layoutHandle = BGFX_INVALID_HANDLE)`
 */
export const bgfx_encoder_set_transient_vertex_buffer = {
  args: ['ptr', 'u8', 'u16', 'u32', 'u32', 'u16'] as [
    encoder: 'ptr',
    stream: 'u8',
    handle: 'u16',
    startVertex: 'u32',
    numVertices: 'u32',
    layoutHandle: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set number of vertices for auto generated vertices use in conjunction with gl_VertexID.
 *
 * C ref: `void setVertexCount(uint32_t _numVertices)`
 */
export const bgfx_encoder_set_vertex_count = {
  args: ['ptr', 'u32'] as [encoder: 'ptr', numVertices: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set instance data buffer for draw primitive.
 *
 * C ref: `void setInstanceDataBuffer(const InstanceDataBuffer *_idb, uint32_t _start, uint32_t _num)`
 */
export const bgfx_encoder_set_instance_data_buffer = {
  args: ['ptr', 'ptr', 'u32', 'u32'] as [
    encoder: 'ptr',
    idb: 'ptr',
    start: 'u32',
    num: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set instance data buffer for draw primitive.
 *
 * C ref: `void setInstanceDataBuffer(VertexBufferHandle _handle, uint32_t _start, uint32_t _num)`
 */
export const bgfx_encoder_set_instance_data_from_vertex_buffer = {
  args: ['ptr', 'u16', 'u32', 'u32'] as [
    encoder: 'ptr',
    handle: 'u16',
    start: 'u32',
    num: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set instance data buffer for draw primitive.
 *
 * C ref: `void setInstanceDataBuffer(DynamicVertexBufferHandle _handle, uint32_t _start, uint32_t _num)`
 */
export const bgfx_encoder_set_instance_data_from_dynamic_vertex_buffer = {
  args: ['ptr', 'u16', 'u32', 'u32'] as [
    encoder: 'ptr',
    handle: 'u16',
    start: 'u32',
    num: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set number of instances for auto generated instances use in conjunction with gl_InstanceID.
 *
 * C ref: `void setInstanceCount(uint32_t _numInstances)`
 */
export const bgfx_encoder_set_instance_count = {
  args: ['ptr', 'u32'] as [encoder: 'ptr', numInstances: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set texture stage for draw primitive.
 *
 * C ref: `void setTexture(uint8_t _stage, UniformHandle _sampler, TextureHandle _handle, uint32_t _flags = UINT32_MAX)`
 */
export const bgfx_encoder_set_texture = {
  args: ['ptr', 'u8', 'u16', 'u16', 'u32'] as [
    encoder: 'ptr',
    stage: 'u8',
    sampler: 'u16',
    handle: 'u16',
    flags: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit an empty primitive for rendering. Uniforms and draw state will be applied but no geometry will be submitted. Useful in cases when no other draw/compute primitive is submitted to view, but it’s desired to execute clear view.
 *
 * These empty draw calls will sort before ordinary draw calls.
 *
 * C ref: `void touch(ViewId _id)`
 */
export const bgfx_encoder_touch = {
  args: ['ptr', 'u16'] as [encoder: 'ptr', id: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive for rendering.
 *
 * C ref: `void submit(ViewId _id, ProgramHandle _program, uint32_t _depth = 0, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_encoder_submit = {
  args: ['ptr', 'u16', 'u16', 'i32', 'u8'] as [
    encoder: 'ptr',
    id: 'u16',
    program: 'u16',
    depth: 'i32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive with occlusion query for rendering.
 *
 * C ref: `void submit(ViewId _id, ProgramHandle _program, OcclusionQueryHandle _occlusionQuery, uint32_t _depth = 0, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_encoder_submit_occlusion_query = {
  args: ['ptr', 'u16', 'ptr', 'ptr', 'i32', 'u8'] as [
    encoder: 'ptr',
    id: 'u16',
    program: 'ptr',
    occlusionQuery: 'ptr',
    depth: 'i32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive for rendering with index and instance data info from indirect buffer.
 *
 * C ref: `void submit(ViewId _id, ProgramHandle _program, IndirectBufferHandle _indirectHandle, uint32_t _start = 0, uint32_t _num = 1, uint32_t _depth = 0, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_encoder_submit_indirect = {
  args: ['ptr', 'u16', 'u16', 'u16', 'u32', 'u32', 'i32', 'u8'] as [
    encoder: 'ptr',
    id: 'u16',
    program: 'u16',
    indirectHandle: 'u16',
    start: 'u32',
    num: 'u32',
    depth: 'i32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive for rendering with index and instance data info and draw count from indirect buffers.
 *
 * C ref: `void submit(ViewId _id, ProgramHandle _program, IndirectBufferHandle _indirectHandle, uint32_t _start, IndexBufferHandle _numHandle, uint32_t _numIndex = 0, uint32_t _numMax = UINT32_MAX, uint32_t _depth = 0, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_encoder_submit_indirect_count = {
  args: [
    'ptr',
    'u16',
    'u16',
    'u16',
    'u32',
    'u16',
    'u32',
    'u32',
    'u32',
    'u8',
  ] as [
    encoder: 'ptr',
    id: 'u16',
    program: 'u16',
    indirectHandle: 'u16',
    start: 'u32',
    num: 'u16',
    numIndex: 'u32',
    numMax: 'u32',
    depth: 'u32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute index buffer.
 *
 * C ref: `void setBuffer(uint8_t _stage, IndexBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_encoder_set_compute_index_buffer = {
  args: ['ptr', 'u8', 'u16', 'u32'] as [
    encoder: 'ptr',
    stage: 'u8',
    handle: 'u16',
    access: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute vertex buffer.
 *
 * C ref: `void setBuffer(uint8_t _stage, VertexBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_encoder_set_compute_vertex_buffer = {
  args: ['ptr', 'u8', 'u16', 'u32'] as [
    encoder: 'ptr',
    stage: 'u8',
    handle: 'u16',
    access: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute dynamic index buffer.
 *
 * C ref: `void setBuffer(uint8_t _stage, DynamicIndexBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_encoder_set_compute_dynamic_index_buffer = {
  args: ['ptr', 'u8', 'u16', 'u32'] as [
    encoder: 'ptr',
    stage: 'u8',
    handle: 'u16',
    access: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute dynamic vertex buffer.
 *
 * C ref: `void setBuffer(uint8_t _stage, DynamicVertexBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_encoder_set_compute_dynamic_vertex_buffer = {
  args: ['ptr', 'u8', 'u16', 'u32'] as [
    encoder: 'ptr',
    stage: 'u8',
    handle: 'u16',
    access: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute indirect buffer.
 *
 * C ref: `void setBuffer(uint8_t _stage, IndirectBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_encoder_set_compute_indirect_buffer = {
  args: ['ptr', 'u8', 'u16', 'u32'] as [
    encoder: 'ptr',
    stage: 'u8',
    handle: 'u16',
    access: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute image from texture.
 *
 * C ref: `void setImage(uint8_t _stage, TextureHandle _handle, uint8_t _mip, Access::Enum _access, TextureFormat::Enum _format = TextureFormat::Count)`
 */
export const bgfx_encoder_set_image = {
  args: ['ptr', 'u8', 'u16', 'u8', 'u32', 'u32'] as [
    encoder: 'ptr',
    stage: 'u8',
    handle: 'u16',
    mip: 'u8',
    access: 'u32',
    format: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatch compute.
 *
 * C ref: `void dispatch(ViewId _id, ProgramHandle _handle, uint32_t _numX = 1, uint32_t _numY = 1, uint32_t _numZ = 1, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_encoder_dispatch = {
  args: ['ptr', 'u16', 'u32', 'u32', 'u32', 'u8'] as [
    encoder: 'ptr',
    handle: 'u16',
    numX: 'u32',
    numY: 'u32',
    numZ: 'u32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatch compute indirect.
 *
 * C ref: `void dispatch(ViewId _id, ProgramHandle _handle, IndirectBufferHandle _indirectHandle, uint32_t _start = 0, uint32_t _num = 1, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_encoder_dispatch_indirect = {
  args: ['ptr', 'u16', 'u16', 'u32', 'u32', 'u8'] as [
    encoder: 'ptr',
    handle: 'u16',
    indirectHandle: 'u16',
    start: 'u32',
    num: 'u32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Discard all previously set state for draw or compute call.
 *
 * C ref: `void discard(uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_encoder_discard = {
  args: ['ptr', 'u8'] as [encoder: 'ptr', flags: 'u8'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * TODO: check functions with same name
 * Blit texture 2D region between two 2D textures.
 *
 * C ref: `void blit(ViewId _id, TextureHandle _dst, uint16_t _dstX, uint16_t _dstY, TextureHandle _src, uint16_t _srcX = 0, uint16_t _srcY = 0, uint16_t _width = UINT16_MAX, uint16_t _height = UINT16_MAX)`
 */
// export const bgfx_encoder_blit = {
//   args: [
//     'ptr',
//     'u16',
//     'ptr',
//     'u16',
//     'u16',
//     'ptr',
//     'u16',
//     'u16',
//     'u16',
//     'u16',
//   ],
//   returns: 'void',
// } as const satisfies FFIFunction;

/**
 * Blit texture region between two textures.
 *
 * C ref: `void blit(ViewId _id, TextureHandle _dst, uint8_t _dstMip, uint16_t _dstX, uint16_t _dstY, uint16_t _dstZ, TextureHandle _src, uint8_t _srcMip = 0, uint16_t _srcX = 0, uint16_t _srcY = 0, uint16_t _srcZ = 0, uint16_t _width = UINT16_MAX, uint16_t _height = UINT16_MAX, uint16_t _depth = UINT16_MAX)`
 */
export const bgfx_encoder_blit = {
  args: [
    'ptr',
    'u16',
    'u16',
    'u8',
    'u16',
    'u16',
    'u16',
    'u16',
    'u8',
    'u16',
    'u16',
    'u16',
    'u16',
    'u16',
    'u16',
  ] as [
    encoder: 'ptr',
    id: 'u16',
    dst: 'u16',
    dstMip: 'u8',
    dstX: 'u16',
    dstY: 'u16',
    dstZ: 'u16',
    src: 'u16',
    srcMip: 'u8',
    srcX: 'u16',
    srcY: 'u16',
    srcZ: 'u16',
    width: 'u16',
    height: 'u16',
    depth: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets a debug marker. This allows you to group graphics calls together for easy browsing in graphics debugging tools.
 *
 * C ref: `void bgfx::setMarker(const char *_name, int32_t _len = INT32_MAX)`
 */
export const bgfx_set_marker = {
  args: ['cstring', 'i32'] as [name: 'cstring', len: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set shader debug name.
 *
 * C ref: `void bgfx::setName(ShaderHandle _handle, const char *_name, int32_t _len = INT32_MAX)`
 */
export const bgfx_set_shader_name = {
  args: ['u16', 'cstring', 'i32'] as [
    handle: 'u16',
    name: 'cstring',
    len: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set texture debug name.
 *
 * C ref: `void bgfx::setName(TextureHandle _handle, const char *_name, int32_t _len = INT32_MAX)`
 */
export const bgfx_set_texture_name = {
  args: ['u16', 'cstring', 'i32'] as [
    handle: 'u16',
    name: 'cstring',
    len: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set render states for draw primitive.
 *
 * C ref: `void bgfx::setState(uint64_t _state, uint32_t _rgba = 0)`
 */
export const bgfx_set_state = {
  args: ['u64', 'u32'] as [state: 'u64', rgba: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set stencil test state.
 *
 * C ref: `void bgfx::setStencil(uint32_t _fstencil, uint32_t _bstencil = BGFX_STENCIL_NONE)`
 */
export const bgfx_set_stencil = {
  args: ['u32', 'u32'] as [fstencil: 'u32', bstencil: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set scissor for draw primitive. For scissor for all primitives in view see bgfx::setViewScissor.
 *
 * C ref: `uint16_t bgfx::setScissor(uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height)`
 */
export const bgfx_set_scissor = {
  args: ['u16', 'u16', 'u16', 'u16'] as [
    x: 'u16',
    y: 'u16',
    width: 'u16',
    height: 'u16',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Set scissor from cache for draw primitive.
 *
 * C ref: `void bgfx::setScissor(uint16_t _cache = UINT16_MAX)`
 */
export const bgfx_set_scissor_cached = {
  args: ['u16'] as [cache: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reserve _num matrices in internal matrix cache.
 *
 * C ref: `uint32_t bgfx::allocTransform(Transform *_transform, uint16_t _num)`
 */
export const bgfx_alloc_transform = {
  args: ['ptr', 'u16'] as [transform: 'ptr', num: 'u16'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Set model matrix for draw primitive. If it is not called, the model will be rendered with an identity model matrix.
 *
 * C ref: `uint32_t bgfx::setTransform(const void *_mtx, uint16_t _num = 1)`
 */
export const bgfx_set_transform = {
  args: ['ptr', 'u16'] as [mtx: 'ptr', num: 'u16'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Set model matrix from matrix cache for draw primitive.
 *
 * C ref: `void bgfx::setTransform(uint32_t _cache, uint16_t _num = 1)`
 */
export const bgfx_set_transform_cached = {
  args: ['u32', 'u16'] as [cache: 'u32', num: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set condition for rendering.
 *
 * C ref: `void bgfx::setCondition(OcclusionQueryHandle _handle, bool _visible)`
 */
export const bgfx_set_condition = {
  args: ['u16', 'bool'] as [handle: 'u16', visible: 'bool'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set index buffer for draw primitive.
 *
 * C ref: `void bgfx::setIndexBuffer(IndexBufferHandle _handle, uint32_t _firstIndex, uint32_t _numIndices)`
 */
export const bgfx_set_index_buffer = {
  args: ['u16', 'u32', 'u32'] as [
    handle: 'u16',
    firstIndex: 'u32',
    numIndices: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set index buffer for draw primitive.
 *
 * C ref: `void bgfx::setIndexBuffer(DynamicIndexBufferHandle _handle, uint32_t _firstIndex, uint32_t _numIndices)`
 */
export const bgfx_set_dynamic_index_buffer = {
  args: ['u16', 'u32', 'u32'] as [
    handle: 'u16',
    firstIndex: 'u32',
    numIndices: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set index buffer for draw primitive.
 *
 * C ref: `void bgfx::setIndexBuffer(const TransientIndexBuffer *_tib, uint32_t _firstIndex, uint32_t _numIndices)`
 */
export const bgfx_set_transient_index_buffer = {
  args: ['ptr', 'u32', 'u32'] as [
    tib: 'ptr',
    firstIndex: 'u32',
    numIndices: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set vertex buffer for draw primitive.
 *
 * C ref: `void bgfx::setVertexBuffer(uint8_t _stream, VertexBufferHandle _handle, uint32_t _startVertex, uint32_t _numVertices, VertexLayoutHandle _layoutHandle = BGFX_INVALID_HANDLE)`
 */
export const bgfx_set_vertex_buffer = {
  args: ['u8', 'u16', 'u32', 'u32', 'u16'] as [
    stream: 'u8',
    handle: 'u16',
    startVertex: 'u32',
    numVertices: 'u32',
    layoutHandle: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 *Set vertex buffer for draw primitive.
 *
 * C ref: `void bgfx::setVertexBuffer(uint8_t _stream, DynamicVertexBufferHandle _handle, uint32_t _startVertex, uint32_t _numVertices, VertexLayoutHandle _layoutHandle = BGFX_INVALID_HANDLE)`
 */
export const bgfx_set_dynamic_vertex_buffer = {
  args: ['u8', 'u16', 'u32', 'u32', 'u16'] as [
    stream: 'u8',
    handle: 'u16',
    startVertex: 'u32',
    numVertices: 'u32',
    layoutHandle: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set vertex buffer for draw primitive.
 *
 * C ref: `void bgfx::setVertexBuffer(uint8_t _stream, const TransientVertexBuffer *_tvb, uint32_t _startVertex, uint32_t _numVertices, VertexLayoutHandle _layoutHandle = BGFX_INVALID_HANDLE)`
 */
export const bgfx_set_transient_vertex_buffer = {
  args: ['u8', 'ptr', 'u32', 'u32', 'u16'] as [
    stream: 'u8',
    tvb: 'ptr',
    startVertex: 'u32',
    numVertices: 'u32',
    layoutHandle: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set number of vertices for auto generated vertices use in conjunction with gl_VertexID.
 *
 * C ref: `void bgfx::setVertexCount(uint32_t _numVertices)`
 */
export const bgfx_set_vertex_count = {
  args: ['u32'] as [numVertices: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set instance data buffer for draw primitive.
 *
 * C ref: `void bgfx::setInstanceDataBuffer(const InstanceDataBuffer *_idb, uint32_t _start, uint32_t _num)`
 */
export const bgfx_set_instance_data_buffer = {
  args: ['ptr', 'u32', 'u32'] as [idb: 'ptr', start: 'u32', num: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set instance data buffer for draw primitive.
 *
 * C ref: `void bgfx::setInstanceDataBuffer(VertexBufferHandle _handle, uint32_t _start, uint32_t _num)`
 */
export const bgfx_set_instance_data_from_vertex_buffer = {
  args: ['u16', 'u32', 'u32'] as [handle: 'u16', start: 'u32', num: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set instance data buffer for draw primitive.
 *
 * C ref: `void bgfx::setInstanceDataBuffer(DynamicVertexBufferHandle _handle, uint32_t _start, uint32_t _num)`
 */
export const bgfx_set_instance_data_from_dynamic_vertex_buffer = {
  args: ['u16', 'u32', 'u32'] as [handle: 'u16', start: 'u32', num: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set number of instances for auto generated instances use in conjunction with gl_InstanceID.
 *
 * C ref: `void bgfx::setInstanceCount(uint32_t _numInstances)`
 */
export const bgfx_set_instance_count = {
  args: ['u32'] as [numInstances: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set texture stage for draw primitive.
 *
 * C ref: `void bgfx::setTexture(uint8_t _stage, UniformHandle _sampler, TextureHandle _handle, uint32_t _flags = UINT32_MAX)`
 */
export const bgfx_set_texture = {
  args: ['u8', 'u16', 'u16', 'u32'] as [
    stage: 'u8',
    sampler: 'u16',
    handle: 'u16',
    flags: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive for rendering.
 *
 * C ref: `void bgfx::submit(ViewId _id, ProgramHandle _program, uint32_t _depth = 0, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_submit = {
  args: ['u16', 'u16', 'u32', 'u8'] as [
    id: 'u16',
    program: 'u16',
    depth: 'u32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive with occlusion query for rendering.
 *
 * C ref: `void bgfx::submit(ViewId _id, ProgramHandle _program, OcclusionQueryHandle _occlusionQuery, uint32_t _depth = 0, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_submit_occlusion_query = {
  args: ['u16', 'u16', 'u16', 'u32', 'u8'] as [
    id: 'u16',
    program: 'u16',
    occlusionQuery: 'u16',
    depth: 'u32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive for rendering with index and instance data info from indirect buffer.
 *
 * C ref: `void bgfx::submit(ViewId _id, ProgramHandle _program, IndirectBufferHandle _indirectHandle, uint32_t _start = 0, uint32_t _num = 1, uint32_t _depth = 0, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_submit_indirect = {
  args: ['u16', 'u16', 'u16', 'u32', 'u32', 'u32', 'u8'] as [
    id: 'u16',
    program: 'u16',
    indirectHandle: 'u16',
    start: 'u32',
    num: 'u32',
    depth: 'u32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submit primitive for rendering with index and instance data info and draw count from indirect buffers.
 *
 * C ref: `void bgfx::submit(ViewId _id, ProgramHandle _program, IndirectBufferHandle _indirectHandle, uint32_t _start, IndexBufferHandle _numHandle, uint32_t _numIndex = 0, uint32_t _numMax = UINT32_MAX, uint32_t _depth = 0, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_submit_indirect_count = {
  args: ['u16', 'u16', 'u16', 'u32', 'u16', 'u32', 'u32', 'u32', 'u8'] as [
    id: 'u16',
    program: 'u16',
    indirectHandle: 'u16',
    start: 'u32',
    numHandle: 'u16',
    numIndex: 'u32',
    numMax: 'u32',
    depth: 'u32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute index buffer.
 *
 * C ref: `void bgfx::setBuffer(uint8_t _stage, IndexBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_set_compute_index_buffer = {
  args: ['u8', 'u16', 'u32'] as [stage: 'u8', handle: 'u16', access: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute vertex buffer.
 *
 * C ref: `void bgfx::setBuffer(uint8_t _stage, VertexBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_set_compute_vertex_buffer = {
  args: ['u8', 'u16', 'u32'] as [stage: 'u8', handle: 'u16', access: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute dynamic index buffer.
 *
 * C ref: `void bgfx::setBuffer(uint8_t _stage, DynamicIndexBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_set_compute_dynamic_index_buffer = {
  args: ['u8', 'u16', 'u32'] as [stage: 'u8', handle: 'u16', access: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute dynamic vertex buffer.
 *
 * C ref: `void bgfx::setBuffer(uint8_t _stage, DynamicVertexBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_set_compute_dynamic_vertex_buffer = {
  args: ['u8', 'u16', 'u32'] as [stage: 'u8', handle: 'u16', access: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute indirect buffer.
 *
 * C ref: `void bgfx::setBuffer(uint8_t _stage, IndirectBufferHandle _handle, Access::Enum _access)`
 */
export const bgfx_set_compute_indirect_buffer = {
  args: ['u8', 'u16', 'u32'] as [stage: 'u8', handle: 'u16', access: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set compute image from texture.
 *
 * C ref: `void bgfx::setImage(uint8_t _stage, TextureHandle _handle, uint8_t _mip, Access::Enum _access, TextureFormat::Enum _format = TextureFormat::Count)`
 */
export const bgfx_set_image = {
  args: ['u8', 'u16', 'u8', 'u32', 'u32'] as [
    stage: 'u8',
    handle: 'u16',
    mip: 'u8',
    access: 'u32',
    format: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatch compute.
 *
 * C ref: `void bgfx::dispatch(ViewId _id, ProgramHandle _handle, uint32_t _numX = 1, uint32_t _numY = 1, uint32_t _numZ = 1, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_dispatch = {
  args: ['u16', 'u16', 'u32', 'u32', 'u32', 'u8'] as [
    id: 'u16',
    program: 'u16',
    numX: 'u32',
    numY: 'u32',
    numZ: 'u32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatch compute indirect.
 *
 * C ref: `void bgfx::dispatch(ViewId _id, ProgramHandle _handle, IndirectBufferHandle _indirectHandle, uint32_t _start = 0, uint32_t _num = 1, uint8_t _flags = BGFX_DISCARD_ALL)`
 */
export const bgfx_dispatch_indirect = {
  args: ['u16', 'u16', 'u16', 'u32', 'u32', 'u8'] as [
    id: 'u16',
    program: 'u16',
    indirectHandle: 'u16',
    start: 'u32',
    num: 'u32',
    flags: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Blit texture region between two textures.
 *
 * C ref: `void bgfx::blit(ViewId _id, TextureHandle _dst, uint8_t _dstMip, uint16_t _dstX, uint16_t _dstY, uint16_t _dstZ, TextureHandle _src, uint8_t _srcMip = 0, uint16_t _srcX = 0, uint16_t _srcY = 0, uint16_t _srcZ = 0, uint16_t _width = UINT16_MAX, uint16_t _height = UINT16_MAX, uint16_t _depth = UINT16_MAX)`
 */
export const bgfx_blit = {
  args: [
    'u16',
    'u16',
    'u8',
    'u16',
    'u16',
    'u16',
    'u16',
    'u8',
    'u16',
    'u16',
    'u16',
    'u16',
    'u16',
    'u16',
  ] as [
    id: 'u16',
    dst: 'u16',
    dstMip: 'u8',
    dstX: 'u16',
    dstY: 'u16',
    dstZ: 'u16',
    src: 'u16',
    srcMip: 'u8',
    srcX: 'u16',
    srcY: 'u16',
    srcZ: 'u16',
    width: 'u16',
    height: 'u16',
    depth: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// BGFX MARK: Resources

/**
 * Allocate buffer to pass to bgfx calls. Data will be freed inside bgfx.
 *
 * C ref: `const Memory *bgfx::alloc(uint32_t _size)`
 */
export const bgfx_alloc = {
  args: ['u32'] as [size: 'u32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Allocate buffer and copy data into it. Data will be freed inside bgfx.
 *
 * C ref: `const Memory *bgfx::copy(const void *_data, uint32_t _size)`
 */
export const bgfx_copy = {
  args: ['ptr', 'u32'] as [data: 'ptr', size: 'u32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Make reference to data to pass to bgfx. Unlike bgfx::alloc, this call doesn’t allocate memory for data. It just copies the _data pointer. You can pass ReleaseFn function pointer to release this memory after it’s consumed, otherwise you must make sure _data is available for at least 2 bgfx::frame calls. ReleaseFn function must be able to be called from any thread.
 *
 * C ref: `const Memory *bgfx::makeRef(const void *_data, uint32_t _size)`
 */
export const bgfx_make_ref = {
  args: ['ptr', 'u32'] as [data: 'ptr', size: 'u32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Make reference to data to pass to bgfx. Unlike bgfx::alloc, this call doesn’t allocate memory for data. It just copies the _data pointer. You can pass ReleaseFn function pointer to release this memory after it’s consumed, otherwise you must make sure _data is available for at least 2 bgfx::frame calls. ReleaseFn function must be able to be called from any thread.
 *
 * C ref: `const Memory *bgfx::makeRef(const void *_data, uint32_t _size, ReleaseFn _releaseFn = NULL, void *_userData = NULL)`
 */
export const bgfx_make_ref_release = {
  args: ['ptr', 'u32', 'callback', 'ptr'] as [
    data: 'ptr',
    size: 'u32',
    releaseFn: 'callback',
    userData: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Create shader from memory buffer.
 *
 * C ref: `ShaderHandle bgfx::createShader(const Memory *_mem)`
 */
export const bgfx_create_shader = {
  args: ['ptr'] as [mem: 'ptr'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Returns the number of uniforms and uniform handles used inside a shader.
 *
 * C ref: `uint16_t bgfx::getShaderUniforms(ShaderHandle _handle, UniformHandle *_uniforms = NULL, uint16_t _max = 0)`
 */
export const bgfx_get_shader_uniforms = {
  args: ['u16', 'u16', 'u16'] as [handle: 'u16', uniforms: 'u16', max: 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Destroy shader. Once a shader program is created with _handle, it is safe to destroy that shader.
 *
 * C ref: `void bgfx::destroy(ShaderHandle _handle)`
 */
export const bgfx_destroy_shader = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create program with vertex and fragment shaders.
 *
 * C ref: `ProgramHandle bgfx::createProgram(ShaderHandle _vsh, ShaderHandle _fsh, bool _destroyShaders = false)`
 */
export const bgfx_create_program = {
  args: ['u16', 'u16', 'bool'] as [
    vsh: 'u16',
    fsh: 'u16',
    destroyShaders: 'bool',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create program with compute shader.
 *
 * C ref: `ProgramHandle bgfx::createProgram(ShaderHandle _csh, bool _destroyShader = false)`
 */
export const bgfx_create_compute_program = {
  args: ['u16', 'bool'] as [csh: 'u16', destroyShader: 'bool'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Destroy program.
 *
 * C ref: `void bgfx::destroy(ProgramHandle _handle)`
 */
export const bgfx_destroy_program = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create shader uniform parameter.
 *
 * C ref: `UniformHandle bgfx::createUniform(const char *_name, UniformType::Enum _type, uint16_t _num = 1)`
 */
export const bgfx_create_uniform = {
  args: ['cstring', 'u32', 'u16'] as [name: 'cstring', type: 'u32', num: 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Retrieve uniform info.
 *
 * C ref: `void bgfx::getUniformInfo(UniformHandle _handle, UniformInfo &_info)`
 */
export const bgfx_get_uniform_info = {
  args: ['u16', 'ptr'] as [handle: 'u16', info: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy shader uniform parameter.
 *
 * C ref: `void bgfx::destroy(UniformHandle _handle)`
 */
export const bgfx_destroy_uniform = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create vertex layout
 *
 * C ref: `VertexLayoutHandle bgfx::createVertexLayout(const VertexLayout &_layout)`
 */
export const bgfx_create_vertex_layout = {
  args: ['ptr'] as [layout: 'ptr'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Destroy vertex layout.
 *
 * C ref: `void bgfx::destroy(VertexLayoutHandle _handle)`
 */
export const bgfx_destroy_vertex_layout = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create static vertex buffer.
 *
 * C ref: `VertexBufferHandle bgfx::createVertexBuffer(const Memory *_mem, const VertexLayout &_layout, uint16_t _flags = BGFX_BUFFER_NONE)`
 */
export const bgfx_create_vertex_buffer = {
  args: ['ptr', 'ptr', 'u16'] as [mem: 'ptr', layout: 'ptr', flags: 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Set static vertex buffer debug name.
 *
 * C ref: `void bgfx::setName(VertexBufferHandle _handle, const char *_name, int32_t _len = INT32_MAX)`
 */
export const bgfx_set_vertex_buffer_name = {
  args: ['u16', 'cstring', 'i32'] as [
    handle: 'u16',
    name: 'cstring',
    len: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy static vertex buffer.
 *
 * C ref: `void bgfx::destroy(VertexBufferHandle _handle)`
 */
export const bgfx_destroy_vertex_buffer = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * End VertexLayout.
 *
 * C ref: `void VertexLayout::end()`
 */
export const bgfx_vertex_layout_end = {
  args: ['ptr'] as [layout: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Start VertexLayout.
 *
 * C ref: `VertexLayout &begin(RendererType::Enum _renderer = RendererType::Noop)`
 */
export const bgfx_vertex_layout_begin = {
  args: ['ptr', 'u32'] as [layout: 'ptr', renderer: 'u32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Add attribute to VertexLayout.
 *
 * C ref: `VertexLayout &add(Attrib::Enum _attrib, uint8_t _num, AttribType::Enum _type, bool _normalized = false, bool _asInt = false)`
 */
export const bgfx_vertex_layout_add = {
  args: ['ptr', 'u32', 'u8', 'u32', 'bool', 'bool'] as [
    layout: 'ptr',
    attrib: 'u32',
    num: 'u8',
    type: 'u32',
    normalized: 'bool',
    asInt: 'bool',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Skip _num bytes in vertex stream.
 *
 * C ref: `VertexLayout &skip(uint8_t _num)`
 */
export const bgfx_vertex_layout_skip = {
  args: ['ptr', 'u8'] as [layout: 'ptr', num: 'u8'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Decode attribute.
 *
 * C ref: `void decode(Attrib::Enum _attrib, uint8_t &_num, AttribType::Enum &_type, bool &_normalized, bool &_asInt) const`
 */
export const bgfx_vertex_layout_decode = {
  args: ['ptr', 'u32', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    layout: 'ptr',
    attrib: 'u32',
    num: 'ptr',
    type: 'ptr',
    normalized: 'ptr',
    asInt: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns true if VertexLayout contains attribute.
 *
 * C ref: `inline bool has(Attrib::Enum _attrib) const`
 */
export const bgfx_vertex_layout_has = {
  args: ['ptr', 'u32'] as [layout: 'ptr', attrib: 'u32'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Returns relative attribute offset from the vertex.
 *
 * C ref: `inline uint16_t getOffset(Attrib::Enum _attrib) const`
 */
export const bgfx_vertex_layout_get_offset = {
  args: ['ptr', 'u32'] as [layout: 'ptr', attrib: 'u32'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Returns vertex stride.
 *
 * C ref: `inline uint8_t getStride() const`
 */
export const bgfx_vertex_layout_get_stride = {
  args: ['ptr'] as [layout: 'ptr'],
  returns: 'u8',
} as const satisfies FFIFunction;

/**
 * Returns size of vertex buffer for number of vertices.
 *
 * C ref: `inline uint32_t getSize(uint32_t _num) const`
 */
export const bgfx_vertex_layout_get_size = {
  args: ['ptr', 'u32'] as [layout: 'ptr', num: 'u32'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Create empty dynamic vertex buffer.
 *
 * C ref: `DynamicVertexBufferHandle bgfx::createDynamicVertexBuffer(uint32_t _num, const VertexLayout &_layout, uint16_t _flags = BGFX_BUFFER_NONE)`
 */
export const bgfx_create_dynamic_vertex_buffer = {
  args: ['u32', 'ptr', 'u16'] as [num: 'u32', layout: 'ptr', flags: 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create dynamic vertex buffer and initialize it.
 *
 * C ref: `DynamicVertexBufferHandle bgfx::createDynamicVertexBuffer(const Memory *_mem, const VertexLayout &_layout, uint16_t _flags = BGFX_BUFFER_NONE)`
 */
export const bgfx_create_dynamic_vertex_buffer_mem = {
  args: ['ptr', 'ptr', 'u16'] as [mem: 'ptr', layout: 'ptr', flags: 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Update dynamic vertex buffer.
 *
 * C ref: `void bgfx::update(DynamicVertexBufferHandle _handle, uint32_t _startVertex, const Memory *_mem)`
 */
export const bgfx_update_dynamic_vertex_buffer = {
  args: ['u16', 'u32', 'ptr'] as [
    handle: 'u16',
    startVertex: 'u32',
    mem: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy dynamic vertex buffer.
 *
 * C ref: `void bgfx::destroy(DynamicVertexBufferHandle _handle)`
 */
export const bgfx_destroy_dynamic_vertex_buffer = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns number of requested or maximum available vertices.
 *
 * C ref: `uint32_t bgfx::getAvailTransientVertexBuffer(uint32_t _num, const VertexLayout &_layout)`
 */
export const bgfx_get_avail_transient_vertex_buffer = {
  args: ['u32', 'ptr'] as [num: 'u32', layout: 'ptr'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Allocates transient vertex buffer.
 *
 * C ref: `void bgfx::allocTransientVertexBuffer(TransientVertexBuffer *_tvb, uint32_t _num, const VertexLayout &_layout)`
 */
export const bgfx_alloc_transient_vertex_buffer = {
  args: ['ptr', 'u32', 'ptr'] as [tvb: 'ptr', num: 'u32', layout: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Creates index buffer.
 *
 * C ref: `IndexBufferHandle bgfx::createIndexBuffer(const Memory *_mem, uint16_t _flags = BGFX_BUFFER_NONE)`
 */
export const bgfx_create_index_buffer = {
  args: ['ptr', 'u16'] as [mem: 'ptr', flags: 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Set static index buffer debug name.
 *
 * C ref: `void bgfx::setName(IndexBufferHandle _handle, const char *_name, int32_t _len = INT32_MAX)`
 */
export const bgfx_set_index_buffer_name = {
  args: ['u16', 'cstring', 'i32'] as [
    handle: 'u16',
    name: 'cstring',
    len: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy static index buffer.
 *
 * C ref: `void bgfx::destroy(IndexBufferHandle _handle)`
 */
export const bgfx_destroy_index_buffer = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create empty dynamic index buffer.
 *
 * C ref: `DynamicIndexBufferHandle bgfx::createDynamicIndexBuffer(uint32_t _num, uint16_t _flags = BGFX_BUFFER_NONE)`
 */
export const bgfx_create_dynamic_index_buffer = {
  args: ['u32', 'u16'] as [num: 'u32', flags: 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create a dynamic index buffer and initialize it.
 *
 * C ref: `DynamicIndexBufferHandle bgfx::createDynamicIndexBuffer(const Memory *_mem, uint16_t _flags = BGFX_BUFFER_NONE)`
 */
export const bgfx_create_dynamic_index_buffer_mem = {
  args: ['ptr', 'u16'] as [mem: 'ptr', flags: 'u16'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Update dynamic index buffer.
 *
 * C ref: `void bgfx::update(DynamicIndexBufferHandle _handle, uint32_t _startIndex, const Memory *_mem)`
 */
export const bgfx_update_dynamic_index_buffer = {
  args: ['u16', 'u32', 'ptr'] as [handle: 'u16', startIndex: 'u32', mem: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy dynamic index buffer.
 *
 * C ref: `void bgfx::destroy(DynamicIndexBufferHandle _handle)`
 */
export const bgfx_destroy_dynamic_index_buffer = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns number of requested or maximum available indices.
 *
 * C ref: `uint32_t bgfx::getAvailTransientIndexBuffer(uint32_t _num, bool _index32 = false)`
 */
export const bgfx_get_avail_transient_index_buffer = {
  args: ['u32', 'bool'] as [num: 'u32', index32: 'bool'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Allocates transient index buffer.
 *
 * C ref: `void bgfx::allocTransientIndexBuffer(TransientIndexBuffer *_tib, uint32_t _num, bool _index32 = false)`
 */
export const bgfx_alloc_transient_index_buffer = {
  args: ['ptr', 'u32', 'bool'] as [tib: 'ptr', num: 'u32', index32: 'bool'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Validate texture parameters.
 *
 * C ref: `bool bgfx::isTextureValid(uint16_t _depth, bool _cubeMap, uint16_t _numLayers, TextureFormat::Enum _format, uint64_t _flags)`
 */
export const bgfx_is_texture_valid = {
  args: ['u16', 'bool', 'u16', 'u32', 'u64'] as [
    depth: 'u16',
    cubeMap: 'bool',
    numLayers: 'u16',
    format: 'u32',
    flags: 'u64',
  ],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Calculate amount of memory required for texture.
 *
 * C ref: `void bgfx::calcTextureSize(TextureInfo &_info, uint16_t _width, uint16_t _height, uint16_t _depth, bool _cubeMap, bool _hasMips, uint16_t _numLayers, TextureFormat::Enum _format)`
 */
export const bgfx_calc_texture_size = {
  args: ['ptr', 'u16', 'u16', 'u16', 'bool', 'bool', 'u16', 'u32'] as [
    info: 'ptr',
    width: 'u16',
    height: 'u16',
    depth: 'u16',
    cubeMap: 'bool',
    hasMips: 'bool',
    numLayers: 'u16',
    format: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create texture from memory buffer.
 *
 * C ref: `TextureHandle bgfx::createTexture(const Memory *_mem, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE, uint8_t _skip = 0, TextureInfo *_info = NULL)`
 */
export const bgfx_create_texture = {
  args: ['ptr', 'u64', 'u8', 'ptr'] as [
    mem: 'ptr',
    flags: 'u64',
    skip: 'u8',
    info: 'ptr',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create 2D texture.
 *
 * C ref: `TextureHandle bgfx::createTexture2D(uint16_t _width, uint16_t _height, bool _hasMips, uint16_t _numLayers, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE, const Memory *_mem = NULL)`
 */
export const bgfx_create_texture_2d = {
  args: ['u16', 'u16', 'bool', 'u16', 'u32', 'u64', 'ptr'] as [
    width: 'u16',
    height: 'u16',
    hasMips: 'bool',
    numLayers: 'u16',
    format: 'u32',
    flags: 'u64',
    mem: 'ptr',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create texture with size based on back-buffer ratio. Texture will maintain ratio if back buffer resolution changes.
 *
 * C ref: `TextureHandle bgfx::createTexture2D(BackbufferRatio::Enum _ratio, bool _hasMips, uint16_t _numLayers, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE)`
 */
export const bgfx_create_texture_2d_scaled = {
  args: ['u32', 'bool', 'u16', 'u32', 'u64'] as [
    ratio: 'u32',
    hasMips: 'bool',
    numLayers: 'u16',
    format: 'u32',
    flags: 'u64',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Update 2D texture.
 *
 * C ref: `void bgfx::updateTexture2D(TextureHandle _handle, uint16_t _layer, uint8_t _mip, uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height, const Memory *_mem, uint16_t _pitch = UINT16_MAX)`
 */
export const bgfx_update_texture_2d = {
  args: ['u16', 'u16', 'u8', 'u16', 'u16', 'u16', 'u16', 'ptr', 'u16'] as [
    handle: 'u16',
    layer: 'u16',
    mip: 'u8',
    x: 'u16',
    y: 'u16',
    width: 'u16',
    height: 'u16',
    mem: 'ptr',
    pitch: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create 3D texture.
 *
 * C ref: `TextureHandle bgfx::createTexture3D(uint16_t _width, uint16_t _height, uint16_t _depth, bool _hasMips, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE, const Memory *_mem = NULL)`
 */
export const bgfx_create_texture_3d = {
  args: ['u16', 'u16', 'u16', 'bool', 'u32', 'u64', 'ptr'] as [
    width: 'u16',
    height: 'u16',
    depth: 'u16',
    hasMips: 'bool',
    format: 'u32',
    flags: 'u64',
    mem: 'ptr',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Update 3D texture.
 *
 * C ref: `void bgfx::updateTexture3D(TextureHandle _handle, uint8_t _mip, uint16_t _x, uint16_t _y, uint16_t _z, uint16_t _width, uint16_t _height, uint16_t _depth, const Memory *_mem)`
 */
export const bgfx_update_texture_3d = {
  args: ['u16', 'u8', 'u16', 'u16', 'u16', 'u16', 'u16', 'u16', 'ptr'] as [
    handle: 'u16',
    mip: 'u8',
    x: 'u16',
    y: 'u16',
    z: 'u16',
    width: 'u16',
    height: 'u16',
    depth: 'u16',
    mem: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create cube texture.
 *
 * C ref: `TextureHandle bgfx::createTextureCube(uint16_t _size, bool _hasMips, uint16_t _numLayers, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE, const Memory *_mem = NULL)`
 */
export const bgfx_create_texture_cube = {
  args: ['u16', 'bool', 'u16', 'u32', 'u64', 'ptr'] as [
    size: 'u16',
    hasMips: 'bool',
    numLayers: 'u16',
    format: 'u32',
    flags: 'u64',
    mem: 'ptr',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Update cube texture.
 *
 * C ref: `void bgfx::updateTextureCube(TextureHandle _handle, uint16_t _layer, uint8_t _side, uint8_t _mip, uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height, const Memory *_mem, uint16_t _pitch = UINT16_MAX)`
 */
export const bgfx_update_texture_cube = {
  args: [
    'u16',
    'u16',
    'u8',
    'u8',
    'u16',
    'u16',
    'u16',
    'u16',
    'ptr',
    'u16',
  ] as [
    handle: 'u16',
    layer: 'u16',
    side: 'u8',
    mip: 'u8',
    x: 'u16',
    y: 'u16',
    width: 'u16',
    height: 'u16',
    mem: 'ptr',
    pitch: 'u16',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Read back texture content.
 *
 * C ref: `uint32_t bgfx::readTexture(TextureHandle _handle, void *_data, uint8_t _mip = 0)`
 */
export const bgfx_read_texture = {
  args: ['u16', 'ptr', 'u8'] as [handle: 'u16', data: 'ptr', mip: 'u8'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Returns texture direct access pointer.
 *
 * C ref: `void *bgfx::getDirectAccessPtr(TextureHandle _handle)`
 */
export const bgfx_get_direct_access_ptr = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Destroy texture.
 *
 * C ref: `void bgfx::destroy(TextureHandle _handle)`
 */
export const bgfx_destroy_texture = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Init attachment.
 *
 * C ref: `void init(TextureHandle _handle, Access::Enum _access = Access::Write, uint16_t _layer = 0, uint16_t _numLayers = 1, uint16_t _mip = 0, uint8_t _resolve = BGFX_RESOLVE_AUTO_GEN_MIPS)`
 */
export const bgfx_attachment_init = {
  args: ['u16', 'ptr', 'u32', 'u16', 'u16', 'u16', 'u8'] as [
    handle: 'u16',
    mem: 'ptr',
    access: 'u32',
    layer: 'u16',
    numLayers: 'u16',
    mip: 'u16',
    resolve: 'u8',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Validate frame buffer parameters.
 *
 * C ref: `bool bgfx::isFrameBufferValid(uint8_t _num, const Attachment *_attachment)`
 */
export const bgfx_is_frame_buffer_valid = {
  args: ['u8', 'ptr'] as [num: 'u8', attachment: 'ptr'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Create frame buffer (simple).
 *
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(uint16_t _width, uint16_t _height, TextureFormat::Enum _format, uint64_t _textureFlags = BGFX_SAMPLER_U_CLAMP | BGFX_SAMPLER_V_CLAMP)`
 */
export const bgfx_create_frame_buffer = {
  args: ['u16', 'u16', 'u32', 'u64'] as [
    width: 'u16',
    height: 'u16',
    format: 'u32',
    textureFlags: 'u64',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create frame buffer with size based on back-buffer ratio. Frame buffer will maintain ratio if back buffer resolution changes.
 *
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(BackbufferRatio::Enum _ratio, TextureFormat::Enum _format, uint64_t _textureFlags = BGFX_SAMPLER_U_CLAMP | BGFX_SAMPLER_V_CLAMP)`
 */
export const bgfx_create_frame_buffer_scaled = {
  args: ['u32', 'u32', 'u64'] as [
    ratio: 'u32',
    format: 'u32',
    textureFlags: 'u64',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create MRT frame buffer from texture handles (simple).
 *
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(uint8_t _num, const TextureHandle *_handles, bool _destroyTextures = false)`
 */
export const bgfx_create_frame_buffer_from_handles = {
  args: ['u8', 'u16', 'bool'] as [
    num: 'u8',
    handles: 'u16',
    destroyTextures: 'bool',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create frame buffer for multiple window rendering.
 *
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(void *_nwh, uint16_t _width, uint16_t _height, TextureFormat::Enum _format = TextureFormat::Count, TextureFormat::Enum _depthFormat = TextureFormat::Count)`
 */
export const bgfx_create_frame_buffer_from_nwh = {
  args: ['ptr', 'u16', 'u16', 'u32', 'u32'] as [
    nwh: 'ptr',
    width: 'u16',
    height: 'u16',
    format: 'u32',
    depthFormat: 'u32',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Create MRT frame buffer from texture handles with specific layer and mip level.
 *
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(uint8_t _num, const Attachment *_attachment, bool _destroyTextures = false)`
 */
export const bgfx_create_frame_buffer_from_attachment = {
  args: ['u8', 'ptr', 'bool'] as [
    num: 'u8',
    attachment: 'ptr',
    destroyTextures: 'bool',
  ],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Obtain texture handle of frame buffer attachment.
 *
 * C ref: `TextureHandle bgfx::getTexture(FrameBufferHandle _handle, uint8_t _attachment = 0)`
 */
export const bgfx_get_texture = {
  args: ['u16', 'u8'] as [handle: 'u16', attachment: 'u8'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Set frame buffer debug name.
 *
 * C ref: `void bgfx::setName(FrameBufferHandle _handle, const char *_name, int32_t _len = INT32_MAX)`
 */
export const bgfx_set_frame_buffer_name = {
  args: ['u16', 'cstring', 'i32'] as [
    handle: 'u16',
    name: 'cstring',
    len: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy frame buffer.
 *
 * C ref: `void bgfx::destroy(FrameBufferHandle _handle)`
 */
export const bgfx_destroy_frame_buffer = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns number of requested or maximum available instance buffer slots.
 *
 * C ref: `uint32_t bgfx::getAvailInstanceDataBuffer(uint32_t _num, uint16_t _stride)`
 */
export const bgfx_get_avail_instance_data_buffer = {
  args: ['u32', 'u16'] as [num: 'u32', stride: 'u16'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Allocate instance data buffer.
 *
 * C ref: `void bgfx::allocInstanceDataBuffer(InstanceDataBuffer *_idb, uint32_t _num, uint16_t _stride)`
 */
export const bgfx_alloc_instance_data_buffer = {
  args: ['ptr', 'u32', 'u16'] as [idb: 'ptr', num: 'u32', stride: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create draw indirect buffer.
 *
 * C ref: `IndirectBufferHandle bgfx::createIndirectBuffer(uint32_t _num)`
 */
export const bgfx_create_indirect_buffer = {
  args: ['u32'] as [num: 'u32'],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Destroy draw indirect buffer.
 *
 * C ref: `void bgfx::destroy(IndirectBufferHandle _handle)`
 */
export const bgfx_destroy_indirect_buffer = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create occlusion query.
 *
 * C ref: `OcclusionQueryHandle bgfx::createOcclusionQuery()`
 */
export const bgfx_create_occlusion_query = {
  args: [],
  returns: 'u16',
} as const satisfies FFIFunction;

/**
 * Retrieve occlusion query result from previous frame.
 *
 * C ref: `OcclusionQueryResult::Enum bgfx::getResult(OcclusionQueryHandle _handle, int32_t *_result = NULL)`
 */
export const bgfx_get_result = {
  args: ['u16', 'ptr'] as [handle: 'u16', result: 'ptr'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Destroy occlusion query.
 *
 * C ref: `void bgfx::destroy(OcclusionQueryHandle _handle)`
 */
export const bgfx_destroy_occlusion_query = {
  args: ['u16'] as [handle: 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;
