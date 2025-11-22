import { decode as decodePng } from '@jsquash/png';
import { decode as decodeAvif } from '@jsquash/avif';
import { decode as decodeJpg } from '@jsquash/jpeg';
import { decode as decodeWebp } from '@jsquash/webp';

type ImageFormat = 'png' | 'avif' | 'jpg' | 'webp';

export type DecodedImage = {
  width: number;
  height: number;
  data: Uint8Array;
};

export async function decodeImage(
  data: ArrayBuffer,
  format: ImageFormat,
): Promise<DecodedImage | null> {
  try {
    switch (format) {
      case 'png': {
        const pngImage = await decodePng(data);

        return {
          width: pngImage.width,
          height: pngImage.height,
          data: new Uint8Array(pngImage.data.buffer),
        };
      }
      case 'avif': {
        const avifImage = await decodeAvif(data);
        if (!avifImage) return null;

        return {
          width: avifImage.width,
          height: avifImage.height,
          data: new Uint8Array(avifImage.data.buffer),
        };
      }

      case 'jpg': {
        const jpgImage = await decodeJpg(data);

        return {
          width: jpgImage.width,
          height: jpgImage.height,
          data: new Uint8Array(jpgImage.data.buffer),
        };
      }
      case 'webp': {
        const webpImage = await decodeWebp(data);

        return {
          width: webpImage.width,
          height: webpImage.height,
          data: new Uint8Array(webpImage.data.buffer),
        };
      }
      default:
        throw new Error(`Unsupported image format: ${format}`);
    }
  } catch (error) {
    console.error(`Failed to decode image of format ${format}:`, error);
    return null;
  }
}

const PNG_SIGNATURE = new Uint8Array([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a, // .PNG....
]);

const JPG_SIGNATURE = new Uint8Array([
  0xff,
  0xd8,
  0xff, // JPEG SOI
]);

const RIFF_SIGNATURE = new Uint8Array([
  0x52,
  0x49,
  0x46,
  0x46, // 'RIFF'
]);

const WEBP_SIGNATURE = new Uint8Array([
  0x57,
  0x45,
  0x42,
  0x50, // 'WEBP'
]);

const FTYP_SIGNATURE = new Uint8Array([
  0x66,
  0x74,
  0x79,
  0x70, // 'ftyp'
]);

const AVIF_MAJOR_BRAND = 'avif';
const AVIS_MAJOR_BRAND = 'avis';

const MIN_WEBP_HEADER_LENGTH = 12; // "RIFF" + 4 bytes size + "WEBP"
const MIN_AVIF_HEADER_LENGTH = 12; // size + "ftyp" + major_brand

/**
 * Check if bytes at given offset match a signature.
 */
function matchSignature(
  bytes: Uint8Array,
  offset: number,
  signature: Uint8Array,
): boolean {
  if (bytes.length < offset + signature.length) {
    return false;
  }

  for (let i = 0; i < signature.length; i++) {
    if (bytes[offset + i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

export function detectImageFormat(data: ArrayBuffer): ImageFormat | null {
  const bytes = new Uint8Array(data);

  // PNG
  if (matchSignature(bytes, 0, PNG_SIGNATURE)) {
    return 'png';
  }

  // JPG
  if (matchSignature(bytes, 0, JPG_SIGNATURE)) {
    return 'jpg';
  }

  // WEBP: "RIFF" at 0, "WEBP" at 8
  if (
    bytes.length >= MIN_WEBP_HEADER_LENGTH &&
    matchSignature(bytes, 0, RIFF_SIGNATURE) &&
    matchSignature(bytes, 8, WEBP_SIGNATURE)
  ) {
    return 'webp';
  }

  // AVIF: ISO BMFF with 'ftyp' box and major_brand 'avif'/'avis'
  if (
    bytes.length >= MIN_AVIF_HEADER_LENGTH &&
    matchSignature(bytes, 4, FTYP_SIGNATURE)
  ) {
    const majorBrand = String.fromCharCode(
      bytes[8]!,
      bytes[9]!,
      bytes[10]!,
      bytes[11]!,
    );

    if (majorBrand === AVIF_MAJOR_BRAND || majorBrand === AVIS_MAJOR_BRAND) {
      return 'avif';
    }
  }

  return null;
}
