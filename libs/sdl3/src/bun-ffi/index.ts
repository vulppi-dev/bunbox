import { getLibPath } from '$utils'
import { dlopen } from 'bun:ffi'
import * as functions from './functions'

const SDL3_LIB_PATH = getLibPath('SDL3')

const { symbols: SDL, close } = dlopen(SDL3_LIB_PATH, {
  ...functions.ERROR_BINDINGS,
  ...functions.EVENTS_BINDINGS,
  ...functions.INIT_BINDINGS,
  ...functions.IO_STREAM_BINDINGS,
  ...functions.RENDERER_BINDINGS,
  ...functions.STD_BINDINGS,
  ...functions.TIMER_BINDINGS,
  ...functions.VIDEO_BINDINGS,
})

process.on('exit', () => {
  close()
})

export { SDL }
