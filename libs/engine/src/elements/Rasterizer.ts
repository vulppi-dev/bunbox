import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import { MaskHelper } from './MaskHelper';

export type RasterizerFillMode = 'fill' | 'line' | 'point';

export type RasterizerCullMode = 'none' | 'front' | 'back' | 'all';

export type RasterizerFrontFace = 'cw' | 'ccw';

// Depth/Stencil
export type CompareFunction =
  | 'never'
  | 'less'
  | 'equal'
  | 'less-equal'
  | 'greater'
  | 'not-equal'
  | 'greater-equal'
  | 'always';

export type StencilOperation =
  | 'keep'
  | 'zero'
  | 'replace'
  | 'invert'
  | 'increment-clamp'
  | 'decrement-clamp'
  | 'increment-wrap'
  | 'decrement-wrap';

export type DepthStencilFaceState = {
  compare: CompareFunction;
  failOp: StencilOperation;
  depthFailOp: StencilOperation;
  passOp: StencilOperation;
};

export type DepthStencilFormat = 'depth24plus' | 'depth24plus-stencil8' | 'depth32float';

export type DepthStencilState = {
  format: DepthStencilFormat;
  depthWriteEnabled: boolean;
  depthCompare: CompareFunction;
  stencilFront: DepthStencilFaceState;
  stencilBack: DepthStencilFaceState;
  stencilReadMask: MaskHelper;
  stencilWriteMask: MaskHelper;
  depthBias: number;
  depthBiasSlopeScale: number;
  depthBiasClamp: number;
};

// Multisample
export type MultisampleState = {
  count: 1 | 2 | 4 | 8 | 16;
  mask: MaskHelper;
  alphaToCoverageEnabled: boolean;
};

// Blend
export type BlendFactor =
  | 'zero'
  | 'one'
  | 'src'
  | 'one-minus-src'
  | 'src-alpha'
  | 'one-minus-src-alpha'
  | 'dst'
  | 'one-minus-dst'
  | 'dst-alpha'
  | 'one-minus-dst-alpha'
  | 'src-alpha-saturated'
  | 'constant'
  | 'one-minus-constant';

export type BlendOperation = 'add' | 'subtract' | 'reverse-subtract' | 'min' | 'max';

export type BlendComponent = {
  srcFactor: BlendFactor;
  dstFactor: BlendFactor;
  operation: BlendOperation;
};

export type BlendState = {
  enabled: boolean;
  color: BlendComponent;
  alpha: BlendComponent;
  writeMask: MaskHelper;
};

