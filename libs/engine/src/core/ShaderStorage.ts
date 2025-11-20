export type ShaderHolder = string & { __shaderHolderBrand: never };

type ShaderPack =
  | {
      type: 'compute';
      entryPoint: string;
    }
  | {
      type: 'graphics';
      vertexEntryPoint: string;
      fragmentEntryPoint?: string;
    };

const SHADER_HOLDER_TYPE = Symbol('ShaderHolder');

function isShaderHolder(value: any): value is ShaderHolder {
  return value[SHADER_HOLDER_TYPE] === true && typeof value === 'string';
}

export class ShaderStorage {
  private __shaders: Map<ShaderHolder, string> = new Map();
}
