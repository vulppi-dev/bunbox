// prettier-multiline-arrays-set-line-pattern: 3
import { Geometry } from '../resources';

// Lightweight helpers to avoid repeated boilerplate.
function writeAll(
  geometry: Geometry,
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
) {
  geometry.writeVertices(positions);
  geometry.writeNormals(normals);
  if (uvs.length) geometry.writeUVs(0, uvs);
  geometry.writeIndices(indices);
  return geometry;
}

export function createPrimitiveTriangleGeometry(): Geometry {
  // simple 2D triangle in X/Y plane (Z=0)
  const positions = [
    0, 1, 0,
    -1, -1, 0,
    1, -1, 0,
  ];
  const normals = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  ];
  const uvs = [
    0.5, 1, 0,
    0, 1, 0,
  ];
  const indices = [
    0, 1, 2,
  ];
  return writeAll(new Geometry(3, 3, 1), positions, normals, uvs, indices);
}

export function createPrimitivePlaneGeometry(
  width = 2,
  height = 2,
  segmentsX = 1,
  segmentsY = 1,
): Geometry {
  const cols = Math.max(1, segmentsX) + 1;
  const rows = Math.max(1, segmentsY) + 1;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const halfW = width / 2;
  const halfH = height / 2;
  for (let y = 0; y < rows; y++) {
    const v = y / (rows - 1);
    const py = -halfH + v * height;
    for (let x = 0; x < cols; x++) {
      const u = x / (cols - 1);
      const px = -halfW + u * width;
      positions.push(px, py, 0);
      normals.push(0, 0, 1);
      uvs.push(u, 1 - v);
    }
  }

  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      const a = y * cols + x;
      const b = a + cols;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  return writeAll(
    new Geometry(positions.length / 3, indices.length, 1),
    positions,
    normals,
    uvs,
    indices,
  );
}

export function createPrimitiveCubeGeometry(
  size = 2,
  subdivisions = 1,
): Geometry {
  const seg = Math.max(1, Math.floor(subdivisions));
  const half = size / 2;
  const vertsPerFace = (seg + 1) * (seg + 1);

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const faces = [
    {
      n: [
        1, 0, 0,
      ],
      u: [
        0, 0, -1,
      ],
      v: [
        0, 1, 0,
      ],
    }, {
      n: [
        -1, 0, 0,
      ],
      u: [
        0, 0, 1,
      ],
      v: [
        0, 1, 0,
      ],
    }, {
      n: [
        0, 1, 0,
      ],
      u: [
        1, 0, 0,
      ],
      v: [
        0, 0, -1,
      ],
    },
    {
      n: [
        0, -1, 0,
      ],
      u: [
        1, 0, 0,
      ],
      v: [
        0, 0, 1,
      ],
    }, {
      n: [
        0, 0, 1,
      ],
      u: [
        1, 0, 0,
      ],
      v: [
        0, 1, 0,
      ],
    }, {
      n: [
        0, 0, -1,
      ],
      u: [
        -1, 0, 0,
      ],
      v: [
        0, 1, 0,
      ],
    },
  ];

  for (let f = 0; f < 6; f++) {
    const face = faces[f]!;
    const n = face.n;
    const u = face.u;
    const v = face.v;
    // face center offset along normal
    const nx = n[0]!,
      ny = n[1]!,
      nz = n[2]!;
    for (let iy = 0; iy <= seg; iy++) {
      const vy = (iy / seg - 0.5) * size;
      for (let ix = 0; ix <= seg; ix++) {
        const vx = (ix / seg - 0.5) * size;
        const px = nx * half + u[0]! * vx + v[0]! * vy;
        const py = ny * half + u[1]! * vx + v[1]! * vy;
        const pz = nz * half + u[2]! * vx + v[2]! * vy;
        positions.push(px, py, pz);
        normals.push(n[0]!, n[1]!, n[2]!);
        uvs.push(ix / seg, 1 - iy / seg);
      }
    }
    const base = f * vertsPerFace;
    for (let iy = 0; iy < seg; iy++) {
      for (let ix = 0; ix < seg; ix++) {
        const a = base + iy * (seg + 1) + ix;
        const b = a + (seg + 1);
        const c = b + 1;
        const d = a + 1;
        indices.push(a, b, d, b, c, d);
      }
    }
  }

  return writeAll(
    new Geometry(positions.length / 3, indices.length, 1),
    positions,
    normals,
    uvs,
    indices,
  );
}

