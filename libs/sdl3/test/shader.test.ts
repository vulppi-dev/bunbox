import { wgsl_to_msl_bin, wgsl_to_spirv_bin } from '$libs';

// --- shaders (minimal; const color) ---
const VS_WGSL = `
@vertex fn main(@builtin(vertex_index) i:u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>,3>( vec2(-0.6,-0.6), vec2(0.6,-0.6), vec2(0.0,0.6) );
  return vec4(p[i], 0.0, 1.0);
}`;
const FS_WGSL = `
@fragment fn main() -> @location(0) vec4<f32> {
  return vec4(1.0, 0.55, 0.2, 1.0);
}`;

const vsm = wgsl_to_msl_bin(VS_WGSL, 'vertex', 'main');
const vss = wgsl_to_spirv_bin(VS_WGSL, 'vertex', 'main');
const fsm = wgsl_to_msl_bin(FS_WGSL, 'fragment', 'main');
const fss = wgsl_to_spirv_bin(FS_WGSL, 'fragment', 'main');

await Bun.write('./.shader/vs.msl', vsm);
await Bun.write('./.shader/fs.msl', fsm);
await Bun.write('./.shader/vs.spv', vss);
await Bun.write('./.shader/fs.spv', fss);
