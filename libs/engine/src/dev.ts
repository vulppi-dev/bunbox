import { Window, EngineContext, Scene } from './index';

const context = new EngineContext();

const win = new Window('Test Window', context);

const scene = new Scene();

win.scene = scene;

// setTimeout(() => {
//   win.dispose();
// }, 5000);