export function createPrimitiveConeGeometry(
  radius = 1,
  height = 2,
  radialSegments = 16,
): Geometry {
  const ring = Math.max(3, Math.floor(radialSegments));
  const half = height / 2;
  const invRadius = radius === 0 ? 0 : 1 / radius;
  const vertexCount = ring * 2 + 2; // side ring + base ring + apex + center
  const indexCount = ring * 6; // sides + base

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // side vertices (ring)
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    positions.push(x, -half, z);
    // approximate normal for cone side
    const ln = Math.sqrt(radius * radius + height * height);
    const nx = (height / ln) * Math.cos(a);
    const nz = (height / ln) * Math.sin(a);
    const ny = radius / ln;
    normals.push(nx, ny, nz);
    uvs.push(i / ring, 0);
  }
  // apex
  positions.push(0, half, 0);
  normals.push(0, 1, 0);
  uvs.push(0.5, 1);

  const apexIndex = ring;
  const baseRingStart = apexIndex + 1;
  // base ring (separate so side normals stay intact)
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    positions.push(x, -half, z);
    normals.push(0, -1, 0);
    uvs.push(0.5 + x * invRadius * 0.5, 0.5 + z * invRadius * 0.5);
  }
  // base center
  positions.push(0, -half, 0);
  normals.push(0, -1, 0);
  uvs.push(0.5, 0.5);

  const baseCenterIdx = baseRingStart + ring;
  // side indices
  for (let i = 0; i < ring; i++) {
    const next = (i + 1) % ring;
    indices.push(i, next, apexIndex);
  }
  // base indices (fan)
  for (let i = 0; i < ring; i++) {
    const next = (i + 1) % ring;
    indices.push(baseCenterIdx, baseRingStart + next, baseRingStart + i);
  }

  return writeAll(
    new Geometry(vertexCount, indexCount, 1),
    positions,
    normals,
    uvs,
    indices,
  );
}

export function createPrimitiveCylinderGeometry(
  radius = 1,
  height = 2,
  radialSegments = 16,
): Geometry {
  const ring = Math.max(3, Math.floor(radialSegments));
  const half = height / 2;
  const invRadius = radius === 0 ? 0 : 1 / radius;
  const vertexCount = ring * 4 + 2; // side (2 rings) + caps (2 rings) + 2 centers
  const indexCount = ring * 12; // sides + caps

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // side top ring
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    positions.push(x, half, z);
    normals.push(x, 0, z);
    uvs.push(i / ring, 0);
  }
  // side bottom ring
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    positions.push(x, -half, z);
    normals.push(x, 0, z);
    uvs.push(i / ring, 1);
  }
  // cap top ring
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    positions.push(x, half, z);
    normals.push(0, 1, 0);
    uvs.push(0.5 + x * invRadius * 0.5, 0.5 + z * invRadius * 0.5);
  }
  // cap bottom ring
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    positions.push(x, -half, z);
    normals.push(0, -1, 0);
    uvs.push(0.5 + x * invRadius * 0.5, 0.5 + z * invRadius * 0.5);
  }
  // centers
  const topCenter = ring * 4;
  positions.push(0, half, 0);
  normals.push(0, 1, 0);
  uvs.push(0.5, 0.5);
  const bottomCenter = ring * 4 + 1;
  positions.push(0, -half, 0);
  normals.push(0, -1, 0);
  uvs.push(0.5, 0.5);

  // side indices (quads -> two tris)
  for (let i = 0; i < ring; i++) {
    const next = (i + 1) % ring;
    const a = i;
    const b = next;
    const c = ring + next;
    const d = ring + i;
    indices.push(a, b, c, a, c, d);
  }
  // top cap
  const capTopStart = ring * 2;
  for (let i = 0; i < ring; i++) {
    const next = (i + 1) % ring;
    indices.push(topCenter, capTopStart + i, capTopStart + next);
  }
  // bottom cap
  const capBottomStart = ring * 3;
  for (let i = 0; i < ring; i++) {
    const next = (i + 1) % ring;
    indices.push(bottomCenter, capBottomStart + next, capBottomStart + i);
  }

  // normalize side normals
  for (let i = 0; i < ring * 2; i++) {
    const ox = normals[i * 3]!;
    const oy = normals[i * 3 + 1]!;
    const oz = normals[i * 3 + 2]!;
    const l = Math.hypot(ox, oy, oz) || 1;
    normals[i * 3] = ox / l;
    normals[i * 3 + 1] = oy / l;
    normals[i * 3 + 2] = oz / l;
  }

  return writeAll(
    new Geometry(vertexCount, indexCount, 1),
    positions,
    normals,
    uvs,
    indices,
  );
}

