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
  "src/game/extraction/extractionState.ts",
  "src/game/extraction/createExtractionZone.ts",
  "scripts/smoke.mjs"
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
  /(^|\/)(performance-review|performanceReview|narrator|buildingVoice)(\/|\.|$)/i,
  /(^|\/)(meeting|theMeeting)(\/|\.|$)/i,
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
  "Extraction And Win Loop",
  "Clarity System",
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
