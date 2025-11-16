struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
}

@group(0) @binding(0)
var cameraSampler: sampler;

@group(0) @binding(1)
var cameraTexture: texture_2d<f32>;

@vertex
fn vs_main(@builtin(vertex_index) vi: u32) -> VertexOutput {
  var out: VertexOutput;
  let positions = array<vec2<f32>, 4>(vec2<f32>(- 1.0, - 1.0), vec2<f32>(1.0, - 1.0), vec2<f32>(- 1.0, 1.0), vec2<f32>(1.0, 1.0));
  let uvs = array<vec2<f32>, 4>(vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 0.0), vec2<f32>(0.0, 1.0), vec2<f32>(1.0, 1.0));

  out.position = vec4<f32>(positions[vi], 0.0, 1.0);
  out.uv = uvs[vi];

  return out;
}

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(cameraTexture, cameraSampler, uv);
}
