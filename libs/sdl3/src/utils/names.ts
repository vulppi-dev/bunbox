import { existsSync, statSync } from 'fs';
import { join } from 'path';

const LIB_EXTENSIONS: Record<string, string> = {
  darwin: 'dylib',
  linux: 'so',
  win32: 'dll',
};

const PLATFORM =
  process.platform === 'darwin'
    ? process.platform
    : join(process.platform, process.arch);

const LIB_EXTENSION = LIB_EXTENSIONS[process.platform] ?? 'so';

export function getLibPath(name: string) {
  if (!(process.platform in LIB_EXTENSIONS)) {
    throw new Error(
      `Unsupported platform: ${process.platform}-${process.arch}`,
    );
  }

  const path = join(
    ROOT_PATH,
    '.libs',
    name,
    PLATFORM,
    `${process.platform !== 'win32' ? 'lib' : ''}${name}.${LIB_EXTENSION}`,
  );

  if (!existsSync(path)) {
    throw new Error(
      `Unsupported platform: ${process.platform}-${process.arch}`,
    );
  }

  const fileStats = statSync(path);
  if (!fileStats.isFile()) {
    throw new Error(
      `Unsupported platform: ${process.platform}-${process.arch}`,
    );
  }

  return path;
}
