import type { Disposable } from '@bunbox/utils';
import { Geometry } from '../resources';

/**
 * GeometryPointer represents a handle to geometry data in the manager.
 * Used to reference geometry without direct coupling.
 * Uses symbol to ensure absolute uniqueness.
 */
export type GeometryPointer = symbol;

interface GeometryEntry {
  geometry: Geometry;
  version: number;
  pointer: GeometryPointer;
}

/**
 * GeometryManager manages geometry buffers and provides pointer-based access.
 * Tracks dirty state and ensures efficient memory usage by deduplicating geometries.
 */
export class GeometryManager implements Disposable {
  private __entries: Map<GeometryPointer, GeometryEntry> = new Map();
  private __geometryToPointer: Map<Geometry, GeometryPointer> = new Map();
  private __hashToPointer: Map<string, GeometryPointer> = new Map();
  private __disposed = false;

  /**
   * Get total number of registered geometries.
   */
  get count(): number {
    return this.__entries.size;
  }

  /**
   * Check if the manager has been disposed.
   */
  get isDisposed(): boolean {
    return this.__disposed;
  }

  /**
   * Register a geometry and get a pointer to it.
   * If the geometry is already registered, returns existing pointer.
   * Uses hash-based deduplication to avoid storing identical geometries.
   */
  register(geometry: Geometry): GeometryPointer {
    if (this.__disposed) {
      throw new Error('GeometryManager has been disposed');
    }

    // Check if already registered
    const existing = this.__geometryToPointer.get(geometry);
    if (existing !== undefined) {
      return existing;
    }

    // Check for hash collision (same content, different instance)
    const hash = geometry.hash;
    const hashPointer = this.__hashToPointer.get(hash);
    if (hashPointer !== undefined) {
      // Reuse existing geometry with same content
      this.__geometryToPointer.set(geometry, hashPointer);
      return hashPointer;
    }

    // Create new entry
    const pointer = Symbol(`geometry:${hash.slice(0, 8)}`);
    const entry: GeometryEntry = {
      geometry,
      version: geometry.isDirty ? 1 : 0,
      pointer,
    };

    this.__entries.set(pointer, entry);
    this.__geometryToPointer.set(geometry, pointer);
    this.__hashToPointer.set(hash, pointer);

    return pointer;
  }

  /**
   * Unregister a geometry by pointer.
   * Removes the geometry from internal tracking.
   */
  unregister(pointer: GeometryPointer): boolean {
    const entry = this.__entries.get(pointer);
    if (!entry) return false;

    const hash = entry.geometry.hash;
    this.__entries.delete(pointer);
    this.__geometryToPointer.delete(entry.geometry);
    this.__hashToPointer.delete(hash);

    return true;
  }

  /**
   * Get geometry by pointer.
   * Returns undefined if pointer is invalid.
   */
  get(pointer: GeometryPointer): Geometry | undefined {
    return this.__entries.get(pointer)?.geometry;
  }

  /**
   * Get pointer for a registered geometry.
   * Returns undefined if geometry is not registered.
   */
  getPointer(geometry: Geometry): GeometryPointer | undefined {
    return this.__geometryToPointer.get(geometry);
  }

  /**
   * Check if a geometry is dirty (modified since last update).
   * Returns false if pointer is invalid.
   */
  isDirty(pointer: GeometryPointer): boolean {
    const entry = this.__entries.get(pointer);
    if (!entry) return false;
    return entry.geometry.isDirty;
  }

  /**
   * Mark a geometry as clean and update its version.
   * Should be called after uploading data to GPU.
   */
  markAsClean(pointer: GeometryPointer): void {
    const entry = this.__entries.get(pointer);
    if (!entry) return;

    entry.geometry.markAsClean();
    entry.version++;
  }

  /**
   * Get the current version number of a geometry.
   * Version increments each time the geometry is marked as clean.
   * Returns 0 if pointer is invalid.
   */
  getVersion(pointer: GeometryPointer): number {
    return this.__entries.get(pointer)?.version ?? 0;
  }

