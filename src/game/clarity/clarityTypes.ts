export type ClarityEventId =
  | "incident-report-filed"
  | "locked-extraction-approach"
  | "records-room-entry"
  | "elevator-room-entry"
  | "meeting-exposure";

export type ClarityBand = "baseline" | "reviewed" | "revised" | "misfiled";

export interface ClarityEventDefinition {
  id: ClarityEventId;
  delta: number;
  once: boolean;
  message: string;
}

export interface ClarityState {
  value: number;
  baseline: number;
  min: number;
  max: number;
  lastEventId: ClarityEventId | null;
  lastMessage: string;
  appliedEventIds: Set<ClarityEventId>;
}

export interface ClarityChange {
  changed: boolean;
  eventId: ClarityEventId;
  previous: number;
  current: number;
  delta: number;
  message: string;
}

export interface ClarityHudInfo {
  value: number;
  band: ClarityBand;
  label: string;
  note: string;
}
