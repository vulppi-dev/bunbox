use naga::valid::{Capabilities, ModuleInfo, ValidationFlags, Validator};
use naga::{back, front};
use naga::{Module, ShaderStage};
use wasm_bindgen::prelude::*;

/// Parse stage strings into Naga's ShaderStage.
/// Supported aliases: "vertex"/"vs", "fragment"/"fs", "compute"/"cs".
fn stage_from_str(s: &str) -> Result<ShaderStage, JsValue> {
    match s.to_ascii_lowercase().as_str() {
        "vertex" | "vs" => Ok(ShaderStage::Vertex),
        "fragment" | "fs" => Ok(ShaderStage::Fragment),
        "compute" | "cs" => Ok(ShaderStage::Compute),
        other => Err(JsValue::from_str(&format!("invalid shader stage: {other}"))),
    }
}

/// WGSL -> Naga IR + validation.
fn parse_and_validate(wgsl: &str) -> Result<(Module, ModuleInfo), JsValue> {
    // WGSL -> IR
    let module =
        front::wgsl::parse_str(wgsl).map_err(|e| JsValue::from_str(&e.emit_to_string(wgsl)))?;
    // Validation
    let mut v = Validator::new(ValidationFlags::all(), Capabilities::all());
    let info = v
        .validate(&module)
        .map_err(|e| JsValue::from_str(&format!("{e:?}")))?;
    Ok((module, info))
}

/// Validates WGSL and returns true if valid, false otherwise.
#[wasm_bindgen(js_name = isWgslValid)]
pub fn is_wgsl_valid(wgsl: &str) -> bool {
    parse_and_validate(wgsl).is_ok()
}

/// Only validates WGSL (throws JS error if invalid).
#[wasm_bindgen(js_name = validateWgsl)]
pub fn validate_wgsl(wgsl: &str) -> Result<(), JsValue> {
    let _ = parse_and_validate(wgsl)?;
    Ok(())
}

/// WGSL -> SPIR-V (binary words -> LE bytes) for Vulkan.
#[wasm_bindgen(js_name = wgslToSpirvBin)]
pub fn wgsl_to_spirv_bin(wgsl: &str, stage: &str, entry: &str) -> Result<Box<[u8]>, JsValue> {
    let (module, info) = parse_and_validate(wgsl)?;
    let stage = stage_from_str(stage)?;

    let spv_opts = back::spv::Options::default();
    let pipeline = back::spv::PipelineOptions {
        shader_stage: stage,
        entry_point: entry.to_string(),
    };

    // naga 26.x: (&module, &info, &Options, Option<&PipelineOptions>)
    let words: Vec<u32> = back::spv::write_vec(&module, &info, &spv_opts, Some(&pipeline))
        .map_err(|e| JsValue::from_str(&format!("SPIR-V error: {e:?}")))?;

    // u32 words -> little-endian bytes
    let mut bytes = Vec::with_capacity(words.len() * 4);
    for w in words {
        bytes.extend_from_slice(&w.to_le_bytes());
    }
    Ok(bytes.into_boxed_slice())
}

/// SPIR-V binary -> disassembled text for debugging.
/// Takes SPIR-V bytes (little-endian) and returns human-readable assembly.
#[wasm_bindgen(js_name = spirvBinToText)]
pub fn spirv_bin_to_text(spirv_bytes: &[u8]) -> Result<String, JsValue> {
    // Validate length
    if spirv_bytes.len() % 4 != 0 {
        return Err(JsValue::from_str(
            "SPIR-V binary length must be multiple of 4",
        ));
    }

    // Parse SPIR-V binary directly from bytes
    let spv_opts = front::spv::Options::default();
    let module = front::spv::parse_u8_slice(spirv_bytes, &spv_opts)
        .map_err(|e| JsValue::from_str(&format!("SPIR-V parse error: {e:?}")))?;

    // Validate
    let mut validator = Validator::new(ValidationFlags::all(), Capabilities::all());
    let info = validator
        .validate(&module)
        .map_err(|e| JsValue::from_str(&format!("SPIR-V validation error: {e:?}")))?;

    // Convert back to WGSL for human-readable output
    let wgsl_opts = back::wgsl::WriterFlags::all();
    let wgsl_text = back::wgsl::write_string(&module, &info, wgsl_opts)
        .map_err(|e| JsValue::from_str(&format!("WGSL write error: {e:?}")))?;

    Ok(wgsl_text)
}
