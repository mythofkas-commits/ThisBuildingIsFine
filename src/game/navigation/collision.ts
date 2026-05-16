import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

interface BlockerBounds {
  name: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface MovementCollision {
  blockerCount: number;
  resolve: (current: Vector3, requestedDelta: Vector3) => Vector3;
  blocksPosition: (position: Vector3) => boolean;
}

const PLAYER_RADIUS = 0.36;
const PLAYER_LOW_Y = 0.35;
const PLAYER_HIGH_Y = 2.2;

export function createMovementCollision(scene: Scene): MovementCollision {
  scene.meshes.forEach((mesh) => {
    mesh.computeWorldMatrix(true);
  });

  const blockers = scene.meshes
    .filter(isMovementBlocker)
    .map((mesh) => {
      const box = mesh.getBoundingInfo().boundingBox;
      return {
        name: mesh.name,
        minX: box.minimumWorld.x,
        maxX: box.maximumWorld.x,
        minZ: box.minimumWorld.z,
        maxZ: box.maximumWorld.z
      };
    });

  function blocksPosition(position: Vector3): boolean {
    return blockers.some((blocker) => circleIntersectsAabb(position, blocker));
  }

  return {
    blockerCount: blockers.length,
    resolve: (current, requestedDelta) => {
      const resolved = current.clone();
      const xCandidate = new Vector3(resolved.x + requestedDelta.x, resolved.y, resolved.z);

      if (!blocksPosition(xCandidate)) {
        resolved.x = xCandidate.x;
      }

      const zCandidate = new Vector3(resolved.x, resolved.y, resolved.z + requestedDelta.z);

      if (!blocksPosition(zCandidate)) {
        resolved.z = zCandidate.z;
      }

      return resolved;
    },
    blocksPosition
  };
}

function isMovementBlocker(mesh: AbstractMesh): boolean {
  if (!mesh.checkCollisions || !mesh.isEnabled() || !mesh.isVisible) {
    return false;
  }

  const box = mesh.getBoundingInfo().boundingBox;
  const min = box.minimumWorld;
  const max = box.maximumWorld;
  const overlapsPlayerHeight = max.y >= PLAYER_LOW_Y && min.y <= PLAYER_HIGH_Y;
  const hasHorizontalArea = max.x - min.x > 0.03 && max.z - min.z > 0.03;

  return overlapsPlayerHeight && hasHorizontalArea;
}

function circleIntersectsAabb(position: Vector3, blocker: BlockerBounds): boolean {
  const closestX = clamp(position.x, blocker.minX, blocker.maxX);
  const closestZ = clamp(position.z, blocker.minZ, blocker.maxZ);
  const deltaX = position.x - closestX;
  const deltaZ = position.z - closestZ;
  return deltaX * deltaX + deltaZ * deltaZ < PLAYER_RADIUS * PLAYER_RADIUS;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
