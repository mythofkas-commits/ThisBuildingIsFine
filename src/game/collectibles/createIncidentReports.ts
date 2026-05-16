import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { createTextMaterial } from "../textures";
import type {
  IncidentReportDefinition,
  IncidentReportHudInfo,
  IncidentReportInstance
} from "./collectibleTypes";
import { incidentReportDefinitions } from "./incidentReports";

export interface IncidentReportCollection {
  reports: IncidentReportInstance[];
  total: number;
  collectNearby: (position: Vector3) => IncidentReportInstance | null;
  getNearestUncollected: (position: Vector3) => IncidentReportInstance | null;
  getHudInfo: (position: Vector3) => IncidentReportHudInfo;
  reset: () => void;
}

export function createIncidentReports(
  scene: Scene,
  parent: TransformNode,
  definitions: IncidentReportDefinition[] = incidentReportDefinitions
): IncidentReportCollection {
  const collectedMaterial = createCollectedReportMaterial(scene);
  const reports = definitions.map((definition) => {
    return {
      definition,
      mesh: createIncidentReportMesh(scene, definition, parent),
      collected: false
    };
  });

  return {
    reports,
    total: reports.length,
    collectNearby: (position) => {
      const nearest = findNearestUncollected(reports, position);

      if (!nearest || distanceToReport(nearest, position) > nearest.definition.collectRadius) {
        return null;
      }

      nearest.collected = true;
      nearest.mesh.material = collectedMaterial;
      nearest.mesh.scaling = new Vector3(0.72, 0.72, 0.72);
      nearest.mesh.isVisible = false;
      return nearest;
    },
    getNearestUncollected: (position) => findNearestUncollected(reports, position),
    getHudInfo: (position) => {
      const nearest = findNearestUncollected(reports, position);
      return {
        collected: reports.filter((report) => report.collected).length,
        total: reports.length,
        nearestLabel: nearest?.definition.label ?? null,
        nearestDistance: nearest ? distanceToReport(nearest, position) : null
      };
    },
    reset: () => {
      reports.forEach((report) => {
        report.collected = false;
        report.mesh.isVisible = true;
        report.mesh.scaling = Vector3.One();
        report.mesh.material = createReportMaterial(scene, report.definition);
      });
    }
  };
}

function createIncidentReportMesh(
  scene: Scene,
  definition: IncidentReportDefinition,
  parent: TransformNode
): Mesh {
  const report = MeshBuilder.CreatePlane(`incident-report-${definition.id.toLowerCase()}`, {
    width: 0.74,
    height: 0.98
  }, scene);
  report.position = new Vector3(definition.position.x, definition.position.y, definition.position.z);
  report.rotation.x = Math.PI / 2.12;
  report.rotation.y = definition.rotationY ?? 0;
  report.material = createReportMaterial(scene, definition);
  report.material.backFaceCulling = false;
  report.checkCollisions = false;
  report.metadata = {
    kind: "incident-report",
    reportId: definition.id,
    roomId: definition.roomId,
    collision: "intentionally-non-collidable"
  };
  report.parent = parent;
  return report;
}

function createReportMaterial(scene: Scene, definition: IncidentReportDefinition): StandardMaterial {
  const material = createTextMaterial(scene, `incident-report-${definition.id}`, ["INCIDENT", "REPORT", definition.id], {
    background: "#f3ead2",
    color: "#302c22",
    accent: "#b43d2f",
    width: 320,
    height: 440,
    fontSize: 38
  });
  material.backFaceCulling = false;
  return material;
}

function createCollectedReportMaterial(scene: Scene): StandardMaterial {
  const material = new StandardMaterial("incident-report-collected-material", scene);
  material.diffuseColor = new Color3(0.36, 0.33, 0.25);
  material.emissiveColor = new Color3(0.05, 0.045, 0.03);
  material.alpha = 0.35;
  return material;
}

function findNearestUncollected(
  reports: IncidentReportInstance[],
  position: Vector3
): IncidentReportInstance | null {
  let nearest: IncidentReportInstance | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  reports.forEach((report) => {
    if (report.collected) {
      return;
    }

    const distance = distanceToReport(report, position);
    if (distance < nearestDistance) {
      nearest = report;
      nearestDistance = distance;
    }
  });

  return nearest;
}

function distanceToReport(report: IncidentReportInstance, position: Vector3): number {
  const reportPosition = report.mesh.getAbsolutePosition();
  return Math.hypot(reportPosition.x - position.x, reportPosition.z - position.z);
}
