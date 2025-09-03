import { SDL_hid_bus_type } from '../../enum/hdiapi'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_hid_device_infoSchema = {
  /** Platform-specific device path */
  path: { order: 0, type: 'string' },
  /** Device Vendor ID */
  vendor_id: { order: 1, type: 'u16' },
  /** Device Product ID */
  product_id: { order: 2, type: 'u16' },
  /** Serial Number */
  serial_number: { order: 3, type: 'string' },
  /** Device Release Number in binary-coded decimal,
        also known as Device Version Number */
  release_number: { order: 4, type: 'u16' },
  /** Manufacturer String */
  manufacturer_string: { order: 5, type: 'string' },
  /** Product string */
  product_string: { order: 6, type: 'string' },
  /** Usage Page for this Device/Interface
        (Windows/Mac/hidraw only) */
  usage_page: { order: 7, type: 'u16' },
  /** Usage for this Device/Interface
        (Windows/Mac/hidraw only) */
  usage: { order: 8, type: 'u16' },
  /** The USB interface which this logical device
        represents.

        Valid only if the device is a USB HID device.
        Set to -1 in all other cases.
    */
  interface_number: { order: 9, type: 'i32' },

  /** Additional information about the USB interface.
        Valid on libusb and Android implementations. */
  interface_class: { order: 10, type: 'i32' },
  interface_subclass: { order: 11, type: 'i32' },
  interface_protocol: { order: 12, type: 'i32' },

  /** Underlying bus type */
  bus_type: { order: 13, type: 'enum', enum: SDL_hid_bus_type },

  /** Pointer to the next device */
  next: { order: 14, type: 'struct', schema: 'self' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_hid_device_info
 */
export class SDL_hid_device_info extends BunStruct<
  typeof SDL_hid_device_infoSchema
> {
  constructor() {
    super(SDL_hid_device_infoSchema)
  }
}
