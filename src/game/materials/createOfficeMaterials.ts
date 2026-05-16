import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";

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
    carpet: material(scene, "carpet-material", new Color3(0.55, 0.49, 0.37)),
    wall: material(scene, "wall-material", new Color3(0.72, 0.7, 0.61)),
    ceiling: material(scene, "ceiling-material", new Color3(0.82, 0.81, 0.72)),
    concrete: material(scene, "concrete-material", new Color3(0.42, 0.43, 0.39)),
    glass: material(scene, "glass-material", new Color3(0.46, 0.62, 0.64), 0.42),
    metal: material(scene, "elevator-metal-material", new Color3(0.31, 0.32, 0.31)),
    cubicle: material(scene, "cubicle-material", new Color3(0.44, 0.54, 0.5)),
    desk: material(scene, "desk-material", new Color3(0.38, 0.31, 0.22)),
    light: emissiveMaterial(scene, "fluorescent-material", new Color3(0.94, 0.93, 0.78)),
    paper: material(scene, "paper-material", new Color3(0.86, 0.82, 0.69)),
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