  /**
   * Get all registered pointers.
   */
  getAllPointers(): readonly GeometryPointer[] {
    return Array.from(this.__entries.keys());
  }

  /**
   * Get all dirty geometries with their pointers.
   */
  getDirtyGeometries(): Array<{
    pointer: GeometryPointer;
    geometry: Geometry;
  }> {
    const result: Array<{ pointer: GeometryPointer; geometry: Geometry }> = [];
    for (const [pointer, entry] of this.__entries) {
      if (entry.geometry.isDirty) {
        result.push({ pointer, geometry: entry.geometry });
      }
    }
    return result;
  }

  /**
   * Clear all registered geometries.
   */
  clear(): void {
    this.__entries.clear();
    this.__geometryToPointer.clear();
    this.__hashToPointer.clear();
  }

  /**
   * Dispose the manager and clear all data.
   */
  dispose(): void {
    if (this.__disposed) return;
    this.clear();
    this.__disposed = true;
  }

  // ==================== PRIMITIVE GEOMETRIES ====================

  /**
   * Create a box (cube) geometry with specified dimensions.
   *
   * Generates a box with 8 vertices, 12 triangles (6 faces).
   * Includes normals and UVs for texture mapping.
   *
   * @param width - Width along X axis (default: 1)
   * @param height - Height along Y axis (default: 1)
   * @param depth - Depth along Z axis (default: 1)
   * @param widthSegments - Number of segments along width (default: 1)
   * @param heightSegments - Number of segments along height (default: 1)
   * @param depthSegments - Number of segments along depth (default: 1)
   * @returns GeometryPointer to the created box
   *
   * @example
   * ```ts
   * const box = manager.createBox(2, 2, 2); // 2x2x2 cube
   * const detailedBox = manager.createBox(1, 1, 1, 4, 4, 4); // With more segments
   * ```
   */
  createBox(
    width: number = 1,
    height: number = 1,
    depth: number = 1,
    widthSegments: number = 1,
    heightSegments: number = 1,
    depthSegments: number = 1,
  ): GeometryPointer {
    const ws = Math.max(1, Math.floor(widthSegments));
    const hs = Math.max(1, Math.floor(heightSegments));
    const ds = Math.max(1, Math.floor(depthSegments));

    // Calculate vertex and index counts for all faces
    const verticesPerFace = (ws + 1) * (hs + 1);
    const indicesPerFace = ws * hs * 6;

    const totalVertices =
      2 * verticesPerFace + // front + back
      2 * ((ws + 1) * (ds + 1)) + // top + bottom
      2 * ((hs + 1) * (ds + 1)); // left + right

    const totalIndices =
      2 * indicesPerFace + 2 * (ws * ds * 6) + 2 * (hs * ds * 6);

    const geometry = new Geometry(totalVertices, totalIndices, 1);

    let vertexOffset = 0;
    let indexOffset = 0;

    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;
    const halfDepth = depth * 0.5;

    // Helper function to build a face
    const buildFace = (
      uDir: [number, number, number],
      vDir: [number, number, number],
      normal: [number, number, number],
      uSegments: number,
      vSegments: number,
      uSize: number,
      vSize: number,
      offset: [number, number, number],
    ) => {
      const startVertex = vertexOffset;

      // Generate vertices
      for (let v = 0; v <= vSegments; v++) {
        for (let u = 0; u <= uSegments; u++) {
          const uT = u / uSegments;
          const vT = v / vSegments;

          const x =
            offset[0] +
            uDir[0] * (uT - 0.5) * uSize +
            vDir[0] * (vT - 0.5) * vSize;
          const y =
            offset[1] +
            uDir[1] * (uT - 0.5) * uSize +
            vDir[1] * (vT - 0.5) * vSize;
          const z =
            offset[2] +
            uDir[2] * (uT - 0.5) * uSize +
            vDir[2] * (vT - 0.5) * vSize;

          geometry.setVertex(vertexOffset, x, y, z);
          geometry.setNormal(vertexOffset, normal[0], normal[1], normal[2]);
          geometry.setUV(0, vertexOffset, uT, vT);
          vertexOffset++;
        }
      }

      // Generate indices
      for (let v = 0; v < vSegments; v++) {
        for (let u = 0; u < uSegments; u++) {
          const a = startVertex + v * (uSegments + 1) + u;
          const b = a + 1;
          const c = a + (uSegments + 1);
          const d = c + 1;

          geometry.setIndex(indexOffset++, a);
          geometry.setIndex(indexOffset++, b);
          geometry.setIndex(indexOffset++, d);
          geometry.setIndex(indexOffset++, a);
          geometry.setIndex(indexOffset++, d);
          geometry.setIndex(indexOffset++, c);
        }
      }
    };

    // Front face (+Z)
    buildFace([1, 0, 0], [0, 1, 0], [0, 0, 1], ws, hs, width, height, [
      0,
      0,
      halfDepth,
    ]);

    // Back face (-Z)
    buildFace([-1, 0, 0], [0, 1, 0], [0, 0, -1], ws, hs, width, height, [
      0,
      0,
      -halfDepth,
    ]);

    // Top face (+Y)
    buildFace([1, 0, 0], [0, 0, 1], [0, 1, 0], ws, ds, width, depth, [
      0,
      halfHeight,
      0,
    ]);

    // Bottom face (-Y)
    buildFace([1, 0, 0], [0, 0, -1], [0, -1, 0], ws, ds, width, depth, [
      0,
      -halfHeight,
      0,
    ]);

    // Right face (+X)
    buildFace([0, 0, -1], [0, 1, 0], [1, 0, 0], ds, hs, depth, height, [
      halfWidth,
      0,
      0,
    ]);

    // Left face (-X)
    buildFace([0, 0, 1], [0, 1, 0], [-1, 0, 0], ds, hs, depth, height, [
      -halfWidth,
      0,
      0,
    ]);

    return this.register(geometry);
  }

