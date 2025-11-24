export class EngineError extends Error {
  constructor(
    message: string,
    public readonly component: string,
  ) {
    super(`[${component}] ${message}`);
    this.name = 'EngineError';
  }

  getComponentName() {
    return this.component;
  }
}
