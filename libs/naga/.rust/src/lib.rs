use naga::valid::{Capabilities, ModuleInfo, ValidationFlags, Validator};
use naga::{Module, ShaderStage};
use naga::{back, front};
use wasm_bindgen::prelude::*;

/// Parse stage strings into Naga's ShaderStage.
/// Supported aliases: "vertex"/"vs", "fragment"/"fs", "compute"/"cs".
fn stage_from_str(s: &str) -> Result<ShaderStage, JsValue> {
    match s.to_ascii_lowercase().as_str() {
        "vertex" | "vs" => Ok(ShaderStage::Vertex),
        "fragment" | "fs" => Ok(ShaderStage::Fragment),
        "compute" | "cs" => Ok(ShaderStage::Compute),
        other => Err(JsValue::from_str(&format!("shader stage inválido: {other}"))),
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

/// Only validates WGSL (throws JS error if invalid).
#[wasm_bindgen]
pub fn validate_wgsl(wgsl: &str) -> Result<(), JsValue> {
    let _ = parse_and_validate(wgsl)?;
    Ok(())
}

/// WGSL -> SPIR-V (binary words -> LE bytes) for Vulkan.
#[wasm_bindgen]
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

/// WGSL -> MSL (text) for Metal (returned as UTF-8 bytes).
#[wasm_bindgen]
pub fn wgsl_to_msl_bin(wgsl: &str, stage: &str, entry: &str) -> Result<Box<[u8]>, JsValue> {
    let (module, info) = parse_and_validate(wgsl)?;
    let stage = stage_from_str(stage)?;

    let msl_opts = back::msl::Options::default();
    let mut pipeline = back::msl::PipelineOptions::default();
    pipeline.entry_point = Some((stage, entry.to_string()));

    let (msl_src, _ti) = back::msl::write_string(&module, &info, &msl_opts, &pipeline)
        .map_err(|e| JsValue::from_str(&format!("MSL error: {e:?}")))?;

    Ok(msl_src.into_bytes().into_boxed_slice())
}

/// WGSL -> HLSL (text) for DirectX (returned as UTF-8 bytes).
/// You can later compile this HLSL into DXIL using DXC (externally).
#[wasm_bindgen]
pub fn wgsl_to_hlsl_bin(wgsl: &str, stage: &str, entry: &str) -> Result<Box<[u8]>, JsValue> {
    use naga::back::hlsl as hlsl;

    let (module, info) = parse_and_validate(wgsl)?;
    let stage = stage_from_str(stage)?;

    // Configure HLSL backend options.
    // Tip: set SM 6.0 for D3D12; downgrade to 5.1/5.0 if targeting D3D11.
    let mut opts = hlsl::Options::default();
    opts.shader_model = hlsl::ShaderModel::V6_0;

    // Select the specific entry point to emit.
    let mut pipeline = hlsl::PipelineOptions::default();
    pipeline.entry_point = Some((stage, entry.to_string()));

    // Write HLSL into a String buffer using the Writer API.
    let mut out = String::new();
    let mut writer = hlsl::Writer::new(&mut out, &opts, &pipeline);

    // For most cases it's okay to omit the fragment linkage hint (None).
    // If you need vertex->fragment interface pruning, pass Some(FragmentEntryPoint).
    writer
        .write(&module, &info, None)
        .map_err(|e| JsValue::from_str(&format!("HLSL error: {e:?}")))?;

    Ok(out.into_bytes().into_boxed_slice())
}
