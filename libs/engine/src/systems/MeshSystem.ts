import { defineSystem, forEachQuery, type Entity } from '../core';
import { MeshComponent, TransformComponent } from '../core/BuiltInComponents';
import { EngineError } from '../errors';
import { Matrix4 } from '../math';
import { MaskHelper } from '../resources';
import type { Geometry } from '../resources/Geometry';
import type { Material } from '../material/MaterialBuilder';
import { TRANSFORM_CACHE_KEY, type TransformCache } from './TransformSystem';

export const MESH_CACHE_KEY = Symbol('meshCache');

export type MeshCache = {
  sourceGeometry: Geometry;
  sourceMaterial: Material | null;
  geometry: Geometry;
  material: Material | null;
  modelMatrix: Matrix4;
  layer: MaskHelper;
};

export const MeshSystem = defineSystem(
  'MeshSystem',
  130,
  ({ world, assetsStorage }) => {
    const cachedEntities = assetsStorage.getTypeEntities(MESH_CACHE_KEY);
    const activeMeshEntities = new Set<Entity>();

    forEachQuery(world, [MeshComponent, TransformComponent], (entity, mesh) => {
      if (!mesh.geometry) {
        return; // ignore meshes without geometry
      }

      activeMeshEntities.add(entity);

      const transformCache = assetsStorage.get<TransformCache>(
        TRANSFORM_CACHE_KEY,
        entity,
      );

      if (!transformCache) {
        throw new EngineError(
          `TransformCache not found for entity ${entity} in MeshSystem`,
          'MeshSystem',
        );
      }

      let cache = assetsStorage.get<MeshCache>(MESH_CACHE_KEY, entity);
      let dirty = false;

      if (!cache) {
        cache = {
          sourceGeometry: mesh.geometry,
          sourceMaterial: mesh.material ?? null,
          geometry: mesh.geometry.clone(),
          material: mesh.material ? mesh.material.clone() : null,
          modelMatrix: new Matrix4(),
          layer: new MaskHelper(),
        };
        assetsStorage.set(MESH_CACHE_KEY, entity, cache);
        dirty = true;
      }

      dirty ||= cache.sourceGeometry !== mesh.geometry;
      dirty ||= cache.sourceMaterial !== mesh.material;
      dirty ||= transformCache.worldMatrix.isDirty;
      dirty ||= mesh.geometry.isDirty;
      dirty ||= mesh.material?.isDirty === true;
      dirty ||= mesh.layer.isDirty;

      if (dirty) {
        cache.sourceGeometry = mesh.geometry;
        cache.geometry.copy(mesh.geometry);

        cache.sourceMaterial = mesh.material ?? null;
        if (mesh.material) {
          if (!cache.material) {
            cache.material = mesh.material.clone();
          } else {
            cache.material.copy(mesh.material);
          }
        } else {
          cache.material = null;
        }

        cache.modelMatrix.copy(transformCache.worldMatrix);
        cache.layer.copy(mesh.layer);
      }

      transformCache.worldMatrix.markAsClean();
      transformCache.localMatrix.markAsClean();
    });

    for (const entity of cachedEntities) {
      if (activeMeshEntities.has(entity)) {
        continue;
      }

      assetsStorage.remove(MESH_CACHE_KEY, entity);
    }
  },
);
