import { Window } from './core';

const win = new Window('Test Window');

win.backgroundColor.setHex(0x3498db); // Set background color to a shade of blue

setTimeout(() => {
  win.backgroundColor.setHex(0xe74c3c, 0.2); // Change background color to a shade of red after 2 seconds
}, 2000);
