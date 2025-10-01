export const USING_VULKAN = process.platform === 'darwin' ? false : true;

export const BACKGROUND_RENDERING = USING_VULKAN ? 'vulkan' : 'metal';

export const VIEWPORT_FACTOR = USING_VULKAN ? -1 : 1;
