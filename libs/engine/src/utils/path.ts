import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const FILE_URL_STRING_REGEXP = /^file:/i;

export function findProjectRoot(fromDir: string): string {
  let dir = FILE_URL_STRING_REGEXP.test(fromDir)
    ? fileURLToPath(fromDir)
    : fromDir;

  while (true) {
    if (existsSync(join(dir, 'package.json'))) {
      return dir;
    }

    const parent = dirname(dir);
    if (parent === dir) {
      return dir;
    }
    dir = parent;
  }
}
