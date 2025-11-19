import {
  Window,
  EngineContext,
  createWorld,
  createPerspectiveCamera,
} from './index';

const context = new EngineContext();

const win = new Window('Test Window', context);

win.on('after-dispose', () => {
  console.log('Disposing window...');
  // context.dispose();
});

const world = createWorld();

win.setWorld(world);

const camera1 = createPerspectiveCamera(world);

// setTimeout(() => {
//   win.dispose();
// }, 5000);
