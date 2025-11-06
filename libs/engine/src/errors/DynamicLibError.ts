export class DynamicLibError extends Error {
  constructor(
    message: string,
    public readonly libName: string,
  ) {
    super(`[lib:${libName}] ${message}`);
    this.name = 'DynamicLibError';
  }

  getLibName() {
    return this.libName;
  }
}
