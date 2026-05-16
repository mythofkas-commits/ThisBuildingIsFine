import type { Mesh } from "@babylonjs/core/Meshes/mesh";

export interface ExtractionZoneDefinition {
  id: string;
  roomId: string;
  label: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  radius: number;
  requiredReportCount: number;
}

export type ExtractionAvailability = "locked" | "available" | "complete";

export interface ExtractionZone {
  definition: ExtractionZoneDefinition;
  marker: Mesh;
  sign: Mesh;
  distanceTo: (position: { x: number; z: number }) => number;
  contains: (position: { x: number; z: number }) => boolean;
  setAvailability: (availability: ExtractionAvailability) => void;
}

export interface ExtractionHudInfo {
  label: string;
  availability: ExtractionAvailability;
  distance: number;
  near: boolean;
  reportsRequired: number;
  actionText: string;
}
