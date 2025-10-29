import { App, Window } from './core';

const app = new App();
const win = new Window('My First Window');

app.addChild(win);

win.on('dispose', () => {
  app.dispose();
});

await Bun.sleep(3000)

  .then(() => {
    win.fullscreen();
    return Bun.sleep(Infinity);
  });
