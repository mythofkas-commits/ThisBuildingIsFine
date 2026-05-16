import type { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { IncidentReportHudInfo } from "./collectibles/collectibleTypes";
import type { ExtractionHudInfo } from "./extraction/extractionTypes";
import type { GameState } from "./gameState";

export interface HudController {
  update: (state: GameState, cameraPosition: Vector3, reports: IncidentReportHudInfo, extraction: ExtractionHudInfo) => void;
}

export function createHud(root: HTMLElement, onRestart: () => void): HudController {
  const hud = document.createElement("div");
  hud.className = "hud";
  hud.innerHTML = `
    <div class="hud-top">
      <section class="hud-panel">
        <div class="hud-title">The Building Is Fine</div>
        <div class="hud-status" data-hud-status></div>
      </section>
      <section class="hud-panel hud-metrics">
        <div class="hud-metric" data-hud-report></div>
        <div class="hud-metric" data-hud-extraction></div>
        <div class="hud-metric" data-hud-location></div>
      </section>
    </div>
      <div class="crosshair" aria-hidden="true"></div>
    <div class="hud-bottom">
      <div class="hud-panel hud-help">
        WASD to audit. Mouse to look. Approach Incident Reports to file them. Press E at approved extraction. R restarts.
      </div>
      <button class="restart-button" type="button">Restart Audit</button>
    </div>
  `;

  root.appendChild(hud);

  const status = hud.querySelector<HTMLElement>("[data-hud-status]");
  const report = hud.querySelector<HTMLElement>("[data-hud-report]");
  const extraction = hud.querySelector<HTMLElement>("[data-hud-extraction]");
  const location = hud.querySelector<HTMLElement>("[data-hud-location]");
  const restartButton = hud.querySelector<HTMLButtonElement>(".restart-button");

  if (!status || !report || !extraction || !location || !restartButton) {
    throw new Error("HUD failed to initialize.");
  }

  restartButton.addEventListener("click", onRestart);

  window.addEventListener("keydown", (event) => {
    if (event.code === "KeyR") {
      onRestart();
    }
  });

  return {
    update: (state, cameraPosition, reports, extractionInfo) => {
      status.textContent = state.status;
      const nearest = reports.nearestDistance === null || reports.nearestLabel === null
        ? "No pending paperwork in range of this thought."
        : `${reports.nearestLabel}: ${reports.nearestDistance < 2.4 ? "nearby" : "pending"}`;
      report.textContent = `Incident Reports: ${reports.collected} / ${reports.total}. ${nearest}`;
      const extractionLabel = extractionInfo.availability === "complete"
        ? `${extractionInfo.label}: audit filed`
        : `${extractionInfo.label}: ${extractionInfo.availability}`;
      extraction.textContent = `${extractionLabel}. ${extractionInfo.actionText}`;
      location.textContent = `Auditor position: ${cameraPosition.x.toFixed(1)}, ${cameraPosition.z.toFixed(1)}`;
    }
  };
}
