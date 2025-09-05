import type { FFIFunction } from 'bun:ffi';

export const STD_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_abs
   */
  SDL_abs: { args: ['i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_acos
   */
  SDL_acos: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_acosf
   */
  SDL_acosf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_aligned_alloc
   */
  SDL_aligned_alloc: { args: ['u64', 'u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_aligned_free
   */
  SDL_aligned_free: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_asin
   */
  SDL_asin: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_asinf
   */
  SDL_asinf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_asprintf
   */
  SDL_asprintf: { args: ['ptr', 'cstring'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_atan
   */
  SDL_atan: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_atan2
   */
  SDL_atan2: { args: ['f64', 'f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_atan2f
   */
  SDL_atan2f: { args: ['f32', 'f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_atanf
   */
  SDL_atanf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_atof
   */
  SDL_atof: { args: ['cstring'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_atoi
   */
  SDL_atoi: { args: ['cstring'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_bsearch
   */
  SDL_bsearch: {
    args: ['ptr', 'ptr', 'u64', 'u64', 'ptr'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_bsearch_r
   */
  SDL_bsearch_r: {
    args: ['ptr', 'ptr', 'u64', 'u64', 'ptr', 'ptr'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_calloc
   */
  SDL_calloc: { args: ['u64', 'u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ceil
   */
  SDL_ceil: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ceilf
   */
  SDL_ceilf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_copysign
   */
  SDL_copysign: { args: ['f64', 'f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_copysignf
   */
  SDL_copysignf: { args: ['f32', 'f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_cos
   */
  SDL_cos: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_cosf
   */
  SDL_cosf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_crc16
   */
  SDL_crc16: { args: ['ptr', 'u64'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_crc32
   */
  SDL_crc32: { args: ['ptr', 'u64'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateEnvironment
   */
  SDL_CreateEnvironment: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyEnvironment
   */
  SDL_DestroyEnvironment: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_exp
   */
  SDL_exp: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_expf
   */
  SDL_expf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_fabs
   */
  SDL_fabs: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_fabsf
   */
  SDL_fabsf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_floor
   */
  SDL_floor: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_floorf
   */
  SDL_floorf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_fmod
   */
  SDL_fmod: { args: ['f64', 'f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_fmodf
   */
  SDL_fmodf: { args: ['f32', 'f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_free
   */
  SDL_free: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_getenv
   */
  SDL_getenv: { args: ['cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_getenv_unsafe
   */
  SDL_getenv_unsafe: { args: ['cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetEnvironment
   */
  SDL_GetEnvironment: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetEnvironmentVariable
   */
  SDL_GetEnvironmentVariable: { args: ['ptr', 'cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetEnvironmentVariables
   */
  SDL_GetEnvironmentVariables: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetMemoryFunctions
   */
  SDL_GetMemoryFunctions: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumAllocations
   */
  SDL_GetNumAllocations: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetOriginalMemoryFunctions
   */
  SDL_GetOriginalMemoryFunctions: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_iconv
   */
  SDL_iconv: { args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_iconv_close
   */
  SDL_iconv_close: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_iconv_open
   */
  SDL_iconv_open: { args: ['cstring', 'cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_iconv_string
   */
  SDL_iconv_string: {
    args: ['cstring', 'cstring', 'cstring', 'u64'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isalnum
   */
  SDL_isalnum: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isalpha
   */
  SDL_isalpha: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isblank
   */
  SDL_isblank: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_iscntrl
   */
  SDL_iscntrl: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isdigit
   */
  SDL_isdigit: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isgraph
   */
  SDL_isgraph: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isinf
   */
  SDL_isinf: { args: ['f64'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isinff
   */
  SDL_isinff: { args: ['f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_islower
   */
  SDL_islower: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isnan
   */
  SDL_isnan: { args: ['f64'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isnanf
   */
  SDL_isnanf: { args: ['f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isprint
   */
  SDL_isprint: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ispunct
   */
  SDL_ispunct: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isspace
   */
  SDL_isspace: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isupper
   */
  SDL_isupper: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_isxdigit
   */
  SDL_isxdigit: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_itoa
   */
  SDL_itoa: { args: ['i32', 'ptr', 'i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_lltoa
   */
  SDL_lltoa: { args: ['i64', 'ptr', 'i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_log
   */
  SDL_log: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_log10
   */
  SDL_log10: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_log10f
   */
  SDL_log10f: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_logf
   */
  SDL_logf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_lround
   */
  SDL_lround: { args: ['f64'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_lroundf
   */
  SDL_lroundf: { args: ['f32'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ltoa
   */
  SDL_ltoa: { args: ['i64', 'ptr', 'i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_malloc
   */
  SDL_malloc: { args: ['u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_memcmp
   */
  SDL_memcmp: { args: ['ptr', 'ptr', 'u64'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_memcpy
   */
  SDL_memcpy: { args: ['ptr', 'ptr', 'u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_memmove
   */
  SDL_memmove: { args: ['ptr', 'ptr', 'u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_memset
   */
  SDL_memset: { args: ['ptr', 'i32', 'u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_memset4
   */
  SDL_memset4: { args: ['ptr', 'u32', 'u64'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_modf
   */
  SDL_modf: { args: ['f64', 'ptr'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_modff
   */
  SDL_modff: { args: ['f32', 'ptr'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_murmur3_32
   */
  SDL_murmur3_32: { args: ['ptr', 'u64', 'u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_pow
   */
  SDL_pow: { args: ['f64', 'f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_powf
   */
  SDL_powf: { args: ['f32', 'f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_qsort
   */
  SDL_qsort: { args: ['ptr', 'u64', 'u64', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_qsort_r
   */
  SDL_qsort_r: {
    args: ['ptr', 'u64', 'u64', 'ptr', 'ptr'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_rand
   */
  SDL_rand: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_rand_bits
   */
  SDL_rand_bits: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_rand_bits_r
   */
  SDL_rand_bits_r: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_rand_r
   */
  SDL_rand_r: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_randf
   */
  SDL_randf: { args: [], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_randf_r
   */
  SDL_randf_r: { args: ['ptr'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_realloc
   */
  SDL_realloc: { args: ['ptr', 'u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_round
   */
  SDL_round: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_roundf
   */
  SDL_roundf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_scalbn
   */
  SDL_scalbn: { args: ['f64', 'i32'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_scalbnf
   */
  SDL_scalbnf: { args: ['f32', 'i32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_setenv_unsafe
   */
  SDL_setenv_unsafe: { args: ['cstring', 'cstring', 'i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetEnvironmentVariable
   */
  SDL_SetEnvironmentVariable: {
    args: ['ptr', 'cstring', 'cstring', 'bool'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetMemoryFunctions
   */
  SDL_SetMemoryFunctions: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_sin
   */
  SDL_sin: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_sinf
   */
  SDL_sinf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_size_add_check_overflow
   */
  // SDL_size_add_check_overflow: {
  //   args: ['u64', 'u64', 'ptr'],
  //   returns: 'bool',
  // }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_size_mul_check_overflow
   */
  // SDL_size_mul_check_overflow: {
  //   args: ['u64', 'u64', 'ptr'],
  //   returns: 'bool',
  // }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_snprintf
   */
  SDL_snprintf: { args: ['ptr', 'u64', 'cstring'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_sqrt
   */
  SDL_sqrt: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_sqrtf
   */
  SDL_sqrtf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_srand
   */
  SDL_srand: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_sscanf
   */
  SDL_sscanf: { args: ['cstring', 'cstring'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StepBackUTF8
   */
  SDL_StepBackUTF8: { args: ['cstring', 'cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StepUTF8
   */
  SDL_StepUTF8: { args: ['cstring', 'ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strcasecmp
   */
  SDL_strcasecmp: { args: ['cstring', 'cstring'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strcasestr
   */
  SDL_strcasestr: { args: ['cstring', 'cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strchr
   */
  SDL_strchr: { args: ['cstring', 'i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strcmp
   */
  SDL_strcmp: { args: ['cstring', 'cstring'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strdup
   */
  SDL_strdup: { args: ['cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strlcat
   */
  SDL_strlcat: { args: ['ptr', 'cstring', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strlcpy
   */
  SDL_strlcpy: { args: ['ptr', 'cstring', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strlen
   */
  SDL_strlen: { args: ['cstring'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strlwr
   */
  SDL_strlwr: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strncasecmp
   */
  SDL_strncasecmp: { args: ['cstring', 'cstring', 'u64'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strncmp
   */
  SDL_strncmp: { args: ['cstring', 'cstring', 'u64'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strndup
   */
  SDL_strndup: { args: ['cstring', 'u64'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strnlen
   */
  SDL_strnlen: { args: ['cstring', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strnstr
   */
  SDL_strnstr: { args: ['cstring', 'cstring', 'u64'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strpbrk
   */
  SDL_strpbrk: { args: ['cstring', 'cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strrchr
   */
  SDL_strrchr: { args: ['cstring', 'i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strrev
   */
  SDL_strrev: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strstr
   */
  SDL_strstr: { args: ['cstring', 'cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strtod
   */
  SDL_strtod: { args: ['cstring', 'ptr'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strtok_r
   */
  SDL_strtok_r: { args: ['ptr', 'cstring', 'ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strtol
   */
  SDL_strtol: { args: ['cstring', 'ptr', 'i32'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strtoll
   */
  SDL_strtoll: { args: ['cstring', 'ptr', 'i32'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strtoul
   */
  SDL_strtoul: { args: ['cstring', 'ptr', 'i32'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strtoull
   */
  SDL_strtoull: { args: ['cstring', 'ptr', 'i32'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_strupr
   */
  SDL_strupr: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_swprintf
   */
  SDL_swprintf: { args: ['ptr', 'u64', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_tan
   */
  SDL_tan: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_tanf
   */
  SDL_tanf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_tolower
   */
  SDL_tolower: { args: ['i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_toupper
   */
  SDL_toupper: { args: ['i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_trunc
   */
  SDL_trunc: { args: ['f64'], returns: 'f64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_truncf
   */
  SDL_truncf: { args: ['f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UCS4ToUTF8
   */
  SDL_UCS4ToUTF8: { args: ['u32', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_uitoa
   */
  SDL_uitoa: { args: ['u32', 'ptr', 'i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ulltoa
   */
  SDL_ulltoa: { args: ['u64', 'ptr', 'i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ultoa
   */
  SDL_ultoa: { args: ['u64', 'ptr', 'i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_unsetenv_unsafe
   */
  SDL_unsetenv_unsafe: { args: ['cstring'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnsetEnvironmentVariable
   */
  SDL_UnsetEnvironmentVariable: { args: ['ptr', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_utf8strlcpy
   */
  SDL_utf8strlcpy: { args: ['ptr', 'cstring', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_utf8strlen
   */
  SDL_utf8strlen: { args: ['cstring'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_utf8strnlen
   */
  SDL_utf8strnlen: { args: ['cstring', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_vasprintf
   */
  SDL_vasprintf: { args: ['ptr', 'cstring', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_vsnprintf
   */
  SDL_vsnprintf: { args: ['ptr', 'u64', 'cstring', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_vsscanf
   */
  SDL_vsscanf: { args: ['cstring', 'cstring', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_vswprintf
   */
  SDL_vswprintf: { args: ['ptr', 'u64', 'ptr', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcscasecmp
   */
  SDL_wcscasecmp: { args: ['ptr', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcscmp
   */
  SDL_wcscmp: { args: ['ptr', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcsdup
   */
  SDL_wcsdup: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcslcat
   */
  SDL_wcslcat: { args: ['ptr', 'ptr', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcslcpy
   */
  SDL_wcslcpy: { args: ['ptr', 'ptr', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcslen
   */
  SDL_wcslen: { args: ['ptr'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcsncasecmp
   */
  SDL_wcsncasecmp: { args: ['ptr', 'ptr', 'u64'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcsncmp
   */
  SDL_wcsncmp: { args: ['ptr', 'ptr', 'u64'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcsnlen
   */
  SDL_wcsnlen: { args: ['ptr', 'u64'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcsnstr
   */
  SDL_wcsnstr: { args: ['ptr', 'ptr', 'u64'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcsstr
   */
  SDL_wcsstr: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_wcstol
   */
  SDL_wcstol: { args: ['ptr', 'ptr', 'i32'], returns: 'i64' },
} as const satisfies Record<string, FFIFunction>;
