export function cstr(str: string) {
  return Buffer.from(str + '\0', 'utf8');
}
