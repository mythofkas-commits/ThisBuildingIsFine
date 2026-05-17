import { createInitialClarityState, resetClarity } from "./clarity/clarityState";
import type { ClarityState } from "./clarity/clarityTypes";
import { createInitialMeetingState, resetMeetingState } from "./meeting/meetingState";
import type { MeetingHazardState } from "./meeting/meetingTypes";
import { createInitialNarratorState, resetNarrator } from "./narrator/narratorState";
import type { NarratorState } from "./narrator/narratorTypes";

export interface GameState {
  collectedReportIds: Set<string>;
  reportTotal: number;
  lastCollectedReportId: string | null;
  clarity: ClarityState;
  narrator: NarratorState;
  meeting: MeetingHazardState;
  extractionAvailable: boolean;
  extractionCompleted: boolean;
  extractionLockedNoticeActive: boolean;
  restartCount: number;
  status: string;
}

export function createInitialGameState(reportTotal = 0): GameState {
  return {
    collectedReportIds: new Set<string>(),
    reportTotal,
    lastCollectedReportId: null,
    clarity: createInitialClarityState(),
    narrator: createInitialNarratorState(),
    meeting: createInitialMeetingState(),
    extractionAvailable: false,
    extractionCompleted: false,
    extractionLockedNoticeActive: false,
    restartCount: 0,
    status: "Evidence audit pending. Incident Reports may be filed by proximity."
  };
}

export function collectReport(state: GameState, reportId: string, reportLabel: string, reportText: string): boolean {
  if (state.collectedReportIds.has(reportId)) {
    return false;
  }

  state.collectedReportIds.add(reportId);
  state.lastCollectedReportId = reportId;
  state.status = `${reportLabel} filed. ${reportText}`;
  return true;
}

export function refreshExtractionAvailability(state: GameState): boolean {
  state.extractionAvailable = state.collectedReportIds.size >= state.reportTotal && state.reportTotal > 0;
  return state.extractionAvailable;
}

export function noteLockedExtraction(state: GameState, message: string): void {
  if (state.extractionCompleted) {
    return;
  }

  state.extractionLockedNoticeActive = true;
  state.status = message;
}

export function completeExtraction(state: GameState, message: string): boolean {
  if (!state.extractionAvailable || state.extractionCompleted) {
    return false;
  }

  state.extractionCompleted = true;
  state.extractionLockedNoticeActive = false;
  state.status = message;
  return true;
}

export function resetGameState(state: GameState): void {
  state.collectedReportIds.clear();
  state.lastCollectedReportId = null;
  resetClarity(state.clarity);
  resetNarrator(state.narrator);
  resetMeetingState(state.meeting);
  state.extractionAvailable = false;
  state.extractionCompleted = false;
  state.extractionLockedNoticeActive = false;
  state.restartCount += 1;
  state.status = "Clarity restored to company baseline. Evidence has been reissued.";
}
