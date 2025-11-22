import { DirtyState } from '@bunbox/utils';
import { MaskHelper } from './MaskHelper';
import type {
  RasterizerFillMode,
  RasterizerCullMode,
  RasterizerFrontFace,
  CompareFunction,
  StencilOperation,
  DepthStencilFormat,
  SampleCount,
  BlendFactor,
  BlendOperation,
} from './types/aliases';

export type DepthStencilFaceState = {
  compare: CompareFunction;
  failOp: StencilOperation;
  depthFailOp: StencilOperation;
  passOp: StencilOperation;
};

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
  count: SampleCount;
  mask: MaskHelper;
  alphaToCoverageEnabled: boolean;
};

// Blend

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
  private __fillMode: RasterizerFillMode = 'fill';
  private __cull: RasterizerCullMode = 'none';
  private __frontFace: RasterizerFrontFace = 'clockwise';
  private __depthStencil: DepthStencilState = {
    format: 'depth24-plus',
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
  private __multisample: MultisampleState = {
    count: 1,
    mask: new MaskHelper(),
    alphaToCoverageEnabled: false,
  };
  private __blend: BlendState = {
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
    // Match Material behavior (new instances start dirty)
    this.markAsDirty();
  }

  get fillMode(): RasterizerFillMode {
    return this.__fillMode;
  }

  get cull(): RasterizerCullMode {
    return this.__cull;
  }

  get frontFace(): RasterizerFrontFace {
    return this.__frontFace;
  }

  // Depth/Stencil
  get depthStencil(): Readonly<DepthStencilState> {
    return {
      ...this.__depthStencil,
      stencilFront: { ...this.__depthStencil.stencilFront },
      stencilBack: { ...this.__depthStencil.stencilBack },
      stencilReadMask: (() => {
        const m = new MaskHelper();
        m.set(this.__depthStencil.stencilReadMask.get()).markAsClean();
        return m;
      })(),
      stencilWriteMask: (() => {
        const m = new MaskHelper();
        m.set(this.__depthStencil.stencilWriteMask.get()).markAsClean();
        return m;
      })(),
    };
  }

  // Multisample
  get multisample(): Readonly<MultisampleState> {
    return {
      ...this.__multisample,
      mask: (() => {
        const m = new MaskHelper();
        m.set(this.__multisample.mask.get()).markAsClean();
        return m;
      })(),
    };
  }

  // Blend
  get blend(): Readonly<BlendState> {
    return {
      enabled: this.__blend.enabled,
      color: { ...this.__blend.color },
      alpha: { ...this.__blend.alpha },
      writeMask: (() => {
        const m = new MaskHelper();
        m.set(this.__blend.writeMask.get()).markAsClean();
        return m;
      })(),
    };
  }

  set fillMode(v: RasterizerFillMode) {
    if (this.__fillMode === v) return;
    this.__fillMode = v;
    this.markAsDirty();
  }

  set cull(v: RasterizerCullMode) {
    if (this.__cull === v) return;
    this.__cull = v;
    this.markAsDirty();
  }

  set frontFace(v: RasterizerFrontFace) {
    if (this.__frontFace === v) return;
    this.__frontFace = v;
    this.markAsDirty();
  }

  set depthStencil(v: DepthStencilState) {
    if (this.__deepEqualDepthStencil(this.__depthStencil, v)) return;
    this.__depthStencil = {
      ...v,
      stencilFront: { ...v.stencilFront },
      stencilBack: { ...v.stencilBack },
      stencilReadMask: (() => {
        const m = new MaskHelper();
        m.set(v.stencilReadMask.get()).markAsClean();
        return m;
      })(),
      stencilWriteMask: (() => {
        const m = new MaskHelper();
        m.set(v.stencilWriteMask.get()).markAsClean();
        return m;
      })(),
    };
    this.markAsDirty();
  }

  set multisample(v: MultisampleState) {
    if (
      this.__multisample.count === v.count &&
      this.__multisample.mask.get() === v.mask.get() &&
      this.__multisample.alphaToCoverageEnabled === v.alphaToCoverageEnabled
    )
      return;
    this.__multisample = {
      ...v,
      mask: (() => {
        const m = new MaskHelper();
        m.set(v.mask.get()).markAsClean();
        return m;
      })(),
    };
    this.markAsDirty();
  }

  set blend(v: BlendState) {
    if (this.__deepEqualBlend(this.__blend, v)) return;
    this.__blend = {
      enabled: v.enabled,
      color: { ...v.color },
      alpha: { ...v.alpha },
      writeMask: (() => {
        const m = new MaskHelper();
        m.set(v.writeMask.get()).markAsClean();
        return m;
      })(),
    };
    this.markAsDirty();
  }

  // Public instance methods (must come after getters/setters)
  updateDepthStencil(patch: Partial<DepthStencilState>): this {
    const next: DepthStencilState = {
      ...this.__depthStencil,
      ...patch,
      stencilFront: {
        ...this.__depthStencil.stencilFront,
        ...(patch.stencilFront ?? {}),
      },
      stencilBack: {
        ...this.__depthStencil.stencilBack,
        ...(patch.stencilBack ?? {}),
      },
    };
    this.depthStencil = next;
    return this;
  }

  updateMultisample(patch: Partial<MultisampleState>): this {
    this.multisample = { ...this.__multisample, ...patch };
    return this;
  }

  updateBlend(patch: Partial<BlendState>): this {
    this.blend = {
      enabled: patch.enabled ?? this.__blend.enabled,
      color: { ...this.__blend.color, ...(patch.color ?? {}) },
      alpha: { ...this.__blend.alpha, ...(patch.alpha ?? {}) },
      writeMask: patch.writeMask ?? this.__blend.writeMask,
    };
    return this;
  }

  equals(other: Rasterizer): boolean {
    return (
      this.__fillMode === other.__fillMode &&
      this.__cull === other.__cull &&
      this.__frontFace === other.__frontFace &&
      this.__deepEqualDepthStencil(this.__depthStencil, other.__depthStencil) &&
      this.__deepEqualMultisample(this.__multisample, other.__multisample) &&
      this.__deepEqualBlend(this.__blend, other.__blend)
    );
  }

  copy(other: Rasterizer): this {
    if (this.equals(other)) return this;
    this.fillMode = other.__fillMode;
    this.cull = other.__cull;
    this.frontFace = other.__frontFace;
    this.depthStencil = other.__depthStencil;
    this.multisample = other.__multisample;
    this.blend = other.__blend;
    return this;
  }

  clone(): Rasterizer {
    const r = new Rasterizer({
      fillMode: this.__fillMode,
      cull: this.__cull,
      frontFace: this.__frontFace,
      depthStencil: this.__depthStencil,
      multisample: this.__multisample,
      blend: this.__blend,
    });
    r.markAsDirty();
    return r;
  }

  private __deepEqualDepthStencil(
    a: DepthStencilState,
    b: DepthStencilState,
  ): boolean {
    return (
      a.format === b.format &&
      a.depthWriteEnabled === b.depthWriteEnabled &&
      a.depthCompare === b.depthCompare &&
      a.stencilReadMask.get() === b.stencilReadMask.get() &&
      a.stencilWriteMask.get() === b.stencilWriteMask.get() &&
      a.depthBias === b.depthBias &&
      a.depthBiasSlopeScale === b.depthBiasSlopeScale &&
      a.depthBiasClamp === b.depthBiasClamp &&
      this.__deepEqualFace(a.stencilFront, b.stencilFront) &&
      this.__deepEqualFace(a.stencilBack, b.stencilBack)
    );
  }

  private __deepEqualFace(
    a: DepthStencilFaceState,
    b: DepthStencilFaceState,
  ): boolean {
    return (
      a.compare === b.compare &&
      a.failOp === b.failOp &&
      a.depthFailOp === b.depthFailOp &&
      a.passOp === b.passOp
    );
  }

  private __deepEqualMultisample(
    a: MultisampleState,
    b: MultisampleState,
  ): boolean {
    return (
      a.count === b.count &&
      a.mask.get() === b.mask.get() &&
      a.alphaToCoverageEnabled === b.alphaToCoverageEnabled
    );
  }

  private __deepEqualBlend(a: BlendState, b: BlendState): boolean {
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
