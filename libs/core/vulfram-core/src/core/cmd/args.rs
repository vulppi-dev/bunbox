use serde::Deserialize;

use crate::core::units::{IVector2, Size};

// MARK: Window

fn window_size_default() -> Size {
    [800, 600]
}

#[derive(Debug, Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct CmdWindowCreateArgs {
    pub title: String,
    #[serde(default = "window_size_default")]
    pub size: Size,
    pub pos: IVector2,
    pub borderless: bool,
    pub resizable: bool,
    pub always_on_top: bool,
    pub initial_state: String,
}
