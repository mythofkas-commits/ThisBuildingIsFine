import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { OfficeMaterials } from "../materials/createOfficeMaterials";
import {
  createBox,
  createConferenceTable,
  createCubicleCluster,
  createDesk,
  createElevatorPlaceholder,
  createFluorescentPanel,
  createReceptionDesk,
  createRecordShelves,
  createWallSign,
  createWallTextureSign
} from "../props/createOfficeProps";
import type { RoomDefinition, RoomExit } from "./roomTypes";

const WALL_THICKNESS = 0.18;
const WALL_HEIGHT = 3.2;
const CEILING_HEIGHT = 3.15;
const DOORWAY_WIDTH = 2.6;

export function createRoom(
  scene: Scene,
  room: RoomDefinition,
  parent: TransformNode,
  materials: OfficeMaterials
): void {
  createFloorAndCeiling(scene, room, parent, materials);
  createWalls(scene, room, parent, materials);
  createLighting(scene, room, parent, materials);
  createRoomLabel(scene, room, parent);
  createRoomProps(scene, room, parent, materials);
  createRunWayfinding(scene, room, parent);
  createM9VisualAssetBatch(scene, room, parent);
}

function createFloorAndCeiling(scene: Scene, room: RoomDefinition, parent: TransformNode, materials: OfficeMaterials): void {
  createBox(scene, `${room.id}-floor`, [room.size.width, 0.15, room.size.depth], [room.center.x, -0.08, room.center.z], materials.carpet, parent, true);
  createBox(scene, `${room.id}-ceiling`, [room.size.width, 0.12, room.size.depth], [room.center.x, CEILING_HEIGHT, room.center.z], materials.ceiling, parent, true);
}

function createWalls(scene: Scene, room: RoomDefinition, parent: TransformNode, materials: OfficeMaterials): void {
  createNorthSouthWall(scene, room, "north", parent, materials);
  createNorthSouthWall(scene, room, "south", parent, materials);
  createEastWestWall(scene, room, "east", parent, materials);
  createEastWestWall(scene, room, "west", parent, materials);
}

function createNorthSouthWall(
  scene: Scene,
  room: RoomDefinition,
  side: Extract<RoomExit, "north" | "south">,
  parent: TransformNode,
  materials: OfficeMaterials
): void {
  const wallZ = room.center.z + (side === "north" ? room.size.depth / 2 : -room.size.depth / 2);
  const hasExit = room.exits.includes(side);
  const availableWidth = room.size.width - DOORWAY_WIDTH;

  if (!hasExit) {
    createBox(scene, `${room.id}-${side}-wall`, [room.size.width, WALL_HEIGHT, WALL_THICKNESS], [room.center.x, 1.55, wallZ], materials.wall, parent, true);
    return;
  }

  const segmentWidth = availableWidth / 2;
  const leftX = room.center.x - DOORWAY_WIDTH / 2 - segmentWidth / 2;
  const rightX = room.center.x + DOORWAY_WIDTH / 2 + segmentWidth / 2;
  createBox(scene, `${room.id}-${side}-wall-left`, [segmentWidth, WALL_HEIGHT, WALL_THICKNESS], [leftX, 1.55, wallZ], materials.wall, parent, true);
  createBox(scene, `${room.id}-${side}-wall-right`, [segmentWidth, WALL_HEIGHT, WALL_THICKNESS], [rightX, 1.55, wallZ], materials.wall, parent, true);
}

