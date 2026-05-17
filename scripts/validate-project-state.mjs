import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function requireFile(path) {
  if (!existsSync(join(root, path))) {
    fail(`Missing required file: ${path}`);
  }
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(join(root, path), "utf8"));
  } catch (error) {
    fail(`Unable to parse ${path}: ${error.message}`);
    return null;
  }
}

function readText(path) {
  try {
    return readFileSync(join(root, path), "utf8");
  } catch (error) {
    fail(`Unable to read ${path}: ${error.message}`);
    return "";
  }
}

function walk(dir, ignored = new Set([".git", ".osgrep", "node_modules", "dist"])) {
  const absolute = join(root, dir);
  if (!existsSync(absolute)) {
    return [];
  }

  return readdirSync(absolute).flatMap((entry) => {
    if (ignored.has(entry)) {
      return [];
    }

    const fullPath = join(absolute, entry);
    const relativePath = relative(root, fullPath).replaceAll("\\", "/");
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return [relativePath, ...walk(relativePath, ignored)];
    }

    return [relativePath];
  });
}

[
  "STABILITY.md",
  "package.json",
  "index.html",
  "vite.config.ts",
  "tsconfig.json",
  "src/main.ts",
  "src/game/createGame.ts",
  "src/game/player.ts",
  "src/game/gameState.ts",
  "src/game/hud.ts",
  "src/game/officeScene.ts",
  "src/game/navigation/collision.ts",
  "src/game/rooms/roomData.ts",
  "src/game/rooms/createRoom.ts",
  "src/game/rooms/createRoomNetwork.ts",
  "src/game/collectibles/incidentReports.ts",
  "src/game/collectibles/createIncidentReports.ts",
  "src/game/clarity/clarityState.ts",
  "src/game/clarity/updateClarity.ts",
  "src/game/narrator/narratorMessages.ts",
  "src/game/narrator/narratorState.ts",
  "src/game/narrator/updateNarrator.ts",
  "src/game/meeting/meetingTypes.ts",
  "src/game/meeting/meetingState.ts",
  "src/game/meeting/createMeetingHazard.ts",
  "src/game/meeting/updateMeetingHazard.ts",
  "src/game/extraction/extractionState.ts",
  "src/game/extraction/createExtractionZone.ts",
  "scripts/smoke.mjs",
  "scripts/generate-procedural-textures.mjs",
  ".prompts/textures/m9-office-materials.md",
  ".prompts/posters/m9-policy-signage.md",
  "public/assets/textures/generated/m9-office-carpet.png",
  "public/assets/textures/generated/m9-wall-subtle-variation.png",
  "public/assets/textures/generated/m9-ceiling-tile-light-panel.png",
  "public/assets/textures/generated/m9-elevator-checkout-panel.png",
  "public/assets/textures/generated/m9-incident-report-paper.png",
  "public/assets/textures/generated/m9-clarity-abstract-overlay.png",
  "public/assets/posters/generated/m9-policy-poster-hallway.svg",
  "public/assets/posters/generated/m9-policy-poster-meeting.svg",
  "public/assets/posters/generated/m9-policy-poster-records.svg",
  "public/assets/posters/generated/m9-meeting-agenda-card.svg"
].forEach(requireFile);

const packageJson = readJson("package.json");
if (packageJson) {
  ["check", "build", "smoke", "validate", "verify"].forEach((scriptName) => {
    if (!packageJson.scripts?.[scriptName]) {
      fail(`Missing npm script: ${scriptName}`);
    }
  });
}

const roomData = readText("src/game/rooms/roomData.ts");
["lobby", "cubicles", "conference", "records", "elevator"].forEach((roomId) => {
  if (!roomData.includes(`id: "${roomId}"`)) {
    fail(`Missing required room ID in roomData.ts: ${roomId}`);
  }
});

const reportData = readText("src/game/collectibles/incidentReports.ts");
const reportIds = [...reportData.matchAll(/id:\s+"(IR-\d+)"/g)].map((match) => match[1]);
if (reportIds.length < 3) {
  fail(`Expected at least 3 Incident Report definitions, found ${reportIds.length}.`);
}

["IR-01", "IR-02", "IR-03"].forEach((reportId) => {
  if (!reportIds.includes(reportId)) {
    fail(`Missing required Incident Report ID: ${reportId}`);
  }
});

const extractionData = readText("src/game/extraction/extractionState.ts");
if (!extractionData.includes('id: "elevator-extraction"')) {
  fail("Missing required extraction zone ID: elevator-extraction");
}

if (!extractionData.includes('roomId: "elevator"')) {
  fail("Extraction zone must remain associated with the elevator room for M4.");
}

