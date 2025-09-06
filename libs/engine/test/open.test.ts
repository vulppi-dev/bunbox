import { App, Window } from '../src/core';

const app = new App();
const win = new Window({
  app,
  title: 'Bun + SDL3 🚀',
  x: 16,
  y: 16,
  features: {
    maximized: true,
    borderless: true,
  },
});

await Bun.sleep(4000);

app.dispose();
