import type { World } from '../core';
import {
  CameraComponent,
  OrthographicCameraComponent,
  PerspectiveCameraComponent,
  TransformComponent,
} from '../core/BuiltInComponents';

export function createPerspectiveCamera(world: World) {
  const entity = world.createEntity();
  world.addComponent(entity, TransformComponent);
  world.addComponent(entity, CameraComponent);
  world.addComponent(entity, PerspectiveCameraComponent);
  return entity;
}

export function createOrthographicCamera(world: World) {
  const entity = world.createEntity();
  world.addComponent(entity, TransformComponent);
  world.addComponent(entity, CameraComponent);
  world.addComponent(entity, OrthographicCameraComponent);
  return entity;
}
