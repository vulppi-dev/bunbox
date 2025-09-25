// Geometry primitives helpers
// All comments in English as per repository guidelines.

import { Geometry } from '../elements/Geometry';

// Utility to create a Geometry and expose its internal typed arrays for bulk fill
function createGeometry(vertexCount: number, indexCount: number, uvLayers = 1) {
  const g = new Geometry(vertexCount, indexCount, uvLayers);
  const pos = g.vertex; // Float32Array length = vc*3
  const nrm = g.normal; // Float32Array length = vc*3
  const uv0 = g.uvs[0]!; // Float32Array length = vc*2
  const idx = g.indices; // Uint32Array length = ic
  return { g, pos, nrm, uv0, idx } as const;
}

export type BoxOptions = {
  width?: number; // X size
  height?: number; // Y size
  depth?: number; // Z size
  uvPerFace?: boolean; // if true, standard per-face UVs 0..1 for each face
  label?: string;
};

export function createBox(options: BoxOptions = {}): Geometry {
  const w = (options.width ?? 1) / 2;
  const h = (options.height ?? 1) / 2;
  const d = (options.depth ?? 1) / 2;
  // 6 faces * 4 verts, 6 faces * 2 tris * 3 idx = 36
  const { g, pos, nrm, uv0, idx } = createGeometry(24, 36);
  // face definitions: [nx,ny,nz], [tangentX,tangentY,tangentZ] not needed, we map UVs straightforwardly
  // Order faces: +X, -X, +Y, -Y, +Z, -Z
  const faces = [
    {
      n: [1, 0, 0] as const,
      u: [0, 0, -1] as const,
      v: [0, 1, 0] as const,
      base: [w, -h, d] as const,
    }, // +X
    {
      n: [-1, 0, 0] as const,
      u: [0, 0, 1] as const,
      v: [0, 1, 0] as const,
      base: [-w, -h, -d] as const,
    }, // -X
    {
      n: [0, 1, 0] as const,
      u: [1, 0, 0] as const,
      v: [0, 0, -1] as const,
      base: [-w, h, d] as const,
    }, // +Y
    {
      n: [0, -1, 0] as const,
      u: [1, 0, 0] as const,
      v: [0, 0, 1] as const,
      base: [-w, -h, -d] as const,
    }, // -Y
    {
      n: [0, 0, 1] as const,
      u: [1, 0, 0] as const,
      v: [0, 1, 0] as const,
      base: [-w, -h, d] as const,
    }, // +Z
    {
      n: [0, 0, -1] as const,
      u: [-1, 0, 0] as const,
      v: [0, 1, 0] as const,
      base: [w, -h, -d] as const,
    }, // -Z
  ];

  let vi = 0;
  let ti = 0;
  for (let f = 0; f < 6; f++) {
    const { n, u, v, base } = faces[f]!;
    // Four corners in UV space (0,0)->(1,1); positions built from base + u/v scaled
    const cornersUV: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    // Corner offsets in object space (map 0..1 to edge extents)
    for (let c = 0; c < 4; c++) {
      const uMul = c === 0 || c === 3 ? 0 : 1;
      const vMul = c <= 1 ? 0 : 1;
      const x =
        base[0] +
        u[0] *
          (2 * w * (u[0] !== 0 ? 0 : 1) +
            (u[0] === 0 ? (c === 1 || c === 2 ? 2 * w : 0) : 0));
      // Instead of overcomplicating, construct positions explicitly per face using width/height/depth
      // We'll handle positions by switch on face for clarity
    }
  }

  // Re-implement per face explicitly for clarity and correctness
  const setQuad = (
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    n: [number, number, number],
    baseIndex: number,
    uv: [number, number, number, number, number, number, number, number] = [
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      1,
    ],
  ) => {
    const vi3 = baseIndex * 3;
    const vi2 = baseIndex * 2;
    // positions
    pos.set(p0, vi3 + 0);
    pos.set(p1, vi3 + 3);
    pos.set(p2, vi3 + 6);
    pos.set(p3, vi3 + 9);
    // normals
    for (let k = 0; k < 4; k++) {
      nrm.set(n, vi3 + k * 3);
    }
    // uvs
    uv0.set(uv, vi2 + 0);
    // indices (two triangles)
    const qi = (baseIndex / 4) * 6;
    const a = baseIndex + 0;
    const b = baseIndex + 1;
    const c = baseIndex + 2;
    const d0 = baseIndex + 0;
    const d1 = baseIndex + 2;
    const d2 = baseIndex + 3;
    idx.set([a, b, c, a, c, d2], qi);
  };

  // Fill 6 quads
  setQuad([w, -h, d], [w, -h, -d], [w, h, -d], [w, h, d], [1, 0, 0], 0); // +X
  setQuad([-w, -h, -d], [-w, -h, d], [-w, h, d], [-w, h, -d], [-1, 0, 0], 4); // -X
  setQuad([-w, h, d], [w, h, d], [w, h, -d], [-w, h, -d], [0, 1, 0], 8); // +Y
  setQuad([-w, -h, -d], [w, -h, -d], [w, -h, d], [-w, -h, d], [0, -1, 0], 12); // -Y
  setQuad([-w, -h, d], [w, -h, d], [w, h, d], [-w, h, d], [0, 0, 1], 16); // +Z
  setQuad([w, -h, -d], [-w, -h, -d], [-w, h, -d], [w, h, -d], [0, 0, -1], 20); // -Z

  g.markAsDirty();
  return g;
}

