const PRIME32_1 = 0x9e3779b1 >>> 0; // 2,654,435,761
const PRIME32_2 = 0x85ebca77 >>> 0; // 2,246,822,839
const PRIME32_3 = 0xc2b2ae3d >>> 0; // 3,261,924,397
const PRIME32_4 = 0x27d4eb2f >>> 0; //   667,988,509
const PRIME32_5 = 0x165667b1 >>> 0; //   374,761,393

/** Mix function for 32-bit lanes */
function round(acc: number, input32: number): number {
  acc = (acc + input32 * PRIME32_2) >>> 0;
  acc = rotl(acc, 13);
  return (acc * PRIME32_1) >>> 0;
}

/** Left rotate a 32-bit integer */
function rotl(x: number, r: number): number {
  return ((x << r) | (x >>> (32 - r))) >>> 0;
}

/**
 * @param input - UTF-8 string or array of bytes
 * @param seed - 32-bit seed value (default: 0)
 * @returns 32-bit unsigned hash
 */
export function xxhash32(input: string | Uint8Array, seed = 0): number {
  let data: Uint8Array;
  if (typeof input === 'string') {
    data = new TextEncoder().encode(input);
  } else {
    data = input;
  }

  const len = data.length >>> 0;
  let h32: number;
  let offset = 0;

  if (len >= 16) {
    let v1 = (seed + PRIME32_1 + PRIME32_2) >>> 0;
    let v2 = (seed + PRIME32_2) >>> 0;
    let v3 = (seed + 0) >>> 0;
    let v4 = (seed - PRIME32_1) >>> 0;

    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const limit = len - 16;
    while (offset <= limit) {
      v1 = round(v1, view.getUint32(offset, true));
      v2 = round(v2, view.getUint32(offset + 4, true));
      v3 = round(v3, view.getUint32(offset + 8, true));
      v4 = round(v4, view.getUint32(offset + 12, true));
      offset += 16;
    }
    h32 = (rotl(v1, 1) + rotl(v2, 7) + rotl(v3, 12) + rotl(v4, 18)) >>> 0;
  } else {
    h32 = (seed + PRIME32_5) >>> 0;
  }

  h32 = (h32 + len) >>> 0;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  // Process remaining 4-byte chunks
  while (offset + 4 <= len) {
    h32 = (h32 + round(0, view.getUint32(offset, true))) >>> 0;
    h32 = (rotl(h32, 17) * PRIME32_4) >>> 0;
    offset += 4;
  }

  // Process remaining bytes
  while (offset < len) {
    h32 = (h32 + data[offset]! * PRIME32_5) >>> 0;
    h32 = (rotl(h32, 11) * PRIME32_1) >>> 0;
    offset++;
  }

  // Final avalanche
  h32 ^= h32 >>> 15;
  h32 = (h32 * PRIME32_2) >>> 0;
  h32 ^= h32 >>> 13;
  h32 = (h32 * PRIME32_3) >>> 0;
  h32 ^= h32 >>> 16;

  return h32 >>> 0;
}
