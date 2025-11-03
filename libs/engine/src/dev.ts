import { Window } from './core';

try {
  const win = new Window('Test Window', {});
  console.log('Window created successfully');

  await Bun.sleep(3000)

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
} catch (error) {
  console.error('Error during execution:', error);
  throw error;
}
