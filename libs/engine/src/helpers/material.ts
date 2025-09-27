// Material helpers
// Creates a simple PBR-ish (Lambert) material using projection/world/model matrices,
// an array of point lights, and a flat surface color.
// Comments in English per repository guidelines.

import { Material } from '../elements';
import { Color } from '../math';

export type SimpleMaterialOptions = {
  label?: string;
  color?: Color;
};

// Minimal, self-contained WGSL shader that validates and can be used by a simple forward pass
const SIMPLE_WGSL = /* wgsl */ `
struct Matrices {
	projection : mat4x4<f32>,
	world      : mat4x4<f32>,
	model      : mat4x4<f32>,
};
@group(0) @binding(0) var<uniform> matrices : Matrices;

struct Light {
	position : vec3<f32>,
	intensity: f32,
	color    : vec3<f32>,
	_pad0    : f32,
};
struct Lights {
	items : array<Light>,
};
@group(0) @binding(1) var<storage, read> lights : Lights;

struct MaterialParams {
	color      : vec4<f32>,
	lightCount : u32,
	_padA      : vec3<u32>,
};
@group(0) @binding(2) var<uniform> material : MaterialParams;

struct VertexIn {
	@location(0) position : vec3<f32>,
	@location(1) normal   : vec3<f32>,
	@location(2) uv       : vec2<f32>,
};

struct VSOut {
	@builtin(position) Position : vec4<f32>,
	@location(0) vNormal   : vec3<f32>,
	@location(1) vUV       : vec2<f32>,
	@location(2) vWorldPos : vec3<f32>,
};

@vertex
fn vs_main(input : VertexIn) -> VSOut {
	var out : VSOut;
	let worldModel = matrices.world * matrices.model;
	let worldPos = worldModel * vec4<f32>(input.position, 1.0);
	out.Position = matrices.projection * worldPos;
	out.vWorldPos = worldPos.xyz;
	// Approximate normal transform (ignores non-uniform scale)
	out.vNormal = normalize((worldModel * vec4<f32>(input.normal, 0.0)).xyz);
	out.vUV = input.uv;
	return out;
}

@fragment
fn fs_main(input : VSOut) -> @location(0) vec4<f32> {
	let N = normalize(input.vNormal);
	let baseColor = material.color.rgb;
	var lighting = vec3<f32>(0.05, 0.05, 0.05); // ambient

	// simple diffuse accumulation
	for (var i : u32 = 0u; i < material.lightCount; i = i + 1u) {
		let Lp = lights.items[i].position;
		let Lc = lights.items[i].color;
		let Li = lights.items[i].intensity;
		let L = normalize(Lp - input.vWorldPos);
		let ndotl = max(dot(N, L), 0.0);
		lighting = lighting + (Lc * (Li * ndotl));
	}

	return vec4<f32>(baseColor * lighting, material.color.a);
}
`;

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
