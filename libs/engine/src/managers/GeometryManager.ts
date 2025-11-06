import type { Disposable } from '@bunbox/utils';
import type { Geometry } from '../resources';

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
  #entries: Map<GeometryPointer, GeometryEntry> = new Map();
  #geometryToPointer: Map<Geometry, GeometryPointer> = new Map();
  #hashToPointer: Map<string, GeometryPointer> = new Map();
  #disposed = false;

  /**
   * Get total number of registered geometries.
   */
  get count(): number {
    return this.#entries.size;
  }

  /**
   * Check if the manager has been disposed.
   */
  get isDisposed(): boolean {
    return this.#disposed;
  }

  /**
   * Register a geometry and get a pointer to it.
   * If the geometry is already registered, returns existing pointer.
   * Uses hash-based deduplication to avoid storing identical geometries.
   */
  register(geometry: Geometry): GeometryPointer {
    if (this.#disposed) {
      throw new Error('GeometryManager has been disposed');
    }

    // Check if already registered
    const existing = this.#geometryToPointer.get(geometry);
    if (existing !== undefined) {
      return existing;
    }

    // Check for hash collision (same content, different instance)
    const hash = geometry.hash;
    const hashPointer = this.#hashToPointer.get(hash);
    if (hashPointer !== undefined) {
      // Reuse existing geometry with same content
      this.#geometryToPointer.set(geometry, hashPointer);
      return hashPointer;
    }

    // Create new entry
    const pointer = Symbol(`geometry:${hash.slice(0, 8)}`);
    const entry: GeometryEntry = {
      geometry,
      version: geometry.isDirty ? 1 : 0,
      pointer,
    };

    this.#entries.set(pointer, entry);
    this.#geometryToPointer.set(geometry, pointer);
    this.#hashToPointer.set(hash, pointer);

    return pointer;
  }

  /**
   * Unregister a geometry by pointer.
   * Removes the geometry from internal tracking.
   */
  unregister(pointer: GeometryPointer): boolean {
    const entry = this.#entries.get(pointer);
    if (!entry) return false;

    const hash = entry.geometry.hash;
    this.#entries.delete(pointer);
    this.#geometryToPointer.delete(entry.geometry);
    this.#hashToPointer.delete(hash);

    return true;
  }

  /**
   * Get geometry by pointer.
   * Returns undefined if pointer is invalid.
   */
  get(pointer: GeometryPointer): Geometry | undefined {
    return this.#entries.get(pointer)?.geometry;
  }

  /**
   * Get pointer for a registered geometry.
   * Returns undefined if geometry is not registered.
   */
  getPointer(geometry: Geometry): GeometryPointer | undefined {
    return this.#geometryToPointer.get(geometry);
  }

  /**
   * Check if a geometry is dirty (modified since last update).
   * Returns false if pointer is invalid.
   */
  isDirty(pointer: GeometryPointer): boolean {
    const entry = this.#entries.get(pointer);
    if (!entry) return false;
    return entry.geometry.isDirty;
  }

  /**
   * Mark a geometry as clean and update its version.
   * Should be called after uploading data to GPU.
   */
  markAsClean(pointer: GeometryPointer): void {
    const entry = this.#entries.get(pointer);
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
    return this.#entries.get(pointer)?.version ?? 0;
  }

  /**
   * Get all registered pointers.
   */
  getAllPointers(): readonly GeometryPointer[] {
    return Array.from(this.#entries.keys());
  }

  /**
   * Get all dirty geometries with their pointers.
   */
  getDirtyGeometries(): Array<{
    pointer: GeometryPointer;
    geometry: Geometry;
  }> {
    const result: Array<{ pointer: GeometryPointer; geometry: Geometry }> = [];
    for (const [pointer, entry] of this.#entries) {
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
    this.#entries.clear();
    this.#geometryToPointer.clear();
    this.#hashToPointer.clear();
  }

  /**
   * Dispose the manager and clear all data.
   */
  dispose(): void {
    if (this.#disposed) return;
    this.clear();
    this.#disposed = true;
  }
}
