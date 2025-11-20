import type { World } from '../core';
import {
  DirectionalLightComponent,
  LightComponent,
  PointLightComponent,
  SpotLightComponent,
  TransformComponent,
} from '../core/BuiltInComponents';

export function createDirectionalLight(world: World) {
  const entity = world.createEntity();
  world.addComponent(entity, TransformComponent);
  world.addComponent(entity, LightComponent);
  world.addComponent(entity, DirectionalLightComponent);

  return entity;
}

export function createPointLight(world: World) {
  const entity = world.createEntity();
  world.addComponent(entity, TransformComponent);
  world.addComponent(entity, LightComponent);
  world.addComponent(entity, PointLightComponent);

  return entity;
}

export function createSpotLight(world: World) {
  const entity = world.createEntity();
  world.addComponent(entity, TransformComponent);
  world.addComponent(entity, LightComponent);
  world.addComponent(entity, SpotLightComponent);

  return entity;
}
