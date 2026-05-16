export interface GameState {
  collectedReportIds: Set<string>;
  reportTotal: number;
  lastCollectedReportId: string | null;
  restartCount: number;
  status: string;
}

export function createInitialGameState(reportTotal = 0): GameState {
  return {
    collectedReportIds: new Set<string>(),
    reportTotal,
    lastCollectedReportId: null,
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

export function resetGameState(state: GameState): void {
  state.collectedReportIds.clear();
  state.lastCollectedReportId = null;
  state.restartCount += 1;
  state.status = "Your previous route has been filed under training materials. Evidence has been reissued.";
}