export type SphereOptions = {
  radius?: number;
  widthSegments?: number; // longitudinal segments (>=3)
  heightSegments?: number; // latitudinal segments (>=2)
  label?: string;
};

export function createSphere(options: SphereOptions = {}): Geometry {
  const r = options.radius ?? 0.5;
  const ws = Math.max(3, options.widthSegments ?? 16);
  const hs = Math.max(2, options.heightSegments ?? 12);
  const vc = (ws + 1) * (hs + 1);
  const ic = ws * hs * 6;
  const { g, pos, nrm, uv0, idx } = createGeometry(vc, ic);

  let vi = 0;
  // vertices
  for (let y = 0; y <= hs; y++) {
    const v = y / hs; // 0..1 from south to north
    const phi = v * Math.PI; // 0..PI
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    for (let x = 0; x <= ws; x++) {
      const u = x / ws; // 0..1
      const theta = u * Math.PI * 2; // 0..2PI
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      const nx = cosTheta * sinPhi;
      const ny = cosPhi;
      const nz = sinTheta * sinPhi;
      const px = nx * r;
      const py = ny * r;
      const pz = nz * r;
      const pOff = vi * 3;
      const tOff = vi * 2;
      pos[pOff + 0] = px;
      pos[pOff + 1] = py;
      pos[pOff + 2] = pz;
      nrm[pOff + 0] = nx;
      nrm[pOff + 1] = ny;
      nrm[pOff + 2] = nz;
      uv0[tOff + 0] = u;
      uv0[tOff + 1] = 1 - v;
      vi++;
    }
  }

  // indices
  let ii = 0;
  const row = ws + 1;
  for (let y = 0; y < hs; y++) {
    for (let x = 0; x < ws; x++) {
      const a = y * row + x;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      idx[ii++] = a;
      idx[ii++] = b;
      idx[ii++] = d;
      idx[ii++] = d;
      idx[ii++] = b;
      idx[ii++] = c;
    }
  }

  g.markAsDirty();
  return g;
}

export type TorusOptions = {
  radius?: number; // major radius (center of torus to tube center)
  tube?: number; // tube radius
  radialSegments?: number; // around the tube
  tubularSegments?: number; // around the torus path
  arc?: number; // sweep angle (default 2PI)
};

export function createTorus(options: TorusOptions = {}): Geometry {
  const R = options.radius ?? 0.5; // major
  const r = options.tube ?? R * 0.33; // minor
  const rs = Math.max(3, options.radialSegments ?? 16);
  const ts = Math.max(3, options.tubularSegments ?? 24);
  const arc = options.arc ?? Math.PI * 2;
  const vc = (rs + 1) * (ts + 1);
  const ic = rs * ts * 6;
  const { g, pos, nrm, uv0, idx } = createGeometry(vc, ic);

  let vi = 0;
  for (let j = 0; j <= ts; j++) {
    const v = j / ts;
    const theta = v * arc; // around major circle
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    for (let i = 0; i <= rs; i++) {
      const u = i / rs;
      const phi = u * Math.PI * 2; // around tube
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      // center of tube on major circle
      const cx = R * cosTheta;
      const cz = R * sinTheta;

      // outward normal in plane from torus center
      const nx = cosTheta * cosPhi;
      const ny = sinPhi;
      const nz = sinTheta * cosPhi;

      const px = cx + r * nx;
      const py = r * ny;
      const pz = cz + r * nz;

      const pOff = vi * 3;
      const tOff = vi * 2;
      pos[pOff + 0] = px;
      pos[pOff + 1] = py;
      pos[pOff + 2] = pz;
      nrm[pOff + 0] = nx;
      nrm[pOff + 1] = ny;
      nrm[pOff + 2] = nz;
      uv0[tOff + 0] = u;
      uv0[tOff + 1] = v;
      vi++;
    }
  }

  let ii = 0;
  const row = rs + 1;
  for (let j = 0; j < ts; j++) {
    for (let i = 0; i < rs; i++) {
      const a = j * row + i;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      idx[ii++] = a;
      idx[ii++] = b;
      idx[ii++] = d;
      idx[ii++] = d;
      idx[ii++] = b;
      idx[ii++] = c;
    }
  }

  g.markAsDirty();
  return g;
}

