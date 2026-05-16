export interface GameState {
  collectedReportIds: Set<string>;
  reportTotal: number;
  lastCollectedReportId: string | null;
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
  state.extractionAvailable = false;
  state.extractionCompleted = false;
  state.extractionLockedNoticeActive = false;
  state.restartCount += 1;
  state.status = "Your previous route has been filed under training materials. Evidence has been reissued.";
}
