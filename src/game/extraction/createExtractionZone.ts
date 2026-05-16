import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { createTextMaterial } from "../textures";
import { extractionZoneDefinition } from "./extractionState";
import type { ExtractionAvailability, ExtractionZone, ExtractionZoneDefinition } from "./extractionTypes";

export function createExtractionZone(
  scene: Scene,
  parent: TransformNode,
  definition: ExtractionZoneDefinition = extractionZoneDefinition
): ExtractionZone {
  const lockedMaterial = createMarkerMaterial(scene, "extraction-marker-locked", new Color3(0.38, 0.36, 0.29));
  const availableMaterial = createMarkerMaterial(scene, "extraction-marker-available", new Color3(0.7, 0.68, 0.46));
  const completeMaterial = createMarkerMaterial(scene, "extraction-marker-complete", new Color3(0.48, 0.6, 0.54));

  const marker = MeshBuilder.CreateCylinder("extraction-zone-marker", {
    diameter: definition.radius * 1.65,
    height: 0.035,
    tessellation: 48
  }, scene);
  marker.position = new Vector3(definition.position.x, definition.position.y, definition.position.z);
  marker.material = lockedMaterial;
  marker.checkCollisions = false;
  marker.metadata = {
    kind: "extraction-zone",
    extractionZoneId: definition.id,
    roomId: definition.roomId,
    collision: "intentionally-non-collidable"
  };
  marker.parent = parent;

  const sign = MeshBuilder.CreatePlane("extraction-status-sign", { width: 1.55, height: 0.42 }, scene);
  sign.position = new Vector3(definition.position.x, 2.24, definition.position.z + 1.72);
  sign.rotation.y = Math.PI;
  sign.material = createStatusSignMaterial(scene, "EXTRACTION", "PENDING");
  sign.material.backFaceCulling = false;
  sign.checkCollisions = false;
  sign.metadata = {
    kind: "decorative-sign",
    extractionZoneId: definition.id,
    collision: "intentionally-non-collidable",
    width: 1.55,
    height: 0.42
  };
  sign.parent = parent;

  return {
    definition,
    marker,
    sign,
    distanceTo: (position) => {
      return Math.hypot(definition.position.x - position.x, definition.position.z - position.z);
    },
    contains: (position) => {
      return Math.hypot(definition.position.x - position.x, definition.position.z - position.z) <= definition.radius;
    },
    setAvailability: (availability) => {
      marker.material = getMarkerMaterial(availability, lockedMaterial, availableMaterial, completeMaterial);
      sign.material = getSignMaterial(scene, availability);
      sign.material.backFaceCulling = false;
    }
  };
}

function createMarkerMaterial(scene: Scene, name: string, color: Color3): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  material.emissiveColor = color.scale(0.18);
  material.specularColor = new Color3(0.04, 0.04, 0.035);
  material.alpha = 0.62;
  return material;
}

function getMarkerMaterial(
  availability: ExtractionAvailability,
  lockedMaterial: StandardMaterial,
  availableMaterial: StandardMaterial,
  completeMaterial: StandardMaterial
): StandardMaterial {
  if (availability === "complete") {
    return completeMaterial;
  }

  if (availability === "available") {
    return availableMaterial;
  }

  return lockedMaterial;
}

function getSignMaterial(scene: Scene, availability: ExtractionAvailability): StandardMaterial {
  if (availability === "complete") {
    return createStatusSignMaterial(scene, "AUDIT", "FILED");
  }

  if (availability === "available") {
    return createStatusSignMaterial(scene, "EXTRACTION", "APPROVED");
  }

  return createStatusSignMaterial(scene, "EXTRACTION", "PENDING");
}

function createStatusSignMaterial(scene: Scene, topLine: string, bottomLine: string): StandardMaterial {
  return createTextMaterial(scene, `extraction-sign-${topLine.toLowerCase()}-${bottomLine.toLowerCase()}`, [topLine, bottomLine], {
    background: "#e7dfc7",
    color: "#313026",
    accent: "#b7aa7f",
    width: 512,
    height: 180,
    fontSize: 25
  });
}
