import { defineSystem, forEachQuery } from '../core';
import {
  DirectionalLightComponent,
  LightComponent,
  PointLightComponent,
  SpotLightComponent,
  TransformComponent,
} from '../core/BuiltInComponents';
import { EngineError } from '../errors';
import { Vector3, Color, Matrix4 } from '../math';
import { MaskHelper } from '../resources';
import { TRANSFORM_CACHE_KEY, type TransformCache } from './TransformSystem';

export const DIRECTIONAL_LIGHT_KEY = Symbol('directionalLightCache');
export const POINT_LIGHT_KEY = Symbol('pointLightCache');
export const SPOT_LIGHT_KEY = Symbol('spotLightCache');

type DirectionalLightCache = {
  color: Color;
  intensity: number;
  layer: MaskHelper;

  direction: Vector3;
};

type PointLightCache = {
  color: Color;
  intensity: number;
  layer: MaskHelper;

  position: Vector3;
  range: number;
};

type SpotLightCache = {
  color: Color;
  intensity: number;
  layer: MaskHelper;

  position: Vector3;
  direction: Vector3;
  range: number;
  angle: number;
};

export const LightSystem = defineSystem(
  'LightSystem',
  120,
  ({ world, assetsStorage }) => {
    forEachQuery(
      world,
      [LightComponent, DirectionalLightComponent, TransformComponent],
      (entity, light) => {
        const transformCache = assetsStorage.get<TransformCache>(
          TRANSFORM_CACHE_KEY,
          entity,
        );

        if (!transformCache) {
          throw new EngineError(
            `TransformCache not found for entity ${entity} in LightSystem`,
            'LightSystem',
          );
        }

        let cache = assetsStorage.get<DirectionalLightCache>(
          DIRECTIONAL_LIGHT_KEY,
          entity,
        );

        let dirty = false;
        if (!cache) {
          cache = {
            direction: new Vector3(0, 0, 1),
            color: new Color(1, 1, 1, 1),
            intensity: -1,
            layer: new MaskHelper(),
          };
          assetsStorage.set(DIRECTIONAL_LIGHT_KEY, entity, cache);
          dirty = true;
        }

        if (!cache) dirty = true;
        if (transformCache.worldMatrix.isDirty) dirty = true;
        if (light.color.isDirty) dirty = true;
        if (cache.intensity !== light.intensity) dirty = true;
        if (light.layer.isDirty) dirty = true;

        if (dirty) {
          transformCache.worldMatrix.decomposeDirection(cache.direction);
          cache.color.copy(light.color);
          cache.intensity = light.intensity;
          cache.layer.copy(light.layer);
        }

        transformCache.worldMatrix.markAsClean();
        transformCache.localMatrix.markAsClean();
      },
    );

    forEachQuery(
      world,
      [LightComponent, PointLightComponent, TransformComponent],
      (entity, light, point) => {
        const transformCache = assetsStorage.get<TransformCache>(
          TRANSFORM_CACHE_KEY,
          entity,
        );

        if (!transformCache) {
          throw new EngineError(
            `TransformCache not found for entity ${entity} in LightSystem`,
            'LightSystem',
          );
        }

        let cache = assetsStorage.get<PointLightCache>(POINT_LIGHT_KEY, entity);

        if (!cache) {
          cache = {
            position: new Vector3(),
            range: point.range,
            color: new Color(1, 1, 1, 1),
            intensity: -1,
            layer: new MaskHelper(),
          };
          assetsStorage.set(POINT_LIGHT_KEY, entity, cache);
        }

        let dirty = false;
        if (transformCache.worldMatrix.isDirty) dirty = true;
        if (light.color.isDirty) dirty = true;
        if (cache.range !== point.range) dirty = true;
        if (cache.intensity !== light.intensity) dirty = true;
        if (light.layer.isDirty) dirty = true;

        if (dirty) {
          transformCache.worldMatrix.decomposePosition(cache.position);
          cache.range = point.range;
          cache.color.copy(light.color);
          cache.intensity = light.intensity;
          cache.layer.copy(light.layer);
        }

        transformCache.worldMatrix.markAsClean();
        transformCache.localMatrix.markAsClean();
      },
    );

    forEachQuery(
      world,
      [LightComponent, SpotLightComponent, TransformComponent],
      (entity, light, spot) => {
        const transformCache = assetsStorage.get<TransformCache>(
          TRANSFORM_CACHE_KEY,
          entity,
        );

        if (!transformCache) {
          throw new EngineError(
            `TransformCache not found for entity ${entity} in LightSystem`,
            'LightSystem',
          );
        }

        let cache = assetsStorage.get<SpotLightCache>(SPOT_LIGHT_KEY, entity);

        if (!cache) {
          cache = {
            position: new Vector3(),
            direction: new Vector3(0, 0, 1),
            range: spot.range,
            angle: spot.angle,
            color: new Color(1, 1, 1, 1),
            intensity: -1,
            layer: new MaskHelper(),
          };
          assetsStorage.set(SPOT_LIGHT_KEY, entity, cache);
        }

        let dirty = false;
        if (transformCache.worldMatrix.isDirty) dirty = true;
        if (light.color.isDirty) dirty = true;
        if (cache.range !== spot.range) dirty = true;
        if (cache.angle !== spot.angle) dirty = true;
        if (cache.intensity !== light.intensity) dirty = true;
        if (light.layer.isDirty) dirty = true;

        if (dirty) {
          transformCache.worldMatrix.decomposePosition(cache.position);
          transformCache.worldMatrix.decomposeDirection(cache.direction);
          cache.range = spot.range;
          cache.angle = spot.angle;
          cache.color.copy(light.color);
          cache.intensity = light.intensity;
          cache.layer.copy(light.layer);
        }

        transformCache.worldMatrix.markAsClean();
        transformCache.localMatrix.markAsClean();
      },
    );
  },
);