export type PlaneOptions = {
  width?: number;
  depth?: number;
  widthSegments?: number;
  depthSegments?: number;
  y?: number; // plane on XZ at this Y
};

export function createPlane(options: PlaneOptions = {}): Geometry {
  const w = options.width ?? 1;
  const d = options.depth ?? 1;
  const ws = Math.max(1, options.widthSegments ?? 1);
  const ds = Math.max(1, options.depthSegments ?? 1);
  const y = options.y ?? 0;
  const cols = ws + 1;
  const rows = ds + 1;
  const vc = cols * rows;
  const ic = ws * ds * 6;
  const { g, pos, nrm, uv0, idx } = createGeometry(vc, ic);
  let vi = 0;
  for (let j = 0; j < rows; j++) {
    const v = j / ds;
    const z = -d / 2 + v * d;
    for (let i = 0; i < cols; i++) {
      const u = i / ws;
      const x = -w / 2 + u * w;
      const pOff = vi * 3;
      const tOff = vi * 2;
      pos[pOff + 0] = x;
      pos[pOff + 1] = y;
      pos[pOff + 2] = z;
      nrm[pOff + 0] = 0;
      nrm[pOff + 1] = 1;
      nrm[pOff + 2] = 0;
      uv0[tOff + 0] = u;
      uv0[tOff + 1] = 1 - v;
      vi++;
    }
  }
  let ii = 0;
  for (let j = 0; j < ds; j++) {
    for (let i = 0; i < ws; i++) {
      const a = j * cols + i;
      const b = a + cols;
      const c = b + 1;
      const d0 = a + 1;
      idx[ii++] = a;
      idx[ii++] = b;
      idx[ii++] = d0;
      idx[ii++] = d0;
      idx[ii++] = b;
      idx[ii++] = c;
    }
  }
  g.markAsDirty();
  return g;
}

export type CylinderOptions = {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean; // if true, no caps
};

