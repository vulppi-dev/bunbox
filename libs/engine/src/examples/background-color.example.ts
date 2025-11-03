/**
 * Example: Setting Window Background Color
 *
 * This example demonstrates how to set the background color of a window
 * using the Color class.
 */

import { Window } from '../core/Window';
import { Color } from '../math/Color';

// Create a window
const window = new Window('main-window', {
  width: 800,
  height: 600,
});

// Set window title
window.title = 'Background Color Example';

// Set background to dark blue
window.backgroundColor = new Color(0.1, 0.2, 0.4, 1.0);

// You can also create colors from hex values
const redColor = new Color();
redColor.setHex(0xff0000); // Red

// Change background color after some time
setTimeout(() => {
  window.backgroundColor = redColor;
}, 2000);

// Or modify the existing color object
setTimeout(() => {
  window.backgroundColor.set(0, 1, 0, 1); // Green
}, 4000);

// The color is automatically used by the ClearScreenRenderPass
// to clear the screen before rendering each frame
