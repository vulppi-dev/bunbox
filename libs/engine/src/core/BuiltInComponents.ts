import { Material } from '../builders';
import { Color, Quaternion, Rect, Vector3 } from '../math';
import { Geometry, MaskHelper } from '../resources';
import { defineComponent } from './Component';
import type { Entity } from './World';

// MARK: Primitive Components

export const TransformComponent = defineComponent('Transform', () => ({
  isActive: true,
  position: new Vector3(),
  rotation: new Quaternion(),
  scale: new Vector3(1, 1, 1),
}));

export const MeshComponent = defineComponent('Mesh', () => ({
  geometry: null as Geometry | null,
  material: null as Material | null,
  layer: new MaskHelper(),
}));

export const CameraComponent = defineComponent('Camera', () => ({
  near: 0.1,
  far: 1000,
  viewport: null as Rect | null,
  layer: new MaskHelper(),
}));

export const LightComponent = defineComponent('Light', () => ({
  color: new Color(1, 1, 1, 1),
  intensity: 1,
  layer: new MaskHelper(),
}));

export const ParentComponent = defineComponent('Parent', () => ({
  parentEntity: null as Entity | null,
}));

// MARK: Behaviour Components

export const PerspectiveCameraComponent = defineComponent(
  'PerspectiveCamera',
  () => ({
    fov: Math.PI * 0.333,
    aspect: 1,
  }),
);

export const OrthographicCameraComponent = defineComponent(
  'OrthographicCamera',
  () => ({
    size: new Rect(),
  }),
);
