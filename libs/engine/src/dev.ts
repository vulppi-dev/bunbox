import { Window } from './index';

const win = new Window('Test Window');

win.backgroundColor.setHex(0x3498db); // Set background color to a shade of blue

setTimeout(() => {
  win.dispose();
}, 3000);
