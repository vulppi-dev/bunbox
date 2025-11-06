import type { Disposable } from '@bunbox/utils';
import type { TextureBase } from '../resources';

/**
 * TexturePointer represents a handle to texture data in the manager.
 * Used to reference textures without direct coupling.
 * Uses symbol to ensure absolute uniqueness.
 */
export type TexturePointer = symbol;

interface TextureEntry {
  texture: TextureBase;
  version: number;
  pointer: TexturePointer;
}

/**
 * TextureManager manages texture data and provides pointer-based access.
 * Tracks dirty state and ensures efficient memory usage by deduplicating textures.
 */
export class TextureManager implements Disposable {
  #entries: Map<TexturePointer, TextureEntry> = new Map();
  #textureToPointer: Map<TextureBase, TexturePointer> = new Map();
  #hashToPointer: Map<string, TexturePointer> = new Map();
  #disposed = false;

  /**
   * Get total number of registered textures.
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
   * Register a texture and get a pointer to it.
   * If the texture is already registered, returns existing pointer.
   * Uses hash-based deduplication to avoid storing identical textures.
   */
  register(texture: TextureBase): TexturePointer {
    if (this.#disposed) {
      throw new Error('TextureManager has been disposed');
    }

    // Check if already registered
    const existing = this.#textureToPointer.get(texture);
    if (existing !== undefined) {
      return existing;
    }

    // Check for hash collision (same content, different instance)
    const hash = texture.hash;
    const hashPointer = this.#hashToPointer.get(hash);
    if (hashPointer !== undefined) {
      // Reuse existing texture with same content
      this.#textureToPointer.set(texture, hashPointer);
      return hashPointer;
    }

    // Create new entry
    const pointer = Symbol(`texture:${hash.slice(0, 8)}`);
    const entry: TextureEntry = {
      texture,
      version: texture.isDirty ? 1 : 0,
      pointer,
    };

    this.#entries.set(pointer, entry);
    this.#textureToPointer.set(texture, pointer);
    this.#hashToPointer.set(hash, pointer);

    return pointer;
  }

  /**
   * Unregister a texture by pointer.
   * Removes the texture from internal tracking.
   */
  unregister(pointer: TexturePointer): boolean {
    const entry = this.#entries.get(pointer);
    if (!entry) return false;

    const hash = entry.texture.hash;
    this.#entries.delete(pointer);
    this.#textureToPointer.delete(entry.texture);
    this.#hashToPointer.delete(hash);

    return true;
  }

  /**
   * Get texture by pointer.
   * Returns undefined if pointer is invalid.
   */
  get(pointer: TexturePointer): TextureBase | undefined {
    return this.#entries.get(pointer)?.texture;
  }

  /**
   * Get pointer for a registered texture.
   * Returns undefined if texture is not registered.
   */
  getPointer(texture: TextureBase): TexturePointer | undefined {
    return this.#textureToPointer.get(texture);
  }

  /**
   * Check if a texture is dirty (modified since last update).
   * Returns false if pointer is invalid.
   */
  isDirty(pointer: TexturePointer): boolean {
    const entry = this.#entries.get(pointer);
    if (!entry) return false;
    return entry.texture.isDirty;
  }

  /**
   * Mark a texture as clean and update its version.
   * Should be called after uploading data to GPU.
   */
  markAsClean(pointer: TexturePointer): void {
    const entry = this.#entries.get(pointer);
    if (!entry) return;

    entry.texture.markAsClean();
    entry.version++;
  }

  /**
   * Get the current version number of a texture.
   * Version increments each time the texture is marked as clean.
   * Returns 0 if pointer is invalid.
   */
  getVersion(pointer: TexturePointer): number {
    return this.#entries.get(pointer)?.version ?? 0;
  }

  /**
   * Get all registered pointers.
   */
  getAllPointers(): readonly TexturePointer[] {
    return Array.from(this.#entries.keys());
  }

  /**
   * Get all dirty textures with their pointers.
   */
  getDirtyTextures(): Array<{
    pointer: TexturePointer;
    texture: TextureBase;
  }> {
    const result: Array<{ pointer: TexturePointer; texture: TextureBase }> = [];
    for (const [pointer, entry] of this.#entries) {
      if (entry.texture.isDirty) {
        result.push({ pointer, texture: entry.texture });
      }
    }
    return result;
  }

  /**
   * Get textures by format.
   */
  getByFormat(format: string): Array<{
    pointer: TexturePointer;
    texture: TextureBase;
  }> {
    const result: Array<{ pointer: TexturePointer; texture: TextureBase }> = [];
    for (const [pointer, entry] of this.#entries) {
      if (entry.texture.format === format) {
        result.push({ pointer, texture: entry.texture });
      }
    }
    return result;
  }

  /**
   * Get depth/stencil textures.
   */
  getDepthTextures(): Array<{
    pointer: TexturePointer;
    texture: TextureBase;
  }> {
    const result: Array<{ pointer: TexturePointer; texture: TextureBase }> = [];
    for (const [pointer, entry] of this.#entries) {
      if (entry.texture.isDepthFormat) {
        result.push({ pointer, texture: entry.texture });
      }
    }
    return result;
  }

  /**
   * Clear all registered textures.
   */
  clear(): void {
    this.#entries.clear();
    this.#textureToPointer.clear();
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
