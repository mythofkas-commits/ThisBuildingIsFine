# TASKS.md

## Current Task

Current milestone: M6 - Performance Review narrator system.

Status: Complete as of 2026-05-16.

M2 replaced the single M1 office shell with a source-defined five-room office network, reusable room and prop factories, shared office materials, updated smoke proof, and preserved the M1 movement/camera/restart/HUD foundation.

M2.1 corrective patch completed on 2026-05-16: fixed placeholder report placement and added deterministic movement collision for walls and major collidable props while preserving intended doorway traversal.

M3 replaced the single placeholder report with three source-defined Incident Reports, proximity collection, HUD count/status updates, restart reset behavior, and browser smoke proof.

M3.1 corrective patch completed on 2026-05-16: reduced and raised procedural wall signage, moved records-room messaging off the south doorway path, and added records-signage smoke proof while preserving M3 collection behavior.

M3.2 stability guardrail patch completed on 2026-05-16: added `STABILITY.md`, static project validation, `npm run validate`, `npm run verify`, and non-brittle smoke contracts for the working M1-M3 foundation.

M4 completed on 2026-05-16: added source-driven elevator extraction, all-report gating, locked/available/complete HUD feedback, minimal win state, restart reset, smoke proof, and updated stability coverage.

M4.1 corrective patch completed on 2026-05-16: replaced ambiguous passive extraction with a clear `E` interaction at the approved elevator, updated HUD prompts, and expanded smoke proof for locked, unlocked, win, and restart reset states.

M5 completed on 2026-05-16: added source-driven Clarity state, HUD Clarity display, subtle Clarity changes from existing events, restart reset, static validation, and smoke proof while preserving M1-M4 contracts.

M6 completed on 2026-05-16: added a source-driven Performance Review narrator, calm bureaucratic message pools, HUD narrator line, event cooldowns, smoke proof, and stability coverage while preserving M1-M5 contracts.

## Next Task

Next milestone: M7 - The Meeting hazard.

When approved for M7, add The Meeting hazard. Do not add AI assets, enemies, combat, inventory, multiplayer, voice audio, text-to-speech, jumpscares, gore, dark horror lighting, or chase behavior.

Every future milestone must run `npm run verify` before claiming pass. If a milestone intentionally changes a locked behavior contract, update `STABILITY.md`, the relevant validation/smoke checks, and the milestone log with the reason.

## Milestones

### M0 - Planning Files Only

Status: Complete.

Acceptance criteria:
- `PLAN.md` exists.
- `AGENTS.md` exists.
- `TOOLING.md` exists.
- `ASSET_PIPELINE.md` exists.
- `EVALS.md` exists.
- `DECISIONS.md` exists.
- `TASKS.md` exists.
- `asset_manifest.json` exists and parses as JSON.
- `.logs/README.md` exists.
- `.prompts/visual_style.md` exists.
- `.prompts/narrator_voice.md` exists.
- `.prompts/environment_assets.md` exists.
- `.prompts/office_props.md` exists.
- `.prompts/abstract_entities.md` exists.
- No game scaffold files exist.
- No dependencies are installed.
- No source code is created.
- No assets are created.

Verification command or proof:
- `rg --files`
- JSON parse command for `asset_manifest.json`
- Search `TASKS.md` for current milestone M0 and next milestone M1.
- Inspect root for absence of `package.json`, `src`, `public`, `vite.config.*`, and asset folders.

### M1 - Minimal 3D Scene + Movement + Camera

Status: Complete.

Acceptance criteria:
- Babylon.js + TypeScript + Vite scaffold exists. Complete.
- A minimal 3D office test scene renders. Complete.
- First-person camera exists. Complete.
- Player can move and look around. Complete.
- Browser smoke test captures nonblank scene proof. Complete.

Verification command or proof:
- `npm install`
- `npm run check`
- `npm run build`
- `npm run smoke`
- `.logs/m1-smoke.png`
- `.logs/m1-smoke.json`
- `.logs/m1.md`

### M2 - Modular Office Room System

Status: Complete. M2.1 corrective patch complete.

Acceptance criteria:
- Rooms are generated from source data. Complete.
- At least five small room modules can be assembled. Complete.
- Hallways and doors connect clearly. Complete.
- No manual placement is required. Complete.

Verification command or proof:
- `npm run check`
- `npm run build`
- `npm run smoke`
- `.logs/m2-smoke.png`
- `.logs/m2-smoke.json`
- `.logs/m2.md`
- `.logs/m2-1-smoke.png`
- `.logs/m2-1-report.png`
- `.logs/m2-1-smoke.json`
- `.logs/m2-1.md`

### M3 - Incident Report Collectible + HUD

Status: Complete.

Acceptance criteria:
- Incident Reports spawn in rooms. Complete: IR-01 lobby, IR-02 cubicles, IR-03 elevator.
- Player can collect reports. Complete.
- HUD shows collected count and total. Complete.
- Collecting a report updates HUD/status. Complete.
- Collected reports disappear clearly. Complete.
- Restart resets collected reports. Complete.
- Movement, collision, and room traversal still work. Complete.
- Collectibles are readable and styled as office paperwork. Complete.

