import type { FFIFunction } from 'bun:ffi';

// BGFX MARK: Init

/**
 * Initialize the bgfx library.
 *
 * C ref: `bool bgfx::init (const bgfx_init_t * _init)`
 */
export const bgfx_init = {
  args: ['ptr'],
  returns: 'bool',
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
 * C ref: `void bgfx::reset (uint32_t _width, uint32_t _height, uint32_t _flags, TextureFormat::Enum _format)`
 */
export const bgfx_reset = {
  args: ['u32', 'u32', 'u32', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Advance to next frame. When using multithreaded renderer, this call just swaps internal buffers, kicks render thread, and returns.
 *
 * C ref: `uint32_t bgfx::frame (bool _capture)`
 */
export const bgfx_frame = {
  args: ['bool'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Set debug flags.
 *
 * C ref: `void bgfx::setDebug(uint32_t _debug)`
 */
export const bgfx_setDebug = {
  args: ['u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Clear internal debug text buffer.
 *
 * C ref: `void bgfx::dbgTextClear(uint8_t _attr = 0, bool _small = false)`
 */
export const bgfx_dbgTextClear = {
  args: ['u8', 'bool'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Print into internal debug text character-buffer (VGA-compatible text mode).
 *
 * C ref: `void bgfx::dbgTextPrintf(uint16_t _x, uint16_t _y, uint8_t _attr, const char* _format, ...)`
 */
export const bgfx_dbgTextPrintf = {
  args: ['u16', 'u16', 'u8', 'cstring', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Print into internal debug text character-buffer (VGA-compatible text mode).
 *
 * C ref: `void bgfx::dbgTextPrintfVargs(uint16_t _x, uint16_t _y, uint8_t _attr, const char *_format, va_list _argList)`
 */
export const bgfx_dbgTextPrintfVargs = {
  args: ['u16', 'u16', 'u8', 'cstring', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draw image into internal debug text buffer.
 *
 * C ref: `void bgfx::dbgTextImage(uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height, const void *_data, uint16_t _pitch)`
 */
export const bgfx_dbgTextImage = {
  args: ['u16', 'u16', 'u16', 'u16', 'ptr', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns supported backend API renderers.
 *
 * C ref: `uint8_t bgfx::getSupportedRenderers(uint8_t _max = 0, RendererType::Enum *_enum = NULL)`
 */
export const bgfx_getSupportedRenderers = {
  args: ['u8', 'ptr'],
  returns: 'u8',
} as const satisfies FFIFunction;

/**
 * Returns current renderer backend API type.
 *
 * C ref: `RendererType::Enum bgfx::getRendererType()`
 */
export const bgfx_getRendererType = {
  args: [],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Returns renderer capabilities.
 *
 * C ref: `const Caps* bgfx::getCaps()`
 */
export const bgfx_getCaps = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns performance counters.
 *
 * C ref: `const Stats *bgfx::getStats()`
 */
export const bgfx_getStats = {
  args: [],
  returns: 'ptr',
};

/**
 * Render frame.
 *
 * C ref: `RenderFrame::Enum bgfx::renderFrame(int32_t _msecs = -1)`
 */
export const bgfx_renderFrame = {
  args: ['i32'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Set platform data.
 *
 * C ref: `void bgfx::setPlatformData(const PlatformData &_data)`
 */
export const bgfx_setPlatformData = {
  args: ['ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Get internal data for interop.
 *
 * C ref: `const InternalData *bgfx::getInternalData()`
 */
export const bgfx_getInternalData = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Override internal texture with externally created texture. Previously created internal texture will released.
 *
 * C ref: `uintptr_t bgfx::overrideInternal(TextureHandle _handle, uintptr_t _ptr)`
 * C ref: `uintptr_t bgfx::overrideInternal(TextureHandle _handle, uint16_t _width, uint16_t _height, uint8_t _numMips, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE)`
 */
export const bgfx_overrideInternal = {
  args: ['ptr', 'u64'],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Pack vertex attribute into vertex stream format.
 *
 * C ref: `void bgfx::vertexPack(const float _input[4], bool _inputNormalized, Attrib::Enum _attr, const VertexLayout &_layout, void *_data, uint32_t _index = 0)`
 */
export const bgfx_vertexPack = {
  args: ['ptr', 'bool', 'u32', 'ptr', 'ptr', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create empty dynamic vertex buffer.
 *
 * C ref: `DynamicVertexBufferHandle bgfx::createDynamicVertexBuffer(uint32_t _num, const VertexLayout &_layout, uint16_t _flags = BGFX_BUFFER_NONE)`
 * C ref: `DynamicVertexBufferHandle bgfx::createDynamicVertexBuffer(const Memory *_mem, const VertexLayout &_layout, uint16_t _flags = BGFX_BUFFER_NONE)`
 */
export const bgfx_createDynamicVertexBuffer = {
  args: ['u32', 'ptr', 'u16'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Update dynamic vertex buffer.
 *
 * C ref: `void bgfx::update(DynamicVertexBufferHandle _handle, uint32_t _startVertex, const Memory *_mem)`
 * C ref: `void bgfx::update(DynamicIndexBufferHandle _handle, uint32_t _startIndex, const Memory *_mem)`
 */
export const bgfx_update = {
  args: ['ptr', 'u32', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroy dynamic vertex buffer.
 *
 * C ref: `void bgfx::destroy(DynamicVertexBufferHandle _handle)`
 * C ref: `void bgfx::destroy(TextureHandle _handle)`
 * C ref: `void bgfx::destroy(IndexBufferHandle _handle)`
 * C ref: `void bgfx::destroy(DynamicIndexBufferHandle _handle)`
 * C ref: `void bgfx::destroy(FrameBufferHandle _handle)`
 * C ref: `void bgfx::destroy(IndirectBufferHandle _handle)`
 * C ref: `void bgfx::destroy(OcclusionQueryHandle _handle)`
 */
export const bgfx_destroy = {
  args: ['ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns number of requested or maximum available vertices.
 *
 * C ref: `uint32_t bgfx::getAvailTransientVertexBuffer(uint32_t _num, const VertexLayout &_layout)`
 */
export const bgfx_getAvailTransientVertexBuffer = {
  args: ['u32', 'ptr'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Allocates transient vertex buffer.
 *
 * C ref: `void bgfx::allocTransientVertexBuffer(TransientVertexBuffer *_tvb, uint32_t _num, const VertexLayout &_layout)`
 */
export const bgfx_allocTransientVertexBuffer = {
  args: ['ptr', 'u32', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Creates index buffer.
 *
 * C ref: `IndexBufferHandle bgfx::createIndexBuffer(const Memory *_mem, uint16_t _flags = BGFX_BUFFER_NONE)`
 */
export const bgfx_createIndexBuffer = {
  args: ['ptr', 'u16'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Set static index buffer debug name.
 *
 * C ref: `void bgfx::setName(IndexBufferHandle _handle, const char *_name, int32_t _len = INT32_MAX)`
 * C ref: `void bgfx::setName(FrameBufferHandle _handle, const char *_name, int32_t _len = INT32_MAX)`
 */
export const bgfx_setName = {
  args: ['ptr', 'cstring', 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create empty dynamic index buffer.
 *
 * C ref: `DynamicIndexBufferHandle bgfx::createDynamicIndexBuffer(uint32_t _num, uint16_t _flags = BGFX_BUFFER_NONE)`
 * C ref: `DynamicIndexBufferHandle bgfx::createDynamicIndexBuffer(const Memory *_mem, uint16_t _flags = BGFX_BUFFER_NONE)`
 */
export const bgfx_createDynamicIndexBuffer = {
  args: ['u32', 'u16'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns number of requested or maximum available indices.
 *
 * C ref: `uint32_t bgfx::getAvailTransientIndexBuffer(uint32_t _num, bool _index32 = false)`
 */
export const bgfx_getAvailTransientIndexBuffer = {
  args: ['u32', 'bool'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Allocates transient index buffer.
 *
 * C ref: `void bgfx::allocTransientIndexBuffer(TransientIndexBuffer *_tib, uint32_t _num, bool _index32 = false)`
 */
export const bgfx_allocTransientIndexBuffer = {
  args: ['ptr', 'u32', 'bool'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Validate texture parameters.
 *
 * C ref: `bool bgfx::isTextureValid(uint16_t _depth, bool _cubeMap, uint16_t _numLayers, TextureFormat::Enum _format, uint64_t _flags)`
 */
export const bgfx_isTextureValid = {
  args: ['u16', 'bool', 'u16', 'u32', 'u64'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Calculate amount of memory required for texture.
 *
 * C ref: `void bgfx::calcTextureSize(TextureInfo &_info, uint16_t _width, uint16_t _height, uint16_t _depth, bool _cubeMap, bool _hasMips, uint16_t _numLayers, TextureFormat::Enum _format)`
 */
export const bgfx_calcTextureSize = {
  args: ['ptr', 'u16', 'u16', 'u16', 'bool', 'bool', 'u16', 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create texture from memory buffer.
 *
 * C ref: `TextureHandle bgfx::createTexture(const Memory *_mem, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE, uint8_t _skip = 0, TextureInfo *_info = NULL)`
 */
export const bgfx_createTexture = {
  args: ['ptr', 'u64', 'u8', 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Create 2D texture.
 *
 * C ref: `TextureHandle bgfx::createTexture2D(uint16_t _width, uint16_t _height, bool _hasMips, uint16_t _numLayers, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE, const Memory *_mem = NULL)`
 * C ref: `TextureHandle bgfx::createTexture2D(BackbufferRatio::Enum _ratio, bool _hasMips, uint16_t _numLayers, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE)`
 */
export const bgfx_createTexture2D = {
  args: ['u16', 'u16', 'bool', 'u16', 'u32', 'u64', 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Update 2D texture.
 *
 * C ref: `void bgfx::updateTexture2D(TextureHandle _handle, uint16_t _layer, uint8_t _mip, uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height, const Memory *_mem, uint16_t _pitch = UINT16_MAX)`
 */
export const bgfx_updateTexture2D = {
  args: ['ptr', 'u16', 'u8', 'u16', 'u16', 'u16', 'u16', 'ptr', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create 3D texture.
 *
 * C ref: `TextureHandle bgfx::createTexture3D(uint16_t _width, uint16_t _height, uint16_t _depth, bool _hasMips, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE, const Memory *_mem = NULL)`
 */
export const bgfx_createTexture3D = {
  args: ['u16', 'u16', 'u16', 'bool', 'u32', 'u64', 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Update 3D texture.
 *
 * C ref: `void bgfx::updateTexture3D(TextureHandle _handle, uint8_t _mip, uint16_t _x, uint16_t _y, uint16_t _z, uint16_t _width, uint16_t _height, uint16_t _depth, const Memory *_mem)`
 */
export const bgfx_updateTexture3D = {
  args: ['ptr', 'u8', 'u16', 'u16', 'u16', 'u16', 'u16', 'u16', 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create cube texture.
 *
 * C ref: `TextureHandle bgfx::createTextureCube(uint16_t _size, bool _hasMips, uint16_t _numLayers, TextureFormat::Enum _format, uint64_t _flags = BGFX_TEXTURE_NONE | BGFX_SAMPLER_NONE, const Memory *_mem = NULL)`
 */
export const bgfx_createTextureCube = {
  args: ['u16', 'bool', 'u16', 'u32', 'u64', 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Update cube texture.
 *
 * C ref: `void bgfx::updateTextureCube(TextureHandle _handle, uint16_t _layer, uint8_t _side, uint8_t _mip, uint16_t _x, uint16_t _y, uint16_t _width, uint16_t _height, const Memory *_mem, uint16_t _pitch = UINT16_MAX)`
 */
export const bgfx_updateTextureCube = {
  args: ['ptr', 'u16', 'u8', 'u8', 'u16', 'u16', 'u16', 'u16', 'ptr', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Read back texture content.
 *
 * C ref: `uint32_t bgfx::readTexture(TextureHandle _handle, void *_data, uint8_t _mip = 0)`
 */
export const bgfx_readTexture = {
  args: ['ptr', 'ptr', 'u8'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Returns texture direct access pointer.
 *
 * C ref: `void *bgfx::getDirectAccessPtr(TextureHandle _handle)`
 */
export const bgfx_getDirectAccessPtr = {
  args: ['ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Validate frame buffer parameters.
 *
 * C ref: ´bool bgfx::isFrameBufferValid(uint8_t _num, const Attachment *_attachment)`
 */
export const bgfx_isFrameBufferValid = {
  args: ['u8', 'ptr'],
  returns: 'bool',
} as const satisfies FFIFunction;

/**
 * Create frame buffer (simple).
 *
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(uint16_t _width, uint16_t _height, TextureFormat::Enum _format, uint64_t _textureFlags = BGFX_SAMPLER_U_CLAMP | BGFX_SAMPLER_V_CLAMP)`
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(BackbufferRatio::Enum _ratio, TextureFormat::Enum _format, uint64_t _textureFlags = BGFX_SAMPLER_U_CLAMP | BGFX_SAMPLER_V_CLAMP)`
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(uint8_t _num, const TextureHandle *_handles, bool _destroyTextures = false)`
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(void *_nwh, uint16_t _width, uint16_t _height, TextureFormat::Enum _format = TextureFormat::Count, TextureFormat::Enum _depthFormat = TextureFormat::Count)`
 * C ref: `FrameBufferHandle bgfx::createFrameBuffer(uint8_t _num, const Attachment *_attachment, bool _destroyTextures = false)`
 */
export const bgfx_createFrameBuffer = {
  args: ['u16', 'u16', 'u32', 'u64'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Obtain texture handle of frame buffer attachment.
 *
 * C ref: `TextureHandle bgfx::getTexture(FrameBufferHandle _handle, uint8_t _attachment = 0)`
 */
export const bgfx_getTexture = {
  args: ['ptr', 'u8'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns number of requested or maximum available instance buffer slots.
 *
 * C ref: `uint32_t bgfx::getAvailInstanceDataBuffer(uint32_t _num, uint16_t _stride)`
 */
export const bgfx_getAvailInstanceDataBuffer = {
  args: ['u32', 'u16'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Allocate instance data buffer.
 *
 * C ref: `void bgfx::allocInstanceDataBuffer(InstanceDataBuffer *_idb, uint32_t _num, uint16_t _stride)`
 */
export const bgfx_allocInstanceDataBuffer = {
  args: ['ptr', 'u32', 'u16'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create draw indirect buffer.
 *
 * C ref: ´IndirectBufferHandle bgfx::createIndirectBuffer(uint32_t _num)`
 */
export const bgfx_createIndirectBuffer = {
  args: ['u32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Create occlusion query.
 *
 * C ref: `OcclusionQueryHandle bgfx::createOcclusionQuery()`
 */
export const bgfx_createOcclusionQuery = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Retrieve occlusion query result from previous frame.
 *
 * C ref: `OcclusionQueryResult::Enum bgfx::getResult(OcclusionQueryHandle _handle, int32_t *_result = NULL)`
 */
export const bgfx_getResult = {
  args: ['ptr', 'ptr'],
  returns: 'u32',
} as const satisfies FFIFunction;
