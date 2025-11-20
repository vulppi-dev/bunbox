import { defineSystem, forEachQuery, type Entity } from '../core';
import {
  CameraComponent,
  OrthographicCameraComponent,
  PerspectiveCameraComponent,
  TransformComponent,
} from '../core/BuiltInComponents';
import { EngineError } from '../errors';
import { Cube, Matrix4 } from '../math';
import { TRANSFORM_CACHE_KEY, type TransformCache } from './TransformSystem';

export const CAMERA_VIEW_KEY = Symbol('cameraViewCache');
export const CAMERA_PROJECTION_KEY = Symbol('cameraProjectionCache');
export const CAMERA_PERSPECTIVE_KEY = Symbol('cameraPerspectiveCache');
export const CAMERA_ORTHOGRAPHIC_KEY = Symbol('cameraOrthographicCache');

type PerspectiveCameraCache = {
  lastFov: number;
  lastAspect: number;
  lastNear: number;
  lastFar: number;
};

export const CameraSystem = defineSystem(
  'CameraSystem',
  110,
  ({ world, assetsStorage }) => {
    const updateViewMatrix = (entity: Entity): void => {
      const transformCache = assetsStorage.get<TransformCache>(
        TRANSFORM_CACHE_KEY,
        entity,
      );

      if (!transformCache) {
        throw new EngineError(
          `TransformCache not found for entity ${entity} in CameraSystem`,
          'CameraSystem',
        );
      }

      // Update view matrix
      let dirtyView = false;
      let cachedView = assetsStorage.get<Matrix4>(CAMERA_VIEW_KEY, entity);

      if (!cachedView) {
        cachedView = new Matrix4();
        assetsStorage.set(CAMERA_VIEW_KEY, entity, cachedView);
        dirtyView = true;
      }

      if (dirtyView || transformCache.worldMatrix.isDirty) {
        cachedView!.copy(transformCache.worldMatrix).invert();
      }
      transformCache.worldMatrix.markAsClean();
      transformCache.localMatrix.markAsClean();
    };

    forEachQuery(
      world,
      [
        CameraComponent,
        PerspectiveCameraComponent,
        TransformComponent,
      ],
      (entity, camera, perspectiveCamera) => {
        updateViewMatrix(entity);

        // Update projection matrix
        let dirtyProjection = false;
        let cachedProjection = assetsStorage.get<Matrix4>(
          CAMERA_PROJECTION_KEY,
          entity,
        );
        let cachedPerspective = assetsStorage.get<PerspectiveCameraCache>(
          CAMERA_PERSPECTIVE_KEY,
          entity,
        );

        if (!cachedProjection) {
          cachedProjection = new Matrix4();
          assetsStorage.set(CAMERA_PROJECTION_KEY, entity, cachedProjection);
          dirtyProjection = true;
        }
        if (!cachedPerspective) {
          cachedPerspective = {
            lastFov: -1,
            lastAspect: -1,
            lastNear: -1,
            lastFar: -1,
          };
          assetsStorage.set(CAMERA_PERSPECTIVE_KEY, entity, cachedPerspective);
          dirtyProjection = true;
        }

        const aspect = perspectiveCamera.aspect;
        const near = camera.near;
        const far = camera.far;

        if (aspect === 0) {
          throw new EngineError(
            `Camera entity ${entity} has invalid aspect ratio of 0`,
            'CameraSystem',
          );
        }
        if (far <= near) {
          throw new EngineError(
            `Camera entity ${entity} has invalid near and far planes: near (${near}) must be less than far (${far})`,
            'CameraSystem',
          );
        }

        dirtyProjection ||=
          cachedPerspective.lastFov !== perspectiveCamera.fov ||
          cachedPerspective.lastAspect !== aspect ||
          cachedPerspective.lastNear !== near ||
          cachedPerspective.lastFar !== far;

        if (dirtyProjection) {
          cachedPerspective.lastFov = perspectiveCamera.fov;
          cachedPerspective.lastAspect = aspect;
          cachedPerspective.lastNear = near;
          cachedPerspective.lastFar = far;

          const fov = 1 / Math.tan(perspectiveCamera.fov * 0.5);
          const invNF = 1 / (near - far);
          const A = far * invNF;
          const B = far * near * invNF;

          // prettier-multiline-arrays-set-line-pattern: 4
          cachedProjection.set([
            fov / aspect, 0, 0, 0,
            0, fov, 0, 0,
            0, 0, A, -1,
            0, 0, B, 0,
          ]);
        }
      },
    );

    const compareCube = new Cube();
    forEachQuery(
      world,
      [
        CameraComponent, OrthographicCameraComponent, TransformComponent,
      ],
      (entity, camera, orthographicCamera) => {
        updateViewMatrix(entity);

        // Update projection matrix
        let dirtyProjection = false;
        let cachedProjection = assetsStorage.get<Matrix4>(
          CAMERA_PROJECTION_KEY,
          entity,
        );
        let cachedOrthographic = assetsStorage.get<Cube>(
          CAMERA_ORTHOGRAPHIC_KEY,
          entity,
        );

        if (!cachedProjection) {
          cachedProjection = new Matrix4();
          assetsStorage.set(CAMERA_PROJECTION_KEY, entity, cachedProjection);
          dirtyProjection = true;
        }
        if (!cachedOrthographic) {
          cachedOrthographic = new Cube();
          cachedOrthographic.markAsClean();
          assetsStorage.set(
            CAMERA_ORTHOGRAPHIC_KEY,
            entity,
            cachedOrthographic,
          );
          dirtyProjection = true;
        }

        const size = orthographicCamera.size;
        compareCube.set(
          size.x,
          size.y,
          size.width,
          size.height,
          camera.near,
          camera.far,
        );

        dirtyProjection ||= !compareCube.equals(cachedOrthographic);

        if (dirtyProjection) {
          cachedOrthographic.copy(compareCube);
          cachedOrthographic.markAsClean();

          const left = size.left;
          const right = size.right;
          const top = size.top;
          const bottom = size.bottom;
          const near = camera.near;
          const far = camera.far;

          if (left === right) {
            throw new EngineError(
              `Camera entity ${entity} has invalid orthographic size: left (${left}) must be different than right (${right})`,
              'CameraSystem',
            );
          }
          if (top === bottom) {
            throw new EngineError(
              `Camera entity ${entity} has invalid orthographic size: top (${top}) must be different than bottom (${bottom})`,
              'CameraSystem',
            );
          }
          if (far <= near) {
            throw new EngineError(
              `Camera entity ${entity} has invalid near and far planes: near (${near}) must be less than far (${far})`,
              'CameraSystem',
            );
          }

          let dh = right - left;
          let dv = top - bottom;
          const invNF = 1 / (near - far);

          // Maps x in [l,r] to [-1,1], y in [b,t] to [-1,1], z in [-n,-f] to [0,1]
          cachedProjection.set([
            // col 0
            2 / dh, 0, 0, 0,
            // col 1
            0, 2 / dv, 0, 0,
            // col 2 (maps z=-n -> 0, z=-f -> 1)
            0, 0, 1 * invNF, 0,
            // col 3 (translation)
            -(right + left) / dh, -(top + bottom) / dv, near * invNF, 1,
          ]);
        }
      },
    );
  },
);
