use serde::{Deserialize, Serialize};

#[repr(u32)]
pub enum EngineResult {
    Success = 0,
    UnknownError = 1,
    GlfwInitError = 1000,
    WgpuInstanceError = 2000,
    CmdInvalidCborError = 3000,
}

#[repr(u32)]
#[derive(Debug, Deserialize, Serialize)]
pub enum EngineWindowState {
    Minimized = 0,
    Maximized,
    Windowed,
    Fullscreen,
    WindowedFullscreen,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", content = "content", rename_all = "camelCase")]
pub enum EngineCmd {
    CreateWindow {
        title: String,
        width: u32,
        height: u32,
        x: u32,
        y: u32,
        borderless: bool,
        resizable: bool,
        opacity: f32,
        state: EngineWindowState,
        #[serde(rename = "alwaysOnTop")]
        always_on_top: bool,
    },
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content", rename_all = "camelCase")]
pub enum EngineEvent {
    CreateWindow { width: u32, height: u32 },
}

pub type EngineBatchCmds = Vec<EngineCmd>;

pub type EngineBatchEvents = Vec<EngineEvent>;
