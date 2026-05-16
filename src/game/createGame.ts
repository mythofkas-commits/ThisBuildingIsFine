import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import type { IncidentReportCollection } from "./collectibles/createIncidentReports";
import { createIncidentReports } from "./collectibles/createIncidentReports";
import { collectReport, createInitialGameState, resetGameState } from "./gameState";
import { createHud } from "./hud";
import { createMovementCollision } from "./navigation/collision";
import { createOfficeScene } from "./officeScene";
import { createPlayer } from "./player";

interface DebugState {
  ready: boolean;
  meshCount: number;
  roomCount: number;
  roomIds: string[];
  connectionCount: number;
  collisionBlockerCount: number;
  wallCollisionProbeBlocked: boolean;
  doorwayProbeClearCount: number;
  decorativeSignCount: number;
  hasHud: boolean;
  reportTotal: number;
  collectedReportCount: number;
  collectedReportIds: string[];
  uncollectedReportIds: string[];
  reportPositions: Array<{ id: string; roomId: string; x: number; y: number; z: number; visible: boolean }>;
  decorativeSigns: Array<{ name: string; x: number; y: number; z: number; width?: number; height?: number }>;
  nearestReportId: string | null;
  restartCount: number;
  cameraPosition: { x: number; y: number; z: number };
  lastStatus: string;
}

declare global {
  interface Window {
    __TBIF_DEBUG__?: DebugState;
    __TBIF_PROOF_CAMERA__?: (position: { x: number; y: number; z: number }, target: { x: number; y: number; z: number }) => void;
  }
}

export function createGame(root: HTMLElement): void {
  root.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "game-shell";

  const canvas = document.createElement("canvas");
  canvas.id = "game-canvas";
  canvas.setAttribute("aria-label", "The Building Is Fine playable 3D scene");
  shell.appendChild(canvas);
  root.appendChild(shell);

  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: true
  });
  const scene = new Scene(engine);
  const office = createOfficeScene(scene);
  const incidentReports = createIncidentReports(scene, office.root);
  const state = createInitialGameState(incidentReports.total);
  const collision = createMovementCollision(scene);
  const player = createPlayer(scene, canvas, collision);
  window.__TBIF_PROOF_CAMERA__ = (position, target) => {
    player.camera.position.copyFrom(new Vector3(position.x, position.y, position.z));
    player.camera.setTarget(new Vector3(target.x, target.y, target.z));
  };

  const restart = () => {
    resetGameState(state);
    player.reset();
    incidentReports.reset();
  };

  const hud = createHud(shell, restart);

  scene.onBeforeRenderObservable.add(() => {
    player.update();
    const collectedReport = incidentReports.collectNearby(player.camera.position);

    if (collectedReport) {
      collectReport(
        state,
        collectedReport.definition.id,
        collectedReport.definition.label,
        collectedReport.definition.text
      );
    }

    hud.update(state, player.camera.position, incidentReports.getHudInfo(player.camera.position));
    updateDebugState(scene, state, player.camera.position, office, collision, incidentReports);
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });

  updateDebugState(scene, state, player.camera.position, office, collision, incidentReports);
}

function updateDebugState(
  scene: Scene,
  state: ReturnType<typeof createInitialGameState>,
  cameraPosition: Vector3,
  office: ReturnType<typeof createOfficeScene>,
  collision: ReturnType<typeof createMovementCollision>,
  incidentReports: IncidentReportCollection
): void {
  const nearestReport = incidentReports.getNearestUncollected(cameraPosition);

  window.__TBIF_DEBUG__ = {
    ready: true,
    meshCount: scene.meshes.length,
    roomCount: office.roomCount,
    roomIds: office.roomIds,
    connectionCount: office.connectionCount,
    collisionBlockerCount: collision.blockerCount,
    wallCollisionProbeBlocked: collision.blocksPosition(new Vector3(0, 1.65, -4.02)),
    doorwayProbeClearCount: office.doorwayProbePositions.filter((position) => {
      return !collision.blocksPosition(new Vector3(position.x, 1.65, position.z));
    }).length,
    decorativeSignCount: scene.meshes.filter((mesh) => {
      return mesh.metadata?.collision === "intentionally-non-collidable";
    }).length,
    hasHud: Boolean(document.querySelector(".hud")),
    reportTotal: incidentReports.total,
    collectedReportCount: state.collectedReportIds.size,
    collectedReportIds: Array.from(state.collectedReportIds),
    uncollectedReportIds: incidentReports.reports
      .filter((report) => !report.collected)
      .map((report) => report.definition.id),
    reportPositions: incidentReports.reports.map((report) => {
      const position = report.mesh.getAbsolutePosition();
      return {
        id: report.definition.id,
        roomId: report.definition.roomId,
        x: position.x,
        y: position.y,
        z: position.z,
        visible: report.mesh.isVisible
      };
    }),
    decorativeSigns: scene.meshes
      .filter((mesh) => mesh.metadata?.collision === "intentionally-non-collidable")
      .map((mesh) => {
        const position = mesh.getAbsolutePosition();
        return {
          name: mesh.name,
          x: position.x,
          y: position.y,
          z: position.z,
          width: mesh.metadata?.width,
          height: mesh.metadata?.height
        };
      }),
    nearestReportId: nearestReport?.definition.id ?? null,
    restartCount: state.restartCount,
    cameraPosition: {
      x: cameraPosition.x,
      y: cameraPosition.y,
      z: cameraPosition.z
    },
    lastStatus: state.status
  };
}