export function createPrimitiveSphereGeometry(
  radius = 1,
  widthSegments = 16,
  heightSegments = 12,
): Geometry {
  const phiStart = 0;
  const phiLength = Math.PI * 2;
  const thetaStart = 0;
  const thetaLength = Math.PI;

  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    for (let x = 0; x <= widthSegments; x++) {
      const u = x / widthSegments;
      const phi = phiStart + u * phiLength;
      const theta = thetaStart + v * thetaLength;

      const px = -radius * Math.cos(phi) * Math.sin(theta);
      const py = radius * Math.cos(theta);
      const pz = radius * Math.sin(phi) * Math.sin(theta);

      vertices.push(px, py, pz);
      const len = Math.hypot(px, py, pz) || 1;
      normals.push(px / len, py / len, pz / len);
      uvs.push(u, 1 - v);
    }
  }

  const verticesPerRow = widthSegments + 1;
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = y * verticesPerRow + x;
      const b = a + verticesPerRow;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  return writeAll(
    new Geometry(vertices.length / 3, indices.length, 1),
    vertices,
    normals,
    uvs,
    indices,
  );
}

export function createPrimitiveIcoSphereGeometry(): Geometry {
  // simple icosahedron (no subdivisions) - good as an "icon" sphere
  const t = (1 + Math.sqrt(5)) / 2;
  const verts = [
    -1, t, 0,
    1, t, 0,
    -1, -t, 0,
    1, -t, 0,
    0, -1, t,
    0, 1, t,
    0, -1, -t,
    0, 1, -t,
    t, 0, -1,
    t, 0, 1,
    -t, 0, -1,
    -t, 0, 1,
  ];
  // normalize vertices to unit sphere
  for (let i = 0; i < verts.length; i += 3) {
    const x = verts[i]!;
    const y = verts[i + 1]!;
    const z = verts[i + 2]!;
    const l = Math.hypot(x, y, z) || 1;
    verts[i] = x / l;
    verts[i + 1] = y / l;
    verts[i + 2] = z / l;
  }
  const faces = [
    0, 11, 5,
    0, 5, 1,
    0, 1, 7,
    0, 7, 10,
    0, 10, 11,
    1, 5, 9,
    5, 11, 4,
    11, 10, 2,
    10, 7, 6,
    7, 1, 8,
    3, 9, 4,
    3, 4, 2,
    3, 2, 6,
    3, 6, 8,
    3, 8, 9,
    4, 9, 5,
    2, 4, 11,
    6, 2, 10,
    8, 6, 7,
    9, 8, 1,
  ];

  const normals: number[] = [];
  const uvs: number[] = [];
  for (let i = 0; i < verts.length; i += 3) {
    const x = verts[i]!,
      y = verts[i + 1]!,
      z = verts[i + 2]!;
    normals.push(x, y, z);
    // spherical UV approximation
    const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
    const v = 0.5 - Math.asin(y) / Math.PI;
    uvs.push(u, v);
  }

  return writeAll(
    new Geometry(verts.length / 3, faces.length, 1),
    verts,
    normals,
    uvs,
    faces,
  );
}

