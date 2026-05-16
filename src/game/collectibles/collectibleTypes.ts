import type { Mesh } from "@babylonjs/core/Meshes/mesh";

export interface IncidentReportDefinition {
  id: string;
  roomId: string;
  label: string;
  text: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotationY?: number;
  collectRadius: number;
}

export interface IncidentReportInstance {
  definition: IncidentReportDefinition;
  mesh: Mesh;
  collected: boolean;
}

export interface IncidentReportHudInfo {
  collected: number;
  total: number;
  nearestLabel: string | null;
  nearestDistance: number | null;
}
