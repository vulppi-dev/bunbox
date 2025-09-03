import type { FFIFunction } from 'bun:ffi';

export const AUDIO_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AudioDevicePaused
   */
  SDL_AudioDevicePaused: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AudioStreamDevicePaused
   */
  SDL_AudioStreamDevicePaused: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindAudioStream
   */
  SDL_BindAudioStream: { args: ['u32', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindAudioStreams
   */
  SDL_BindAudioStreams: { args: ['u32', 'ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ClearAudioStream
   */
  SDL_ClearAudioStream: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CloseAudioDevice
   */
  SDL_CloseAudioDevice: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ConvertAudioSamples
   */
  SDL_ConvertAudioSamples: {
    args: ['ptr', 'ptr', 'i32', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateAudioStream
   */
  SDL_CreateAudioStream: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyAudioStream
   */
  SDL_DestroyAudioStream: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FlushAudioStream
   */
  SDL_FlushAudioStream: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioDeviceChannelMap
   */
  SDL_GetAudioDeviceChannelMap: { args: ['u32', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioDeviceFormat
   */
  SDL_GetAudioDeviceFormat: { args: ['u32', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioDeviceGain
   */
  SDL_GetAudioDeviceGain: { args: ['u32', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioDeviceName
   */
  SDL_GetAudioDeviceName: { args: ['u32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioDriver
   */
  SDL_GetAudioDriver: { args: ['i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioFormatName
   */
  SDL_GetAudioFormatName: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioPlaybackDevices
   */
  SDL_GetAudioPlaybackDevices: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioRecordingDevices
   */
  SDL_GetAudioRecordingDevices: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamAvailable
   */
  SDL_GetAudioStreamAvailable: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamData
   */
  SDL_GetAudioStreamData: { args: ['ptr', 'ptr', 'i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamDevice
   */
  SDL_GetAudioStreamDevice: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamFormat
   */
  SDL_GetAudioStreamFormat: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamFrequencyRatio
   */
  SDL_GetAudioStreamFrequencyRatio: { args: ['ptr'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamGain
   */
  SDL_GetAudioStreamGain: { args: ['ptr'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamInputChannelMap
   */
  SDL_GetAudioStreamInputChannelMap: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamOutputChannelMap
   */
  SDL_GetAudioStreamOutputChannelMap: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamProperties
   */
  SDL_GetAudioStreamProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAudioStreamQueued
   */
  SDL_GetAudioStreamQueued: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentAudioDriver
   */
  SDL_GetCurrentAudioDriver: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumAudioDrivers
   */
  SDL_GetNumAudioDrivers: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSilenceValueForFormat
   */
  SDL_GetSilenceValueForFormat: { args: ['u32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsAudioDevicePhysical
   */
  SDL_IsAudioDevicePhysical: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsAudioDevicePlayback
   */
  SDL_IsAudioDevicePlayback: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadWAV
   */
  SDL_LoadWAV: { args: ['cstring', 'ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadWAV_IO
   */
  SDL_LoadWAV_IO: {
    args: ['ptr', 'bool', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockAudioStream
   */
  SDL_LockAudioStream: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MixAudio
   */
  SDL_MixAudio: { args: ['ptr', 'ptr', 'u32', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenAudioDevice
   */
  SDL_OpenAudioDevice: { args: ['u32', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenAudioDeviceStream
   */
  SDL_OpenAudioDeviceStream: {
    args: ['u32', 'ptr', 'ptr', 'ptr'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PauseAudioDevice
   */
  SDL_PauseAudioDevice: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PauseAudioStreamDevice
   */
  SDL_PauseAudioStreamDevice: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PutAudioStreamData
   */
  SDL_PutAudioStreamData: { args: ['ptr', 'ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PutAudioStreamDataNoCopy
   */
  // SDL_PutAudioStreamDataNoCopy: {
  //   args: ['ptr', 'ptr', 'i32', 'ptr', 'ptr'],
  //   returns: 'bool',
  // }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PutAudioStreamPlanarData
   */
  // SDL_PutAudioStreamPlanarData: {
  //   args: ['ptr', 'ptr', 'i32', 'i32'],
  //   returns: 'bool',
  // }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResumeAudioDevice
   */
  SDL_ResumeAudioDevice: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResumeAudioStreamDevice
   */
  SDL_ResumeAudioStreamDevice: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioDeviceGain
   */
  SDL_SetAudioDeviceGain: { args: ['u32', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioIterationCallbacks
   */
  // SDL_SetAudioIterationCallbacks: {
  //   args: ['u32', 'ptr', 'ptr', 'ptr'],
  //   returns: 'bool',
  // }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioPostmixCallback
   */
  SDL_SetAudioPostmixCallback: { args: ['u32', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioStreamFormat
   */
  SDL_SetAudioStreamFormat: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioStreamFrequencyRatio
   */
  SDL_SetAudioStreamFrequencyRatio: { args: ['ptr', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioStreamGain
   */
  SDL_SetAudioStreamGain: { args: ['ptr', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioStreamGetCallback
   */
  SDL_SetAudioStreamGetCallback: {
    args: ['ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioStreamInputChannelMap
   */
  SDL_SetAudioStreamInputChannelMap: {
    args: ['ptr', 'ptr', 'i32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioStreamOutputChannelMap
   */
  SDL_SetAudioStreamOutputChannelMap: {
    args: ['ptr', 'ptr', 'i32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAudioStreamPutCallback
   */
  SDL_SetAudioStreamPutCallback: {
    args: ['ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnbindAudioStream
   */
  SDL_UnbindAudioStream: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnbindAudioStreams
   */
  SDL_UnbindAudioStreams: { args: ['ptr', 'i32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnlockAudioStream
   */
  SDL_UnlockAudioStream: { args: ['ptr'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
