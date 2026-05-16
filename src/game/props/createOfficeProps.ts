import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { OfficeMaterials } from "../materials/createOfficeMaterials";
import { createTextMaterial } from "../textures";

export type Vec3Tuple = [number, number, number];

interface WallSignOptions {
  width?: number;
  height?: number;
  fontSize?: number;
}

export function createBox(
  scene: Scene,
  name: string,
  size: Vec3Tuple,
  position: Vec3Tuple,
  material: StandardMaterial,
  parent: TransformNode,
  collidable = false
): Mesh {
  const mesh = MeshBuilder.CreateBox(name, {
    width: size[0],
    height: size[1],
    depth: size[2]
  }, scene);
  mesh.position = new Vector3(position[0], position[1], position[2]);
  mesh.material = material;
  mesh.parent = parent;
  mesh.checkCollisions = collidable;
  return mesh;
}

export function createFluorescentPanel(
  scene: Scene,
  name: string,
  position: Vector3,
  parent: TransformNode,
  materials: OfficeMaterials
): void {
  createBox(scene, `${name}-panel`, [2.15, 0.04, 0.34], [position.x, position.y, position.z], materials.light, parent);
  const light = new PointLight(`${name}-light`, new Vector3(position.x, 2.72, position.z), scene);
  light.intensity = 0.34;
  light.diffuse = new Color3(1, 0.96, 0.76);
  light.parent = parent;
}

export function createWallSign(
  scene: Scene,
  name: string,
  lines: string[],
  position: Vector3,
  rotationY: number,
  parent: TransformNode,
  options: WallSignOptions = {}
): Mesh {
  const width = options.width ?? 1.85;
  const height = options.height ?? 0.46;
  const fontSize = options.fontSize ?? 26;
  const sign = MeshBuilder.CreatePlane(name, { width, height }, scene);
  sign.position = position;
  sign.rotation.y = rotationY;
  sign.checkCollisions = false;
  sign.metadata = {
    kind: "decorative-sign",
    collision: "intentionally-non-collidable",
    width,
    height
  };
  sign.material = createTextMaterial(scene, `${name}-text`, lines, {
    background: "#e7dfc7",
    color: "#313026",
    accent: "#b7aa7f",
    width: 512,
    height: 180,
    fontSize
  });
  sign.material.backFaceCulling = false;
  sign.parent = parent;
  return sign;
}

export function createIncidentReport(
  scene: Scene,
  position: Vector3,
  parent: TransformNode
): Mesh {
  const report = MeshBuilder.CreatePlane("incident-report-placeholder", { width: 0.72, height: 0.96 }, scene);
  report.position = position;
  report.rotation.x = Math.PI / 2.15;
  report.material = createTextMaterial(scene, "incident-report", ["INCIDENT", "REPORT", "M2-001"], {
    background: "#f3ead2",
    color: "#302c22",
    accent: "#b43d2f",
    width: 300,
    height: 420,
    fontSize: 38
  });
  report.material.backFaceCulling = false;
  report.parent = parent;
  return report;
}

export function createReceptionDesk(scene: Scene, parent: TransformNode, materials: OfficeMaterials, x: number, z: number): void {
  createBox(scene, "reception-desk-top", [2.4, 0.2, 0.9], [x, 0.8, z], materials.desk, parent, true);
  createBox(scene, "reception-desk-front", [2.4, 0.8, 0.16], [x, 0.42, z - 0.42], materials.desk, parent, true);
  const plaque = MeshBuilder.CreatePlane("lobby-check-in-plaque", { width: 1.1, height: 0.34 }, scene);
  plaque.position = new Vector3(x, 0.96, z - 0.47);
  plaque.rotation.x = Math.PI / 2.05;
  plaque.checkCollisions = false;
  plaque.metadata = {
    kind: "decorative-countertop-plaque",
    collision: "intentionally-non-collidable"
  };
  plaque.material = createTextMaterial(scene, "lobby-check-in-plaque-text", ["AUDIT", "CHECK-IN"], {
    background: "#e7dfc7",
    color: "#313026",
    accent: "#b7aa7f",
    width: 384,
    height: 140,
    fontSize: 26
  });
  plaque.parent = parent;
}

