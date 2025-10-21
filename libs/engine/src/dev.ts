import { SDL_Keycode } from '@bunbox/sdl3';
import { App, Window } from '.';
import { createSimpleMaterial } from './helpers/material';
import { createBox } from './helpers/geometry';
import { Mesh } from './nodes/Mesh';
import { PerspectiveCamera } from './nodes/PerspectiveCamera';
import { Color } from './math';

const app = new App();
app.setLogPriority('verbose');

const win = new Window({
  title: 'Dev mode - Render Test',
  width: 1024,
  height: 768,
  features: {
    resizable: true,
    highPixelDensity: true,
  },
});

win.on('windowClose', (ev) => {
  if (ev.windowId !== win.windowId) return;
  win.dispose();
  app.dispose();
});

win.on('keyDown', (ev) => {
  if (ev.key === SDL_Keycode.SDLK_ESCAPE) {
    app.dispose();
  }
  console.log(ev.type, ev.keyText);
});

win.clearColor.setHex(0x1a1a2e);

// Create a simple test scene
const camera = new PerspectiveCamera();
camera.fov = (60 * Math.PI) / 180; // Convert degrees to radians
camera.aspect = 1024 / 768;
camera.near = 0.1;
camera.far = 100;
camera.position.z = 3;

// Create a box geometry with a colored material
const boxGeometry = createBox({ width: 1, height: 1, depth: 1 });
const boxMaterial = createSimpleMaterial({
  label: 'BoxMaterial',
  color: new Color(1, 0.5, 0.2, 1), // Orange
});

const boxMesh = new Mesh();
boxMesh.geometry = boxGeometry;
boxMesh.material = boxMaterial;

// Build scene tree
win.addChild(camera);
win.addChild(boxMesh);

app.addChild(win);

console.log('[Dev] Scene ready: 1 camera, 1 mesh (box)');
console.log('[Dev] Box vertices:', boxGeometry.vertexCount);
console.log('[Dev] Box indices:', boxGeometry.indexCount);
