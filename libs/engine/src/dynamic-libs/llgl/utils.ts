import { LLGL_RenderSystemFlags } from './enums';

/**
 * Gets a human-readable description for LLGL render system flags.
 */
export function getRenderSystemFlagsDescription(
  flags: LLGL_RenderSystemFlags,
): string {
  const descriptions: string[] = [];

  if (flags & LLGL_RenderSystemFlags.PREFER_HARDWARE) {
    descriptions.push('Prefer Hardware');
  }

  if (flags & LLGL_RenderSystemFlags.DEBUG_DEVICE) {
    descriptions.push('Debug Device');
  }

  return descriptions.length > 0 ? descriptions.join(', ') : 'None';
}
