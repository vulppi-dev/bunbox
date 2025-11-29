use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};

pub mod args;

#[repr(u32)]
#[derive(Debug, Deserialize_repr, Serialize_repr)]
pub enum EngineWindowState {
    Minimized = 0,
    Maximized,
    Windowed,
    Fullscreen,
    WindowedFullscreen,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", content = "content", rename_all = "kebab-case")]
pub enum EngineCmd {
    CmdWindowCreate(args::CmdWindowCreateArgs),
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "content", rename_all = "kebab-case")]
pub enum EngineEvent {
    WindowCreated { id: u32 },
}

#[derive(Debug, Deserialize)]
pub struct EngineCmdEnvelope {
    pub id: u64,
    #[serde(flatten)]
    pub cmd: EngineCmd,
}

pub type EngineBatchCmds = Vec<EngineCmdEnvelope>;

pub type EngineBatchEvents = Vec<EngineEvent>;
