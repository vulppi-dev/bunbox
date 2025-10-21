// Material helpers
// Creates a simple PBR-ish (Lambert) material using projection/world/model matrices,
// an array of point lights, and a flat surface color.
// Comments in English per repository guidelines.

import { Material } from '../elements';
import { Color } from '../math';

/** Options for createSimpleMaterial helper. */
export type SimpleMaterialOptions = {
  label?: string;
  color?: Color;
};

// Minimal, self-contained WGSL shader compatible with SDL GPU push-uniforms
// Note: WGSL doesn't have explicit push_constant syntax, but we use simple
// uniforms that match the push-uniform data layout expected by Window.ts
const SIMPLE_WGSL = /* wgsl */ `
struct VertexIn {
	@location(0) position : vec3<f32>,
	@location(1) normal   : vec3<f32>,
	@location(2) uv       : vec2<f32>,
};

struct VSOut {
	@builtin(position) Position : vec4<f32>,
	@location(0) vNormal : vec3<f32>,
	@location(1) vUV     : vec2<f32>,
};

// Vertex uniforms: projection(16) + view(16) + model(16) = 48 floats
struct VertexUniforms {
	projection : mat4x4<f32>,
	view : mat4x4<f32>,
	model : mat4x4<f32>,
};
@group(0) @binding(0) var<uniform> vu : VertexUniforms;

// Fragment uniforms: color(4) = 4 floats
struct FragmentUniforms {
	color : vec4<f32>,
};
@group(0) @binding(0) var<uniform> fu : FragmentUniforms;

@vertex
fn vs_main(input : VertexIn) -> VSOut {
	var out : VSOut;
	let worldPos = vu.model * vec4<f32>(input.position, 1.0);
	let viewPos = vu.view * worldPos;
	out.Position = vu.projection * viewPos;
	// Approximate normal transform (ignores non-uniform scale)
	out.vNormal = normalize((vu.model * vec4<f32>(input.normal, 0.0)).xyz);
	out.vUV = input.uv;
	return out;
}

@fragment
fn fs_main(input : VSOut) -> @location(0) vec4<f32> {
	return fu.color;
}
`;

/**
 * Create a simple material with flat color (no lighting).
 */
export function createSimpleMaterial(
  opts: SimpleMaterialOptions = {},
): Material {
  const m = new Material({
    shader: SIMPLE_WGSL,
    label: opts.label ?? 'SimpleMaterial',
    params: {
      color: opts.color ?? new Color(1, 1, 1, 1),
    },
  });
  return m;
}

export default {
  createSimpleMaterial,
};
