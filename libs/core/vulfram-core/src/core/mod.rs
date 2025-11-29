use once_cell::sync::OnceCell;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use std::thread::{self, ThreadId};
use winit::application::ApplicationHandler;
use winit::event::WindowEvent;
use winit::event_loop::{ActiveEventLoop, EventLoop};
use winit::window::{Window, WindowId};

pub mod cmd;
pub mod units;

#[derive(Debug)]
#[repr(u32)]
pub enum EngineResult {
    Success = 0,
    UnknownError = 1,
    NotInitialized,
    AlreadyInitialized,
    WrongThread,
    WinitInitEventLoopError = 1000,
    WgpuInstanceError = 2000,
    CmdInvalidCborError = 3000,
}

pub struct WindowState {
    pub id: WindowId,
    pub window: Arc<Window>,
    pub surface: wgpu::Surface<'static>,
    pub config: wgpu::SurfaceConfiguration,
}

pub struct EngineState {
    pub windows: HashMap<u32, WindowState>,
    pub buffers: HashMap<u64, Vec<u8>>,
    pub event_pool: HashSet<cmd::EngineBatchEvents>,

    pub event_loop: EventLoop<()>,
    pub wgpu: wgpu::Instance,
    pub device: Option<wgpu::Device>,
    pub queue: Option<wgpu::Queue>,
}

impl EngineState {
    pub fn new() -> Self {
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

        Self {
            windows: HashMap::new(),
            buffers: HashMap::new(),
            event_pool: HashSet::new(),
            event_loop: EventLoop::new().unwrap(),
            wgpu: wgpu_instance,
            device: None,
            queue: None,
        }
    }

    fn request_redraw(&self) {
        for window_state in self.windows.values() {
            window_state.window.request_redraw();
        }
    }
}

impl ApplicationHandler for EngineState {
    fn resumed(&mut self, _event_loop: &ActiveEventLoop) {
        // TODO: Insert events to engine event pool
    }

    fn window_event(
        &mut self,
        _event_loop: &ActiveEventLoop,
        _window_id: WindowId,
        _event: WindowEvent,
    ) {
        // TODO: Insert events to engine event pool
    }
}

thread_local! {
    static ENGINE_INSTANCE: RefCell<Option<EngineState>> = RefCell::new(None);
}
static MAIN_THREAD_ID: OnceCell<ThreadId> = OnceCell::new();

pub fn engine_init() -> EngineResult {
    let _ = env_logger::try_init();
    let current_id = thread::current().id();

    if let Err(_) = MAIN_THREAD_ID.set(current_id) {
        if MAIN_THREAD_ID.get().unwrap() != &current_id {
            return EngineResult::WrongThread;
        }
    }

    ENGINE_INSTANCE.with(|cell| {
        let mut opt = cell.borrow_mut();
        if opt.is_some() {
            EngineResult::AlreadyInitialized
        } else {
            *opt = Some(EngineState::new());
            EngineResult::Success
        }
    });

    EngineResult::Success
}

pub fn engine_dispose() -> EngineResult {
    let current_id = thread::current().id();

    if let Some(main_id) = MAIN_THREAD_ID.get() {
        if &current_id != main_id {
            return EngineResult::WrongThread;
        }
    } else {
        return EngineResult::NotInitialized;
    }

    ENGINE_INSTANCE.with(|cell| {
        let mut opt = cell.borrow_mut();
        *opt = None;
    });

    EngineResult::Success
}

pub fn with_engine<F, R>(f: F) -> Result<R, EngineResult>
where
    F: FnOnce(&EngineState) -> R,
{
    let current_id = thread::current().id();
    let main_id = MAIN_THREAD_ID.get().ok_or(EngineResult::NotInitialized)?;

    if &current_id != main_id {
        return Err(EngineResult::WrongThread);
    }

    ENGINE_INSTANCE.with(|cell| {
        let opt = cell.borrow();
        let engine = opt.as_ref().ok_or(EngineResult::NotInitialized)?;
        Ok(f(engine))
    })
}

pub fn with_engine_mut<F, R>(f: F) -> Result<R, EngineResult>
where
    F: FnOnce(&mut EngineState) -> R,
{
    let current_id = thread::current().id();
    let main_id = MAIN_THREAD_ID.get().ok_or(EngineResult::NotInitialized)?;

    if &current_id != main_id {
        return Err(EngineResult::WrongThread);
    }

    ENGINE_INSTANCE.with(|cell| {
        let mut opt = cell.borrow_mut();
        let engine = opt.as_mut().ok_or(EngineResult::NotInitialized)?;
        Ok(f(engine))
    })
}

pub fn engine_send_pool(ptr: *const u8, length: usize) -> EngineResult {
    let data = unsafe { std::slice::from_raw_parts(ptr, length).to_vec() };

    let batch = match serde_cbor::from_slice::<cmd::EngineBatchCmds>(&data) {
        Err(_e) => {
            return EngineResult::CmdInvalidCborError;
        }
        Ok(batch) => batch,
    };

    match with_engine_mut(|engine_state| cmd::engine_process_batch(engine_state, batch)) {
        Err(e) => return e,
        Ok(_) => EngineResult::Success,
    }
}

pub fn engine_receive_pool(out_ptr: *const u8, out_length: &usize) -> EngineResult {
    // TODO: If out_ptr is null, just set out_length to the required length and return Success
    // Otherwise, write the data to out_ptr (up to out_length) and set out_length to the actual length written

    EngineResult::Success
}

pub fn engine_upload_buffer(bfr_id: u64, bfr_ptr: *const u8, bfr_length: usize) -> EngineResult {
    EngineResult::Success
}

pub fn engine_download_buffer(bfr_id: u64, bfr_ptr: *const u8, bfr_length: &usize) -> EngineResult {
    EngineResult::Success
}

pub fn engine_tick(time: u64, delta_time: u32) -> EngineResult {
    match with_engine_mut(|engine| {
        engine.request_redraw();

        // ... lógica de atualização do engine ...
    }) {
        Err(e) => return e,
        Ok(_) => EngineResult::Success,
    }
}