export function createCylinder(options: CylinderOptions = {}): Geometry {
  const rt = Math.max(0, options.radiusTop ?? 0.5);
  const rb = Math.max(0, options.radiusBottom ?? 0.5);
  const h = options.height ?? 1;
  const rs = Math.max(3, options.radialSegments ?? 16);
  const hs = Math.max(1, options.heightSegments ?? 1);
  const open = !!options.openEnded;

  const sideVC = (rs + 1) * (hs + 1);
  const sideIC = rs * hs * 6;
  const capVC = open ? 0 : rs + 1 + 1; // ring + center per cap
  const capIC = open ? 0 : rs * 3; // triangle fan per cap
  const vc = sideVC + (capVC > 0 ? capVC * 2 : 0);
  const ic = sideIC + (capIC > 0 ? capIC * 2 : 0);

  const { g, pos, nrm, uv0, idx } = createGeometry(vc, ic);

  let vi = 0;
  // sides
  for (let y = 0; y <= hs; y++) {
    const v = y / hs;
    const radius = rb + (rt - rb) * v;
    const py = -h / 2 + v * h;
    for (let i = 0; i <= rs; i++) {
      const u = i / rs;
      const theta = u * Math.PI * 2;
      const cos = Math.cos(theta),
        sin = Math.sin(theta);
      const nx = cos;
      const nz = sin;
      const px = radius * cos;
      const pz = radius * sin;
      const pOff = vi * 3;
      const tOff = vi * 2;
      pos[pOff + 0] = px;
      pos[pOff + 1] = py;
      pos[pOff + 2] = pz;
      // normal not account for slope; using radial normal is acceptable for most cases
      nrm[pOff + 0] = nx;
      nrm[pOff + 1] = 0;
      nrm[pOff + 2] = nz;
      uv0[tOff + 0] = u;
      uv0[tOff + 1] = 1 - v;
      vi++;
    }
  }
  // side indices
  let ii = 0;
  const row = rs + 1;
  for (let y = 0; y < hs; y++) {
    for (let i = 0; i < rs; i++) {
      const a = y * row + i;
      const b = a + row;
      const c = b + 1;
      const d = a + 1;
      idx[ii++] = a;
      idx[ii++] = b;
      idx[ii++] = d;
      idx[ii++] = d;
      idx[ii++] = b;
      idx[ii++] = c;
    }
  }

  if (!open) {
    // top cap
    const topCenter = vi;
    const py = h / 2;
    pos.set([0, py, 0], topCenter * 3);
    nrm.set([0, 1, 0], topCenter * 3);
    uv0.set([0.5, 0.5], topCenter * 2);
    vi++;
    for (let i = 0; i <= rs; i++) {
      const u = i / rs;
      const theta = u * Math.PI * 2;
      const cos = Math.cos(theta),
        sin = Math.sin(theta);
      const px = rt * cos;
      const pz = rt * sin;
      const pOff = vi * 3;
      const tOff = vi * 2;
      pos[pOff + 0] = px;
      pos[pOff + 1] = py;
      pos[pOff + 2] = pz;
      nrm[pOff + 0] = 0;
      nrm[pOff + 1] = 1;
      nrm[pOff + 2] = 0;
      uv0[tOff + 0] = 0.5 + px / (rt * 2);
      uv0[tOff + 1] = 0.5 - pz / (rt * 2);
      vi++;
    }
    // fan indices (center, i, i+1)
    for (let i = 0; i < rs; i++) {
      idx[ii++] = topCenter;
      idx[ii++] = topCenter + 1 + i;
      idx[ii++] = topCenter + 1 + i + 1;
    }

    // bottom cap
    const bottomCenter = vi;
    const pyb = -h / 2;
    pos.set([0, pyb, 0], bottomCenter * 3);
    nrm.set([0, -1, 0], bottomCenter * 3);
    uv0.set([0.5, 0.5], bottomCenter * 2);
    vi++;
    for (let i = 0; i <= rs; i++) {
      const u = i / rs;
      const theta = u * Math.PI * 2;
      const cos = Math.cos(theta),
        sin = Math.sin(theta);
      const px = rb * cos;
      const pz = rb * sin;
      const pOff = vi * 3;
      const tOff = vi * 2;
      pos[pOff + 0] = px;
      pos[pOff + 1] = pyb;
      pos[pOff + 2] = pz;
      nrm[pOff + 0] = 0;
      nrm[pOff + 1] = -1;
      nrm[pOff + 2] = 0;
      uv0[tOff + 0] = 0.5 + px / (rb * 2);
      uv0[tOff + 1] = 0.5 + pz / (rb * 2);
      vi++;
    }
    for (let i = 0; i < rs; i++) {
      idx[ii++] = bottomCenter;
      idx[ii++] = bottomCenter + 1 + i + 1;
      idx[ii++] = bottomCenter + 1 + i;
    }
  }

  g.markAsDirty();
  return g;
}

export type ConeOptions = {
  radius?: number; // base radius
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
};

export function createCone(options: ConeOptions = {}): Geometry {
  return createCylinder({
    radiusTop: 0,
    radiusBottom: options.radius ?? 0.5,
    height: options.height ?? 1,
    radialSegments: options.radialSegments ?? 16,
    heightSegments: options.heightSegments ?? 1,
    openEnded: options.openEnded ?? false,
  });
}

export type CircleOptions = {
  radius?: number;
  segments?: number;
  y?: number; // plane on XZ at this Y
};

export function createCircle(options: CircleOptions = {}): Geometry {
  const r = options.radius ?? 0.5;
  const s = Math.max(3, options.segments ?? 32);
  const y = options.y ?? 0;
  const vc = s + 1; // center + ring
  const ic = s * 3;
  const { g, pos, nrm, uv0, idx } = createGeometry(vc, ic);
  // center
  pos.set([0, y, 0], 0);
  nrm.set([0, 1, 0], 0);
  uv0.set([0.5, 0.5], 0);
  let vi = 1;
  for (let i = 0; i < s; i++) {
    const u = i / s;
    const theta = u * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const pOff = vi * 3;
    const tOff = vi * 2;
    pos[pOff + 0] = x;
    pos[pOff + 1] = y;
    pos[pOff + 2] = z;
    nrm[pOff + 0] = 0;
    nrm[pOff + 1] = 1;
    nrm[pOff + 2] = 0;
    uv0[tOff + 0] = 0.5 + x / (2 * r);
    uv0[tOff + 1] = 0.5 - z / (2 * r);
    vi++;
  }
  let ii = 0;
  for (let i = 0; i < s; i++) {
    const a = 0; // center
    const b = 1 + i;
    const c = 1 + ((i + 1) % s);
    idx[ii++] = a;
    idx[ii++] = b;
    idx[ii++] = c;
  }

  g.markAsDirty();
  return g;
}

export default {
  createBox,
  createSphere,
  createTorus,
  createPlane,
  createCylinder,
  createCone,
  createCircle,
};
