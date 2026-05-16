import type { ClarityBand, ClarityEventDefinition, ClarityEventId, ClarityHudInfo, ClarityState } from "./clarityTypes";

export const clarityBaseline = 100;

export const clarityEvents: Record<ClarityEventId, ClarityEventDefinition> = {
  "incident-report-filed": {
    id: "incident-report-filed",
    delta: -4,
    once: false,
    message: "Clarity variance detected. Please remain conceptually available."
  },
  "locked-extraction-approach": {
    id: "locked-extraction-approach",
    delta: -3,
    once: true,
    message: "The building has revised your confidence downward."
  },
  "records-room-entry": {
    id: "records-room-entry",
    delta: -5,
    once: true,
    message: "Several records disagree with your interpretation."
  },
  "elevator-room-entry": {
    id: "elevator-room-entry",
    delta: -2,
    once: true,
    message: "Your orientation is under informal review."
  }
};

export const roomClarityEvents: Partial<Record<string, ClarityEventId>> = {
  records: "records-room-entry",
  elevator: "elevator-room-entry"
};

export function createInitialClarityState(): ClarityState {
  return {
    value: clarityBaseline,
    baseline: clarityBaseline,
    min: 0,
    max: clarityBaseline,
    lastEventId: null,
    lastMessage: "Clarity restored to company baseline.",
    appliedEventIds: new Set<ClarityEventId>()
  };
}

export function resetClarity(state: ClarityState): void {
  state.value = state.baseline;
  state.lastEventId = null;
  state.lastMessage = "Clarity restored to company baseline.";
  state.appliedEventIds.clear();
}

export function getClarityBand(value: number): ClarityBand {
  if (value >= 95) {
    return "baseline";
  }

  if (value >= 85) {
    return "reviewed";
  }

  if (value >= 70) {
    return "revised";
  }

  return "misfiled";
}

export function getClarityHudInfo(state: ClarityState): ClarityHudInfo {
  const band = getClarityBand(state.value);
  return {
    value: state.value,
    band,
    label: `Clarity: ${state.value}%`,
    note: getClarityNote(band)
  };
}

function getClarityNote(band: ClarityBand): string {
  switch (band) {
    case "baseline":
      return "company baseline";
    case "reviewed":
      return "under informal review";
    case "revised":
      return "orientation revised";
    case "misfiled":
      return "confidence misfiled";
  }
}
