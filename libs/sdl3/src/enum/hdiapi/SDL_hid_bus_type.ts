/**
 * @description https://wiki.libsdl.org/SDL3/SDL_hid_bus_type
 */
export enum SDL_hid_bus_type {
  /** Unknown bus type */
  SDL_HID_API_BUS_UNKNOWN = 0x00,

  /** USB bus
       Specifications:
       https://usb.org/hid */
  SDL_HID_API_BUS_USB = 0x01,

  /** Bluetooth or Bluetooth LE bus
       Specifications:
       https://www.bluetooth.com/specifications/specs/human-interface-device-profile-1-1-1/
       https://www.bluetooth.com/specifications/specs/hid-service-1-0/
       https://www.bluetooth.com/specifications/specs/hid-over-gatt-profile-1-0/ */
  SDL_HID_API_BUS_BLUETOOTH = 0x02,

  /** I2C bus
       Specifications:
       https://docs.microsoft.com/previous-versions/windows/hardware/design/dn642101(v=vs.85) */
  SDL_HID_API_BUS_I2C = 0x03,

  /** SPI bus
       Specifications:
       https://www.microsoft.com/download/details.aspx?id=103325 */
  SDL_HID_API_BUS_SPI = 0x04,
}
