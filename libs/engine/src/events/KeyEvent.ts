import { SDL_Keycode } from '@bunbox/sdl3';
import { Event, type EventOptions } from './Event';

export type KeyEventOptions = {
  windowId: number;
  deviceId: number;
  code: number;
  key: number;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  repeat: boolean;
} & EventOptions;

/**
 * Human-readable text map for SDL3 keycodes.
 * - Composite keys in PascalCase (e.g., LeftShift).
 * - Letter keys in UPPER_CASE (A..Z).
 * - Visible punctuation uses the symbol itself.
 */
const KEY_TEXT_MAP = {
  // Basic control / whitespace
  0x00000000: 'Unknown',
  0x0000000d: 'Return',
  0x0000001b: 'Escape',
  0x00000008: 'Backspace',
  0x00000009: 'Tab',
  0x00000020: 'Space',

  // ASCII punctuation & digits
  0x00000021: '!',
  0x00000022: '"',
  0x00000023: '#',
  0x00000024: '$',
  0x00000025: '%',
  0x00000026: '&',
  0x00000027: "'",
  0x00000028: '(',
  0x00000029: ')',
  0x0000002a: '*',
  0x0000002b: '+',
  0x0000002c: ',',
  0x0000002d: '-',
  0x0000002e: '.',
  0x0000002f: '/',
  0x00000030: '0',
  0x00000031: '1',
  0x00000032: '2',
  0x00000033: '3',
  0x00000034: '4',
  0x00000035: '5',
  0x00000036: '6',
  0x00000037: '7',
  0x00000038: '8',
  0x00000039: '9',
  0x0000003a: ':',
  0x0000003b: ';',
  0x0000003c: '<',
  0x0000003d: '=',
  0x0000003e: '>',
  0x0000003f: '?',
  0x00000040: '@',
  0x0000005b: '[',
  0x0000005c: '\\',
  0x0000005d: ']',
  0x0000005e: '^',
  0x0000005f: '_',
  0x00000060: '`',

  // Letters (UPPER_CASE text)
  0x00000061: 'A',
  0x00000062: 'B',
  0x00000063: 'C',
  0x00000064: 'D',
  0x00000065: 'E',
  0x00000066: 'F',
  0x00000067: 'G',
  0x00000068: 'H',
  0x00000069: 'I',
  0x0000006a: 'J',
  0x0000006b: 'K',
  0x0000006c: 'L',
  0x0000006d: 'M',
  0x0000006e: 'N',
  0x0000006f: 'O',
  0x00000070: 'P',
  0x00000071: 'Q',
  0x00000072: 'R',
  0x00000073: 'S',
  0x00000074: 'T',
  0x00000075: 'U',
  0x00000076: 'V',
  0x00000077: 'W',
  0x00000078: 'X',
  0x00000079: 'Y',
  0x0000007a: 'Z',

  // More ASCII punctuation
  0x0000007b: '{',
  0x0000007c: '|',
  0x0000007d: '}',
  0x0000007e: '~',
  0x0000007f: 'Delete',
  0x000000b1: '±',

  // Function & navigation (scancode-masked range)
  0x40000039: 'CapsLock',
  0x4000003a: 'F1',
  0x4000003b: 'F2',
  0x4000003c: 'F3',
  0x4000003d: 'F4',
  0x4000003e: 'F5',
  0x4000003f: 'F6',
  0x40000040: 'F7',
  0x40000041: 'F8',
  0x40000042: 'F9',
  0x40000043: 'F10',
  0x40000044: 'F11',
  0x40000045: 'F12',
  0x40000046: 'PrintScreen',
  0x40000047: 'ScrollLock',
  0x40000048: 'Pause',
  0x40000049: 'Insert',
  0x4000004a: 'Home',
  0x4000004b: 'PageUp',
  0x4000004d: 'End',
  0x4000004e: 'PageDown',
  0x4000004f: 'Right',
  0x40000050: 'Left',
  0x40000051: 'Down',
  0x40000052: 'Up',
  0x40000053: 'NumLockClear',

  // Numpad (KP)
  0x40000054: 'NumpadDivide',
  0x40000055: 'NumpadMultiply',
  0x40000056: 'NumpadMinus',
  0x40000057: 'NumpadPlus',
  0x40000058: 'NumpadEnter',
  0x40000059: 'Numpad1',
  0x4000005a: 'Numpad2',
  0x4000005b: 'Numpad3',
  0x4000005c: 'Numpad4',
  0x4000005d: 'Numpad5',
  0x4000005e: 'Numpad6',
  0x4000005f: 'Numpad7',
  0x40000060: 'Numpad8',
  0x40000061: 'Numpad9',
  0x40000062: 'Numpad0',
  0x40000063: 'NumpadPeriod',

  // App/system & more function keys
  0x40000065: 'Application',
  0x40000066: 'Power',
  0x40000067: 'NumpadEquals',
  0x40000068: 'F13',
  0x40000069: 'F14',
  0x4000006a: 'F15',
  0x4000006b: 'F16',
  0x4000006c: 'F17',
  0x4000006d: 'F18',
  0x4000006e: 'F19',
  0x4000006f: 'F20',
  0x40000070: 'F21',
  0x40000071: 'F22',
  0x40000072: 'F23',
  0x40000073: 'F24',
  0x40000074: 'Execute',
  0x40000075: 'Help',
  0x40000076: 'Menu',
  0x40000077: 'Select',
  0x40000078: 'Stop',
  0x40000079: 'Again',
  0x4000007a: 'Undo',
  0x4000007b: 'Cut',
  0x4000007c: 'Copy',
  0x4000007d: 'Paste',
  0x4000007e: 'Find',
  0x4000007f: 'Mute',
  0x40000080: 'VolumeUp',
  0x40000081: 'VolumeDown',
  0x40000085: 'NumpadComma',
  0x40000086: 'NumpadEqualsAS400',
  0x40000099: 'AltErase',
  0x4000009a: 'SysReq',
  0x4000009b: 'Cancel',
  0x4000009c: 'Clear',
  0x4000009d: 'Prior',
  0x4000009e: 'Return2',
  0x4000009f: 'Separator',
  0x400000a0: 'Out',
  0x400000a1: 'Oper',
  0x400000a2: 'ClearAgain',
  0x400000a3: 'CrSel',
  0x400000a4: 'ExSel',

  // Numpad extended set
  0x400000b0: 'Numpad00',
  0x400000b1: 'Numpad000',
  0x400000b2: 'ThousandsSeparator',
  0x400000b3: 'DecimalSeparator',
  0x400000b4: 'CurrencyUnit',
  0x400000b5: 'CurrencySubUnit',
  0x400000b6: 'NumpadLeftParen',
  0x400000b7: 'NumpadRightParen',
  0x400000b8: 'NumpadLeftBrace',
  0x400000b9: 'NumpadRightBrace',
  0x400000ba: 'NumpadTab',
  0x400000bb: 'NumpadBackspace',
  0x400000bc: 'NumpadA',
  0x400000bd: 'NumpadB',
  0x400000be: 'NumpadC',
  0x400000bf: 'NumpadD',
  0x400000c0: 'NumpadE',
  0x400000c1: 'NumpadF',
  0x400000c2: 'NumpadXor',
  0x400000c3: 'NumpadPower',
  0x400000c4: 'NumpadPercent',
  0x400000c5: 'NumpadLess',
  0x400000c6: 'NumpadGreater',
  0x400000c7: 'NumpadAmpersand',
  0x400000c8: 'NumpadDoubleAmpersand',
  0x400000c9: 'NumpadVerticalBar',
  0x400000ca: 'NumpadDoubleVerticalBar',
  0x400000cb: 'NumpadColon',
  0x400000cc: 'NumpadHash',
  0x400000cd: 'NumpadSpace',
  0x400000ce: 'NumpadAt',
  0x400000cf: 'NumpadExclam',
  0x400000d0: 'NumpadMemStore',
  0x400000d1: 'NumpadMemRecall',
  0x400000d2: 'NumpadMemClear',
  0x400000d3: 'NumpadMemAdd',
  0x400000d4: 'NumpadMemSubtract',
  0x400000d5: 'NumpadMemMultiply',
  0x400000d6: 'NumpadMemDivide',
  0x400000d7: 'NumpadPlusMinus',
  0x400000d8: 'NumpadClear',
  0x400000d9: 'NumpadClearEntry',
  0x400000da: 'NumpadBinary',
  0x400000db: 'NumpadOctal',
  0x400000dc: 'NumpadDecimal',
  0x400000dd: 'NumpadHexadecimal',

  // Modifiers
  0x400000e0: 'LeftCtrl',
  0x400000e1: 'LeftShift',
  0x400000e2: 'LeftAlt',
  0x400000e3: 'LeftMeta',
  0x400000e4: 'RightCtrl',
  0x400000e5: 'RightShift',
  0x400000e6: 'RightAlt',
  0x400000e7: 'RightMeta',

  // Mode / sleep / media / Action keys
  0x40000101: 'Mode',
  0x40000102: 'Sleep',
  0x40000103: 'Wake',
  0x40000104: 'ChannelIncrement',
  0x40000105: 'ChannelDecrement',
  0x40000106: 'MediaPlay',
  0x40000107: 'MediaPause',
  0x40000108: 'MediaRecord',
  0x40000109: 'MediaFastForward',
  0x4000010a: 'MediaRewind',
  0x4000010b: 'MediaNextTrack',
  0x4000010c: 'MediaPreviousTrack',
  0x4000010d: 'MediaStop',
  0x4000010e: 'MediaEject',
  0x4000010f: 'MediaPlayPause',
  0x40000110: 'MediaSelect',
  0x40000111: 'ActionNew',
  0x40000112: 'ActionOpen',
  0x40000113: 'ActionClose',
  0x40000114: 'ActionExit',
  0x40000115: 'ActionSave',
  0x40000116: 'ActionPrint',
  0x40000117: 'ActionProperties',
  0x40000118: 'ActionSearch',
  0x40000119: 'ActionHome',
  0x4000011a: 'ActionBack',
  0x4000011b: 'ActionForward',
  0x4000011c: 'ActionStop',
  0x4000011d: 'ActionRefresh',
  0x4000011e: 'ActionBookmarks',

  // Mobile-like soft/call keys
  0x4000011f: 'SoftLeft',
  0x40000120: 'SoftRight',
  0x40000121: 'Call',
  0x40000122: 'EndCall',

  // Extended (0x20000000 range)
  0x20000001: 'LeftTab',
  0x20000002: 'Level5Shift',
  0x20000003: 'MultiKeyCompose',
  0x20000004: 'LeftMeta',
  0x20000005: 'RightMeta',
  0x20000006: 'LeftHyper',
  0x20000007: 'RightHyper',
} as const satisfies Record<number, string>;

export class KeyEvent extends Event {
  #windowId: number;
  #deviceId: number;
  #code: number;
  #key: number;
  #ctrl: boolean;
  #shift: boolean;
  #alt: boolean;
  #meta: boolean;
  #repeat: boolean;

  constructor(options: KeyEventOptions) {
    super(options);
    this.#windowId = options.windowId;
    this.#deviceId = options.deviceId;
    this.#code = options.code;
    this.#key = options.key;
    this.#ctrl = options.ctrl;
    this.#shift = options.shift;
    this.#alt = options.alt;
    this.#meta = options.meta;
    this.#repeat = options.repeat;
  }

  get windowId() {
    return this.#windowId;
  }

  get deviceId() {
    return this.#deviceId;
  }

  get code() {
    return this.#code;
  }

  get key() {
    return this.#key;
  }

  get ctrl() {
    return this.#ctrl;
  }

  get shift() {
    return this.#shift;
  }

  get alt() {
    return this.#alt;
  }

  get meta() {
    return this.#meta;
  }

  get repeat() {
    return this.#repeat;
  }

  get keyText() {
    return KEY_TEXT_MAP[this.#key as keyof typeof KEY_TEXT_MAP] || 'Unknown';
  }
}