export function createCubicleCluster(scene: Scene, parent: TransformNode, materials: OfficeMaterials, x: number, z: number): void {
  createBox(scene, "cubicle-spine", [0.16, 1.35, 4.6], [x, 0.72, z], materials.cubicle, parent, true);
  createBox(scene, "cubicle-cross-a", [3.2, 1.35, 0.16], [x + 0.75, 0.72, z - 1.3], materials.cubicle, parent, true);
  createBox(scene, "cubicle-cross-b", [3.2, 1.35, 0.16], [x - 0.75, 0.72, z + 1.3], materials.cubicle, parent, true);
  createDesk(scene, parent, materials, x + 1.45, z + 0.8, "cubicle-desk-a");
  createDesk(scene, parent, materials, x - 1.45, z - 0.8, "cubicle-desk-b");
}

export function createDesk(scene: Scene, parent: TransformNode, materials: OfficeMaterials, x: number, z: number, name: string): void {
  createBox(scene, `${name}-top`, [1.65, 0.18, 0.82], [x, 0.78, z], materials.desk, parent, true);
  createBox(scene, `${name}-phone`, [0.32, 0.12, 0.24], [x - 0.42, 0.94, z], materials.metal, parent);
  createBox(scene, `${name}-form-stack`, [0.38, 0.08, 0.5], [x + 0.38, 0.96, z + 0.05], materials.paper, parent);
  createChair(scene, parent, materials, x, z - 0.82, `${name}-chair`);
}

export function createChair(scene: Scene, parent: TransformNode, materials: OfficeMaterials, x: number, z: number, name: string): void {
  createBox(scene, `${name}-seat`, [0.68, 0.15, 0.68], [x, 0.46, z], materials.chair, parent, true);
  createBox(scene, `${name}-back`, [0.68, 0.78, 0.12], [x, 0.87, z - 0.34], materials.chair, parent, true);
}

export function createConferenceTable(scene: Scene, parent: TransformNode, materials: OfficeMaterials, x: number, z: number): void {
  createBox(scene, "conference-table-too-long", [4.8, 0.2, 1.25], [x, 0.78, z], materials.desk, parent, true);
  for (let index = 0; index < 4; index += 1) {
    const offsetX = -1.8 + index * 1.2;
    createChair(scene, parent, materials, x + offsetX, z - 1.15, `conference-chair-south-${index + 1}`);
    createChair(scene, parent, materials, x + offsetX, z + 1.15, `conference-chair-north-${index + 1}`);
  }
  createWallSign(scene, "conference-screen", ["THIS MEETING", "IS OPTIONAL"], new Vector3(x, 2.2, z + 3.91), Math.PI, parent);
}

export function createRecordShelves(scene: Scene, parent: TransformNode, materials: OfficeMaterials, x: number, z: number): void {
  for (let index = 0; index < 4; index += 1) {
    createBox(scene, `records-shelf-${index + 1}`, [0.52, 1.75, 2.4], [x - 2.4 + index * 1.6, 0.95, z], materials.records, parent, true);
  }
  createWallSign(
    scene,
    "records-sign",
    ["FORMS", "REMEMBER YOU"],
    new Vector3(x, 2.34, z + 3.58),
    Math.PI,
    parent,
    { width: 1.55, height: 0.42, fontSize: 23 }
  );
}

export function createElevatorPlaceholder(scene: Scene, parent: TransformNode, materials: OfficeMaterials, x: number, z: number): void {
  createBox(scene, "elevator-frame-top", [2.5, 0.25, 0.28], [x, 2.72, z], materials.metal, parent, true);
  createBox(scene, "elevator-frame-left", [0.22, 2.8, 0.28], [x - 1.36, 1.34, z], materials.metal, parent, true);
  createBox(scene, "elevator-frame-right", [0.22, 2.8, 0.28], [x + 1.36, 1.34, z], materials.metal, parent, true);
  createBox(scene, "elevator-door-left", [1.16, 2.45, 0.12], [x - 0.6, 1.22, z - 0.08], materials.metal, parent, true);
  createBox(scene, "elevator-door-right", [1.16, 2.45, 0.12], [x + 0.6, 1.22, z - 0.08], materials.metal, parent, true);
  createWallSign(scene, "sign-exit-request-pending", ["EXIT REQUEST", "PENDING"], new Vector3(x, 2.72, z - 0.18), Math.PI, parent);
}
