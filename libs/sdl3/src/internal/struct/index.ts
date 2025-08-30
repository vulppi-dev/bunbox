import { BunStruct } from './bun-struct'
import { NAPIStruct } from './napi-struct'

export { cstr, type StructSchema } from '@bunbox/struct'

const isBunRuntime = 'Bun' in globalThis

export const SDLStruct = isBunRuntime ? BunStruct : NAPIStruct