  /**
   * Create a sphere geometry using UV sphere algorithm.
   *
   * Generates a sphere with latitude/longitude grid.
   * Includes smooth normals and spherical UV mapping.
   *
   * @param radius - Sphere radius (default: 1)
   * @param widthSegments - Number of horizontal segments (default: 32)
   * @param heightSegments - Number of vertical segments (default: 16)
   * @param phiStart - Horizontal starting angle in radians (default: 0)
   * @param phiLength - Horizontal sweep angle (default: 2π)
   * @param thetaStart - Vertical starting angle (default: 0)
   * @param thetaLength - Vertical sweep angle (default: π)
   * @returns GeometryPointer to the created sphere
   *
   * @example
   * ```ts
   * const sphere = manager.createSphere(1, 32, 16); // Standard sphere
   * const hemisphere = manager.createSphere(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
   * ```
   */
  createSphere(
    radius: number = 1,
    widthSegments: number = 32,
    heightSegments: number = 16,
    phiStart: number = 0,
    phiLength: number = Math.PI * 2,
    thetaStart: number = 0,
    thetaLength: number = Math.PI,
  ): GeometryPointer {
    const ws = Math.max(3, Math.floor(widthSegments));
    const hs = Math.max(2, Math.floor(heightSegments));

    const vertexCount = (ws + 1) * (hs + 1);
    const indexCount = ws * hs * 6;

    const geometry = new Geometry(vertexCount, indexCount, 1);

    let vertexOffset = 0;
    let indexOffset = 0;

    // Generate vertices
    for (let y = 0; y <= hs; y++) {
      const v = y / hs;
      const theta = thetaStart + v * thetaLength;

      for (let x = 0; x <= ws; x++) {
        const u = x / ws;
        const phi = phiStart + u * phiLength;

        // Spherical to Cartesian coordinates
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const nx = sinTheta * cosPhi;
        const ny = cosTheta;
        const nz = sinTheta * sinPhi;

        const px = radius * nx;
        const py = radius * ny;
        const pz = radius * nz;

        geometry.setVertex(vertexOffset, px, py, pz);
        geometry.setNormal(vertexOffset, nx, ny, nz);
        geometry.setUV(0, vertexOffset, u, 1 - v);
        vertexOffset++;
      }
    }

    // Generate indices
    for (let y = 0; y < hs; y++) {
      for (let x = 0; x < ws; x++) {
        const a = y * (ws + 1) + x;
        const b = a + 1;
        const c = a + (ws + 1);
        const d = c + 1;

        geometry.setIndex(indexOffset++, a);
        geometry.setIndex(indexOffset++, c);
        geometry.setIndex(indexOffset++, b);
        geometry.setIndex(indexOffset++, b);
        geometry.setIndex(indexOffset++, c);
        geometry.setIndex(indexOffset++, d);
      }
    }

    return this.register(geometry);
  }

