import { Window } from './index';

const win = new Window('Test Window');

win.clearColor.setHex(0x3498db, 0.2); // Set background color to a shade of blue

setTimeout(() => {
  win.dispose();
}, 3000);
