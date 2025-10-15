export type AppFeature = 'audio' | 'joystick' | 'haptic' | 'gamepad' | 'sensor' | 'camera';

export type AppLogPriority = 'trace' | 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type AppLogCategory =
  | 'application'
  | 'assert'
  | 'audio'
  | 'custom'
  | 'error'
  | 'gpu'
  | 'input'
  | 'render'
  | 'system'
  | 'test'
  | 'video';