function createEastWestWall(
  scene: Scene,
  room: RoomDefinition,
  side: Extract<RoomExit, "east" | "west">,
  parent: TransformNode,
  materials: OfficeMaterials
): void {
  const wallX = room.center.x + (side === "east" ? room.size.width / 2 : -room.size.width / 2);
  const hasExit = room.exits.includes(side);
  const availableDepth = room.size.depth - DOORWAY_WIDTH;

  if (!hasExit) {
    createBox(scene, `${room.id}-${side}-wall`, [WALL_THICKNESS, WALL_HEIGHT, room.size.depth], [wallX, 1.55, room.center.z], materials.wall, parent, true);
    return;
  }

  const segmentDepth = availableDepth / 2;
  const southZ = room.center.z - DOORWAY_WIDTH / 2 - segmentDepth / 2;
  const northZ = room.center.z + DOORWAY_WIDTH / 2 + segmentDepth / 2;
  createBox(scene, `${room.id}-${side}-wall-south`, [WALL_THICKNESS, WALL_HEIGHT, segmentDepth], [wallX, 1.55, southZ], materials.wall, parent, true);
  createBox(scene, `${room.id}-${side}-wall-north`, [WALL_THICKNESS, WALL_HEIGHT, segmentDepth], [wallX, 1.55, northZ], materials.wall, parent, true);
}

function createLighting(scene: Scene, room: RoomDefinition, parent: TransformNode, materials: OfficeMaterials): void {
  createFluorescentPanel(scene, `${room.id}-light-a`, new Vector3(room.center.x - 1.7, 3.04, room.center.z - 1.25), parent, materials);
  createFluorescentPanel(scene, `${room.id}-light-b`, new Vector3(room.center.x + 1.7, 3.04, room.center.z + 1.25), parent, materials);
}

function createRoomLabel(scene: Scene, room: RoomDefinition, parent: TransformNode): void {
  const placement = getRoomLabelPlacement(room);
  createWallSign(
    scene,
    `${room.id}-label`,
    room.signLines,
    placement.position,
    placement.rotationY,
    parent,
    { width: 1.75, height: 0.44, fontSize: 24 }
  );
}

function getRoomLabelPlacement(room: RoomDefinition): { position: Vector3; rotationY: number } {
  const labelY = 2.28;
  const inset = 0.08;

  if (!room.exits.includes("south")) {
    return {
      position: new Vector3(room.center.x, labelY, room.center.z - room.size.depth / 2 + inset),
      rotationY: 0
    };
  }

  if (!room.exits.includes("west")) {
    return {
      position: new Vector3(room.center.x - room.size.width / 2 + inset, labelY, room.center.z),
      rotationY: Math.PI / 2
    };
  }

  if (!room.exits.includes("north")) {
    return {
      position: new Vector3(room.center.x, labelY, room.center.z + room.size.depth / 2 - inset),
      rotationY: Math.PI
    };
  }

  return {
    position: new Vector3(room.center.x + room.size.width / 2 - inset, labelY, room.center.z),
    rotationY: -Math.PI / 2
  };
}

function createRoomProps(scene: Scene, room: RoomDefinition, parent: TransformNode, materials: OfficeMaterials): void {
  switch (room.kind) {
    case "lobby":
      createReceptionDesk(scene, parent, materials, room.center.x - 1.2, room.center.z - 0.4);
      createDesk(scene, parent, materials, room.center.x + 2.2, room.center.z + 1.6, "lobby-side-desk");
      break;
    case "cubicles":
      createCubicleCluster(scene, parent, materials, room.center.x, room.center.z);
      break;
    case "conference":
      createConferenceTable(scene, parent, materials, room.center.x, room.center.z);
      break;
    case "records":
      createRecordShelves(scene, parent, materials, room.center.x, room.center.z + 0.2);
      break;
    case "elevator":
      createElevatorPlaceholder(scene, parent, materials, room.center.x, room.center.z + room.size.depth / 2 - 0.18);
      createDesk(scene, parent, materials, room.center.x - 2.1, room.center.z - 1.7, "elevator-waiting-desk");
      break;
  }
}

