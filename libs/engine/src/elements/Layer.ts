import { Dirtyable } from '../abstract';

export class Layer extends Dirtyable {
  #layerValue = 255;

  hasLayer(value: number): boolean {
    if (value < 0 || value > 31) {
      throw new Error('Layer value must be between 0 and 31.');
    }
    return (this.#layerValue & (1 << value)) !== 0;
  }

  setLayer(value: number, state: boolean): this {
    if (value < 0 || value > 31) {
      throw new Error('Layer value must be between 0 and 31.');
    }
    if (state) {
      this.#layerValue |= 1 << value;
    } else {
      this.#layerValue &= ~(1 << value);
    }

    return this.markAsDirty();
  }

  get(): number {
    return this.#layerValue;
  }

  set(value: number): this {
    if (value < 0 || value > 0xffffffff) {
      throw new Error('Layer value must be between 0 and 4294967295.');
    }
    this.#layerValue = value;
    return this.markAsDirty();
  }

  copy(l: Layer): this {
    this.#layerValue = l.#layerValue;
    return this.markAsDirty();
  }

  clone(): this {
    const newLayer = new Layer();
    newLayer.#layerValue = this.#layerValue;
    newLayer.markAsDirty();
    return newLayer as this;
  }

  match(layer: Layer) {
    return Boolean(this.#layerValue & layer.#layerValue);
  }
}
