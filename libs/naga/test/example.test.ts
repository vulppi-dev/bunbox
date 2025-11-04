import {
  isWgslValid,
  validateWgsl,
  wgslToSpirvBin,
  spirvBinToText,
} from '../dist/naga_wasm.js';

// Example WGSL shader
const vertexShader = `
@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
  let x = f32(i32(vertexIndex) - 1);
  let y = f32(i32(vertexIndex & 1u) * 2 - 1);
  return vec4<f32>(x, y, 0.0, 1.0);
}
`;

const fragmentShader = `
@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
`;

console.log('=== Testing WGSL Validation ===');
console.log('Vertex shader valid:', isWgslValid(vertexShader));
console.log('Fragment shader valid:', isWgslValid(fragmentShader));
console.log('Invalid shader valid:', isWgslValid('invalid shader code'));

console.log('\n=== Testing WGSL to SPIR-V ===');
try {
  const spirvVertex = wgslToSpirvBin(vertexShader, 'vertex', 'main');
  console.log('Vertex SPIR-V size:', spirvVertex.length, 'bytes');

  const spirvFragment = wgslToSpirvBin(fragmentShader, 'fragment', 'main');
  console.log('Fragment SPIR-V size:', spirvFragment.length, 'bytes');

  console.log('\n=== Testing SPIR-V to Text ===');
  const readable = spirvBinToText(spirvVertex);
  console.log('Disassembled shader:\n', readable);
} catch (error) {
  console.error('Error:', error);
}

console.log('\n=== Testing Error Handling ===');
try {
  validateWgsl('this is not valid wgsl');
} catch (error: any) {
  console.log(
    'Expected error caught:',
    error.toString().substring(0, 80) + '...',
  );
}

console.log('\n✅ All tests completed!');
