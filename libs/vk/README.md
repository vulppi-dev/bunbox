# @bunbox/vk

Vulkan bindings for Bun using FFI.

## Installation

```bash
bun add @bunbox/vk
```

## Features

- ✨ Complete Vulkan 1.0 - 1.3 API coverage
- 🚀 Direct FFI bindings for maximum performance
- 📦 Organized by API version for easy navigation
- 🔧 Type-safe struct definitions using `@bunbox/struct`
- 🎯 Platform-specific functions (Win32, X11, Wayland, Metal)
- 🛠️ Utility functions for version handling and common operations

## Structure

The package is organized into several modules:

### Enums

Vulkan enumerations organized by API version:

- `enums/vk10.ts` - Vulkan 1.0 enumerations
- `enums/vk11.ts` - Vulkan 1.1 additions
- `enums/vk12.ts` - Vulkan 1.2 additions
- `enums/vk13.ts` - Vulkan 1.3 additions

### Structs

Vulkan structure definitions organized by API version:

- `structs/vk10.ts` - Vulkan 1.0 structures
- `structs/vk11.ts` - Vulkan 1.1 additions
- `structs/vk12.ts` - Vulkan 1.2 additions
- `structs/vk13.ts` - Vulkan 1.3 additions

### Functions

Vulkan functions organized by category:

- `functions/global.ts` - Global-level functions (e.g., `vkGetInstanceProcAddr`)
- `functions/instance-vk10.ts` - Instance-level functions
- `functions/device-vk10.ts` - Device-level functions (memory, sync, etc.)
- `functions/resources-vk10.ts` - Resource management (buffers, images, commands)

### Platform Functions

Platform-specific Vulkan functions:

- Windows: Win32 surface creation
- Linux: X11 (Xlib/XCB) and Wayland surface creation
- macOS: Metal surface creation

### Callbacks

Vulkan callback function signatures for:

- Memory allocation callbacks
- Debug callbacks
- Device memory report callbacks

### Utils

Utility functions for:

- Version number creation and parsing
- Common constants (API versions, special values)
- Result checking and error messages
- C string conversion

## Usage

```typescript
import { VK } from '@bunbox/vk';
import {
  VkResult,
  VkStructureType,
  vkApplicationInfo,
  vkInstanceCreateInfo,
  makeVersion,
  VK_API_VERSION_1_0,
} from '@bunbox/vk';

// Create application info
const appInfo = vkApplicationInfo({
  sType: VkStructureType.APPLICATION_INFO,
  pNext: 0n,
  pApplicationName: 'My Vulkan App',
  applicationVersion: makeVersion(1, 0, 0),
  pEngineName: 'My Engine',
  engineVersion: makeVersion(1, 0, 0),
  apiVersion: VK_API_VERSION_1_0,
});

// Create instance
const instanceCreateInfo = vkInstanceCreateInfo({
  sType: VkStructureType.INSTANCE_CREATE_INFO,
  pNext: 0n,
  flags: 0,
  pApplicationInfo: /* pointer to appInfo */,
  enabledLayerCount: 0,
  ppEnabledLayerNames: 0n,
  enabledExtensionCount: 0,
  ppEnabledExtensionNames: 0n,
});

// Call Vulkan functions
const result = VK.vkCreateInstance(/* ... */);
```

## API Organization

The Vulkan API is extensive. To make it manageable, this package organizes the API into:

1. **By Version**: Enums and structs are separated by Vulkan version (1.0, 1.1, 1.2, 1.3)
2. **By Category**: Functions are grouped by their purpose (global, instance, device, resources)
3. **By Platform**: Platform-specific extensions are in their own module

This organization makes it easier to find what you need and understand which API version introduced specific features.

## License

MIT

## Contributing

Contributions are welcome! This package aims to provide complete Vulkan API coverage while maintaining good organization and TypeScript type safety.
