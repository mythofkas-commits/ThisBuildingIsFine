import { Engine } from "@babylonjs/core/Engines/engine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { getClarityHudInfo } from "./clarity/clarityState";
import { applyClarityEvent, applyRoomClarityEvent } from "./clarity/updateClarity";
import type { IncidentReportCollection } from "./collectibles/createIncidentReports";
import { createIncidentReports } from "./collectibles/createIncidentReports";
import { createExtractionZone } from "./extraction/createExtractionZone";
import { extractionMessages } from "./extraction/extractionState";
import type { ExtractionZone } from "./extraction/extractionTypes";
import {
  collectReport,
  completeExtraction,
  createInitialGameState,
  noteLockedExtraction,
  refreshExtractionAvailability,
  resetGameState
} from "./gameState";
import { createHud } from "./hud";
import { createMeetingHazard } from "./meeting/createMeetingHazard";
import { getMeetingHudInfo } from "./meeting/meetingState";
import type { MeetingHazardController } from "./meeting/meetingTypes";
import { updateMeetingHazard } from "./meeting/updateMeetingHazard";
import { createMovementCollision } from "./navigation/collision";
import { emitNarrator, tickNarrator } from "./narrator/updateNarrator";
import { createOfficeScene } from "./officeScene";
import { createPlayer } from "./player";
import { m2RoomNetwork } from "./rooms/roomData";

interface DebugState {
  ready: boolean;
  meshCount: number;
  roomCount: number;
  roomIds: string[];
  connectionCount: number;
  collisionBlockerCount: number;
  dynamicCollisionBlockerCount: number;
  wallCollisionProbeBlocked: boolean;
  doorwayProbeClearCount: number;
  decorativeSignCount: number;
  hasHud: boolean;
  reportTotal: number;
  collectedReportCount: number;
  collectedReportIds: string[];
  uncollectedReportIds: string[];
  reportPositions: Array<{ id: string; roomId: string; x: number; y: number; z: number; visible: boolean }>;
  extraction: {
    id: string;
    roomId: string;
    label: string;
    available: boolean;
    completed: boolean;
    requiredReportCount: number;
    distance: number;
    near: boolean;
  };
  decorativeSigns: Array<{
    name: string;
    kind?: string;
    x: number;
    y: number;
    z: number;
    width?: number;
    height?: number;
    wallOffsetApplied?: number;
    facingNormal?: { x: number; y: number; z: number };
    backFaceCulling?: boolean;
  }>;
  clarity: {
    value: number;
    baseline: number;
    band: string;
    lastEventId: string | null;
    lastMessage: string;
    appliedEventIds: string[];
  };
  narrator: {
    currentMessage: string;
    currentEventId: string;
    emissionCount: number;
    blockedCount: number;
    history: Array<{ eventId: string; message: string; frame: number }>;
  };
  meeting: {
    id: string;
    roomId: string;
    phase: string;
    insideZone: boolean;
    exposureFrames: number;
    activationCount: number;
    escapeCount: number;
    clarityApplied: boolean;
    objectPositions: Array<{ id: string; x: number; z: number; rotationY: number }>;
  };
  currentRoomId: string | null;
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
  const extractionZone = createExtractionZone(scene, office.root);
  const state = createInitialGameState(incidentReports.total);
  const collision = createMovementCollision(scene);
  const meetingHazard = createMeetingHazard(scene, office.root, state.meeting, collision);
  const player = createPlayer(scene, canvas, collision);
  let extractionUseRequested = false;
  window.__TBIF_PROOF_CAMERA__ = (position, target) => {
    player.camera.position.copyFrom(new Vector3(position.x, position.y, position.z));
    player.camera.setTarget(new Vector3(target.x, target.y, target.z));
  };

  const restart = () => {
    resetGameState(state);
    meetingHazard.reset();
    player.reset();
    incidentReports.reset();
    extractionZone.setAvailability("locked");
    extractionUseRequested = false;
    emitNarrator(state.narrator, "restart", { force: true });
  };

  const hud = createHud(shell, restart);

  window.addEventListener("keydown", (event) => {
    if (event.code === "KeyE") {
      extractionUseRequested = true;
    }
  });

