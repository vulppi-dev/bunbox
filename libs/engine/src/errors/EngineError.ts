export class EngineError extends Error {
  constructor(
    message: string,
    public readonly component: string,
  ) {
    super(`[${component}] ${message}`);
    this.name = 'ComponentError';
  }

  getComponentName() {
    return this.component;
  }
}
