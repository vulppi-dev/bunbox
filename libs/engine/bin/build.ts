import minimist, { type ParsedArgs } from 'minimist';
import { build } from 'bun';
import { join } from 'path';
import { findProjectRoot } from '../src/utils/path';

const TARGETS = [
  'darwin',
  'darwin-arm',
  'linux',
  'win32',
  'linux-arm',
  // 'win32-arm', // Not yet supported by Bun
] as const;

const ASSETS = {
  darwin: [
    './assets/x64/macos/libglfw.dylib',
    './assets/x64/macos/libbgfx.dylib',
    './assets/x64/macos/libfreetype.dylib',
  ],
  linux: [
    './assets/x64/linux/libglfw.dylib',
    './assets/x64/linux/libbgfx.dylib',
    './assets/x64/linux/libfreetype.dylib',
  ],
  win32: [
    './assets/x64/win32/libglfw.dylib',
    './assets/x64/win32/libbgfx.dylib',
    './assets/x64/win32/libfreetype.dylib',
  ],
  'darwin-arm': [
    './assets/arm64/macos/libglfw.dylib',
    './assets/arm64/macos/libbgfx.dylib',
    './assets/arm64/macos/libfreetype.dylib',
  ],
  'linux-arm': [
    './assets/arm64/linux/libglfw.dylib',
    './assets/arm64/linux/libbgfx.dylib',
    './assets/arm64/linux/libfreetype.dylib',
  ],
};

const TARGET = {
  darwin: 'bun-darwin-x64',
  linux: 'bun-linux-x64',
  win32: 'bun-windows-x64',
  'darwin-arm': 'bun-darwin-arm64',
  'linux-arm': 'bun-linux-arm64',
  // 'win32-arm': 'bun-windows-arm64',
} as const;

const args: {
  target?: (typeof TARGETS)[number];
} & ParsedArgs = minimist(process.argv.slice(2));

const SELECTED_TARGET =
  args.target ??
  ((process.arch === 'arm64'
    ? `${process.platform}-arm`
    : process.platform) as (typeof TARGETS)[number]);

if (SELECTED_TARGET && !TARGETS.includes(SELECTED_TARGET)) {
  throw new Error(`Invalid target: ${SELECTED_TARGET}`);
}

const ASSET = ASSETS[SELECTED_TARGET];
if (!ASSET) {
  throw new Error(`No assets for target: ${SELECTED_TARGET}`);
}

const ENTRY_POINTS = [
  ...args._.map((p) => join(process.cwd(), p)),
  ...ASSET.map((p) => join(findProjectRoot(import.meta.url), p)),
];

console.debug('Building for target:', SELECTED_TARGET);
console.debug('Entry points:', ENTRY_POINTS);

await build({
  entrypoints: ENTRY_POINTS,
  define: {
    __BUN_MODE__: '"compiled"',
  },
  compile: {
    outfile: './dist/app',
    target: TARGET[SELECTED_TARGET],
  },
  naming: {
    chunk: '[dir]/[name].[ext]',
    asset: '[dir]/[name].[ext]',
  },
});