  /**
   * Create a plane geometry on XY plane.
   *
   * Generates a flat rectangular surface facing +Z.
   * Useful for ground planes, walls, or UI backgrounds.
   *
   * @param width - Width along X axis (default: 1)
   * @param height - Height along Y axis (default: 1)
   * @param widthSegments - Number of segments along width (default: 1)
   * @param heightSegments - Number of segments along height (default: 1)
   * @returns GeometryPointer to the created plane
   *
   * @example
   * ```ts
   * const ground = manager.createPlane(100, 100, 10, 10); // Large subdivided ground
   * const wall = manager.createPlane(10, 5); // Simple wall
   * ```
   */
  createPlane(
    width: number = 1,
    height: number = 1,
    widthSegments: number = 1,
    heightSegments: number = 1,
  ): GeometryPointer {
    const ws = Math.max(1, Math.floor(widthSegments));
    const hs = Math.max(1, Math.floor(heightSegments));

    const vertexCount = (ws + 1) * (hs + 1);
    const indexCount = ws * hs * 6;

    const geometry = new Geometry(vertexCount, indexCount, 1);

    let vertexOffset = 0;
    let indexOffset = 0;

    // Generate vertices
    for (let y = 0; y <= hs; y++) {
      const v = y / hs;
      const py = (v - 0.5) * height;

      for (let x = 0; x <= ws; x++) {
        const u = x / ws;
        const px = (u - 0.5) * width;

        geometry.setVertex(vertexOffset, px, py, 0);
        geometry.setNormal(vertexOffset, 0, 0, 1);
        geometry.setUV(0, vertexOffset, u, 1 - v);
        vertexOffset++;
      }
    }

    // Generate indices
    for (let y = 0; y < hs; y++) {
      for (let x = 0; x < ws; x++) {
        const a = y * (ws + 1) + x;
        const b = a + 1;
        const c = a + (ws + 1);
        const d = c + 1;

        geometry.setIndex(indexOffset++, a);
        geometry.setIndex(indexOffset++, c);
        geometry.setIndex(indexOffset++, b);
        geometry.setIndex(indexOffset++, b);
        geometry.setIndex(indexOffset++, c);
        geometry.setIndex(indexOffset++, d);
      }
    }

    return this.register(geometry);
  }

