export type NarratorEventId =
  | "performance-review-pending"
  | "report-collected"
  | "clarity-changed"
  | "locked-extraction"
  | "extraction-approved"
  | "extraction-complete"
  | "restart"
  | "records-room-entered"
  | "elevator-room-entered"
  | "meeting-noticed"
  | "meeting-reminder"
  | "meeting-escaped";

export interface NarratorMessageDefinition {
  eventId: NarratorEventId;
  messages: string[];
  cooldownFrames: number;
}

export interface NarratorEmission {
  eventId: NarratorEventId;
  message: string;
  frame: number;
}

export interface NarratorState {
  currentMessage: string;
  currentEventId: NarratorEventId;
  frame: number;
  emissionCount: number;
  globalCooldownFrames: number;
  lastGlobalFrame: number;
  lastEventFrames: Map<NarratorEventId, number>;
  history: NarratorEmission[];
  blockedCount: number;
}

export interface NarratorEmitOptions {
  force?: boolean;
}
