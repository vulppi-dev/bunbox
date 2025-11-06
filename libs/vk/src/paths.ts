const VK_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'libvulkan.1.dylib',
    x64: 'libvulkan.1.dylib',
  },
  linux: {
    arm64: 'libvulkan.so.1',
    x64: 'libvulkan.so.1',
  },
  win32: {
    arm64: 'vulkan-1.dll',
    x64: 'vulkan-1.dll',
  },
};

export const VK_PATH = VK_LIBS[process.platform]?.[process.arch];