export class Rasterizer extends DirtyState {
  #hash = '';
  #fillMode: RasterizerFillMode = 'fill';
  #cull: RasterizerCullMode = 'none';
  #frontFace: RasterizerFrontFace = 'cw';
  #depthStencil: DepthStencilState = {
    format: 'depth24plus',
    depthWriteEnabled: true,
    depthCompare: 'less',
    stencilFront: {
      compare: 'always',
      failOp: 'keep',
      depthFailOp: 'keep',
      passOp: 'keep',
    },
    stencilBack: {
      compare: 'always',
      failOp: 'keep',
      depthFailOp: 'keep',
      passOp: 'keep',
    },
    stencilReadMask: new MaskHelper(),
    stencilWriteMask: new MaskHelper(),
    depthBias: 0,
    depthBiasSlopeScale: 0,
    depthBiasClamp: 0,
  };
  #multisample: MultisampleState = {
    count: 1,
    mask: new MaskHelper(),
    alphaToCoverageEnabled: false,
  };
  #blend: BlendState = {
    enabled: false,
    color: { srcFactor: 'one', dstFactor: 'zero', operation: 'add' },
    alpha: { srcFactor: 'one', dstFactor: 'zero', operation: 'add' },
    writeMask: (() => {
      const m = new MaskHelper();
      m.disableAll();
      m.setBit(0, true); // R
      m.setBit(1, true); // G
      m.setBit(2, true); // B
      m.setBit(3, true); // A
      return m;
    })(),
  };

  constructor(
    options: Partial<{
      fillMode: RasterizerFillMode;
      cull: RasterizerCullMode;
      frontFace: RasterizerFrontFace;
      depthStencil: Partial<DepthStencilState>;
      multisample: Partial<MultisampleState>;
      blend: Partial<BlendState>;
    }> = {},
  ) {
    super();
    if (options.fillMode !== undefined) this.fillMode = options.fillMode;
    if (options.cull !== undefined) this.cull = options.cull;
    if (options.frontFace !== undefined) this.frontFace = options.frontFace;
    if (options.depthStencil) this.updateDepthStencil(options.depthStencil);
    if (options.multisample) this.updateMultisample(options.multisample);
    if (options.blend) this.updateBlend(options.blend);
    // Ensure hash is initialized even if no options provided
    if (!this.#hash) this.#updateHash();
    // Match Material behavior (new instances start dirty)
    this.markAsDirty();
  }

  get fillMode(): RasterizerFillMode {
    return this.#fillMode;
  }

  get cull(): RasterizerCullMode {
    return this.#cull;
  }

  get frontFace(): RasterizerFrontFace {
    return this.#frontFace;
  }

  get hash(): string {
    return this.#hash;
  }

  // Depth/Stencil
  get depthStencil(): Readonly<DepthStencilState> {
    return {
      ...this.#depthStencil,
      stencilFront: { ...this.#depthStencil.stencilFront },
      stencilBack: { ...this.#depthStencil.stencilBack },
      stencilReadMask: (() => {
        const m = new MaskHelper();
        m.set(this.#depthStencil.stencilReadMask.get()).unmarkAsDirty();
        return m;
      })(),
      stencilWriteMask: (() => {
        const m = new MaskHelper();
        m.set(this.#depthStencil.stencilWriteMask.get()).unmarkAsDirty();
        return m;
      })(),
    };
  }

  // Multisample
  get multisample(): Readonly<MultisampleState> {
    return {
      ...this.#multisample,
      mask: (() => {
        const m = new MaskHelper();
        m.set(this.#multisample.mask.get()).unmarkAsDirty();
        return m;
      })(),
    };
  }

  // Blend
  get blend(): Readonly<BlendState> {
    return {
      enabled: this.#blend.enabled,
      color: { ...this.#blend.color },
      alpha: { ...this.#blend.alpha },
      writeMask: (() => {
        const m = new MaskHelper();
        m.set(this.#blend.writeMask.get()).unmarkAsDirty();
        return m;
      })(),
    };
  }

  set fillMode(v: RasterizerFillMode) {
    if (this.#fillMode === v) return;
    this.#fillMode = v;
    this.#updateHash();
    this.markAsDirty();
  }

  set cull(v: RasterizerCullMode) {
    if (this.#cull === v) return;
    this.#cull = v;
    this.#updateHash();
    this.markAsDirty();
  }

  set frontFace(v: RasterizerFrontFace) {
    if (this.#frontFace === v) return;
    this.#frontFace = v;
    this.#updateHash();
    this.markAsDirty();
  }

  set depthStencil(v: DepthStencilState) {
    if (this.#deepEqualDepthStencil(this.#depthStencil, v)) return;
    this.#depthStencil = {
      ...v,
      stencilFront: { ...v.stencilFront },
      stencilBack: { ...v.stencilBack },
      stencilReadMask: (() => {
        const m = new MaskHelper();
        m.set(v.stencilReadMask.get()).unmarkAsDirty();
        return m;
      })(),
      stencilWriteMask: (() => {
        const m = new MaskHelper();
        m.set(v.stencilWriteMask.get()).unmarkAsDirty();
        return m;
      })(),
    };
    this.#updateHash();
    this.markAsDirty();
  }

  set multisample(v: MultisampleState) {
    if (
      this.#multisample.count === v.count &&
      this.#multisample.mask.get() === v.mask.get() &&
      this.#multisample.alphaToCoverageEnabled === v.alphaToCoverageEnabled
    )
      return;
    this.#multisample = {
      ...v,
      mask: (() => {
        const m = new MaskHelper();
        m.set(v.mask.get()).unmarkAsDirty();
        return m;
      })(),
    };
    this.#updateHash();
    this.markAsDirty();
  }

  set blend(v: BlendState) {
    if (this.#deepEqualBlend(this.#blend, v)) return;
    this.#blend = {
      enabled: v.enabled,
      color: { ...v.color },
      alpha: { ...v.alpha },
      writeMask: (() => {
        const m = new MaskHelper();
        m.set(v.writeMask.get()).unmarkAsDirty();
        return m;
      })(),
    };
    this.#updateHash();
    this.markAsDirty();
  }

  // Public instance methods (must come after getters/setters)
  updateDepthStencil(patch: Partial<DepthStencilState>): this {
    const next: DepthStencilState = {
      ...this.#depthStencil,
      ...patch,
      stencilFront: {
        ...this.#depthStencil.stencilFront,
        ...(patch.stencilFront ?? {}),
      },
      stencilBack: {
        ...this.#depthStencil.stencilBack,
        ...(patch.stencilBack ?? {}),
      },
    };
    this.depthStencil = next;
    return this;
  }

  updateMultisample(patch: Partial<MultisampleState>): this {
    this.multisample = { ...this.#multisample, ...patch };
    return this;
  }

  updateBlend(patch: Partial<BlendState>): this {
    this.blend = {
      enabled: patch.enabled ?? this.#blend.enabled,
      color: { ...this.#blend.color, ...(patch.color ?? {}) },
      alpha: { ...this.#blend.alpha, ...(patch.alpha ?? {}) },
      writeMask: patch.writeMask ?? this.#blend.writeMask,
    };
    return this;
  }

  equals(other: Rasterizer): boolean {
    return (
      this.#fillMode === other.#fillMode &&
      this.#cull === other.#cull &&
      this.#frontFace === other.#frontFace &&
      this.#deepEqualDepthStencil(this.#depthStencil, other.#depthStencil) &&
      this.#deepEqualMultisample(this.#multisample, other.#multisample) &&
      this.#deepEqualBlend(this.#blend, other.#blend)
    );
  }

  copy(other: Rasterizer): this {
    if (this.equals(other)) return this;
    this.fillMode = other.#fillMode;
    this.cull = other.#cull;
    this.frontFace = other.#frontFace;
    this.depthStencil = other.#depthStencil;
    this.multisample = other.#multisample;
    this.blend = other.#blend;
    return this;
  }

  clone(): Rasterizer {
    const r = new Rasterizer({
      fillMode: this.#fillMode,
      cull: this.#cull,
      frontFace: this.#frontFace,
      depthStencil: this.#depthStencil,
      multisample: this.#multisample,
      blend: this.#blend,
    });
    r.markAsDirty();
    return r;
  }

  #updateHash() {
    this.#hash = sha(
      JSON.stringify({
        fillMode: this.#fillMode,
        cull: this.#cull,
        frontFace: this.#frontFace,
        depthStencil: {
          format: this.#depthStencil.format,
          depthWriteEnabled: this.#depthStencil.depthWriteEnabled,
          depthCompare: this.#depthStencil.depthCompare,
          stencilFront: this.#depthStencil.stencilFront,
          stencilBack: this.#depthStencil.stencilBack,
          stencilReadMask: this.#depthStencil.stencilReadMask.get(),
          stencilWriteMask: this.#depthStencil.stencilWriteMask.get(),
          depthBias: this.#depthStencil.depthBias,
          depthBiasSlopeScale: this.#depthStencil.depthBiasSlopeScale,
          depthBiasClamp: this.#depthStencil.depthBiasClamp,
        },
        multisample: {
          count: this.#multisample.count,
          mask: this.#multisample.mask.get(),
          alphaToCoverageEnabled: this.#multisample.alphaToCoverageEnabled,
        },
        blend: {
          enabled: this.#blend.enabled,
          color: this.#blend.color,
          alpha: this.#blend.alpha,
          writeMask: this.#blend.writeMask.get(),
        },
      }),
      'hex',
    );
  }

  #deepEqualDepthStencil(a: DepthStencilState, b: DepthStencilState): boolean {
    return (
      a.format === b.format &&
      a.depthWriteEnabled === b.depthWriteEnabled &&
      a.depthCompare === b.depthCompare &&
      a.stencilReadMask.get() === b.stencilReadMask.get() &&
      a.stencilWriteMask.get() === b.stencilWriteMask.get() &&
      a.depthBias === b.depthBias &&
      a.depthBiasSlopeScale === b.depthBiasSlopeScale &&
      a.depthBiasClamp === b.depthBiasClamp &&
      this.#deepEqualFace(a.stencilFront, b.stencilFront) &&
      this.#deepEqualFace(a.stencilBack, b.stencilBack)
    );
  }

  #deepEqualFace(a: DepthStencilFaceState, b: DepthStencilFaceState): boolean {
    return (
      a.compare === b.compare &&
      a.failOp === b.failOp &&
      a.depthFailOp === b.depthFailOp &&
      a.passOp === b.passOp
    );
  }

  #deepEqualMultisample(a: MultisampleState, b: MultisampleState): boolean {
    return (
      a.count === b.count &&
      a.mask.get() === b.mask.get() &&
      a.alphaToCoverageEnabled === b.alphaToCoverageEnabled
    );
  }

  #deepEqualBlend(a: BlendState, b: BlendState): boolean {
    return (
      a.enabled === b.enabled &&
      a.writeMask.get() === b.writeMask.get() &&
      a.color.srcFactor === b.color.srcFactor &&
      a.color.dstFactor === b.color.dstFactor &&
      a.color.operation === b.color.operation &&
      a.alpha.srcFactor === b.alpha.srcFactor &&
      a.alpha.dstFactor === b.alpha.dstFactor &&
      a.alpha.operation === b.alpha.operation
    );
  }
}
