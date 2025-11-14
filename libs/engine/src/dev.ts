import { EngineContext } from './core/EngineContext';
import { Window } from './index';

const context = new EngineContext();

const win = new Window('Test Window', context);

setTimeout(() => {
  win.dispose();
}, 3000);
