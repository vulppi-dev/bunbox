export class Geometry {
  #vertex: Float32Array;
  #normal: Float32Array;
  #uvs: Float32Array[];
  #indices: Uint32Array;

  constructor(vertexLength: number, indexLength: number, uvLayers = 1) {
    this.#vertex = new Float32Array(vertexLength * 3);
    this.#normal = new Float32Array(vertexLength * 3);
    this.#uvs = Array.from(
      { length: uvLayers },
      () => new Float32Array(vertexLength * 2),
    );
    this.#indices = new Uint32Array(indexLength);
  }

  get vertex() {
    return this.#vertex;
  }

  get normal() {
    return this.#normal;
  }

  get uvs() {
    return [...this.#uvs];
  }

  get indices() {
    return this.#indices;
  }
}