function createRunWayfinding(scene: Scene, room: RoomDefinition, parent: TransformNode): void {
  switch (room.id) {
    case "lobby":
      createWallSign(
        scene,
        "m8-wayfinding-lobby",
        ["REPORT 1", "OPEN OFFICE EAST"],
        new Vector3(room.center.x + 2.2, 1.72, room.center.z - room.size.depth / 2 + 0.09),
        0,
        parent,
        { width: 1.78, height: 0.4, fontSize: 22 }
      );
      break;
    case "cubicles":
      createWallSign(
        scene,
        "m8-wayfinding-cubicles",
        ["REPORT 2", "MEETING EAST", "RECORDS NORTH"],
        new Vector3(room.center.x, 1.74, room.center.z - room.size.depth / 2 + 0.09),
        0,
        parent,
        { width: 1.95, height: 0.5, fontSize: 20 }
      );
      break;
    case "conference":
      createWallSign(
        scene,
        "m8-wayfinding-conference",
        ["MEETING ZONE", "LEAVE TO DECLINE"],
        new Vector3(room.center.x + room.size.width / 2 - 0.09, 1.72, room.center.z + 1.9),
        -Math.PI / 2,
        parent,
        { width: 1.84, height: 0.42, fontSize: 21 }
      );
      break;
    case "records":
      createWallSign(
        scene,
        "m8-wayfinding-records",
        ["RECORDS REVIEWED", "CHECK-OUT EAST"],
        new Vector3(room.center.x - room.size.width / 2 + 0.09, 1.72, room.center.z - 1.7),
        Math.PI / 2,
        parent,
        { width: 1.86, height: 0.42, fontSize: 21 }
      );
      break;
    case "elevator":
      createWallSign(
        scene,
        "m8-wayfinding-elevator",
        ["REPORT 3", "FILE AUDIT HERE"],
        new Vector3(room.center.x - 1.8, 1.72, room.center.z + room.size.depth / 2 - 0.09),
        Math.PI,
        parent,
        { width: 1.82, height: 0.42, fontSize: 21 }
      );
      break;
  }
}

function createM9VisualAssetBatch(scene: Scene, room: RoomDefinition, parent: TransformNode): void {
  switch (room.id) {
    case "lobby":
      createWallTextureSign(
        scene,
        "m9-policy-poster-hallway",
        "m9-policy-poster-hallway",
        "/assets/posters/generated/m9-policy-poster-hallway.svg",
        new Vector3(room.center.x - 2.15, 1.7, room.center.z - room.size.depth / 2 + 0.1),
        0,
        parent,
        { width: 0.92, height: 1.28 }
      );
      break;
    case "conference":
      createWallTextureSign(
        scene,
        "m9-policy-poster-meeting",
        "m9-policy-poster-meeting",
        "/assets/posters/generated/m9-policy-poster-meeting.svg",
        new Vector3(room.center.x + room.size.width / 2 - 0.1, 1.7, room.center.z - 1.9),
        -Math.PI / 2,
        parent,
        { width: 0.92, height: 1.28 }
      );
      createWallTextureSign(
        scene,
        "m9-meeting-agenda-card",
        "m9-meeting-agenda-card",
        "/assets/posters/generated/m9-meeting-agenda-card.svg",
        new Vector3(room.center.x, 1.56, room.center.z + room.size.depth / 2 - 0.1),
        Math.PI,
        parent,
        { width: 0.82, height: 1.12 }
      );
      break;
    case "records":
      createWallTextureSign(
        scene,
        "m9-policy-poster-records",
        "m9-policy-poster-records",
        "/assets/posters/generated/m9-policy-poster-records.svg",
        new Vector3(room.center.x + 1.95, 1.72, room.center.z + room.size.depth / 2 - 0.1),
        Math.PI,
        parent,
        { width: 0.92, height: 1.28 }
      );
      createWallTextureSign(
        scene,
        "m9-clarity-abstract-overlay",
        "m9-clarity-abstract-overlay",
        "/assets/textures/generated/m9-clarity-abstract-overlay.png",
        new Vector3(room.center.x + room.size.width / 2 - 0.1, 1.42, room.center.z + 1.85),
        -Math.PI / 2,
        parent,
        { width: 0.74, height: 0.74, hasAlpha: true, alpha: 0.86 }
      );
      break;
  }
}
