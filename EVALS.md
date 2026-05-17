# EVALS.md

## Purpose

Evals define how Codex proves each milestone works. Every milestone should end with short evidence: commands run, screenshots or logs observed, failures found, and anything not verified.

## M0 - Planning Files Only

Acceptance:
- All requested planning files exist.
- `asset_manifest.json` parses as valid JSON.
- `TASKS.md` says current milestone is M0 and next milestone is M1.
- No game scaffold files exist.
- No dependencies are installed.
- No source code is created.
- No assets are created.

Verification:
- `rg --files`
- JSON parse command.
- Exact search in `TASKS.md`.
- Directory inspection for forbidden scaffold files.

## Build Checks

Start in M1.

Required once a scaffold exists:
- Dependency install completes.
- TypeScript build passes.
- Vite production build passes.
- No browser console errors during smoke test.

M0:
- Not applicable.

## Browser and Playtest Checks

Start in M1.

Required checks:
- Local dev server opens.
- Canvas is visible and nonblank.
- Player can move and look.
- HUD appears when introduced.
- Win, fail, and restart flows work when introduced.

M0:
- Not applicable.

## Screenshot Checks

Start in M1.

Required checks:
- Desktop screenshot of current milestone.
- Canvas is not blank.
- Important UI text fits.
- Scene is framed correctly.
- Visual tone remains office-surreal, not horror.

## Asset Checks

Start in M9 for generated assets, earlier only for procedural placeholders.

Required checks:
- Asset is listed in `asset_manifest.json`.
- Source prompt exists.
- Asset loads from source path.
- Scale is correct.
- Style matches prompt.
- Placeholder replacement is recorded.

## Performance Checks

Start in M1, remain lightweight until M10.

Targets:
- Smooth desktop browser interaction.
- No runaway mesh creation.
- No unbounded timers or event listeners.
- No obvious memory leak during short playtest.
- Keep MVP geometry simple and batched where practical.

## Gameplay-Feel Checks

Required from M3 onward:
- Exploration is understandable.
- Incident Reports are noticeable.
- The extraction choice is clear.
- The player is curious rather than constantly scared.
- Failure states are readable and restartable.

## Tone Checks

Required from every content milestone:
- Dry, calm, bureaucratic voice.
- Strange and uncanny without gore or jump scares.
- Quiet tension rather than panic.
- Comedy is understated.
- The building feels sensitive and bureaucratic, not evil.

## Milestone Acceptance Summary

- M1: Minimal 3D scene, first-person camera, movement, browser proof.
- M2: Modular office rooms generated from source data.
- M3: Incident Report collectible and HUD counter.
- M4: Extraction elevator, win flow, restart flow.
- M5: Clarity meter changes gameplay feedback.
- M6: Performance Review narrator reacts to player behavior.
- M7: The Meeting creates spatial/puzzle pressure without monster behavior.
- M8: Complete five-room run works end to end with reports, Clarity, Performance Review, The Meeting, File Audit completion, and restart covered by smoke proof.
- M9: Generated visual assets/textures appear in-game and are tracked.
- M10: Polish pass, screenshots, smoke tests, performance sanity.
- M11: First playable vertical slice accepted by director.