  scene.onBeforeRenderObservable.add(() => {
    tickNarrator(state.narrator);
    player.update();
    const collectedReport = incidentReports.collectNearby(player.camera.position);

    if (collectedReport) {
      const reportAccepted = collectReport(
        state,
        collectedReport.definition.id,
        collectedReport.definition.label,
        collectedReport.definition.text
      );

      if (reportAccepted) {
        emitNarrator(state.narrator, "report-collected", { force: true });
        const clarityChange = applyClarityEvent(state.clarity, "incident-report-filed");
        if (clarityChange.changed) {
          state.status = `${state.status} ${clarityChange.message}`;
          emitNarrator(state.narrator, "clarity-changed", { force: true });
        }
      }
    }

    const currentRoomId = getCurrentRoomId(player.camera.position);
    const roomClarityChange = applyRoomClarityEvent(state.clarity, currentRoomId);
    if (roomClarityChange?.changed && !collectedReport) {
      state.status = roomClarityChange.message;
      if (currentRoomId === "records") {
        emitNarrator(state.narrator, "records-room-entered");
      } else if (currentRoomId === "elevator") {
        emitNarrator(state.narrator, "elevator-room-entered");
      }
    }

    const meetingUpdate = updateMeetingHazard(meetingHazard, player.camera.position);
    if (meetingUpdate.statusMessage) {
      state.status = meetingUpdate.statusMessage;
    }
    if (meetingUpdate.narratorEventId) {
      emitNarrator(state.narrator, meetingUpdate.narratorEventId);
    }
    if (meetingUpdate.clarityEventId) {
      const clarityChange = applyClarityEvent(state.clarity, meetingUpdate.clarityEventId);
      if (clarityChange.changed) {
        state.status = `${state.status} ${clarityChange.message}`;
        emitNarrator(state.narrator, "clarity-changed", { force: true });
      }
    }

    const extractionWasAvailable = state.extractionAvailable;
    const extractionAvailable = refreshExtractionAvailability(state);

    if (!extractionWasAvailable && extractionAvailable && !state.extractionCompleted) {
      state.status = extractionMessages.available;
      emitNarrator(state.narrator, "extraction-approved", { force: true });
    }

    const nearExtraction = extractionZone.contains(player.camera.position);

    if (nearExtraction && state.extractionCompleted) {
      state.status = extractionMessages.complete;
    } else if (nearExtraction && extractionAvailable && extractionUseRequested) {
      if (completeExtraction(state, extractionMessages.complete)) {
        emitNarrator(state.narrator, "extraction-complete", { force: true });
      }
    } else if (nearExtraction && extractionAvailable) {
      state.status = extractionMessages.availableNear;
    } else if (nearExtraction && !extractionAvailable) {
      noteLockedExtraction(state, extractionMessages.locked);
      emitNarrator(state.narrator, "locked-extraction");
      const clarityChange = applyClarityEvent(state.clarity, "locked-extraction-approach");
      if (clarityChange.changed) {
        state.status = `${extractionMessages.locked} ${clarityChange.message}`;
        emitNarrator(state.narrator, "clarity-changed", { force: true });
      }
    }

    extractionUseRequested = false;
    extractionZone.setAvailability(state.extractionCompleted ? "complete" : state.extractionAvailable ? "available" : "locked");
    hud.update(
      state,
      player.camera.position,
      incidentReports.getHudInfo(player.camera.position),
      getClarityHudInfo(state.clarity),
      getMeetingHudInfo(state.meeting, player.camera.position),
      getExtractionHudInfo(extractionZone, player.camera.position, state)
    );
    updateDebugState(scene, state, player.camera.position, office, collision, incidentReports, extractionZone, meetingHazard);
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });

  updateDebugState(scene, state, player.camera.position, office, collision, incidentReports, extractionZone, meetingHazard);
}

