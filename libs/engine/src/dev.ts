import { Window, EngineContext, Scene } from './index';

const context = new EngineContext();

const win = new Window('Test Window', context);

const scene = new Scene();
scene.clearColor.set(0.2, 0.3, 0.4, 1.0);

win.scene = scene;

// setTimeout(() => {
//   win.dispose();
// }, 5000);
