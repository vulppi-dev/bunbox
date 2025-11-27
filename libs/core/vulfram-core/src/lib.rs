mod core;

#[unsafe(no_mangle)]
pub extern "C" fn engine_init() -> u32 {
    let result = core::engine_init();
    result as u32
}

#[unsafe(no_mangle)]
pub extern "C" fn engine_dispose() -> u32 {
    let result = core::engine_dispose();
    result as u32
}
