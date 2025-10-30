import { Window } from './core';

const win = new Window('Test Window', {});

Bun.sleep(3000)

  // .then(() => {
  //   win.fullscreen();
  //   return Bun.sleep(2000);
  // })
  // .then(() => {
  //   win.setSize(800, 600);
  //   return Bun.sleep(3000);
  // })
  // .then(() => {
  //   win.setSize(1366, 768);
  //   return Bun.sleep(2000);
  // })
  // .then(() => {
  //   win.restore();
  //   return Bun.sleep(2000);
  // })
  // .then(() => {
  //   win.maximize();
  //   return Bun.sleep(2000);
  // })
  // .then(() => {
  //   win.minimize();
  //   return Bun.sleep(2000);
  // })
  .then(() => {
    win.fullscreen(true);
    return Bun.sleep(2000);
  })
  .then(() => {
    win.maximize();
    return Bun.sleep(2000);
  })
  .then(() => {
    win.restore();
    return Bun.sleep(2000);
  })
  .then(() => {
    win.restore();
    return Bun.sleep(2000);
  })
  .then(() => {
    win.dispose();
    return Bun.sleep(2000);
  });
