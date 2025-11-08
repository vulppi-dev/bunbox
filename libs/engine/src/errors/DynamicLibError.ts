export class DynamicLibError extends Error {
  constructor(
    message: string,
    public readonly libName: 'GLFW' | 'Vulkan',
  ) {
    super(`[lib:${libName}] ${message}`);
    this.name = 'DynamicLibError';
  }

  getLibName() {
    return this.libName;
  }
}
