import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { OfficeMaterials } from "../materials/createOfficeMaterials";
import { createBox } from "../props/createOfficeProps";
import { createRoom } from "./createRoom";
import { m2RoomNetwork } from "./roomData";
import type { RoomNetworkDefinition } from "./roomTypes";

export interface RoomNetworkObjects {
  root: TransformNode;
  roomCount: number;
  roomIds: string[];
  connectionCount: number;
  doorwayProbePositions: Array<{ x: number; z: number }>;
}

export function createRoomNetwork(
  scene: Scene,
  materials: OfficeMaterials,
  network: RoomNetworkDefinition = m2RoomNetwork
): RoomNetworkObjects {
  const root = new TransformNode("m2-office-room-network", scene);

  network.rooms.forEach((room) => {
    createRoom(scene, room, root, materials);
  });

  createConnectionMarkers(scene, root, materials, network);

  return {
    root,
    roomCount: network.rooms.length,
    roomIds: network.rooms.map((room) => room.id),
    connectionCount: network.connections.length,
    doorwayProbePositions: createDoorwayProbePositions(network)
  };
}

function createDoorwayProbePositions(network: RoomNetworkDefinition): Array<{ x: number; z: number }> {
  return network.connections.map(([fromId, toId]) => {
    const from = network.rooms.find((room) => room.id === fromId);
    const to = network.rooms.find((room) => room.id === toId);

    if (!from || !to) {
      throw new Error(`Invalid room connection: ${fromId} -> ${toId}`);
    }

    return {
      x: (from.center.x + to.center.x) / 2,
      z: (from.center.z + to.center.z) / 2
    };
  });
}

function createConnectionMarkers(
  scene: Scene,
  root: TransformNode,
  materials: OfficeMaterials,
  network: RoomNetworkDefinition
): void {
  network.connections.forEach(([fromId, toId], index) => {
    const from = network.rooms.find((room) => room.id === fromId);
    const to = network.rooms.find((room) => room.id === toId);

    if (!from || !to) {
      throw new Error(`Invalid room connection: ${fromId} -> ${toId}`);
    }

    const midX = (from.center.x + to.center.x) / 2;
    const midZ = (from.center.z + to.center.z) / 2;
    const horizontal = Math.abs(from.center.x - to.center.x) > Math.abs(from.center.z - to.center.z);
    createBox(
      scene,
      `connection-threshold-${index + 1}`,
      horizontal ? [1.7, 0.025, 2.35] : [2.35, 0.025, 1.7],
      [midX, 0.012, midZ],
      materials.concrete,
      root
    );
  });
}