const clarityData = readText("src/game/clarity/clarityState.ts");
if (!clarityData.includes("clarityBaseline = 100")) {
  fail("M5 Clarity must start at company baseline 100.");
}

if (!clarityData.includes('"incident-report-filed"')) {
  fail("M5 Clarity must include a source-driven Incident Report event.");
}

const narratorData = readText("src/game/narrator/narratorMessages.ts");
[
  "report-collected",
  "clarity-changed",
  "locked-extraction",
  "extraction-approved",
  "extraction-complete",
  "restart"
].forEach((eventId) => {
  if (!narratorData.includes(`"${eventId}"`)) {
    fail(`M6 narrator must include source-driven event: ${eventId}`);
  }
});

const narratorUpdate = readText("src/game/narrator/updateNarrator.ts");
if (!narratorUpdate.includes("cooldownFrames")) {
  fail("M6 narrator must include cooldown/rate-limit behavior.");
}

const meetingState = readText("src/game/meeting/meetingState.ts");
[
  'id: "the-meeting"',
  'roomId: "conference"',
  "exposureFramesForClarity"
].forEach((requiredText) => {
  if (!meetingState.includes(requiredText)) {
    fail(`M7 Meeting state must include source-driven contract: ${requiredText}`);
  }
});

const meetingCreate = readText("src/game/meeting/createMeetingHazard.ts");
[
  "createMeetingHazard",
  "meeting-chair",
  "meeting-agenda",
  "addDynamicMesh"
].forEach((requiredText) => {
  if (!meetingCreate.includes(requiredText)) {
    fail(`M7 Meeting hazard must create source-driven office pressure objects: ${requiredText}`);
  }
});

const meetingUpdate = readText("src/game/meeting/updateMeetingHazard.ts");
[
  "updateMeetingHazard",
  "meeting-exposure",
  "meeting-noticed",
  "meeting-escaped"
].forEach((requiredText) => {
  if (!meetingUpdate.includes(requiredText)) {
    fail(`M7 Meeting hazard must include activation, escape, and Clarity behavior: ${requiredText}`);
  }
});

if (meetingUpdate.match(/chase|enemy|monster|combat|damage|death/i)) {
  fail("M7 Meeting hazard must remain an event, not a chase enemy, combatant, or fail-state monster.");
}

const roomCreation = readText("src/game/rooms/createRoom.ts");
[
  "m8-wayfinding-lobby",
  "m8-wayfinding-cubicles",
  "m8-wayfinding-conference",
  "m8-wayfinding-records",
  "m8-wayfinding-elevator"
].forEach((requiredText) => {
  if (!roomCreation.includes(requiredText)) {
    fail(`M8 complete run must include source-driven wayfinding marker: ${requiredText}`);
  }
});

const smokeScript = readText("scripts/smoke.mjs");
[
  "fullRunVisitedRoomIds",
  "m9-smoke.json",
  "m9-meeting.png",
  "m9-signage.png",
  "m9-visual-assets.png",
  "signOrientationChecks",
  "requiredM9AssetIds",
  "File Audit approved",
  "Proceed to Complete Check-Out"
].forEach((requiredText) => {
  if (!smokeScript.includes(requiredText)) {
    fail(`M9 smoke must prove complete-run integration, sign readability, and visual asset loading: ${requiredText}`);
  }
});

const officeProps = readText("src/game/props/createOfficeProps.ts");
[
  "DEFAULT_WALL_SIGN_OFFSET",
  "wallOffsetApplied",
  "facingNormal",
  "backFaceCulling = true",
  "createWallTextureSign"
].forEach((requiredText) => {
  if (!officeProps.includes(requiredText)) {
    fail(`M8.1 wall sign factory must prevent z-fighting and mirrored backface text: ${requiredText}`);
  }
});

const materialFactory = readText("src/game/materials/createOfficeMaterials.ts");
[
  "m9-office-carpet",
  "m9-wall-subtle-variation",
  "m9-ceiling-tile-light-panel",
  "m9-elevator-checkout-panel",
  "m9-incident-report-paper"
].forEach((assetId) => {
  if (!materialFactory.includes(assetId)) {
    fail(`M9 office materials must load generated/procedural asset: ${assetId}`);
  }
});

[
  "m9-policy-poster-hallway",
  "m9-policy-poster-meeting",
  "m9-policy-poster-records",
  "m9-meeting-agenda-card",
  "m9-clarity-abstract-overlay"
].forEach((assetId) => {
  if (!roomCreation.includes(assetId) && !officeProps.includes(assetId)) {
    fail(`M9 room/prop creation must place generated/procedural visual asset: ${assetId}`);
  }
});

