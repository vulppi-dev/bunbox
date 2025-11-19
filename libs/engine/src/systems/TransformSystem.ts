import { defineSystem, forEachQuery } from '../core';
import { ParentComponent, TransformComponent } from '../core/BuiltInComponents';
import type { Entity } from '../core/World';
import { EngineError } from '../errors';
import { Matrix4 } from '../math';

export const TRANSFORM_CACHE_KEY = Symbol('transformCache');

export type TransformCache = {
  localMatrix: Matrix4;
  worldMatrix: Matrix4;
};

export const TransformsSystem = defineSystem(
  'TransformsSystem',
  100,
  ({ world, assetsStorage }) => {
    const visited = new Set<Entity>();
    const visiting = new Set<Entity>();

    const updateWorldMatrix = (entity: Entity): void => {
      if (visited.has(entity)) {
        return;
      }

      if (visiting.has(entity)) {
        throw new EngineError(
          `Transform hierarchy cycle detected at entity ${entity}`,
          'TransformsSystem',
        );
      }

      visiting.add(entity);

      const transform = world.getComponentValue(entity, TransformComponent);
      if (!transform) {
        visiting.delete(entity);
        return;
      }

      const parent = world.getComponentValue(entity, ParentComponent);
      let cache = assetsStorage.get<TransformCache>(
        TRANSFORM_CACHE_KEY,
        entity,
      );

      if (!cache) {
        cache = {
          localMatrix: new Matrix4(),
          worldMatrix: new Matrix4(),
        };
        assetsStorage.set(TRANSFORM_CACHE_KEY, entity, cache);
      }

      const position = transform.position;
      const rotation = transform.rotation;
      const scale = transform.scale;

      const isLocalDirty =
        position.isDirty || rotation.isDirty || scale.isDirty;

      if (isLocalDirty) {
        cache.localMatrix
          .reset()
          .translate(position)
          .rotate(rotation)
          .scale(scale);

        position.markAsClean();
        rotation.markAsClean();
        scale.markAsClean();
      }

      if (parent && parent.parentEntity) {
        updateWorldMatrix(parent.parentEntity);
        const parentCache = assetsStorage.get<TransformCache>(
          TRANSFORM_CACHE_KEY,
          parent.parentEntity,
        );

        if (!parentCache) {
          throw new EngineError(
            `Parent entity ${parent.parentEntity} is missing TransformCache`,
            'TransformsSystem',
          );
        }

        if (parentCache.worldMatrix.isDirty) {
          cache.worldMatrix
            .copy(parentCache.worldMatrix)
            .mulR(cache.localMatrix);
        }
      } else if (cache.localMatrix.isDirty) {
        cache.worldMatrix.copy(cache.localMatrix);
      }

      visiting.delete(entity);
      visited.add(entity);
    };

    forEachQuery(world, [TransformComponent], (entity) => {
      updateWorldMatrix(entity);
    });
  },
);
