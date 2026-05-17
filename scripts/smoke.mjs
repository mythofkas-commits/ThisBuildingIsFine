import { chromium } from "playwright-core";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";

const root = process.cwd();
const logsDir = resolve(root, ".logs");
const smokePort = 5174;
const smokeUrl = `http://127.0.0.1:${smokePort}/`;
mkdirSync(logsDir, { recursive: true });

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];

const executablePath = chromeCandidates.find((candidate) => existsSync(candidate));

if (!executablePath) {
  throw new Error("No local Chrome or Edge executable found for smoke test.");
}

const server = await createServer({
  root,
  logLevel: "silent",
  server: {
    host: "127.0.0.1",
    port: smokePort,
    strictPort: true
  }
});

async function waitForServer(url, timeoutMs = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

try {
  await server.listen();
  await waitForServer(smokeUrl);

  const browser = await chromium.launch({
    executablePath,
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleMessages = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto(smokeUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__TBIF_DEBUG__?.ready === true);
  await page.waitForFunction(() => {
    const assets = window.__TBIF_DEBUG__?.generatedAssets ?? [];
    return assets.length >= 10 && assets.every((asset) => asset.loaded);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: resolve(logsDir, "m9-reports-before.png"), fullPage: true });

  const initialDebug = await page.evaluate(() => window.__TBIF_DEBUG__);
  const initialHud = await page.evaluate(() => ({
    hasHud: Boolean(document.querySelector(".hud")),
    reportText: document.querySelector("[data-hud-report]")?.textContent ?? "",
    clarityText: document.querySelector("[data-hud-clarity]")?.textContent ?? "",
    meetingText: document.querySelector("[data-hud-meeting]")?.textContent ?? "",
    checkOutText: document.querySelector("[data-hud-extraction]")?.textContent ?? "",
    narratorText: document.querySelector("[data-hud-narrator]")?.textContent ?? "",
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? ""
  }));

  const before = await page.evaluate(() => window.__TBIF_DEBUG__?.cameraPosition);
  await page.keyboard.down("w");
  await page.waitForTimeout(900);
  await page.keyboard.up("w");
  const afterMove = await page.evaluate(() => window.__TBIF_DEBUG__?.cameraPosition);

  const afterCollection = await page.evaluate(() => ({
    debug: window.__TBIF_DEBUG__,
    hudText: document.querySelector("[data-hud-report]")?.textContent ?? "",
    clarityText: document.querySelector("[data-hud-clarity]")?.textContent ?? "",
    narratorText: document.querySelector("[data-hud-narrator]")?.textContent ?? "",
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? ""
  }));

  await page.keyboard.down("d");
  await page.waitForTimeout(1900);
  await page.keyboard.up("d");
  const afterRoomTraversal = await page.evaluate(() => window.__TBIF_DEBUG__);

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: 15.8, y: 1.65, z: -2.6 },
      { x: 16.2, y: 1.55, z: -0.4 }
    );
  });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: resolve(logsDir, "m9-meeting.png"), fullPage: true });
  const meetingActive = await page.evaluate(() => ({
    debug: window.__TBIF_DEBUG__,
    meetingText: document.querySelector("[data-hud-meeting]")?.textContent ?? "",
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? "",
    clarityText: document.querySelector("[data-hud-clarity]")?.textContent ?? "",
    narratorText: document.querySelector("[data-hud-narrator]")?.textContent ?? ""
  }));

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: 11.25, y: 1.65, z: 0 },
      { x: 8.6, y: 1.55, z: 0 }
    );
  });
  await page.waitForTimeout(850);
  const meetingEscaped = await page.evaluate(() => ({
    debug: window.__TBIF_DEBUG__,
    meetingText: document.querySelector("[data-hud-meeting]")?.textContent ?? "",
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? "",
    narratorText: document.querySelector("[data-hud-narrator]")?.textContent ?? ""
  }));

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: 8.0, y: 1.65, z: 8.0 },
      { x: 8.8, y: 1.55, z: 8.0 }
    );
  });
  await page.waitForTimeout(350);
  const recordsReview = await page.evaluate(() => ({
    debug: window.__TBIF_DEBUG__,
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? "",
    clarityText: document.querySelector("[data-hud-clarity]")?.textContent ?? "",
    narratorText: document.querySelector("[data-hud-narrator]")?.textContent ?? ""
  }));

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: 16, y: 1.65, z: 9.72 },
      { x: 16, y: 1.55, z: 11.5 }
    );
  });
  await page.waitForTimeout(250);
  const lockedExtraction = await page.evaluate(() => ({
    debug: window.__TBIF_DEBUG__,
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? "",
    clarityText: document.querySelector("[data-hud-clarity]")?.textContent ?? "",
    narratorText: document.querySelector("[data-hud-narrator]")?.textContent ?? "",
    extractionText: document.querySelector("[data-hud-extraction]")?.textContent ?? ""
  }));

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: 9.45, y: 1.65, z: 0.8 },
      { x: 9.45, y: 1.55, z: 1.7 }
    );
  });
  await page.waitForTimeout(250);
  const afterSecondReport = await page.evaluate(() => window.__TBIF_DEBUG__);

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: 13.9, y: 1.65, z: 6.3 },
      { x: 14.4, y: 1.55, z: 7.1 }
    );
  });
  await page.waitForTimeout(250);
  const afterAllReports = await page.evaluate(() => ({
    debug: window.__TBIF_DEBUG__,
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? "",
    clarityText: document.querySelector("[data-hud-clarity]")?.textContent ?? "",
    narratorText: document.querySelector("[data-hud-narrator]")?.textContent ?? "",
    extractionText: document.querySelector("[data-hud-extraction]")?.textContent ?? ""
  }));

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: 16, y: 1.65, z: 9.72 },
      { x: 16, y: 1.55, z: 11.5 }
    );
  });
  await page.waitForTimeout(250);
  const afterExtractionPrompt = await page.evaluate(() => ({
    debug: window.__TBIF_DEBUG__,
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? "",
    clarityText: document.querySelector("[data-hud-clarity]")?.textContent ?? "",
    narratorText: document.querySelector("[data-hud-narrator]")?.textContent ?? "",
    extractionText: document.querySelector("[data-hud-extraction]")?.textContent ?? ""
  }));

  await page.keyboard.press("e");
  await page.waitForTimeout(250);
  const afterInteractionWin = await page.evaluate(() => ({
    debug: window.__TBIF_DEBUG__,
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? "",
    clarityText: document.querySelector("[data-hud-clarity]")?.textContent ?? "",
    narratorText: document.querySelector("[data-hud-narrator]")?.textContent ?? "",
    extractionText: document.querySelector("[data-hud-extraction]")?.textContent ?? ""
  }));

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: -1.45, y: 1.65, z: -2.42 },
      { x: -2.15, y: 1.7, z: -3.88 }
    );
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: resolve(logsDir, "m9-visual-assets.png"), fullPage: true });

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: 6.4, y: 1.65, z: 8.1 },
      { x: 4.05, y: 2.24, z: 8.1 }
    );
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: resolve(logsDir, "m9-signage.png"), fullPage: true });

  const screenshotPath = resolve(logsDir, "m9-smoke.png");
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.keyboard.press("r");
  await page.waitForTimeout(150);
  const afterRestart = await page.evaluate(() => window.__TBIF_DEBUG__);

  await browser.close();

  const moved =
    before &&
    afterMove &&
    Math.hypot(afterMove.x - before.x, afterMove.z - before.z) > 0.05;
  const traversed =
    afterMove &&
    afterRoomTraversal &&
    Math.hypot(afterRoomTraversal.cameraPosition.x - afterMove.x, afterRoomTraversal.cameraPosition.z - afterMove.z) > 1;
  const fullRunVisitedRoomIds = Array.from(new Set([
    initialDebug?.currentRoomId,
    afterCollection.debug?.currentRoomId,
    afterRoomTraversal?.currentRoomId,
    meetingActive.debug?.currentRoomId,
    meetingEscaped.debug?.currentRoomId,
    recordsReview.debug?.currentRoomId,
    lockedExtraction.debug?.currentRoomId,
    afterSecondReport?.currentRoomId,
    afterAllReports.debug?.currentRoomId,
    afterInteractionWin.debug?.currentRoomId
  ].filter(Boolean)));

  if (!moved) {
    throw new Error("Smoke test did not observe first-person movement.");
  }

  if (!afterRestart || afterRestart.restartCount < 1) {
    throw new Error("Smoke test did not observe restart flow.");
  }

  if (!initialHud.hasHud || !initialDebug?.hasHud) {
    throw new Error(`Smoke test did not observe HUD on scene load: ${JSON.stringify({ initialHud, initialDebug })}`);
  }

  if (!initialDebug.clarity || initialDebug.clarity.value !== 100 || !initialHud.clarityText.includes("Clarity: 100%")) {
    throw new Error(`Smoke test did not observe initial Clarity baseline: ${JSON.stringify({ initialHud, initialDebug })}`);
  }

  if (
    !initialDebug.narrator ||
    !initialHud.narratorText.includes("Performance review pending") ||
    initialDebug.narrator.history.length < 1
  ) {
    throw new Error(`Smoke test did not observe initial narrator state: ${JSON.stringify({ initialHud, initialDebug })}`);
  }

  if (!afterRestart || afterRestart.roomCount < 5 || afterRestart.connectionCount < 4) {
    throw new Error(`Smoke test expected at least 5 rooms and connected room data: ${JSON.stringify(afterRestart)}`);
  }

  if (!initialDebug || initialDebug.reportTotal < 3 || initialDebug.reportPositions.length < 3) {
    throw new Error(`Smoke test expected at least 3 source-defined reports: ${JSON.stringify(initialDebug)}`);
  }

  if (!initialDebug.extraction || initialDebug.extraction.id !== "elevator-extraction") {
    throw new Error(`Smoke test did not observe source-defined extraction zone: ${JSON.stringify(initialDebug)}`);
  }

  if (
    !initialDebug.meeting ||
    initialDebug.meeting.id !== "the-meeting" ||
    initialDebug.meeting.roomId !== "conference" ||
    initialDebug.meeting.objectPositions.length < 6 ||
    initialDebug.dynamicCollisionBlockerCount < 1
  ) {
    throw new Error(`Smoke test did not observe source-driven M7 Meeting hazard setup: ${JSON.stringify(initialDebug)}`);
  }

  const requiredRoomIds = ["lobby", "cubicles", "conference", "records", "elevator"];
  const missingRoomIds = requiredRoomIds.filter((roomId) => !afterRestart.roomIds.includes(roomId));
  if (missingRoomIds.length > 0) {
    throw new Error(`Smoke test missing required rooms: ${missingRoomIds.join(", ")}`);
  }

  if (!afterRestart.wallCollisionProbeBlocked || afterRestart.collisionBlockerCount < 1) {
    throw new Error(`Smoke test did not observe wall collision behavior: ${JSON.stringify(afterRestart)}`);
  }

  if (afterRestart.doorwayProbeClearCount < afterRestart.connectionCount) {
    throw new Error(`Smoke test did not observe clear intended doorways: ${JSON.stringify(afterRestart)}`);
  }

  if (afterRestart.decorativeSignCount < 1) {
    throw new Error(`Smoke test did not observe decorative sign classification: ${JSON.stringify(afterRestart)}`);
  }

  const recordsSigns = afterRestart?.decorativeSigns ?? [];
  const recordsLabel = {
    label: recordsSigns.find((sign) => sign.name === "records-label") ?? null,
    recordsSign: recordsSigns.find((sign) => sign.name === "records-sign") ?? null
  };

  if (
    !recordsLabel.label ||
    recordsLabel.label.y < 2.1 ||
    Math.abs(recordsLabel.label.z - 4) < 0.5 ||
    recordsLabel.label.height > 0.5
  ) {
    throw new Error(`Records room label is still low or doorway-mounted: ${JSON.stringify(recordsLabel)}`);
  }

  if (
    !recordsLabel.recordsSign ||
    recordsLabel.recordsSign.y < 2.1 ||
    Math.abs(recordsLabel.recordsSign.z - 4) < 0.5 ||
    recordsLabel.recordsSign.height > 0.5
  ) {
    throw new Error(`Records prop sign is still low or doorway-mounted: ${JSON.stringify(recordsLabel)}`);
  }

  const decorativeSigns = afterRestart.decorativeSigns ?? [];
  const signsWithoutWallOffset = decorativeSigns.filter((sign) => (sign.wallOffsetApplied ?? 0) < 0.035);
  const signsWithBackfaceText = decorativeSigns.filter((sign) => sign.backFaceCulling !== true);
  if (signsWithoutWallOffset.length > 0 || signsWithBackfaceText.length > 0) {
    throw new Error(`Wall signs must be offset from walls and render only their readable front face: ${JSON.stringify({ signsWithoutWallOffset, signsWithBackfaceText })}`);
  }

  const signOrientationChecks = [
    { name: "m8-wayfinding-conference", axis: "x", direction: -1 },
    { name: "m8-wayfinding-records", axis: "x", direction: 1 },
    { name: "m8-wayfinding-elevator", axis: "z", direction: -1 },
    { name: "m8-wayfinding-lobby", axis: "z", direction: 1 }
  ];
  const badSignOrientations = signOrientationChecks.filter((check) => {
    const sign = decorativeSigns.find((candidate) => candidate.name === check.name);
    const axisValue = check.axis === "x" ? sign?.facingNormal?.x : sign?.facingNormal?.z;
    return !sign || axisValue === undefined || axisValue * check.direction < 0.9;
  });
  if (badSignOrientations.length > 0) {
    throw new Error(`Wall signs must face the intended room-side viewing direction: ${JSON.stringify({ badSignOrientations, decorativeSigns })}`);
  }

  const requiredM9AssetIds = [
    "m9-office-carpet",
    "m9-wall-subtle-variation",
    "m9-ceiling-tile-light-panel",
    "m9-elevator-checkout-panel",
    "m9-incident-report-paper",
    "m9-clarity-abstract-overlay",
    "m9-policy-poster-hallway",
    "m9-policy-poster-meeting",
    "m9-policy-poster-records",
    "m9-meeting-agenda-card"
  ];
  const loadedM9AssetIds = new Set(
    (initialDebug.generatedAssets ?? [])
      .filter((asset) => asset.loaded)
      .map((asset) => asset.assetId)
  );
  const missingM9AssetIds = requiredM9AssetIds.filter((assetId) => !loadedM9AssetIds.has(assetId));
  if (missingM9AssetIds.length > 0) {
    throw new Error(`M9 generated/procedural asset textures did not load: ${missingM9AssetIds.join(", ")}`);
  }

  const m9DecorativeAssetIds = new Set(
    decorativeSigns
      .filter((sign) => sign.generatedAsset)
      .map((sign) => sign.assetId)
  );
  ["m9-policy-poster-hallway", "m9-policy-poster-meeting", "m9-policy-poster-records", "m9-meeting-agenda-card", "m9-clarity-abstract-overlay"].forEach((assetId) => {
    if (!m9DecorativeAssetIds.has(assetId)) {
      throw new Error(`M9 decorative asset was not present in scene sign metadata: ${assetId}`);
    }
  });

  const requiredReportIds = ["IR-01", "IR-02", "IR-03"];
  const initialReportIds = initialDebug.reportPositions.map((report) => report.id);
  const missingReportIds = requiredReportIds.filter((reportId) => !initialReportIds.includes(reportId));
  if (missingReportIds.length > 0) {
    throw new Error(`Smoke test missing required Incident Reports: ${missingReportIds.join(", ")}`);
  }

  if (!initialDebug.reportPositions.every((report) => report.visible)) {
    throw new Error(`Smoke test expected reports to be visible before collection: ${JSON.stringify(initialDebug.reportPositions)}`);
  }

  if (!afterCollection.debug || afterCollection.debug.collectedReportCount < 1) {
    throw new Error(`Smoke test did not observe Incident Report collection: ${JSON.stringify(afterCollection)}`);
  }

  if (!afterCollection.hudText.includes("Incident Reports: 1 /")) {
    throw new Error(`Smoke test did not observe HUD report count update: ${JSON.stringify(afterCollection)}`);
  }

  if (
    !afterCollection.debug.clarity ||
    afterCollection.debug.clarity.value >= initialDebug.clarity.value ||
    !afterCollection.clarityText.includes("Clarity:") ||
    !afterCollection.statusText.includes("Clarity variance")
  ) {
    throw new Error(`Smoke test did not observe Clarity change after report collection: ${JSON.stringify(afterCollection)}`);
  }

  if (
    !afterCollection.debug.narrator.history.some((entry) => entry.eventId === "report-collected") ||
    !afterCollection.debug.narrator.history.some((entry) => entry.eventId === "clarity-changed") ||
    afterCollection.narratorText.length < 12
  ) {
    throw new Error(`Smoke test did not observe narrator report/Clarity reaction: ${JSON.stringify(afterCollection)}`);
  }

  const initialMeetingObjectsById = new Map(
    initialDebug.meeting.objectPositions.map((object) => [object.id, object])
  );
  const meetingObjectMoved = meetingActive.debug?.meeting.objectPositions.some((object) => {
    const initialObject = initialMeetingObjectsById.get(object.id);
    return initialObject && Math.hypot(object.x - initialObject.x, object.z - initialObject.z) > 0.45;
  });

  if (
    !meetingActive.debug ||
    !meetingActive.debug.meeting.insideZone ||
    !["assembling", "active"].includes(meetingActive.debug.meeting.phase) ||
    meetingActive.debug.meeting.activationCount < 1 ||
    !meetingObjectMoved ||
    !meetingActive.meetingText.includes("The Meeting") ||
    !meetingActive.debug.clarity.appliedEventIds.includes("meeting-exposure") ||
    !meetingActive.debug.narrator.history.some((entry) => entry.eventId === "meeting-noticed") ||
    !meetingActive.debug.narrator.history.some((entry) => entry.eventId === "meeting-reminder")
  ) {
    throw new Error(`Smoke test did not observe active M7 Meeting behavior: ${JSON.stringify(meetingActive)}`);
  }

  if (
    !meetingEscaped.debug ||
    meetingEscaped.debug.meeting.insideZone ||
    meetingEscaped.debug.meeting.escapeCount < 1 ||
    !["cooling", "idle"].includes(meetingEscaped.debug.meeting.phase) ||
    !meetingEscaped.debug.narrator.history.some((entry) => entry.eventId === "meeting-escaped") ||
    !meetingEscaped.statusText.includes("failed to reach you")
  ) {
    throw new Error(`Smoke test did not observe Meeting escape behavior: ${JSON.stringify(meetingEscaped)}`);
  }

  if (
    !recordsReview.debug ||
    recordsReview.debug.currentRoomId !== "records" ||
    !recordsReview.debug.clarity.appliedEventIds.includes("records-room-entry") ||
    recordsReview.narratorText.length < 12
  ) {
    throw new Error(`Smoke test did not observe records room integration in full M8 path: ${JSON.stringify(recordsReview)}`);
  }

  if (
    !lockedExtraction.debug ||
    lockedExtraction.debug.extraction.available ||
    lockedExtraction.debug.extraction.completed ||
    !lockedExtraction.statusText.includes("adequate paperwork") ||
    !lockedExtraction.extractionText.includes("Reports still required") ||
    !lockedExtraction.debug.clarity.appliedEventIds.includes("locked-extraction-approach")
  ) {
    throw new Error(`Smoke test did not observe locked extraction feedback: ${JSON.stringify(lockedExtraction)}`);
  }

  const expectedFullRunRoomIds = ["lobby", "cubicles", "conference", "records", "elevator"];
  const missingFullRunRoomIds = expectedFullRunRoomIds.filter((roomId) => !fullRunVisitedRoomIds.includes(roomId));
  if (missingFullRunRoomIds.length > 0) {
    throw new Error(`Smoke test did not observe the complete five-room M8 path. Missing: ${missingFullRunRoomIds.join(", ")}; visited: ${fullRunVisitedRoomIds.join(", ")}`);
  }

  const lockedNarratorCount = lockedExtraction.debug.narrator.history
    .filter((entry) => entry.eventId === "locked-extraction")
    .length;
  if (
    lockedNarratorCount !== 1 ||
    lockedExtraction.debug.narrator.blockedCount < 1 ||
    lockedExtraction.narratorText.length < 12
  ) {
    throw new Error(`Smoke test did not observe narrator locked-extraction cooldown behavior: ${JSON.stringify(lockedExtraction)}`);
  }

  if (!afterSecondReport || afterSecondReport.collectedReportCount < 2 || afterSecondReport.extraction.available) {
    throw new Error(`Smoke test did not collect the second report while keeping extraction locked: ${JSON.stringify(afterSecondReport)}`);
  }

  if (
    !afterAllReports.debug ||
    afterAllReports.debug.collectedReportCount < 3 ||
    !afterAllReports.debug.extraction.available ||
    afterAllReports.debug.extraction.completed ||
    !afterAllReports.statusText.includes("File Audit approved") ||
    !afterAllReports.extractionText.includes("Proceed to Complete Check-Out") ||
    afterAllReports.debug.clarity.value >= initialDebug.clarity.value
  ) {
    throw new Error(`Smoke test did not observe extraction availability after all reports: ${JSON.stringify(afterAllReports)}`);
  }

  if (!afterAllReports.debug.narrator.history.some((entry) => entry.eventId === "extraction-approved")) {
    throw new Error(`Smoke test did not observe narrator extraction approval: ${JSON.stringify(afterAllReports)}`);
  }

  if (
    !afterExtractionPrompt.debug ||
    !afterExtractionPrompt.debug.extraction.available ||
    afterExtractionPrompt.debug.extraction.completed ||
    !afterExtractionPrompt.debug.extraction.near ||
    !afterExtractionPrompt.statusText.includes("Press E") ||
    !afterExtractionPrompt.extractionText.includes("Press E")
  ) {
    throw new Error(`Smoke test did not observe explicit extraction prompt: ${JSON.stringify(afterExtractionPrompt)}`);
  }

  if (
    !afterInteractionWin.debug ||
    !afterInteractionWin.debug.extraction.completed ||
    !afterInteractionWin.statusText.includes("Audit filed") ||
    !afterInteractionWin.extractionText.includes("audit filed")
  ) {
    throw new Error(`Smoke test did not observe minimal win state after E interaction: ${JSON.stringify(afterInteractionWin)}`);
  }

  if (
    !afterInteractionWin.debug.narrator.history.some((entry) => entry.eventId === "extraction-complete") ||
    !afterInteractionWin.narratorText.includes("partially received")
  ) {
    throw new Error(`Smoke test did not observe narrator extraction completion: ${JSON.stringify(afterInteractionWin)}`);
  }

  if (
    afterRestart.collectedReportCount !== 0 ||
    afterRestart.uncollectedReportIds.length !== afterRestart.reportTotal ||
    !afterRestart.reportPositions.every((report) => report.visible) ||
    afterRestart.extraction.available ||
    afterRestart.extraction.completed ||
    afterRestart.clarity.value !== afterRestart.clarity.baseline ||
    afterRestart.narrator.currentEventId !== "restart"
  ) {
    throw new Error(`Smoke test did not observe report reset after restart: ${JSON.stringify(afterRestart)}`);
  }

  if (!traversed) {
    throw new Error("Smoke test did not observe movement toward connected rooms.");
  }

  if (consoleMessages.some((message) => message.type === "error") || pageErrors.length > 0) {
    throw new Error(`Browser errors: ${JSON.stringify({ consoleMessages, pageErrors })}`);
  }

  const proof = {
    url: smokeUrl,
    screenshot: ".logs/m9-smoke.png",
    reportScreenshot: ".logs/m9-reports-before.png",
    meetingScreenshot: ".logs/m9-meeting.png",
    visualAssetScreenshot: ".logs/m9-visual-assets.png",
    recordsSignageScreenshot: ".logs/m9-signage.png",
    recordsSignage: recordsLabel,
    signOrientationChecks,
    requiredM9AssetIds,
    loadedM9AssetIds: Array.from(loadedM9AssetIds),
    fullRunVisitedRoomIds,
    initialDebug,
    initialHud,
    afterCollection,
    meetingActive,
    meetingEscaped,
    recordsReview,
    lockedExtraction,
    afterSecondReport,
    afterAllReports,
    afterExtractionPrompt,
    afterInteractionWin,
    debug: afterRestart,
    movementObserved: moved,
    traversalObserved: traversed,
    traversalPosition: afterRoomTraversal?.cameraPosition,
    connectedRoomTraversalObserved: true,
    consoleMessages,
    pageErrors,
    server: `vite createServer API on 127.0.0.1:${smokePort}`
  };

  writeFileSync(resolve(logsDir, "m9-smoke.json"), `${JSON.stringify(proof, null, 2)}\n`);
  console.log("M9 smoke passed. Screenshot: .logs/m9-smoke.png");
} finally {
  await server.close();
}
