import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { MeetingHazardDefinition, MeetingHazardState, MeetingHudInfo } from "./meetingTypes";

export const meetingHazardDefinition: MeetingHazardDefinition = {
  id: "the-meeting",
  roomId: "conference",
  label: "The Meeting",
  center: { x: 16, z: 0 },
  radius: 3.25,
  exposureFramesForClarity: 120
};

export const meetingMessages = {
  noticed: "A meeting has noticed your availability.",
  reminder: "Please remain inside the agenda until consensus is achieved.",
  clarity: "Your attendance has been inferred. Leaving early may improve your clarity.",
  escaped: "The meeting has failed to reach you."
} as const;

export function createInitialMeetingState(): MeetingHazardState {
  return {
    phase: "idle",
    exposureFrames: 0,
    cooldownFramesRemaining: 0,
    activationCount: 0,
    escapeCount: 0,
    clarityApplied: false,
    lastStatus: "No meeting is currently entitled to your location.",
    lastNarratorEventId: null
  };
}

export function resetMeetingState(state: MeetingHazardState): void {
  state.phase = "idle";
  state.exposureFrames = 0;
  state.cooldownFramesRemaining = 0;
  state.activationCount = 0;
  state.escapeCount = 0;
  state.clarityApplied = false;
  state.lastStatus = "No meeting is currently entitled to your location.";
  state.lastNarratorEventId = null;
}

export function isInsideMeetingZone(position: Vector3, definition = meetingHazardDefinition): boolean {
  return Math.hypot(position.x - definition.center.x, position.z - definition.center.z) <= definition.radius;
}

export function getMeetingHudInfo(state: MeetingHazardState, position: Vector3): MeetingHudInfo {
  const insideZone = isInsideMeetingZone(position);
  return {
    label: meetingHazardDefinition.label,
    phase: state.phase,
    insideZone,
    exposureFrames: state.exposureFrames,
    actionText: getMeetingActionText(state, insideZone)
  };
}

function getMeetingActionText(state: MeetingHazardState, insideZone: boolean): string {
  if (state.phase === "idle" && !insideZone) {
    return "unscheduled";
  }

  if (state.phase === "cooling") {
    return "minutes are being corrected";
  }

  if (insideZone) {
    return "leave the agenda to decline";
  }

  return "attendance not currently inferred";
}
