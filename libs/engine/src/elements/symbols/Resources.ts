export const DISPOSE_FUNC_SYM = Symbol('DisposeFunction');
export const PREPARE_FUNC_SYM = Symbol('PrepareFunction');
export const REBUILD_FUNC_SYM = Symbol('RebuildFunction');
export const RELEASE_FUNC_SYM = Symbol('ReleaseFunction');

export abstract class Resource {
  abstract [DISPOSE_FUNC_SYM](): void;
  abstract [PREPARE_FUNC_SYM](...args: any[]): void;
  abstract [REBUILD_FUNC_SYM](...args: any[]): void;
  abstract [RELEASE_FUNC_SYM](): void;
}
