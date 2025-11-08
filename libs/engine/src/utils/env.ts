export function getEnv(key: string, defaultValue: string) {
  return process.env[key] || defaultValue;
}
