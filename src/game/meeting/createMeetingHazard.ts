import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MovementCollision } from "../navigation/collision";
import { createTextMaterial } from "../textures";
import { meetingHazardDefinition, resetMeetingState } from "./meetingState";
import type { MeetingHazardController, MeetingHazardObject, MeetingHazardState, MeetingObjectPose } from "./meetingTypes";

interface MeetingMaterials {
  chair: StandardMaterial;
  desk: StandardMaterial;
  paper: StandardMaterial;
}

export function createMeetingHazard(
  scene: Scene,
  parent: TransformNode,
  state: MeetingHazardState,
  collision: MovementCollision
): MeetingHazardController {
  const root = new TransformNode("meeting-hazard-root", scene);
  root.parent = parent;
  const materials = createMeetingMaterials(scene);
  const objects = createMeetingObjects(scene, root, materials);

  objects.forEach((object) => {
    object.blockerMeshes.forEach((mesh) => {
      collision.addDynamicMesh(mesh);
    });
  });

  return {
    definition: meetingHazardDefinition,
    state,
    objects,
    reset: () => {
      resetMeetingState(state);
      objects.forEach((object) => {
        object.node.position.copyFrom(object.idlePose.position);
        object.node.rotation.y = object.idlePose.rotationY;
      });
    }
  };
}

function createMeetingMaterials(scene: Scene): MeetingMaterials {
  return {
    chair: material(scene, "meeting-chair-material", new Color3(0.25, 0.31, 0.3)),
    desk: material(scene, "meeting-table-material", new Color3(0.39, 0.32, 0.23)),
    paper: material(scene, "meeting-paper-material", new Color3(0.84, 0.8, 0.66))
  };
}

function createMeetingObjects(scene: Scene, parent: TransformNode, materials: MeetingMaterials): MeetingHazardObject[] {
  const definitions: Array<{
    id: string;
    type: "chair" | "table" | "agenda";
    idlePose: MeetingObjectPose;
    meetingPose: MeetingObjectPose;
  }> = [
    {
      id: "meeting-chair-01",
      type: "chair",
      idlePose: pose(19.1, -2.75, -Math.PI / 2),
      meetingPose: pose(14.35, -1.95, 0.78)
    },
    {
      id: "meeting-chair-02",
      type: "chair",
      idlePose: pose(19.1, -1.55, -Math.PI / 2),
      meetingPose: pose(15.65, -2.5, 0.18)
    },
    {
      id: "meeting-chair-03",
      type: "chair",
      idlePose: pose(19.1, 1.55, -Math.PI / 2),
      meetingPose: pose(17.25, -2.35, -0.18)
    },
    {
      id: "meeting-chair-04",
      type: "chair",
      idlePose: pose(19.1, 2.75, -Math.PI / 2),
      meetingPose: pose(18.4, -1.2, -0.9)
    },
    {
      id: "meeting-chair-05",
      type: "chair",
      idlePose: pose(13.6, -3.05, 0),
      meetingPose: pose(18.5, 0.75, -1.48)
    },
    {
      id: "meeting-side-table",
      type: "table",
      idlePose: pose(15.0, -3.12, 0),
      meetingPose: pose(17.8, 1.95, -1.2)
    },
    {
      id: "meeting-agenda",
      type: "agenda",
      idlePose: pose(16.55, -3.16, 0),
      meetingPose: pose(15.25, 1.95, 0.42)
    }
  ];

  return definitions.map((definition) => {
    switch (definition.type) {
      case "chair":
        return createChairObject(scene, parent, materials, definition.id, definition.idlePose, definition.meetingPose);
      case "table":
        return createTableObject(scene, parent, materials, definition.id, definition.idlePose, definition.meetingPose);
      case "agenda":
        return createAgendaObject(scene, parent, materials, definition.id, definition.idlePose, definition.meetingPose);
    }
  });
}

function createChairObject(
  scene: Scene,
  parent: TransformNode,
  materials: MeetingMaterials,
  id: string,
  idlePose: MeetingObjectPose,
  meetingPose: MeetingObjectPose
): MeetingHazardObject {
  const node = createNode(scene, parent, id, idlePose);
  const seat = MeshBuilder.CreateBox(`${id}-seat`, { width: 0.68, height: 0.15, depth: 0.68 }, scene);
  seat.position = new Vector3(0, 0.46, 0);
  seat.material = materials.chair;
  seat.checkCollisions = true;
  seat.parent = node;

  const back = MeshBuilder.CreateBox(`${id}-back`, { width: 0.68, height: 0.78, depth: 0.12 }, scene);
  back.position = new Vector3(0, 0.88, -0.34);
  back.material = materials.chair;
  back.checkCollisions = true;
  back.parent = node;

  return { id, node, blockerMeshes: [seat, back], idlePose, meetingPose };
}

function createTableObject(
  scene: Scene,
  parent: TransformNode,
  materials: MeetingMaterials,
  id: string,
  idlePose: MeetingObjectPose,
  meetingPose: MeetingObjectPose
): MeetingHazardObject {
  const node = createNode(scene, parent, id, idlePose);
  const top = MeshBuilder.CreateBox(`${id}-top`, { width: 1.35, height: 0.18, depth: 0.72 }, scene);
  top.position = new Vector3(0, 0.76, 0);
  top.material = materials.desk;
  top.checkCollisions = true;
  top.parent = node;

  const papers = MeshBuilder.CreateBox(`${id}-agenda-stack`, { width: 0.64, height: 0.08, depth: 0.46 }, scene);
  papers.position = new Vector3(0.18, 0.91, 0);
  papers.material = materials.paper;
  papers.checkCollisions = false;
  papers.parent = node;

  return { id, node, blockerMeshes: [top], idlePose, meetingPose };
}

function createAgendaObject(
  scene: Scene,
  parent: TransformNode,
  materials: MeetingMaterials,
  id: string,
  idlePose: MeetingObjectPose,
  meetingPose: MeetingObjectPose
): MeetingHazardObject {
  const node = createNode(scene, parent, id, idlePose);
  const stand = MeshBuilder.CreateBox(`${id}-stand`, { width: 0.12, height: 1.0, depth: 0.12 }, scene);
  stand.position = new Vector3(0, 0.62, 0);
  stand.material = materials.desk;
  stand.checkCollisions = true;
  stand.parent = node;

  const panel = MeshBuilder.CreatePlane(`${id}-panel`, { width: 1.2, height: 0.58 }, scene);
  panel.position = new Vector3(0, 1.18, -0.08);
  panel.rotation.y = Math.PI;
  panel.material = createTextMaterial(scene, `${id}-text`, ["AGENDA", "ITEM: YOU"], {
    background: "#e7dfc7",
    color: "#313026",
    accent: "#9a8f66",
    width: 420,
    height: 220,
    fontSize: 38
  });
  panel.material.backFaceCulling = false;
  panel.checkCollisions = false;
  panel.parent = node;

  return { id, node, blockerMeshes: [stand], idlePose, meetingPose };
}

function createNode(scene: Scene, parent: TransformNode, id: string, idlePose: MeetingObjectPose): TransformNode {
  const node = new TransformNode(id, scene);
  node.position.copyFrom(idlePose.position);
  node.rotation.y = idlePose.rotationY;
  node.parent = parent;
  return node;
}

function pose(x: number, z: number, rotationY: number): MeetingObjectPose {
  return {
    position: new Vector3(x, 0, z),
    rotationY
  };
}

function material(scene: Scene, name: string, color: Color3): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.08, 0.08, 0.07);
  return mat;
}