  /**
   * Create a cylinder geometry.
   *
   * Generates a cylinder with caps on both ends.
   * Includes smooth normals on the side and flat normals on caps.
   *
   * @param radiusTop - Radius at top (default: 1)
   * @param radiusBottom - Radius at bottom (default: 1)
   * @param height - Height along Y axis (default: 1)
   * @param radialSegments - Number of segments around circumference (default: 32)
   * @param heightSegments - Number of segments along height (default: 1)
   * @param openEnded - Whether to exclude caps (default: false)
   * @returns GeometryPointer to the created cylinder
   *
   * @example
   * ```ts
   * const cylinder = manager.createCylinder(1, 1, 2); // Standard cylinder
   * const cone = manager.createCylinder(0, 1, 2); // Cone (zero top radius)
   * const tube = manager.createCylinder(1, 1, 2, 32, 1, true); // Open tube
   * ```
   */
  createCylinder(
    radiusTop: number = 1,
    radiusBottom: number = 1,
    height: number = 1,
    radialSegments: number = 32,
    heightSegments: number = 1,
    openEnded: boolean = false,
  ): GeometryPointer {
    const rs = Math.max(3, Math.floor(radialSegments));
    const hs = Math.max(1, Math.floor(heightSegments));

    // Calculate vertex and index counts
    const sideVertices = (rs + 1) * (hs + 1);
    const capVertices = openEnded ? 0 : 2 * (rs + 1);
    const vertexCount = sideVertices + capVertices;

    const sideIndices = rs * hs * 6;
    const capIndices = openEnded ? 0 : 2 * rs * 3;
    const indexCount = sideIndices + capIndices;

    const geometry = new Geometry(vertexCount, indexCount, 1);

    const halfHeight = height * 0.5;
    let vertexOffset = 0;
    let indexOffset = 0;

    // Generate side vertices
    for (let y = 0; y <= hs; y++) {
      const v = y / hs;
      const py = v * height - halfHeight;
      const radius = radiusBottom + v * (radiusTop - radiusBottom);

      for (let x = 0; x <= rs; x++) {
        const u = x / rs;
        const theta = u * Math.PI * 2;

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        const px = radius * cosTheta;
        const pz = radius * sinTheta;

        // Normal for cylinder side
        const slope = (radiusBottom - radiusTop) / height;
        const nx = cosTheta;
        const ny = slope;
        const nz = sinTheta;
        const nl = Math.sqrt(nx * nx + ny * ny + nz * nz);

        geometry.setVertex(vertexOffset, px, py, pz);
        geometry.setNormal(vertexOffset, nx / nl, ny / nl, nz / nl);
        geometry.setUV(0, vertexOffset, u, 1 - v);
        vertexOffset++;
      }
    }

    // Generate side indices
    for (let y = 0; y < hs; y++) {
      for (let x = 0; x < rs; x++) {
        const a = y * (rs + 1) + x;
        const b = a + 1;
        const c = a + (rs + 1);
        const d = c + 1;

        geometry.setIndex(indexOffset++, a);
        geometry.setIndex(indexOffset++, c);
        geometry.setIndex(indexOffset++, b);
        geometry.setIndex(indexOffset++, b);
        geometry.setIndex(indexOffset++, c);
        geometry.setIndex(indexOffset++, d);
      }
    }

    if (!openEnded) {
      // Top cap
      const topCenter = vertexOffset;
      geometry.setVertex(topCenter, 0, halfHeight, 0);
      geometry.setNormal(topCenter, 0, 1, 0);
      geometry.setUV(0, topCenter, 0.5, 0.5);
      vertexOffset++;

      for (let x = 0; x < rs; x++) {
        const u = x / rs;
        const theta = u * Math.PI * 2;
        const px = radiusTop * Math.cos(theta);
        const pz = radiusTop * Math.sin(theta);

        geometry.setVertex(vertexOffset, px, halfHeight, pz);
        geometry.setNormal(vertexOffset, 0, 1, 0);
        geometry.setUV(
          0,
          vertexOffset,
          0.5 + 0.5 * Math.cos(theta),
          0.5 + 0.5 * Math.sin(theta),
        );

        const next = x === rs - 1 ? topCenter + 1 : vertexOffset + 1;
        geometry.setIndex(indexOffset++, topCenter);
        geometry.setIndex(indexOffset++, vertexOffset);
        geometry.setIndex(indexOffset++, next);

        vertexOffset++;
      }

      // Bottom cap
      const bottomCenter = vertexOffset;
      geometry.setVertex(bottomCenter, 0, -halfHeight, 0);
      geometry.setNormal(bottomCenter, 0, -1, 0);
      geometry.setUV(0, bottomCenter, 0.5, 0.5);
      vertexOffset++;

      for (let x = 0; x < rs; x++) {
        const u = x / rs;
        const theta = u * Math.PI * 2;
        const px = radiusBottom * Math.cos(theta);
        const pz = radiusBottom * Math.sin(theta);

        geometry.setVertex(vertexOffset, px, -halfHeight, pz);
        geometry.setNormal(vertexOffset, 0, -1, 0);
        geometry.setUV(
          0,
          vertexOffset,
          0.5 + 0.5 * Math.cos(theta),
          0.5 + 0.5 * Math.sin(theta),
        );

        const next = x === rs - 1 ? bottomCenter + 1 : vertexOffset + 1;
        geometry.setIndex(indexOffset++, bottomCenter);
        geometry.setIndex(indexOffset++, next);
        geometry.setIndex(indexOffset++, vertexOffset);

        vertexOffset++;
      }
    }

    return this.register(geometry);
  }

