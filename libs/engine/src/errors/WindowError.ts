export class WindowError extends Error {
  constructor(message: string, id: string) {
    super(`[WindowId:${id}] ${message}`);
    this.name = 'WindowError';
  }
}