export function createPrimitivePillGeometry(
  radius = 0.5,
  length = 2,
  segments = 12,
): Geometry {
  // capsule: cylinder length (without caps) = length, plus hemisphere caps
  const hemiSegments = Math.max(3, Math.floor(segments / 2));
  const radial = Math.max(3, segments);

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const cylinderLength = Math.max(0, length - radius * 2);
  const half = cylinderLength / 2;

  // build hemisphere top
  for (let y = 0; y <= hemiSegments; y++) {
    const v = y / hemiSegments;
    const theta = (v * Math.PI) / 2;
    for (let i = 0; i <= radial; i++) {
      const u = i / radial;
      const phi = u * Math.PI * 2;
      const sx = Math.cos(phi) * Math.cos(theta) * radius;
      const sy = Math.sin(theta) * radius;
      const sz = Math.sin(phi) * Math.cos(theta) * radius;
      positions.push(sx, half + sy, sz);
      const l = Math.hypot(sx, sy, sz) || 1;
      normals.push(sx / l, sy / l, sz / l);
      uvs.push(u, 1 - v * 0.5);
    }
  }

  const topRows = hemiSegments + 1;
  // cylinder body
  for (let y = 0; y <= 1; y++) {
    const py = half * (1 - 2 * y);
    for (let i = 0; i <= radial; i++) {
      const u = i / radial;
      const phi = u * Math.PI * 2;
      const sx = Math.cos(phi) * radius;
      const sz = Math.sin(phi) * radius;
      positions.push(sx, py, sz);
      const l = Math.hypot(sx, 0, sz) || 1;
      normals.push(sx / l, 0, sz / l);
      uvs.push(u, 0.5 + (y === 0 ? 0.5 : 0));
    }
  }

  const cylRows = 2;
  // bottom hemisphere
  for (let y = 0; y <= hemiSegments; y++) {
    const v = y / hemiSegments;
    const theta = (v * Math.PI) / 2;
    for (let i = 0; i <= radial; i++) {
      const u = i / radial;
      const phi = u * Math.PI * 2;
      const sx = Math.cos(phi) * Math.cos(theta) * radius;
      const sy = -Math.sin(theta) * radius;
      const sz = Math.sin(phi) * Math.cos(theta) * radius;
      positions.push(sx, -half + sy, sz);
      const l = Math.hypot(sx, sy, sz) || 1;
      normals.push(sx / l, sy / l, sz / l);
      uvs.push(u, v * 0.5);
    }
  }

  const rows = topRows + cylRows + (hemiSegments + 1);
  const cols = radial + 1;
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = r * cols + c;
      const b = a + cols;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  return writeAll(
    new Geometry(positions.length / 3, indices.length, 1),
    positions,
    normals,
    uvs,
    indices,
  );
}

export function createPrimitiveTorusGeometry(
  major = 1,
  minor = 0.3,
  tubularSegments = 24,
  radialSegments = 12,
): Geometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let j = 0; j <= radialSegments; j++) {
    const v = (j / radialSegments) * Math.PI * 2;
    const cosV = Math.cos(v);
    const sinV = Math.sin(v);
    for (let i = 0; i <= tubularSegments; i++) {
      const u = (i / tubularSegments) * Math.PI * 2;
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);
      const x = (major + minor * cosV) * cosU;
      const y = (major + minor * cosV) * sinU;
      const z = minor * sinV;
      positions.push(x, z, y);
      const nx = cosV * cosU;
      const ny = sinV;
      const nz = cosV * sinU;
      const l = Math.hypot(nx, ny, nz) || 1;
      normals.push(nx / l, ny / l, nz / l);
      uvs.push(i / tubularSegments, j / radialSegments);
    }
  }

  for (let j = 0; j < radialSegments; j++) {
    for (let i = 0; i < tubularSegments; i++) {
      const a = (tubularSegments + 1) * j + i;
      const b = (tubularSegments + 1) * (j + 1) + i;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  return writeAll(
    new Geometry(positions.length / 3, indices.length, 1),
    positions,
    normals,
    uvs,
    indices,
  );
}
