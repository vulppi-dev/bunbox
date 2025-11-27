#[repr(u32)]
pub enum EngineResult {
    Success = 0,
    UnknownError,
    GlfwInitError,
    WgpuInstanceError,
}
