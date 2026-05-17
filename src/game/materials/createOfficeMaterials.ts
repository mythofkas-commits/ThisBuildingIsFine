import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import { createImageTextureMaterial } from "../textures";

export interface OfficeMaterials {
  carpet: StandardMaterial;
  wall: StandardMaterial;
  ceiling: StandardMaterial;
  concrete: StandardMaterial;
  glass: StandardMaterial;
  metal: StandardMaterial;
  cubicle: StandardMaterial;
  desk: StandardMaterial;
  light: StandardMaterial;
  paper: StandardMaterial;
  chair: StandardMaterial;
  records: StandardMaterial;
}

export function createOfficeMaterials(scene: Scene): OfficeMaterials {
  return {
    carpet: createImageTextureMaterial(scene, "carpet-material", {
      assetId: "m9-office-carpet",
      path: "/assets/textures/generated/m9-office-carpet.png",
      uScale: 6,
      vScale: 6
    }),
    wall: createImageTextureMaterial(scene, "wall-material", {
      assetId: "m9-wall-subtle-variation",
      path: "/assets/textures/generated/m9-wall-subtle-variation.png",
      uScale: 3,
      vScale: 2
    }),
    ceiling: createImageTextureMaterial(scene, "ceiling-material", {
      assetId: "m9-ceiling-tile-light-panel",
      path: "/assets/textures/generated/m9-ceiling-tile-light-panel.png",
      uScale: 4,
      vScale: 4
    }),
    concrete: material(scene, "concrete-material", new Color3(0.42, 0.43, 0.39)),
    glass: material(scene, "glass-material", new Color3(0.46, 0.62, 0.64), 0.42),
    metal: createImageTextureMaterial(scene, "elevator-metal-material", {
      assetId: "m9-elevator-checkout-panel",
      path: "/assets/textures/generated/m9-elevator-checkout-panel.png",
      uScale: 2,
      vScale: 2
    }),
    cubicle: material(scene, "cubicle-material", new Color3(0.44, 0.54, 0.5)),
    desk: material(scene, "desk-material", new Color3(0.38, 0.31, 0.22)),
    light: emissiveMaterial(scene, "fluorescent-material", new Color3(0.94, 0.93, 0.78)),
    paper: createImageTextureMaterial(scene, "paper-material", {
      assetId: "m9-incident-report-paper",
      path: "/assets/textures/generated/m9-incident-report-paper.png",
      uScale: 1.6,
      vScale: 1.6
    }),
    chair: material(scene, "chair-material", new Color3(0.28, 0.32, 0.31)),
    records: material(scene, "records-material", new Color3(0.48, 0.44, 0.34))
  };
}

function material(scene: Scene, name: string, color: Color3, alpha = 1): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.08, 0.08, 0.07);
  mat.alpha = alpha;
  return mat;
}

function emissiveMaterial(scene: Scene, name: string, color: Color3): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.emissiveColor = color;
  mat.specularColor = new Color3(0.02, 0.02, 0.02);
  return mat;
}