Verification command or proof:
- `npm run check`
- `npm run build`
- `npm run smoke`
- `.logs/m3-reports-before.png`
- `.logs/m3-smoke.png`
- `.logs/m3-smoke.json`
- `.logs/m3.md`
- `.logs/m3-1-smoke.png`
- `.logs/m3-1-records-signage.png`
- `.logs/m3-1-smoke.json`
- `.logs/m3-1.md`
- `STABILITY.md`
- `npm run validate`
- `npm run verify`
- `.logs/m3-2-smoke.png`
- `.logs/m3-2-smoke.json`
- `.logs/m3-2.md`

### M4 - Extraction Elevator + Win/Restart Loop

Status: Complete.

Acceptance criteria:
- Elevator appears as extraction point. Complete.
- Extraction zone is source-defined in the elevator room. Complete.
- Extraction is locked before all reports are collected. Complete.
- HUD/status explains that reports are still required. Complete.
- Extraction becomes available after all 3 Incident Reports. Complete.
- Approaching active extraction triggers minimal win state. Complete.
- M4.1: Active extraction displays `Press E` and pressing `E` near the approved elevator triggers the minimal win state. Complete.
- Restart resets reports, extraction, win state, HUD, and player position. Complete.
- Movement, collision, room traversal, and M1-M3 stability contracts still pass. Complete.

Verification command or proof:
- `npm run check`
- `npm run build`
- `npm run validate`
- `npm run smoke`
- `npm run verify`
- `.logs/m4-smoke.json`
- `.logs/m4-smoke.png`
- `.logs/m4-reports-before.png`
- `.logs/m4.md`
- `.logs/m4-1-smoke.json`
- `.logs/m4-1-smoke.png`
- `.logs/m4-1-reports-before.png`
- `.logs/m4-1-records-signage.png`
- `.logs/m4-1.md`

### M5 - Clarity Meter

Status: Complete.

Acceptance criteria:
- Clarity appears on HUD. Complete.
- Clarity can decrease. Complete.
- Low Clarity changes signs, labels, HUD reliability, or messages. Complete: M5 adds dry status-message changes and HUD state labels.
- The effect is surreal and funny-unsettling, not horror. Complete.
- Restart restores Clarity to baseline. Complete.
- Existing report collection, extraction, movement, collision, room traversal, and restart contracts still pass. Complete.

Verification command or proof:
- `npm run check`
- `npm run build`
- `npm run validate`
- `npm run smoke`
- `npm run verify`
- `.logs/m5-smoke.json`
- `.logs/m5-smoke.png`
- `.logs/m5-reports-before.png`
- `.logs/m5-records-signage.png`
- `.logs/m5.md`

### M6 - Performance Review Narrator System

Status: Complete.

Acceptance criteria:
- Narrator reacts to existing events. Complete: report collection, Clarity changes, locked extraction, extraction approval, extraction completion, restart, and selected room entry.
- Messages are dry, bureaucratic, calm, and sometimes misleading. Complete.
- No horror voice direction. Complete.
- Narrator has cooldown/rate-limiting. Complete.
- Existing M1-M5 systems still pass. Complete.

Verification command or proof:
- `npm run check`
- `npm run build`
- `npm run validate`
- `npm run smoke`
- `npm run verify`
- `.logs/m6-smoke.json`
- `.logs/m6-smoke.png`
- `.logs/m6-reports-before.png`
- `.logs/m6-records-signage.png`
- `.logs/m6.md`

### M7 - The Meeting Hazard

Acceptance criteria:
- A self-scheduling conference-room event can occur.
- Chairs, tables, agendas, or projector screens rearrange around the player.
- Hazard creates spatial/puzzle pressure.
- No monster, chase, gore, jump scare, or panic horror behavior.

Verification command or proof:
- Build passes.
- Browser screenshot sequence or playtest notes prove hazard behavior.

### M8 - First Complete 5-Room Run

Acceptance criteria:
- Player can complete a full five-room run.
- Reports, Clarity, Performance Review, The Meeting, elevator extraction, win, fail, and restart all work together.

Verification command or proof:
- Build passes.
- Browser smoke test completes a run.

### M9 - AI-Generated Visual Assets/Textures

Acceptance criteria:
- Generated or requested assets follow prompt files.
- Assets are tracked in `asset_manifest.json`.
- Assets load in-game.
- Placeholders remain replaceable.

Verification command or proof:
- Build passes.
- Manifest validation.
- Browser screenshot proof.

### M10 - Polish, Screenshots, Browser Smoke Tests

Acceptance criteria:
- Core MVP has a polish pass.
- Screenshots cover key states.
- Browser smoke tests cover launch, movement, collection, extraction, fail, and restart.
- Performance is acceptable for desktop browser.

Verification command or proof:
- Build passes.
- Smoke test artifacts.
- Screenshot set.

### M11 - First Playable Vertical Slice

Acceptance criteria:
- Director can play a complete vertical slice.
- Tone matches surreal corporate mystery.
- Systems are documented enough for the next milestone set.

Verification command or proof:
- Build passes.
- Playable local URL or packaged artifact.
- Director acceptance notes.

## Do Not Do Yet

- Do not scaffold Vite before M1.
- Do not install dependencies before M1.
- Do not create source code in M0.
- Do not add assets in M0.
- Do not add inventory.
- Do not add combat.
- Do not add complex enemies.
- Do not add multiplayer.
- Do not add large open worlds.
- Do not add realistic humans.
- Do not add cinematic cutscenes.
- Do not add dark horror, gore, jump scares, or oppressive survival horror.
- Do not add advanced asset work before M9.