function updateDebugState(
  scene: Scene,
  state: ReturnType<typeof createInitialGameState>,
  cameraPosition: Vector3,
  office: ReturnType<typeof createOfficeScene>,
  collision: ReturnType<typeof createMovementCollision>,
  incidentReports: IncidentReportCollection,
  extractionZone: ExtractionZone,
  meetingHazard: MeetingHazardController
): void {
  const nearestReport = incidentReports.getNearestUncollected(cameraPosition);
  const extractionDistance = extractionZone.distanceTo(cameraPosition);
  const meetingHudInfo = getMeetingHudInfo(state.meeting, cameraPosition);

  window.__TBIF_DEBUG__ = {
    ready: true,
    meshCount: scene.meshes.length,
    roomCount: office.roomCount,
    roomIds: office.roomIds,
    connectionCount: office.connectionCount,
    collisionBlockerCount: collision.blockerCount,
    dynamicCollisionBlockerCount: collision.dynamicBlockerCount,
    wallCollisionProbeBlocked: collision.blocksPosition(new Vector3(0, 1.65, -4.02)),
    doorwayProbeClearCount: office.doorwayProbePositions.filter((position) => {
      return !collision.blocksPosition(new Vector3(position.x, 1.65, position.z));
    }).length,
    decorativeSignCount: scene.meshes.filter((mesh) => {
      return mesh.metadata?.kind === "decorative-sign";
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
    extraction: {
      id: extractionZone.definition.id,
      roomId: extractionZone.definition.roomId,
      label: extractionZone.definition.label,
      available: state.extractionAvailable,
      completed: state.extractionCompleted,
      requiredReportCount: extractionZone.definition.requiredReportCount,
      distance: extractionDistance,
      near: extractionZone.contains(cameraPosition)
    },
    decorativeSigns: scene.meshes
      .filter((mesh) => mesh.metadata?.kind === "decorative-sign")
      .map((mesh) => {
        const position = mesh.getAbsolutePosition();
        return {
          name: mesh.name,
          kind: mesh.metadata?.kind,
          x: position.x,
          y: position.y,
          z: position.z,
          width: mesh.metadata?.width,
          height: mesh.metadata?.height,
          wallOffsetApplied: mesh.metadata?.wallOffsetApplied,
          facingNormal: mesh.metadata?.facingNormal,
          backFaceCulling: mesh.material?.backFaceCulling
        };
      }),
    clarity: {
      value: state.clarity.value,
      baseline: state.clarity.baseline,
      band: getClarityHudInfo(state.clarity).band,
      lastEventId: state.clarity.lastEventId,
      lastMessage: state.clarity.lastMessage,
      appliedEventIds: Array.from(state.clarity.appliedEventIds)
    },
    narrator: {
      currentMessage: state.narrator.currentMessage,
      currentEventId: state.narrator.currentEventId,
      emissionCount: state.narrator.emissionCount,
      blockedCount: state.narrator.blockedCount,
      history: state.narrator.history.map((entry) => ({ ...entry }))
    },
    meeting: {
      id: meetingHazard.definition.id,
      roomId: meetingHazard.definition.roomId,
      phase: state.meeting.phase,
      insideZone: meetingHudInfo.insideZone,
      exposureFrames: state.meeting.exposureFrames,
      activationCount: state.meeting.activationCount,
      escapeCount: state.meeting.escapeCount,
      clarityApplied: state.meeting.clarityApplied,
      objectPositions: meetingHazard.objects.map((object) => ({
        id: object.id,
        x: object.node.getAbsolutePosition().x,
        z: object.node.getAbsolutePosition().z,
        rotationY: object.node.rotation.y
      }))
    },
    currentRoomId: getCurrentRoomId(cameraPosition),
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

function getCurrentRoomId(position: Vector3): string | null {
  const room = m2RoomNetwork.rooms.find((candidate) => {
    const halfWidth = candidate.size.width / 2;
    const halfDepth = candidate.size.depth / 2;
    return (
      position.x >= candidate.center.x - halfWidth &&
      position.x <= candidate.center.x + halfWidth &&
      position.z >= candidate.center.z - halfDepth &&
      position.z <= candidate.center.z + halfDepth
    );
  });

  return room?.id ?? null;
}

function getExtractionHudInfo(extractionZone: ExtractionZone, cameraPosition: Vector3, state: ReturnType<typeof createInitialGameState>) {
  const distance = extractionZone.distanceTo(cameraPosition);
  const near = extractionZone.contains(cameraPosition);
  return {
    label: extractionZone.definition.label,
    availability: state.extractionCompleted ? "complete" as const : state.extractionAvailable ? "available" as const : "locked" as const,
    distance,
    near,
    reportsRequired: extractionZone.definition.requiredReportCount,
    actionText: getExtractionActionText(distance, near, state)
  };
}

function getExtractionActionText(distance: number, near: boolean, state: ReturnType<typeof createInitialGameState>): string {
  if (state.extractionCompleted) {
    return "Audit filed. R restarts the audit.";
  }

  if (state.extractionAvailable && near) {
    return "Press E to file audit.";
  }

  if (state.extractionAvailable) {
    return `Proceed to Complete Check-Out. Distance ${distance.toFixed(1)}`;
  }

  if (near) {
    return "Reports still required.";
  }

  return `Check-Out pending. Distance ${distance.toFixed(1)}`;
}
