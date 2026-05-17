import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { ClarityEventId } from "../clarity/clarityTypes";
import type { NarratorEventId } from "../narrator/narratorTypes";

export type MeetingPhase = "idle" | "assembling" | "active" | "cooling";

export interface MeetingHazardDefinition {
  id: string;
  roomId: "conference";
  label: string;
  center: { x: number; z: number };
  radius: number;
  exposureFramesForClarity: number;
}

export interface MeetingHazardState {
  phase: MeetingPhase;
  exposureFrames: number;
  cooldownFramesRemaining: number;
  activationCount: number;
  escapeCount: number;
  clarityApplied: boolean;
  lastStatus: string;
  lastNarratorEventId: NarratorEventId | null;
}

export interface MeetingObjectPose {
  position: Vector3;
  rotationY: number;
}

export interface MeetingHazardObject {
  id: string;
  node: TransformNode;
  blockerMeshes: AbstractMesh[];
  idlePose: MeetingObjectPose;
  meetingPose: MeetingObjectPose;
}

export interface MeetingHazardController {
  definition: MeetingHazardDefinition;
  state: MeetingHazardState;
  objects: MeetingHazardObject[];
  reset: () => void;
}

export interface MeetingUpdateResult {
  statusMessage: string | null;
  narratorEventId: NarratorEventId | null;
  clarityEventId: ClarityEventId | null;
}

export interface MeetingHudInfo {
  label: string;
  phase: MeetingPhase;
  insideZone: boolean;
  exposureFrames: number;
  actionText: string;
}
