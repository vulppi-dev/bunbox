import { validate_wgsl } from '@bunbox/naga';
import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';

export type MaterialOptions = {
  shader: string;
  label?: string;
  params?: Record<string, any>;
};

export class Material extends DirtyState {
  #label = '';
  #params: Record<string, any> = {};

  #shader = '';

  constructor({ shader, label = '', params = {} }: MaterialOptions) {
    super();
    this.#label = label;
    this.#params = { ...params };
    this.shader = shader;
  }

  get label() {
    return this.#label;
  }
  set label(v: string) {
    if (this.#label === v) return;
    this.#label = v;
    this.markAsDirty();
  }

  get shader() {
    return this.#shader;
  }
  set shader(src: string) {
    if (this.#shader === src) return;
    try {
      validate_wgsl(src);
    } catch {
      throw new Error('Invalid WGSL');
    }
    this.#shader = src;
    this.markAsDirty();
  }

  equals(other: Material): boolean {
    return (
      this.#label === other.#label &&
      this.#shader === other.#shader &&
      (() => {
        const a = this.#params;
        const b = other.#params;
        const ka = Object.keys(a);
        const kb = Object.keys(b);
        if (ka.length !== kb.length) return false;
        for (const k of ka) if (!Object.is(a[k], b[k])) return false;
        return true;
      })()
    );
  }

  copy(other: Material): this {
    if (this.equals(other)) return this;
    this.#label = other.#label;
    this.#params = { ...other.#params };
    // Use setters to validate shaders and invalidate schema
    this.shader = other.#shader;
    return this.markAsDirty();
  }

  clone(): Material {
    const m = new Material({
      shader: this.#shader,
      label: this.#label,
      params: { ...this.#params },
    });
    m.markAsDirty();
    return m;
  }

  get hash(): string {
    return sha(this.#shader || '', 'hex');
  }
}
