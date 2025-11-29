use serde::{Deserialize, Serialize};
use serde_repr::{Deserialize_repr, Serialize_repr};

use crate::core::{EngineResult, EngineState};

pub mod args;

#[derive(Debug, Deserialize, Clone)]
#[serde(tag = "type", content = "content", rename_all = "kebab-case")]
pub enum EngineCmd {
    CmdWindowCreate(args::CmdWindowCreateArgs),
}

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type", content = "content", rename_all = "kebab-case")]
pub enum EngineEvent {
    WindowCreated { id: u32 },
}

#[derive(Debug, Deserialize, Clone)]
pub struct EngineCmdEnvelope {
    pub id: u64,
    #[serde(flatten)]
    pub cmd: EngineCmd,
}

pub type EngineBatchCmds = Vec<EngineCmdEnvelope>;

pub type EngineBatchEvents = Vec<EngineEvent>;

pub fn engine_process_batch(engine: &mut EngineState, batch: EngineBatchCmds) -> EngineResult {
    EngineResult::Success
}
