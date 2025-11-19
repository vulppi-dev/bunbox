import { defineSystem, forEachQuery } from '../core';
import { CameraComponent } from '../core/BuiltInComponents';
import { EngineError } from '../errors';
import type { Matrix4 } from '../math';
import { CAMERA_PROJECTION_KEY, CAMERA_VIEW_KEY } from './CameraSystem';

export const RenderSystem = defineSystem(
  'RenderSystem',
  300,
  ({ world, assetsStorage }) => {
    forEachQuery(world, [CameraComponent], (entity, camera) => {
      const view = assetsStorage.get<Matrix4>(CAMERA_VIEW_KEY, entity);
      const projection = assetsStorage.get<Matrix4>(
        CAMERA_PROJECTION_KEY,
        entity,
      );

      if (!view || !projection) {
        throw new EngineError(
          `Missing camera matrices for entity ${entity}`,
          'RenderSystem',
        );
      }

      if (!view.isDirty && !projection.isDirty) {
        return;
      }

      console.log('PROCESS RENDER FOR CAMERA ENTITY:', entity);
      console.log('View Matrix:', view.toString());
      console.log('Projection Matrix:', projection.toString());
      view.markAsClean();
      projection.markAsClean();
    });
  },
);
