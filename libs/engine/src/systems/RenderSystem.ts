import { defineSystem, forEachQuery, type Entity } from '../core';
import { CameraComponent } from '../core/BuiltInComponents';
import { EngineError } from '../errors';
import type { Color, Matrix4, Rect, Vector3 } from '../math';
import type { MaskHelper } from '../resources';
import type { Environment } from '../resources/Environment';
import type { Geometry } from '../resources/Geometry';
import type { Material } from '../material/MaterialBuilder';
import { CAMERA_PROJECTION_KEY, CAMERA_VIEW_KEY } from './CameraSystem';
import {
  DIRECTIONAL_LIGHT_KEY,
  POINT_LIGHT_KEY,
  SPOT_LIGHT_KEY,
  type DirectionalLightCache,
  type PointLightCache,
  type SpotLightCache,
} from './LightSystem';
import { MESH_CACHE_KEY, type MeshCache } from './MeshSystem';

export type FrameCamera = {
  id: Entity;
  view: Matrix4;
  projection: Matrix4;
  layer: MaskHelper;
  viewport: Rect | null;
  viewDirty: boolean;
  projectionDirty: boolean;
  layerDirty: boolean;
};

type BaseFrameLight = {
  id: Entity;
  color: Color;
  intensity: number;
  layer: MaskHelper;
  dirty: boolean;
};

export type FrameDirectionalLight = BaseFrameLight & {
  type: 'directional';
  direction: Vector3;
};

export type FramePointLight = BaseFrameLight & {
  type: 'point';
  position: Vector3;
  range: number;
};

export type FrameSpotLight = BaseFrameLight & {
  type: 'spot';
  position: Vector3;
  direction: Vector3;
  range: number;
  angle: number;
};

export type FrameLight =
  | FrameDirectionalLight
  | FramePointLight
  | FrameSpotLight;

export type FrameMesh = {
  id: Entity;
  geometry: Geometry;
  material: Material | null;
  modelMatrix: Matrix4;
  layer: MaskHelper;
  geometryDirty: boolean;
  materialDirty: boolean;
  transformDirty: boolean;
  layerDirty: boolean;
};

export type CameraRenderGroup = {
  camera: FrameCamera;
  lights: FrameLight[];
  meshes: FrameMesh[];
};

export type FrameRenderArtifacts = {
  cameras: CameraRenderGroup[];
  environment: Environment | null;
};

export const FRAME_RENDER_KEY = Symbol('frameRenderArtifacts');
const FRAME_RENDER_ID = 'frame' as Entity;

