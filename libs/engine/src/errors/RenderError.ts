export class RenderError extends Error {
  constructor(message: string, backend: 'Vulkan') {
    super(`[Render:${backend}] ${message}`);
    this.name = 'RenderError';
  }
}
