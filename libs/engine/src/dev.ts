import { App, Window } from './core';

const app = new App();
const win = new Window('My First Window');

app.addChild(win);

win.on('dispose', () => {
  app.dispose();
  process.exit(0);
});
