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
  // 'win32-arm',
] as const;

const ASSETS = {
  darwin: ['./assets/darwin/libSDL3.dylib', './assets/darwin/libiconv.dylib'],
  linux: ['./assets/linux/x64/libSDL3.so', './assets/linux/x64/libiconv.so.2'],
  win32: ['./assets/win32/x64/SDL3.dll'],
  'darwin-arm': [
    './assets/darwin/libSDL3.dylib',
    './assets/darwin/libiconv.dylib',
  ],
  'linux-arm': [
    './assets/linux/arm64/libSDL3.so',
    './assets/linux/arm64/libiconv.so.2',
  ],
  // 'win32-arm': ['./assets/win32/arm64/SDL3.dll'],
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
