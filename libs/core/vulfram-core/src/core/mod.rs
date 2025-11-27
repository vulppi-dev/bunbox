pub mod enums;
pub mod pointers;

pub fn engine_init() -> enums::EngineResult {
    // Try to initialize GLFW. If it fails, return immediately.
    let glfw = match glfw::init(glfw::fail_on_errors) {
        Err(_e) => {
            // TODO: push an error event into the engine's error/event pool
            return enums::EngineResult::GlfwInitError;
        }
        Ok(glfw) => glfw,
    };

    let wgpu_descriptor = wgpu::InstanceDescriptor {
        backends: if cfg!(target_os = "ios") || cfg!(target_os = "macos") {
            wgpu::Backends::METAL | wgpu::Backends::VULKAN
        } else {
            wgpu::Backends::DX12 | wgpu::Backends::VULKAN
        },
        backend_options: wgpu::BackendOptions::default(),
        flags: wgpu::InstanceFlags::empty(),
        memory_budget_thresholds: wgpu::MemoryBudgetThresholds::default(),
    };

    let wgpu_instance = wgpu::Instance::new(&wgpu_descriptor);

    unsafe {
        pointers::GLFW_INSTANCE = Some(glfw);
        pointers::WGPU_INSTANCE = Some(wgpu_instance);
    }
    enums::EngineResult::Success
}

pub fn engine_dispose() -> enums::EngineResult {
    unsafe {
        pointers::GLFW_INSTANCE = None;
        pointers::WGPU_INSTANCE = None;
    }
    enums::EngineResult::Success
}

pub fn engine_send_pool(ptr: *const u8, length: usize) -> enums::EngineResult {
    let data = unsafe { std::slice::from_raw_parts(ptr, length).to_vec() };

    let batch = match serde_cbor::from_slice::<enums::EngineBatchCmds>(&data) {
        Err(_e) => {
            return enums::EngineResult::CmdInvalidCborError;
        }
        Ok(batch) => batch,
    };

    for cmd in batch {
        match cmd {
            enums::EngineCmd::CreateWindow {
                title,
                width,
                height,
                x,
                y,
                borderless,
                resizable,
                opacity,
                state,
                always_on_top,
            } => {
                print!(
                    "Creating window: '{}' ({}x{}) at ({},{}) Borderless: {} Resizable: {} Opacity: {} State: {:?} AlwaysOnTop: {}\n",
                    title,
                    width,
                    height,
                    x,
                    y,
                    borderless,
                    resizable,
                    opacity,
                    state,
                    always_on_top
                );
            }
        }
    }

    enums::EngineResult::Success
}

pub fn engine_receive_pool(out_ptr: *const u8, out_length: usize) -> enums::EngineResult {
    enums::EngineResult::Success
}

pub fn engine_upload_buffer(
    bfr_id: u64,
    bfr_ptr: *const u8,
    bfr_length: usize,
) -> enums::EngineResult {
    enums::EngineResult::Success
}

pub fn engine_download_buffer(
    bfr_id: u64,
    bfr_ptr: *const u8,
    bfr_length: usize,
) -> enums::EngineResult {
    enums::EngineResult::Success
}