const assetManifest = readJson("asset_manifest.json");
if (assetManifest) {
  const requiredFields = assetManifest.required_fields ?? [];
  const allowedStatuses = new Set(assetManifest.allowed_statuses ?? []);
  const manifestItems = [...(assetManifest.assets ?? []), ...(assetManifest.placeholders ?? [])];
  const m9AssetIds = [
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

  manifestItems.forEach((item) => {
    requiredFields.forEach((field) => {
      if (!(field in item)) {
        fail(`Asset manifest entry ${item.id ?? "(missing id)"} missing required field: ${field}`);
      }
    });
    if (item.status && !allowedStatuses.has(item.status)) {
      fail(`Asset manifest entry ${item.id} uses unsupported status: ${item.status}`);
    }
    if (item.source_path && !String(item.source_path).startsWith("mesh:") && !String(item.source_path).startsWith("dom:") && !existsSync(join(root, item.source_path))) {
      fail(`Asset manifest entry ${item.id} source_path does not exist: ${item.source_path}`);
    }
    if (item.prompt_ref && !existsSync(join(root, item.prompt_ref))) {
      fail(`Asset manifest entry ${item.id} prompt_ref does not exist: ${item.prompt_ref}`);
    }
  });

  m9AssetIds.forEach((assetId) => {
    const item = manifestItems.find((candidate) => candidate.id === assetId);
    if (!item) {
      fail(`M9 asset missing from asset_manifest.json: ${assetId}`);
      return;
    }
    if (item.source_type !== "local_procedural_placeholder") {
      fail(`M9 asset ${assetId} must honestly report local_procedural_placeholder source_type.`);
    }
    if (!item.validation || item.validation.status !== "validated") {
      fail(`M9 asset ${assetId} must include validated manifest validation.`);
    }
  });
}

const playerFacingText = [
  readText("src/game/extraction/extractionState.ts"),
  readText("src/game/extraction/createExtractionZone.ts"),
  readText("src/game/hud.ts"),
  readText("src/game/narrator/narratorMessages.ts"),
  readText("src/game/rooms/roomData.ts")
].join("\n");

[
  "Extraction approved",
  "Extraction unavailable",
  "Extraction Elevator",
  "EXTRACTION",
  "Proceed to elevator",
  "approved extraction"
].forEach((forbiddenText) => {
  if (playerFacingText.includes(forbiddenText)) {
    fail(`M8 player-facing text should avoid tactical extraction wording: ${forbiddenText}`);
  }
});

const allPaths = walk(".");
const forbiddenEngineMarkers = allPaths.filter((path) => {
  const lower = path.toLowerCase();
  return (
    lower.endsWith(".uproject") ||
    lower.endsWith(".uplugin") ||
    lower.endsWith(".umap") ||
    lower.endsWith(".uasset") ||
    lower.endsWith(".unity") ||
    lower.endsWith(".prefab") ||
    lower === "project.godot" ||
    lower.endsWith("/project.godot") ||
    lower === "projectsettings" ||
    lower.startsWith("projectsettings/")
  );
});

if (forbiddenEngineMarkers.length > 0) {
  fail(`Unity/Godot/Unreal project markers are not allowed in the current stack: ${forbiddenEngineMarkers.join(", ")}`);
}

const prematureFeaturePatterns = [
  /(^|\/)(inventory|combat|enemy|enemies|multiplayer)(\/|\.|$)/i
];

const prematureFiles = allPaths
  .filter((path) => path.startsWith("src/") || path.startsWith("scripts/"))
  .filter((path) => prematureFeaturePatterns.some((pattern) => pattern.test(path)));

if (prematureFiles.length > 0) {
  fail(`Obvious future-milestone feature files exist before their approved milestone: ${prematureFiles.join(", ")}`);
}

const stability = readText("STABILITY.md");
[
  "Movement And Camera",
  "Restart Flow",
  "Five-Room Modular Layout",
  "Room Connectivity",
  "Collision And Walkable Behavior",
  "Incident Report System",
  "HUD Behavior",
  "Sign Readability",
  "Extraction And Win Loop",
  "Clarity System",
  "Performance Review Narrator",
  "The Meeting Hazard",
  "Complete Five-Room Run",
  "Tone Constraints",
  "AI-Only Workflow"
].forEach((heading) => {
  if (!stability.includes(heading)) {
    fail(`STABILITY.md is missing contract section: ${heading}`);
  }
});

if (failures.length > 0) {
  console.error("Project state validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Project state validation passed.");
console.log(`Checked ${allPaths.length} project paths from ${pathToFileURL(root).href}`);
