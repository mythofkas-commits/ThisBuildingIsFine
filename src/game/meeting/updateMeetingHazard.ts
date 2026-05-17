import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { isInsideMeetingZone, meetingMessages } from "./meetingState";
import type { MeetingHazardController, MeetingHazardObject, MeetingUpdateResult } from "./meetingTypes";

const assemblyFrames = 72;
const coolingFrames = 86;
const reminderIntervalFrames = 180;
const moveLerp = 0.085;
const rotationLerp = 0.11;

export function updateMeetingHazard(
  hazard: MeetingHazardController,
  playerPosition: Vector3
): MeetingUpdateResult {
  const state = hazard.state;
  const insideZone = isInsideMeetingZone(playerPosition, hazard.definition);
  const result: MeetingUpdateResult = {
    statusMessage: null,
    narratorEventId: null,
    clarityEventId: null
  };

  if (insideZone && state.phase === "idle") {
    state.phase = "assembling";
    state.exposureFrames = 0;
    state.cooldownFramesRemaining = 0;
    state.activationCount += 1;
    state.lastStatus = meetingMessages.noticed;
    state.lastNarratorEventId = "meeting-noticed";
    result.statusMessage = meetingMessages.noticed;
    result.narratorEventId = "meeting-noticed";
  }

  if (!insideZone && (state.phase === "assembling" || state.phase === "active")) {
    state.phase = "cooling";
    state.cooldownFramesRemaining = coolingFrames;
    state.exposureFrames = 0;
    state.escapeCount += 1;
    state.lastStatus = meetingMessages.escaped;
    state.lastNarratorEventId = "meeting-escaped";
    result.statusMessage = meetingMessages.escaped;
    result.narratorEventId = "meeting-escaped";
  }

  if (state.phase === "assembling" || state.phase === "active") {
    state.exposureFrames += 1;
    if (state.exposureFrames >= assemblyFrames) {
      state.phase = "active";
    }

    if (
      !state.clarityApplied &&
      state.exposureFrames >= hazard.definition.exposureFramesForClarity
    ) {
      state.clarityApplied = true;
      state.lastStatus = meetingMessages.clarity;
      state.lastNarratorEventId = "meeting-reminder";
      result.statusMessage = meetingMessages.clarity;
      result.narratorEventId = "meeting-reminder";
      result.clarityEventId = "meeting-exposure";
    } else if (
      state.phase === "active" &&
      state.exposureFrames > assemblyFrames &&
      state.exposureFrames % reminderIntervalFrames === 0
    ) {
      state.lastStatus = meetingMessages.reminder;
      state.lastNarratorEventId = "meeting-reminder";
      result.statusMessage = meetingMessages.reminder;
      result.narratorEventId = "meeting-reminder";
    }
  } else if (state.phase === "cooling") {
    state.cooldownFramesRemaining -= 1;
    if (state.cooldownFramesRemaining <= 0) {
      state.phase = "idle";
      state.cooldownFramesRemaining = 0;
    }
  }

  updateMeetingObjects(hazard);
  return result;
}

function updateMeetingObjects(hazard: MeetingHazardController): void {
  const targetPose = hazard.state.phase === "idle" || hazard.state.phase === "cooling"
    ? "idlePose"
    : "meetingPose";

  hazard.objects.forEach((object) => {
    moveObjectToward(object, targetPose);
  });
}

function moveObjectToward(object: MeetingHazardObject, targetPoseName: "idlePose" | "meetingPose"): void {
  const targetPose = object[targetPoseName];
  object.node.position = object.node.position.scale(1 - moveLerp).add(targetPose.position.scale(moveLerp));
  object.node.rotation.y = lerpAngle(object.node.rotation.y, targetPose.rotationY, rotationLerp);
}

function lerpAngle(current: number, target: number, amount: number): number {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * amount;
}