  /**
   * Create a cone geometry.
   *
   * Convenience method for creating a cylinder with zero top radius.
   *
   * @param radius - Base radius (default: 1)
   * @param height - Height along Y axis (default: 1)
   * @param radialSegments - Number of segments around circumference (default: 32)
   * @param heightSegments - Number of segments along height (default: 1)
   * @param openEnded - Whether to exclude base cap (default: false)
   * @returns GeometryPointer to the created cone
   *
   * @example
   * ```ts
   * const cone = manager.createCone(1, 2); // Standard cone
   * const pyramid = manager.createCone(1, 2, 4); // 4-sided pyramid
   * ```
   */
  createCone(
    radius: number = 1,
    height: number = 1,
    radialSegments: number = 32,
    heightSegments: number = 1,
    openEnded: boolean = false,
  ): GeometryPointer {
    return this.createCylinder(
      0,
      radius,
      height,
      radialSegments,
      heightSegments,
      openEnded,
    );
  }

  /**
   * Create a torus (donut) geometry.
   *
   * Generates a torus with smooth normals.
   *
   * @param radius - Distance from center to tube center (default: 1)
   * @param tubeRadius - Radius of the tube (default: 0.4)
   * @param radialSegments - Number of segments around tube (default: 16)
   * @param tubularSegments - Number of segments along torus (default: 32)
   * @param arc - Central angle in radians (default: 2π for full torus)
   * @returns GeometryPointer to the created torus
   *
   * @example
   * ```ts
   * const torus = manager.createTorus(1, 0.4); // Standard donut
   * const arcTorus = manager.createTorus(1, 0.4, 16, 32, Math.PI); // Half torus
   * ```
   */
  createTorus(
    radius: number = 1,
    tubeRadius: number = 0.4,
    radialSegments: number = 16,
    tubularSegments: number = 32,
    arc: number = Math.PI * 2,
  ): GeometryPointer {
    const rs = Math.max(3, Math.floor(radialSegments));
    const ts = Math.max(3, Math.floor(tubularSegments));

    const vertexCount = (rs + 1) * (ts + 1);
    const indexCount = rs * ts * 6;

    const geometry = new Geometry(vertexCount, indexCount, 1);

    let vertexOffset = 0;
    let indexOffset = 0;

    // Generate vertices
    for (let j = 0; j <= rs; j++) {
      const v = j / rs;
      const phi = v * Math.PI * 2;

      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      for (let i = 0; i <= ts; i++) {
        const u = i / ts;
        const theta = u * arc;

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        // Position
        const px = (radius + tubeRadius * cosPhi) * cosTheta;
        const py = tubeRadius * sinPhi;
        const pz = (radius + tubeRadius * cosPhi) * sinTheta;

        // Normal
        const nx = cosPhi * cosTheta;
        const ny = sinPhi;
        const nz = cosPhi * sinTheta;

        geometry.setVertex(vertexOffset, px, py, pz);
        geometry.setNormal(vertexOffset, nx, ny, nz);
        geometry.setUV(0, vertexOffset, u, v);
        vertexOffset++;
      }
    }

    // Generate indices
    for (let j = 0; j < rs; j++) {
      for (let i = 0; i < ts; i++) {
        const a = j * (ts + 1) + i;
        const b = a + 1;
        const c = a + (ts + 1);
        const d = c + 1;

        geometry.setIndex(indexOffset++, a);
        geometry.setIndex(indexOffset++, c);
        geometry.setIndex(indexOffset++, b);
        geometry.setIndex(indexOffset++, b);
        geometry.setIndex(indexOffset++, c);
        geometry.setIndex(indexOffset++, d);
      }
    }

    return this.register(geometry);
  }
}
