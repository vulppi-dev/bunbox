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
  [SDL_Keycode.SDLK_UNKNOWN]: 'Unknown',
  [SDL_Keycode.SDLK_RETURN]: 'Return',
  [SDL_Keycode.SDLK_ESCAPE]: 'Escape',
  [SDL_Keycode.SDLK_BACKSPACE]: 'Backspace',
  [SDL_Keycode.SDLK_TAB]: 'Tab',
  [SDL_Keycode.SDLK_SPACE]: 'Space',

  // ASCII punctuation & digits
  [SDL_Keycode.SDLK_EXCLAIM]: '!',
  [SDL_Keycode.SDLK_DBLAPOSTROPHE]: '"',
  [SDL_Keycode.SDLK_HASH]: '#',
  [SDL_Keycode.SDLK_DOLLAR]: '$',
  [SDL_Keycode.SDLK_PERCENT]: '%',
  [SDL_Keycode.SDLK_AMPERSAND]: '&',
  [SDL_Keycode.SDLK_APOSTROPHE]: "'",
  [SDL_Keycode.SDLK_LEFTPAREN]: '(',
  [SDL_Keycode.SDLK_RIGHTPAREN]: ')',
  [SDL_Keycode.SDLK_ASTERISK]: '*',
  [SDL_Keycode.SDLK_PLUS]: '+',
  [SDL_Keycode.SDLK_COMMA]: ',',
  [SDL_Keycode.SDLK_MINUS]: '-',
  [SDL_Keycode.SDLK_PERIOD]: '.',
  [SDL_Keycode.SDLK_SLASH]: '/',
  [SDL_Keycode.SDLK_0]: '0',
  [SDL_Keycode.SDLK_1]: '1',
  [SDL_Keycode.SDLK_2]: '2',
  [SDL_Keycode.SDLK_3]: '3',
  [SDL_Keycode.SDLK_4]: '4',
  [SDL_Keycode.SDLK_5]: '5',
  [SDL_Keycode.SDLK_6]: '6',
  [SDL_Keycode.SDLK_7]: '7',
  [SDL_Keycode.SDLK_8]: '8',
  [SDL_Keycode.SDLK_9]: '9',
  [SDL_Keycode.SDLK_COLON]: ':',
  [SDL_Keycode.SDLK_SEMICOLON]: ';',
  [SDL_Keycode.SDLK_LESS]: '<',
  [SDL_Keycode.SDLK_EQUALS]: '=',
  [SDL_Keycode.SDLK_GREATER]: '>',
  [SDL_Keycode.SDLK_QUESTION]: '?',
  [SDL_Keycode.SDLK_AT]: '@',
  [SDL_Keycode.SDLK_LEFTBRACKET]: '[',
  [SDL_Keycode.SDLK_BACKSLASH]: '\\',
  [SDL_Keycode.SDLK_RIGHTBRACKET]: ']',
  [SDL_Keycode.SDLK_CARET]: '^',
  [SDL_Keycode.SDLK_UNDERSCORE]: '_',
  [SDL_Keycode.SDLK_GRAVE]: '`',

  // Letters (UPPER_CASE text)
  [SDL_Keycode.SDLK_A]: 'A',
  [SDL_Keycode.SDLK_B]: 'B',
  [SDL_Keycode.SDLK_C]: 'C',
  [SDL_Keycode.SDLK_D]: 'D',
  [SDL_Keycode.SDLK_E]: 'E',
  [SDL_Keycode.SDLK_F]: 'F',
  [SDL_Keycode.SDLK_G]: 'G',
  [SDL_Keycode.SDLK_H]: 'H',
  [SDL_Keycode.SDLK_I]: 'I',
  [SDL_Keycode.SDLK_J]: 'J',
  [SDL_Keycode.SDLK_K]: 'K',
  [SDL_Keycode.SDLK_L]: 'L',
  [SDL_Keycode.SDLK_M]: 'M',
  [SDL_Keycode.SDLK_N]: 'N',
  [SDL_Keycode.SDLK_O]: 'O',
  [SDL_Keycode.SDLK_P]: 'P',
  [SDL_Keycode.SDLK_Q]: 'Q',
  [SDL_Keycode.SDLK_R]: 'R',
  [SDL_Keycode.SDLK_S]: 'S',
  [SDL_Keycode.SDLK_T]: 'T',
  [SDL_Keycode.SDLK_U]: 'U',
  [SDL_Keycode.SDLK_V]: 'V',
  [SDL_Keycode.SDLK_W]: 'W',
  [SDL_Keycode.SDLK_X]: 'X',
  [SDL_Keycode.SDLK_Y]: 'Y',
  [SDL_Keycode.SDLK_Z]: 'Z',

  // More ASCII punctuation
  [SDL_Keycode.SDLK_LEFTBRACE]: '{',
  [SDL_Keycode.SDLK_PIPE]: '|',
  [SDL_Keycode.SDLK_RIGHTBRACE]: '}',
  [SDL_Keycode.SDLK_TILDE]: '~',
  [SDL_Keycode.SDLK_DELETE]: 'Delete',
  [SDL_Keycode.SDLK_PLUSMINUS]: '±',

  // Function & navigation (scancode-masked range)
  [SDL_Keycode.SDLK_CAPSLOCK]: 'CapsLock',
  [SDL_Keycode.SDLK_F1]: 'F1',
  [SDL_Keycode.SDLK_F2]: 'F2',
  [SDL_Keycode.SDLK_F3]: 'F3',
  [SDL_Keycode.SDLK_F4]: 'F4',
  [SDL_Keycode.SDLK_F5]: 'F5',
  [SDL_Keycode.SDLK_F6]: 'F6',
  [SDL_Keycode.SDLK_F7]: 'F7',
  [SDL_Keycode.SDLK_F8]: 'F8',
  [SDL_Keycode.SDLK_F9]: 'F9',
  [SDL_Keycode.SDLK_F10]: 'F10',
  [SDL_Keycode.SDLK_F11]: 'F11',
  [SDL_Keycode.SDLK_F12]: 'F12',
  [SDL_Keycode.SDLK_PRINTSCREEN]: 'PrintScreen',
  [SDL_Keycode.SDLK_SCROLLLOCK]: 'ScrollLock',
  [SDL_Keycode.SDLK_PAUSE]: 'Pause',
  [SDL_Keycode.SDLK_INSERT]: 'Insert',
  [SDL_Keycode.SDLK_HOME]: 'Home',
  [SDL_Keycode.SDLK_PAGEUP]: 'PageUp',
  [SDL_Keycode.SDLK_END]: 'End',
  [SDL_Keycode.SDLK_PAGEDOWN]: 'PageDown',
  [SDL_Keycode.SDLK_RIGHT]: 'Right',
  [SDL_Keycode.SDLK_LEFT]: 'Left',
  [SDL_Keycode.SDLK_DOWN]: 'Down',
  [SDL_Keycode.SDLK_UP]: 'Up',
  [SDL_Keycode.SDLK_NUMLOCKCLEAR]: 'NumLockClear',

  // Numpad (KP)
  [SDL_Keycode.SDLK_KP_DIVIDE]: 'NumpadDivide',
  [SDL_Keycode.SDLK_KP_MULTIPLY]: 'NumpadMultiply',
  [SDL_Keycode.SDLK_KP_MINUS]: 'NumpadMinus',
  [SDL_Keycode.SDLK_KP_PLUS]: 'NumpadPlus',
  [SDL_Keycode.SDLK_KP_ENTER]: 'NumpadEnter',
  [SDL_Keycode.SDLK_KP_1]: 'Numpad1',
  [SDL_Keycode.SDLK_KP_2]: 'Numpad2',
  [SDL_Keycode.SDLK_KP_3]: 'Numpad3',
  [SDL_Keycode.SDLK_KP_4]: 'Numpad4',
  [SDL_Keycode.SDLK_KP_5]: 'Numpad5',
  [SDL_Keycode.SDLK_KP_6]: 'Numpad6',
  [SDL_Keycode.SDLK_KP_7]: 'Numpad7',
  [SDL_Keycode.SDLK_KP_8]: 'Numpad8',
  [SDL_Keycode.SDLK_KP_9]: 'Numpad9',
  [SDL_Keycode.SDLK_KP_0]: 'Numpad0',
  [SDL_Keycode.SDLK_KP_PERIOD]: 'NumpadPeriod',

  // App/system & more function keys
  [SDL_Keycode.SDLK_APPLICATION]: 'Application',
  [SDL_Keycode.SDLK_POWER]: 'Power',
  [SDL_Keycode.SDLK_KP_EQUALS]: 'NumpadEquals',
  [SDL_Keycode.SDLK_F13]: 'F13',
  [SDL_Keycode.SDLK_F14]: 'F14',
  [SDL_Keycode.SDLK_F15]: 'F15',
  [SDL_Keycode.SDLK_F16]: 'F16',
  [SDL_Keycode.SDLK_F17]: 'F17',
  [SDL_Keycode.SDLK_F18]: 'F18',
  [SDL_Keycode.SDLK_F19]: 'F19',
  [SDL_Keycode.SDLK_F20]: 'F20',
  [SDL_Keycode.SDLK_F21]: 'F21',
  [SDL_Keycode.SDLK_F22]: 'F22',
  [SDL_Keycode.SDLK_F23]: 'F23',
  [SDL_Keycode.SDLK_F24]: 'F24',
  [SDL_Keycode.SDLK_EXECUTE]: 'Execute',
  [SDL_Keycode.SDLK_HELP]: 'Help',
  [SDL_Keycode.SDLK_MENU]: 'Menu',
  [SDL_Keycode.SDLK_SELECT]: 'Select',
  [SDL_Keycode.SDLK_STOP]: 'Stop',
  [SDL_Keycode.SDLK_AGAIN]: 'Again',
  [SDL_Keycode.SDLK_UNDO]: 'Undo',
  [SDL_Keycode.SDLK_CUT]: 'Cut',
  [SDL_Keycode.SDLK_COPY]: 'Copy',
  [SDL_Keycode.SDLK_PASTE]: 'Paste',
  [SDL_Keycode.SDLK_FIND]: 'Find',
  [SDL_Keycode.SDLK_MUTE]: 'Mute',
  [SDL_Keycode.SDLK_VOLUMEUP]: 'VolumeUp',
  [SDL_Keycode.SDLK_VOLUMEDOWN]: 'VolumeDown',
  [SDL_Keycode.SDLK_KP_COMMA]: 'NumpadComma',
  [SDL_Keycode.SDLK_KP_EQUALSAS400]: 'NumpadEqualsAS400',
  [SDL_Keycode.SDLK_ALTERASE]: 'AltErase',
  [SDL_Keycode.SDLK_SYSREQ]: 'SysReq',
  [SDL_Keycode.SDLK_CANCEL]: 'Cancel',
  [SDL_Keycode.SDLK_CLEAR]: 'Clear',
  [SDL_Keycode.SDLK_PRIOR]: 'Prior',
  [SDL_Keycode.SDLK_RETURN2]: 'Return2',
  [SDL_Keycode.SDLK_SEPARATOR]: 'Separator',
  [SDL_Keycode.SDLK_OUT]: 'Out',
  [SDL_Keycode.SDLK_OPER]: 'Oper',
  [SDL_Keycode.SDLK_CLEARAGAIN]: 'ClearAgain',
  [SDL_Keycode.SDLK_CRSEL]: 'CrSel',
  [SDL_Keycode.SDLK_EXSEL]: 'ExSel',

  // Numpad extended set
  [SDL_Keycode.SDLK_KP_00]: 'Numpad00',
  [SDL_Keycode.SDLK_KP_000]: 'Numpad000',
  [SDL_Keycode.SDLK_THOUSANDSSEPARATOR]: 'ThousandsSeparator',
  [SDL_Keycode.SDLK_DECIMALSEPARATOR]: 'DecimalSeparator',
  [SDL_Keycode.SDLK_CURRENCYUNIT]: 'CurrencyUnit',
  [SDL_Keycode.SDLK_CURRENCYSUBUNIT]: 'CurrencySubUnit',
  [SDL_Keycode.SDLK_KP_LEFTPAREN]: 'NumpadLeftParen',
  [SDL_Keycode.SDLK_KP_RIGHTPAREN]: 'NumpadRightParen',
  [SDL_Keycode.SDLK_KP_LEFTBRACE]: 'NumpadLeftBrace',
  [SDL_Keycode.SDLK_KP_RIGHTBRACE]: 'NumpadRightBrace',
  [SDL_Keycode.SDLK_KP_TAB]: 'NumpadTab',
  [SDL_Keycode.SDLK_KP_BACKSPACE]: 'NumpadBackspace',
  [SDL_Keycode.SDLK_KP_A]: 'NumpadA',
  [SDL_Keycode.SDLK_KP_B]: 'NumpadB',
  [SDL_Keycode.SDLK_KP_C]: 'NumpadC',
  [SDL_Keycode.SDLK_KP_D]: 'NumpadD',
  [SDL_Keycode.SDLK_KP_E]: 'NumpadE',
  [SDL_Keycode.SDLK_KP_F]: 'NumpadF',
  [SDL_Keycode.SDLK_KP_XOR]: 'NumpadXor',
  [SDL_Keycode.SDLK_KP_POWER]: 'NumpadPower',
  [SDL_Keycode.SDLK_KP_PERCENT]: 'NumpadPercent',
  [SDL_Keycode.SDLK_KP_LESS]: 'NumpadLess',
  [SDL_Keycode.SDLK_KP_GREATER]: 'NumpadGreater',
  [SDL_Keycode.SDLK_KP_AMPERSAND]: 'NumpadAmpersand',
  [SDL_Keycode.SDLK_KP_DBLAMPERSAND]: 'NumpadDoubleAmpersand',
  [SDL_Keycode.SDLK_KP_VERTICALBAR]: 'NumpadVerticalBar',
  [SDL_Keycode.SDLK_KP_DBLVERTICALBAR]: 'NumpadDoubleVerticalBar',
  [SDL_Keycode.SDLK_KP_COLON]: 'NumpadColon',
  [SDL_Keycode.SDLK_KP_HASH]: 'NumpadHash',
  [SDL_Keycode.SDLK_KP_SPACE]: 'NumpadSpace',
  [SDL_Keycode.SDLK_KP_AT]: 'NumpadAt',
  [SDL_Keycode.SDLK_KP_EXCLAM]: 'NumpadExclam',
  [SDL_Keycode.SDLK_KP_MEMSTORE]: 'NumpadMemStore',
  [SDL_Keycode.SDLK_KP_MEMRECALL]: 'NumpadMemRecall',
  [SDL_Keycode.SDLK_KP_MEMCLEAR]: 'NumpadMemClear',
  [SDL_Keycode.SDLK_KP_MEMADD]: 'NumpadMemAdd',
  [SDL_Keycode.SDLK_KP_MEMSUBTRACT]: 'NumpadMemSubtract',
  [SDL_Keycode.SDLK_KP_MEMMULTIPLY]: 'NumpadMemMultiply',
  [SDL_Keycode.SDLK_KP_MEMDIVIDE]: 'NumpadMemDivide',
  [SDL_Keycode.SDLK_KP_PLUSMINUS]: 'NumpadPlusMinus',
  [SDL_Keycode.SDLK_KP_CLEAR]: 'NumpadClear',
  [SDL_Keycode.SDLK_KP_CLEARENTRY]: 'NumpadClearEntry',
  [SDL_Keycode.SDLK_KP_BINARY]: 'NumpadBinary',
  [SDL_Keycode.SDLK_KP_OCTAL]: 'NumpadOctal',
  [SDL_Keycode.SDLK_KP_DECIMAL]: 'NumpadDecimal',
  [SDL_Keycode.SDLK_KP_HEXADECIMAL]: 'NumpadHexadecimal',

  // Modifiers
  [SDL_Keycode.SDLK_LCTRL]: 'LeftCtrl',
  [SDL_Keycode.SDLK_LSHIFT]: 'LeftShift',
  [SDL_Keycode.SDLK_LALT]: 'LeftAlt',
  [SDL_Keycode.SDLK_LGUI]: 'LeftMeta',
  [SDL_Keycode.SDLK_RCTRL]: 'RightCtrl',
  [SDL_Keycode.SDLK_RSHIFT]: 'RightShift',
  [SDL_Keycode.SDLK_RALT]: 'RightAlt',
  [SDL_Keycode.SDLK_RGUI]: 'RightMeta',

  // Mode / sleep / media / Action keys
  [SDL_Keycode.SDLK_MODE]: 'Mode',
  [SDL_Keycode.SDLK_SLEEP]: 'Sleep',
  [SDL_Keycode.SDLK_WAKE]: 'Wake',
  [SDL_Keycode.SDLK_CHANNEL_INCREMENT]: 'ChannelIncrement',
  [SDL_Keycode.SDLK_CHANNEL_DECREMENT]: 'ChannelDecrement',
  [SDL_Keycode.SDLK_MEDIA_PLAY]: 'MediaPlay',
  [SDL_Keycode.SDLK_MEDIA_PAUSE]: 'MediaPause',
  [SDL_Keycode.SDLK_MEDIA_RECORD]: 'MediaRecord',
  [SDL_Keycode.SDLK_MEDIA_FAST_FORWARD]: 'MediaFastForward',
  [SDL_Keycode.SDLK_MEDIA_REWIND]: 'MediaRewind',
  [SDL_Keycode.SDLK_MEDIA_NEXT_TRACK]: 'MediaNextTrack',
  [SDL_Keycode.SDLK_MEDIA_PREVIOUS_TRACK]: 'MediaPreviousTrack',
  [SDL_Keycode.SDLK_MEDIA_STOP]: 'MediaStop',
  [SDL_Keycode.SDLK_MEDIA_EJECT]: 'MediaEject',
  [SDL_Keycode.SDLK_MEDIA_PLAY_PAUSE]: 'MediaPlayPause',
  [SDL_Keycode.SDLK_MEDIA_SELECT]: 'MediaSelect',
  [SDL_Keycode.SDLK_AC_NEW]: 'ActionNew',
  [SDL_Keycode.SDLK_AC_OPEN]: 'ActionOpen',
  [SDL_Keycode.SDLK_AC_CLOSE]: 'ActionClose',
  [SDL_Keycode.SDLK_AC_EXIT]: 'ActionExit',
  [SDL_Keycode.SDLK_AC_SAVE]: 'ActionSave',
  [SDL_Keycode.SDLK_AC_PRINT]: 'ActionPrint',
  [SDL_Keycode.SDLK_AC_PROPERTIES]: 'ActionProperties',
  [SDL_Keycode.SDLK_AC_SEARCH]: 'ActionSearch',
  [SDL_Keycode.SDLK_AC_HOME]: 'ActionHome',
  [SDL_Keycode.SDLK_AC_BACK]: 'ActionBack',
  [SDL_Keycode.SDLK_AC_FORWARD]: 'ActionForward',
  [SDL_Keycode.SDLK_AC_STOP]: 'ActionStop',
  [SDL_Keycode.SDLK_AC_REFRESH]: 'ActionRefresh',
  [SDL_Keycode.SDLK_AC_BOOKMARKS]: 'ActionBookmarks',

  // Mobile-like soft/call keys
  [SDL_Keycode.SDLK_SOFTLEFT]: 'SoftLeft',
  [SDL_Keycode.SDLK_SOFTRIGHT]: 'SoftRight',
  [SDL_Keycode.SDLK_CALL]: 'Call',
  [SDL_Keycode.SDLK_ENDCALL]: 'EndCall',

  // Extended (0x20000000 range)
  [SDL_Keycode.SDLK_LEFT_TAB]: 'LeftTab',
  [SDL_Keycode.SDLK_LEVEL5_SHIFT]: 'Level5Shift',
  [SDL_Keycode.SDLK_MULTI_KEY_COMPOSE]: 'MultiKeyCompose',
  [SDL_Keycode.SDLK_LMETA]: 'LeftMeta',
  [SDL_Keycode.SDLK_RMETA]: 'RightMeta',
  [SDL_Keycode.SDLK_LHYPER]: 'LeftHyper',
  [SDL_Keycode.SDLK_RHYPER]: 'RightHyper',
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
