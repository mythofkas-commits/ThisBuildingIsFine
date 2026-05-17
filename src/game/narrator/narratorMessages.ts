import type { NarratorEventId, NarratorMessageDefinition } from "./narratorTypes";

export const narratorMessages: Record<NarratorEventId, NarratorMessageDefinition> = {
  "performance-review-pending": {
    eventId: "performance-review-pending",
    cooldownFrames: 120,
    messages: ["Performance review pending."]
  },
  "report-collected": {
    eventId: "report-collected",
    cooldownFrames: 90,
    messages: [
      "Your paperwork has developed confidence.",
      "You have collected evidence. Evidence has collected you back."
    ]
  },
  "clarity-changed": {
    eventId: "clarity-changed",
    cooldownFrames: 45,
    messages: [
      "Clarity variance detected. Please remain conceptually available.",
      "Your orientation is under informal review."
    ]
  },
  "locked-extraction": {
    eventId: "locked-extraction",
    cooldownFrames: 180,
    messages: ["Your exit request has been received and emotionally misunderstood."]
  },
  "extraction-approved": {
    eventId: "extraction-approved",
    cooldownFrames: 120,
    messages: ["File Audit approved. Please submit findings before the building reconsiders."]
  },
  "extraction-complete": {
    eventId: "extraction-complete",
    cooldownFrames: 120,
    messages: ["The company has marked your concern as partially received."]
  },
  "restart": {
    eventId: "restart",
    cooldownFrames: 30,
    messages: ["Performance review restarted. Previous certainty has been archived."]
  },
  "records-room-entered": {
    eventId: "records-room-entered",
    cooldownFrames: 180,
    messages: ["The records appreciate your attempt to remember them correctly."]
  },
  "elevator-room-entered": {
    eventId: "elevator-room-entered",
    cooldownFrames: 180,
    messages: ["The elevator is experiencing a brief disagreement with verticality."]
  },
  "meeting-noticed": {
    eventId: "meeting-noticed",
    cooldownFrames: 220,
    messages: [
      "A meeting has noticed your availability.",
      "Your attendance has been inferred."
    ]
  },
  "meeting-reminder": {
    eventId: "meeting-reminder",
    cooldownFrames: 240,
    messages: [
      "The chairs are aligning around a shared misunderstanding.",
      "Please remain inside the agenda until consensus is achieved."
    ]
  },
  "meeting-escaped": {
    eventId: "meeting-escaped",
    cooldownFrames: 120,
    messages: [
      "The meeting has failed to reach you.",
      "Leaving early may improve your clarity."
    ]
  }
};
