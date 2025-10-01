// Image decoding and Texture creation helpers
// All comments in English as per repository guidelines.

import { Texture, type TextureDescriptor } from '../elements/Texture';
import { decode as decodePng } from '@jsquash/png';
import { decode as decodeJpeg } from '@jsquash/jpeg';
import { decode as decodeWebp } from '@jsquash/webp';
import { decode as decodeAvif } from '@jsquash/avif';

/** Result of decoding an image file/buffer. */
export type DecodedImage = {
  data: Uint8Array | Uint16Array;
  width: number;
  height: number;
  bitDepth?: number;
};

function extOf(path: string): string {
  const dot = path.lastIndexOf('.');
  if (dot < 0) return '';
  return path.slice(dot + 1).toLowerCase();
}

/** Decode an image buffer (PNG/JPEG/WEBP/AVIF) to raw image data.
 * By default returns 8-bit RGBA (Uint8Array). Some inputs may output 16-bit.
 */
export async function decodeImage(
  buffer: ArrayBuffer,
  mimeOrExt?: string,
): Promise<DecodedImage> {
  const key = (mimeOrExt ?? '').toLowerCase();
  const tryOrder: Array<'png' | 'jpeg' | 'jpg' | 'webp' | 'avif'> = [
    'png',
    'jpeg',
    'jpg',
    'webp',
    'avif',
  ];

  const tryDecode = async (kind: string): Promise<DecodedImage | null> => {
    try {
      switch (kind) {
        case 'png': {
          const img = await decodePng(buffer);
          return {
            data: img.data as Uint8Array,
            width: img.width,
            height: img.height,
            bitDepth: 8,
          };
        }
        case 'jpeg':
        case 'jpg': {
          const img = await decodeJpeg(buffer);
          return {
            data: img.data as Uint8Array,
            width: img.width,
            height: img.height,
            bitDepth: 8,
          };
        }
        case 'webp': {
          const img = await decodeWebp(buffer);
          return {
            data: img.data as Uint8Array,
            width: img.width,
            height: img.height,
            bitDepth: 8,
          };
        }
        case 'avif': {
          const img = await decodeAvif(buffer);
          // avif may optionally output 16-bit depending on source; normalize to Uint8Array if needed
          if (img.data instanceof Uint16Array) {
            // convert to 8-bit RGBA by shifting down
            const out = new Uint8Array(img.data.length);
            for (let i = 0; i < img.data.length; i++) out[i] = img.data[i] >> 8;
            return {
              data: out,
              width: img.width,
              height: img.height,
              bitDepth: 8,
            };
          }
          return {
            data: img.data as Uint8Array,
            width: img.width,
            height: img.height,
            bitDepth: 8,
          };
        }
      }
    } catch {
      // ignore and try next
    }
    return null;
  };

  // If hint provided, try first
  if (key) {
    const hint = key.includes('/') ? key.split('/')[1]! : key;
    const hinted = await tryDecode(hint);
    if (hinted) return hinted;
  }

  // Fallback to brute force order
  for (const kind of tryOrder) {
    const res = await tryDecode(kind);
    if (res) return res;
  }
  throw new Error('Unsupported or corrupt image input');
}

/** Create a Texture from a file path on disk (uses Bun.file).
 * Decodes to RGBA8 and stores pixels in Texture.data.
 */
export async function textureFromFile(
  path: string,
  overrides?: Partial<Omit<TextureDescriptor, 'width' | 'height'>>,
): Promise<Texture> {
  const ab = await Bun.file(path).arrayBuffer();
  const decoded = await decodeImage(ab, extOf(path));
  const desc: TextureDescriptor = {
    label: overrides?.label ?? `Texture(${path})`,
    width: decoded.width,
    height: decoded.height,
    depthOrLayers: overrides?.depthOrLayers ?? 1,
    dimension: overrides?.dimension ?? '2d',
    format: overrides?.format ?? 'rgba8unorm',
    mipLevels: overrides?.mipLevels ?? 1,
    sampleCount: overrides?.sampleCount ?? 1,
    usage: overrides?.usage,
    data: decoded.data as Uint8Array,
  };
  return new Texture(desc);
}

/** Create a Texture from an ArrayBuffer (file bytes). Optionally pass a hint for mime/ext. */
export async function textureFromArrayBuffer(
  buffer: ArrayBuffer,
  hint?: string,
  overrides?: Partial<Omit<TextureDescriptor, 'width' | 'height'>>,
): Promise<Texture> {
  const decoded = await decodeImage(buffer, hint);
  const desc: TextureDescriptor = {
    label: overrides?.label ?? 'Texture(Buffer)',
    width: decoded.width,
    height: decoded.height,
    depthOrLayers: overrides?.depthOrLayers ?? 1,
    dimension: overrides?.dimension ?? '2d',
    format: overrides?.format ?? 'rgba8unorm',
    mipLevels: overrides?.mipLevels ?? 1,
    sampleCount: overrides?.sampleCount ?? 1,
    usage: overrides?.usage,
    data: decoded.data as Uint8Array,
  };
  return new Texture(desc);
}

export default {
  decodeImage,
  textureFromFile,
  textureFromArrayBuffer,
};
