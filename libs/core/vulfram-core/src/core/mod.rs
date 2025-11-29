use once_cell::sync::OnceCell;
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::Arc;
use std::thread::{self, ThreadId};
use winit::application::ApplicationHandler;
use winit::event::WindowEvent;
use winit::event_loop::{ActiveEventLoop, ControlFlow, EventLoop};
use winit::platform::pump_events::EventLoopExtPumpEvents;
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
    BufferOverflow,
    // Reserved error codes for Winit 1000-1999
    WinitError = 1000,
    // Reserved error codes for WGPU 2000-2999
    WgpuInstanceError = 2000,
    // Reserved error codes for Command Processing 3000-3999
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
    pub window_id_map: HashMap<WindowId, u32>,
    pub buffers: HashMap<u64, Vec<u8>>,
    pub event_queue: cmd::EngineBatchEvents,

    pub wgpu: wgpu::Instance,
    pub device: Option<wgpu::Device>,
    pub queue: Option<wgpu::Queue>,

    pub time: u64,
    pub delta_time: u32,
}

pub struct Engine {
    pub state: EngineState,
    pub event_loop: EventLoop<()>,
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
            window_id_map: HashMap::new(),
            buffers: HashMap::new(),
            event_queue: Vec::new(),
            wgpu: wgpu_instance,
            device: None,
            queue: None,
            time: 0,
            delta_time: 0,
        }
    }

    fn request_redraw(&self) {
        for window_state in self.windows.values() {
            window_state.window.request_redraw();
        }
    }
}

impl Engine {
    pub fn new() -> Self {
        Self {
            state: EngineState::new(),
            event_loop: EventLoop::new().unwrap(),
        }
    }
}

impl ApplicationHandler for EngineState {
    fn resumed(&mut self, _event_loop: &ActiveEventLoop) {
        // TODO: Insert events to engine event queue
    }

    fn window_event(
        &mut self,
        _event_loop: &ActiveEventLoop,
        _window_id: WindowId,
        _event: WindowEvent,
    ) {
        // TODO: Insert events to engine event queue
    }
}

thread_local! {
    static ENGINE_INSTANCE: RefCell<Option<Engine>> = RefCell::new(None);
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
            *opt = Some(Engine::new());
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
        Ok(f(&mut engine.state))
    })
}

fn with_engine_full<F, R>(f: F) -> Result<R, EngineResult>
where
    F: FnOnce(&mut Engine) -> R,
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

    match with_engine(|engine_state| cmd::engine_process_batch(engine_state, batch)) {
        Err(e) => return e,
        Ok(_) => EngineResult::Success,
    }
}

pub fn engine_receive_pool(out_ptr: *mut u8, out_length: *mut usize) -> EngineResult {
    match with_engine(|engine| {
        let serialized = match serde_cbor::to_vec(&engine.event_queue) {
            Ok(data) => data,
            Err(_) => return EngineResult::UnknownError,
        };

        let required_length = serialized.len();

        unsafe {
            if out_ptr.is_null() {
                *out_length = required_length;
                return EngineResult::Success;
            }

            let available_length = *out_length;

            if required_length <= available_length {
                std::ptr::copy_nonoverlapping(serialized.as_ptr(), out_ptr, required_length);
                *out_length = required_length;
                engine.event_queue.clear();
                return EngineResult::Success;
            } else {
                *out_length = required_length;
                return EngineResult::BufferOverflow;
            }
        }
    }) {
        Err(e) => e,
        Ok(result) => result,
    }
}

pub fn engine_upload_buffer(bfr_id: u64, bfr_ptr: *const u8, bfr_length: usize) -> EngineResult {
    let data = unsafe { std::slice::from_raw_parts(bfr_ptr, bfr_length).to_vec() };

    match with_engine(|engine| {
        engine.buffers.insert(bfr_id, data);
    }) {
        Err(e) => e,
        Ok(_) => EngineResult::Success,
    }
}

pub fn engine_download_buffer(
    bfr_id: u64,
    bfr_ptr: *mut u8,
    bfr_length: *mut usize,
) -> EngineResult {
    match with_engine(|engine| {
        let buffer = match engine.buffers.get(&bfr_id) {
            Some(buf) => buf,
            None => return EngineResult::UnknownError,
        };

        let required_length = buffer.len();

        unsafe {
            if bfr_ptr.is_null() {
                *bfr_length = required_length;
                return EngineResult::Success;
            }

            let available_length = *bfr_length;

            if required_length <= available_length {
                std::ptr::copy_nonoverlapping(buffer.as_ptr(), bfr_ptr, required_length);
                *bfr_length = required_length;
                return EngineResult::Success;
            } else {
                *bfr_length = required_length;
                return EngineResult::BufferOverflow;
            }
        }
    }) {
        Err(e) => e,
        Ok(result) => result,
    }
}

pub fn engine_clear_buffer(bfr_id: u64) -> EngineResult {
    match with_engine(|engine| {
        engine.buffers.remove(&bfr_id);
    }) {
        Err(e) => return e,
        Ok(_) => EngineResult::Success,
    }
}

pub fn engine_tick(time: u64, delta_time: u32) -> EngineResult {
    match with_engine_full(|engine| {
        engine.state.time = time;
        engine.state.delta_time = delta_time;

        engine.event_loop.set_control_flow(ControlFlow::Poll);
        engine.event_loop.pump_app_events(None, &mut engine.state);

        engine.state.request_redraw();
    }) {
        Err(e) => e,
        Ok(_) => EngineResult::Success,
    }
}
