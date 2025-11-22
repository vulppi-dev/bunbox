import { World } from '../core';
import {
  CameraSystem,
  LightSystem,
  RenderSystem,
  TransformsSystem,
} from '../systems';

export function createWorld(): World {
  const world = new World();
  world.registerSystem(TransformsSystem);
  world.registerSystem(CameraSystem);
  world.registerSystem(LightSystem);
  world.registerSystem(RenderSystem);

  return world;
}