export const RenderSystem = defineSystem(
  'RenderSystem',
  900,
  ({ world, assetsStorage }) => {
    const meshCache =
      assetsStorage.getTypeCache<MeshCache>(MESH_CACHE_KEY) ??
      new Map<Entity, MeshCache>();
    const directionalCache =
      assetsStorage.getTypeCache<DirectionalLightCache>(
        DIRECTIONAL_LIGHT_KEY,
      ) ?? new Map<Entity, DirectionalLightCache>();
    const pointCache =
      assetsStorage.getTypeCache<PointLightCache>(POINT_LIGHT_KEY) ??
      new Map<Entity, PointLightCache>();
    const spotCache =
      assetsStorage.getTypeCache<SpotLightCache>(SPOT_LIGHT_KEY) ??
      new Map<Entity, SpotLightCache>();

    const renderArtifacts: FrameRenderArtifacts = {
      environment: world.environment ?? null,
      cameras: [],
    };

    const usedCameras: Entity[] = [];
    const usedMeshes = new Set<Entity>();
    const usedDirectional = new Set<Entity>();
    const usedPoint = new Set<Entity>();
    const usedSpot = new Set<Entity>();

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

      const cameraData: FrameCamera = {
        id: entity,
        view,
        projection,
        layer: camera.layer,
        viewport: camera.viewport,
        viewDirty: view.isDirty,
        projectionDirty: projection.isDirty,
        layerDirty: camera.layer.isDirty,
      };

      const cameraLights: FrameLight[] = [];
      for (const [lightId, cache] of directionalCache) {
        if (!camera.layer.overlaps(cache.layer)) continue;
        cameraLights.push({
          id: lightId,
          type: 'directional',
          direction: cache.direction,
          color: cache.color,
          intensity: cache.intensity,
          layer: cache.layer,
          dirty:
            cache.direction.isDirty ||
            cache.color.isDirty ||
            cache.layer.isDirty,
        });
        usedDirectional.add(lightId);
      }

      for (const [lightId, cache] of pointCache) {
        if (!camera.layer.overlaps(cache.layer)) continue;
        cameraLights.push({
          id: lightId,
          type: 'point',
          position: cache.position,
          range: cache.range,
          color: cache.color,
          intensity: cache.intensity,
          layer: cache.layer,
          dirty:
            cache.position.isDirty ||
            cache.color.isDirty ||
            cache.layer.isDirty,
        });
        usedPoint.add(lightId);
      }

      for (const [lightId, cache] of spotCache) {
        if (!camera.layer.overlaps(cache.layer)) continue;
        cameraLights.push({
          id: lightId,
          type: 'spot',
          position: cache.position,
          direction: cache.direction,
          range: cache.range,
          angle: cache.angle,
          color: cache.color,
          intensity: cache.intensity,
          layer: cache.layer,
          dirty:
            cache.position.isDirty ||
            cache.direction.isDirty ||
            cache.color.isDirty ||
            cache.layer.isDirty,
        });
        usedSpot.add(lightId);
      }

      const cameraMeshes: FrameMesh[] = [];
      for (const [meshId, cache] of meshCache) {
        if (!camera.layer.overlaps(cache.layer)) continue;
        cameraMeshes.push({
          id: meshId,
          geometry: cache.geometry,
          material: cache.material,
          modelMatrix: cache.modelMatrix,
          layer: cache.layer,
          geometryDirty: cache.geometry.isDirty,
          materialDirty: cache.material?.isDirty ?? false,
          transformDirty: cache.modelMatrix.isDirty,
          layerDirty: cache.layer.isDirty,
        });
        usedMeshes.add(meshId);
      }

      renderArtifacts.cameras.push({
        camera: cameraData,
        lights: cameraLights,
        meshes: cameraMeshes,
      });
      usedCameras.push(entity);
    });

    assetsStorage.set(FRAME_RENDER_KEY, FRAME_RENDER_ID, renderArtifacts);

    for (const cameraId of usedCameras) {
      assetsStorage.get<Matrix4>(CAMERA_VIEW_KEY, cameraId)?.markAsClean();
      assetsStorage
        .get<Matrix4>(CAMERA_PROJECTION_KEY, cameraId)
        ?.markAsClean();
      world.getComponentValue(cameraId, CameraComponent)?.layer.markAsClean();
    }

    for (const meshId of usedMeshes) {
      const cache = meshCache.get(meshId);
      if (!cache) continue;
      cache.geometry.markAsClean();
      cache.material?.markAsClean();
      cache.modelMatrix.markAsClean();
      cache.layer.markAsClean();
    }

    for (const lightId of usedDirectional) {
      const cache = directionalCache.get(lightId);
      if (!cache) continue;
      cache.direction.markAsClean();
      cache.color.markAsClean();
      cache.layer.markAsClean();
    }

    for (const lightId of usedPoint) {
      const cache = pointCache.get(lightId);
      if (!cache) continue;
      cache.position.markAsClean();
      cache.color.markAsClean();
      cache.layer.markAsClean();
    }

    for (const lightId of usedSpot) {
      const cache = spotCache.get(lightId);
      if (!cache) continue;
      cache.position.markAsClean();
      cache.direction.markAsClean();
      cache.color.markAsClean();
      cache.layer.markAsClean();
    }

    renderArtifacts.environment?.markAsClean();
  },
);
