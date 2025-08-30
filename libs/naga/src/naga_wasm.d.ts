/* tslint:disable */
/* eslint-disable */
/**
 * Apenas valida WGSL (lança erro JS se inválido)
 */
export function validate_wgsl(wgsl: string): void;
/**
 * WGSL -> SPIR-V (binário) para Vulkan
 */
export function wgsl_to_spirv_bin(wgsl: string, stage: string, entry: string): Uint8Array;
/**
 * WGSL -> MSL (texto) para Metal (devolvido como bytes UTF-8)
 */
export function wgsl_to_msl_bin(wgsl: string, stage: string, entry: string): Uint8Array;
