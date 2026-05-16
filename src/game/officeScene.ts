import { Color4 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { createOfficeMaterials } from "./materials/createOfficeMaterials";
import { createRoomNetwork } from "./rooms/createRoomNetwork";

export interface OfficeSceneObjects {
  root: TransformNode;
  roomCount: number;
  roomIds: string[];
  connectionCount: number;
  doorwayProbePositions: Array<{ x: number; z: number }>;
}

export function createOfficeScene(scene: Scene): OfficeSceneObjects {
  scene.clearColor = new Color4(0.08, 0.085, 0.07, 1);
  scene.collisionsEnabled = true;

  const materials = createOfficeMaterials(scene);
  const network = createRoomNetwork(scene, materials);

  return {
    root: network.root,
    roomCount: network.roomCount,
    roomIds: network.roomIds,
    connectionCount: network.connectionCount,
    doorwayProbePositions: network.doorwayProbePositions
  };
}
