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
  await page.waitForTimeout(500);
  await page.screenshot({ path: resolve(logsDir, "m3-2-reports-before.png"), fullPage: true });

  const initialDebug = await page.evaluate(() => window.__TBIF_DEBUG__);
  const initialHud = await page.evaluate(() => ({
    hasHud: Boolean(document.querySelector(".hud")),
    reportText: document.querySelector("[data-hud-report]")?.textContent ?? "",
    statusText: document.querySelector("[data-hud-status]")?.textContent ?? ""
  }));

  const before = await page.evaluate(() => window.__TBIF_DEBUG__?.cameraPosition);
  await page.keyboard.down("w");
  await page.waitForTimeout(900);
  await page.keyboard.up("w");
  const afterMove = await page.evaluate(() => window.__TBIF_DEBUG__?.cameraPosition);

  const afterCollection = await page.evaluate(() => ({
    debug: window.__TBIF_DEBUG__,
    hudText: document.querySelector("[data-hud-report]")?.textContent ?? ""
  }));

  await page.keyboard.down("d");
  await page.waitForTimeout(1900);
  await page.keyboard.up("d");
  const afterRoomTraversal = await page.evaluate(() => window.__TBIF_DEBUG__?.cameraPosition);

  await page.evaluate(() => {
    window.__TBIF_PROOF_CAMERA__?.(
      { x: 6.4, y: 1.65, z: 8.1 },
      { x: 4.05, y: 2.24, z: 8.1 }
    );
  });
  await page.waitForTimeout(250);
  await page.screenshot({ path: resolve(logsDir, "m3-2-records-signage.png"), fullPage: true });

  const screenshotPath = resolve(logsDir, "m3-2-smoke.png");
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
    Math.hypot(afterRoomTraversal.x - afterMove.x, afterRoomTraversal.z - afterMove.z) > 1;

  if (!moved) {
    throw new Error("Smoke test did not observe first-person movement.");
  }

  if (!afterRestart || afterRestart.restartCount < 1) {
    throw new Error("Smoke test did not observe restart flow.");
  }

  if (!initialHud.hasHud || !initialDebug?.hasHud) {
    throw new Error(`Smoke test did not observe HUD on scene load: ${JSON.stringify({ initialHud, initialDebug })}`);
  }

  if (!afterRestart || afterRestart.roomCount < 5 || afterRestart.connectionCount < 4) {
    throw new Error(`Smoke test expected at least 5 rooms and connected room data: ${JSON.stringify(afterRestart)}`);
  }

  if (!initialDebug || initialDebug.reportTotal < 3 || initialDebug.reportPositions.length < 3) {
    throw new Error(`Smoke test expected at least 3 source-defined reports: ${JSON.stringify(initialDebug)}`);
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
    afterRestart.collectedReportCount !== 0 ||
    afterRestart.uncollectedReportIds.length !== afterRestart.reportTotal ||
    !afterRestart.reportPositions.every((report) => report.visible)
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
    screenshot: ".logs/m3-2-smoke.png",
    reportScreenshot: ".logs/m3-2-reports-before.png",
    recordsSignageScreenshot: ".logs/m3-2-records-signage.png",
    recordsSignage: recordsLabel,
    initialDebug,
    initialHud,
    afterCollection,
    debug: afterRestart,
    movementObserved: moved,
    traversalObserved: traversed,
    traversalPosition: afterRoomTraversal,
    connectedRoomTraversalObserved: true,
    consoleMessages,
    pageErrors,
    server: `vite createServer API on 127.0.0.1:${smokePort}`
  };

  writeFileSync(resolve(logsDir, "m3-2-smoke.json"), `${JSON.stringify(proof, null, 2)}\n`);
  console.log("M3.2 smoke passed. Screenshot: .logs/m3-2-smoke.png");
} finally {
  await server.close();
}
