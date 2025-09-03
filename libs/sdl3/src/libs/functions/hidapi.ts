import type { FFIFunction } from 'bun:ffi';

export const HIDAPI_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_ble_scan
   */
  SDL_hid_ble_scan: { args: ['bool'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_close
   */
  SDL_hid_close: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_device_change_count
   */
  SDL_hid_device_change_count: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_enumerate
   */
  SDL_hid_enumerate: { args: ['u16', 'u16'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_exit
   */
  SDL_hid_exit: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_free_enumeration
   */
  SDL_hid_free_enumeration: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_get_device_info
   */
  SDL_hid_get_device_info: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_get_feature_report
   */
  SDL_hid_get_feature_report: { args: ['ptr', 'ptr', 'u64'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_get_indexed_string
   */
  SDL_hid_get_indexed_string: {
    args: ['ptr', 'i32', 'ptr', 'u64'],
    returns: 'i32',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_get_input_report
   */
  SDL_hid_get_input_report: { args: ['ptr', 'ptr', 'u64'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_get_manufacturer_string
   */
  SDL_hid_get_manufacturer_string: {
    args: ['ptr', 'ptr', 'u64'],
    returns: 'i32',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_get_product_string
   */
  SDL_hid_get_product_string: { args: ['ptr', 'ptr', 'u64'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_get_properties
   */
  // SDL_hid_get_properties: { args: ['ptr'], returns: 'u32' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_get_report_descriptor
   */
  SDL_hid_get_report_descriptor: {
    args: ['ptr', 'ptr', 'u64'],
    returns: 'i32',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_get_serial_number_string
   */
  SDL_hid_get_serial_number_string: {
    args: ['ptr', 'ptr', 'u64'],
    returns: 'i32',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_init
   */
  SDL_hid_init: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_open
   */
  SDL_hid_open: { args: ['u16', 'u16', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_open_path
   */
  SDL_hid_open_path: { args: ['cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_read
   */
  SDL_hid_read: { args: ['ptr', 'ptr', 'u64'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_read_timeout
   */
  SDL_hid_read_timeout: {
    args: ['ptr', 'ptr', 'u64', 'i32'],
    returns: 'i32',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_send_feature_report
   */
  SDL_hid_send_feature_report: {
    args: ['ptr', 'ptr', 'u64'],
    returns: 'i32',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_set_nonblocking
   */
  SDL_hid_set_nonblocking: { args: ['ptr', 'i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_hid_write
   */
  SDL_hid_write: { args: ['ptr', 'ptr', 'u64'], returns: 'i32' },
} as const satisfies Record<string, FFIFunction>;
