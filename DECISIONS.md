# DECISIONS.md

## Decision Log

Record durable technical, design, and workflow decisions here. Keep entries short and auditable.

## D001 - Use Babylon.js + TypeScript + Vite For MVP

Status: Accepted

Context:
The project must be developed by Codex as autonomously as possible. Manual scene editors, hidden inspector state, manual imports, visual scripting graphs, and binary scene workflows are high-risk.

Decision:
Use Babylon.js + TypeScript + Vite as the default stack for the MVP.

Rationale:
- Scenes and gameplay can be authored in source files.
- Procedural geometry can cover the MVP.
- Browser playtests and screenshots can be automated.
- Vite build commands are repeatable.
- TypeScript supports safer autonomous refactoring.

Consequences:
- Codex must build lightweight game architecture in source.
- Visual fidelity starts stylized and procedural.
- Generated assets are deferred until the loop works.

## D002 - Procedural Geometry Before Generated Assets

Status: Accepted

Context:
The MVP needs fast iteration and reliable verification.

Decision:
Use procedural geometry and simple materials for M1-M8. Introduce AI-generated visual assets/textures in M9.

Rationale:
- Avoids asset blockers early.
- Keeps scale and collision deterministic.
- Lets gameplay prove itself before polish.

Consequences:
- Early visuals will be intentionally simple.
- All placeholders must be tracked and replaceable.

## D003 - Tone Is Surreal Mystery, Not Horror

Status: Accepted

Context:
The game has light thriller elements but must not become dark horror, panic horror, gore, monster horror, jump-scare horror, or oppressive survival horror.

Decision:
All systems must support uncanny corporate absurdism, dry comedy, and quiet tension.

Rationale:
- The core identity is curious, suspicious, and funny-unsettling.
- Horror escalation would undermine the intended player experience.

Consequences:
- The Meeting must be spatial and bureaucratic, not a monster.
- Clarity loss must feel surreal and unreliable, not madness horror.
- Narrator text must remain calm and corporate.

## D004 - Human Is Director And Judge

Status: Accepted

Context:
The workflow should be AI-only as much as possible.

Decision:
Codex owns implementation, verification, screenshots, logs, task tracking, and documentation. The human approves direction, judges results, and grants permissions when needed.

Rationale:
- Minimizes repetitive manual work.
- Keeps progress auditable.

Consequences:
- Prefer scripts, manifests, prompts, and browser automation.
- Stop only for approval, credentials, paid API use, or system-level blockers.

## D005 - Use DOM HUD For Early Milestones

Status: Accepted

Context:
M1 needs basic HUD text and restart flow, but does not need a fully diegetic in-world UI or Babylon GUI complexity yet.

Decision:
Use a source-driven DOM HUD overlay for M1.

Rationale:
- Easy to inspect, style, and test with browser automation.
- Keeps Babylon scene code focused on the 3D foundation.
- Avoids editor or asset work.

Consequences:
- Later milestones can either keep the DOM HUD or migrate selected elements into the 3D world when gameplay requires it.

## D006 - Browser Smoke Uses Vite JS API And Local Chrome/Edge

Status: Accepted

Context:
M1 needs browser proof without manual launch steps or global tooling.

Decision:
Use a local `scripts/smoke.mjs` script that starts Vite through its JavaScript API and drives an installed local Chrome or Edge executable through `playwright-core`.

Rationale:
- Avoids global Playwright browser installation.
- Closes the dev server deterministically after the smoke test.
- Produces screenshot and JSON proof under `.logs/`.

Consequences:
- Smoke tests require a local Chrome or Edge executable.

## D007 - Define Rooms As TypeScript Data

Status: Accepted

Context:
M2 needs a modular office room system that Codex can expand without manual scene-building or hidden editor state.

Decision:
Represent the first office floor as TypeScript room definitions in `src/game/rooms/roomData.ts`, rendered by reusable room, prop, and material factories.

Rationale:
- The room network is inspectable in source control.
- Future milestones can add rooms, placements, labels, and connections by editing data.
- Browser smoke tests can verify room count and connection metadata.

Consequences:
- Early layouts remain simple and grid-like.
- More advanced procedural variation is deferred until a later milestone explicitly requires it.

## D008 - Use Deterministic AABB Movement Collision For M2

Status: Accepted

Context:
Manual M2 playtest showed that direct camera position movement ignored Babylon mesh collision flags, allowing the player to walk through walls and props.

Decision:
Use a lightweight source-driven AABB collision resolver derived from collidable procedural meshes. Movement resolves X and Z axes separately to preserve the existing feel while blocking walls and major props.

Rationale:
- Avoids adding a physics dependency.
- Keeps collision behavior inspectable and deterministic.
- Preserves source-driven room and prop generation.

Consequences:
- Collision is intentionally simple and axis-aligned for now.
- Future non-rectangular props or moving hazards may need additional blocker metadata.

## D009 - Define Incident Reports As Source-Driven Collectibles

Status: Accepted

Context:
M3 needs real collectible behavior without manual object placement, hidden editor state, inventory systems, or later milestone mechanics.

Decision:
Define Incident Reports in TypeScript data and instantiate them through a dedicated collectible factory. Track collected state in `GameState`, expose counts to the DOM HUD, and verify collection/restart behavior through browser smoke proof.

Rationale:
- Report IDs, room association, placement, labels, and flavor text stay inspectable.
- Future milestones can gate extraction or alter reports without hardcoding behavior into room creation.
- Keeps reports non-collidable while preserving wall and hard-object collision from M2.1.

Consequences:
- M3 uses proximity collection only; no inventory or detailed document reader exists yet.
- Extraction gating and win behavior remain deferred to M4.

## D010 - Add Source-Driven Elevator Extraction For M4

Status: Accepted

Context:
M4 needs a minimal extraction/win loop without adding inventory, complex elevator animation, cutscenes, or later milestone systems.

Decision:
Define a source-driven extraction zone in the elevator room and gate completion on all required Incident Reports being collected. Use restrained HUD/status text and a small procedural marker/sign to communicate locked, available, and complete states.

Rationale:
- Keeps extraction inspectable in TypeScript data and factory modules.
- Preserves M1-M3 stability contracts while completing the first run loop.
- Avoids hidden editor state and manual placement.

Consequences:
- Extraction is proximity-based for now.
- The win state is intentionally minimal and HUD-driven.
- More elaborate elevator behavior or end-of-run scoring is deferred until explicitly approved.

## D011 - Use Explicit Elevator Interaction For M4.1 Extraction

Status: Accepted

Context:
Manual M4 playtest showed that standing in the extraction zone after collecting all reports did not clearly or reliably trigger the win state. The HUD text implied passive behavior without telling the player exactly how to complete extraction.

Decision:
Use `E` as the explicit interaction key for approved extraction. The elevator remains locked before all Incident Reports are collected, becomes available after all required reports, and completes the audit only when the player is near the elevator and presses `E`.

Rationale:
- Makes the completion action unambiguous for manual play.
- Keeps extraction source-driven and easy to smoke test.
- Avoids adding a larger interaction or inventory system before it is needed.

Consequences:
- M4.1 smoke proof must verify the locked state, unlocked prompt, `E` interaction, win state, and restart reset.
- Future interaction work may replace this with a shared interaction module if a later milestone needs it.

## D012 - Add Non-Punitive Source-Driven Clarity For M5

Status: Accepted

Context:
M5 needs a psychological/surreal meter without introducing fail states, horror pressure, or punitive survival mechanics.

Decision:
Add Clarity as source-driven game state starting at 100. Existing events can lower it slightly: filing Incident Reports, entering selected strange rooms, and approaching locked extraction. Restart restores Clarity to company baseline.

Rationale:
- Makes the building feel bureaucratically unstable without darkening the game.
- Keeps the system inspectable and easy to expand for M6+.
- Uses existing player actions instead of adding new mechanics before they are approved.

Consequences:
- M5 does not add a Clarity fail condition.
- HUD and status messages communicate Clarity changes in a calm, dry voice.
- Future low-Clarity sign contradictions or HUD unreliability can build on the Clarity state.

## D013 - Add Source-Driven Performance Review Narrator For M6

Status: Accepted

Context:
M6 needs the building to gain a dry, calm, bureaucratic voice without adding audio, text-to-speech, hazards, enemies, or new M7+ gameplay systems.

Decision:
Add a dedicated narrator subsystem with source-defined event message pools, frame-based cooldowns, a short emission history, and a HUD narrator line separate from the core gameplay status. The narrator reacts to existing events: report collection, Clarity changes, locked extraction attempts, extraction approval, extraction completion, restart, and selected room entries.

Rationale:
- Keeps the voice inspectable and deterministic for smoke testing.
- Preserves existing report, Clarity, extraction, and restart status behavior.
- Prevents repeated frame-level triggers from spamming the player.

Consequences:
- M6 adds text-only narrator messages, not voice audio.
- Future Performance Review rules can extend event pools and trigger conditions without rewriting M1-M5 systems.
- M7 The Meeting remains deferred.

## D014 - Add The Meeting As A Source-Driven Spatial Event For M7

Status: Accepted

Context:
M7 needs the first surreal hazard without introducing enemies, combat, chase behavior, dark horror, voice audio, generated assets, or manual scene placement.

Decision:
Add The Meeting as a dedicated source-driven conference-room event. It owns inspectable state, a source-defined trigger zone, procedural office objects, dynamic collision blockers, HUD feedback, narrator events, subtle one-time Clarity exposure, escape behavior, and smoke-test proof.

Rationale:
- Keeps the hazard expandable without turning it into a creature or AI enemy.
- Uses procedural chairs, a side table, and an agenda panel already compatible with the office style.
- Preserves AI-only authoring because all positions, messages, collision, and verification live in source and scripts.
- Spatial pressure stays readable because the arrangement is partial and leaving the zone releases the event.

Consequences:
- Movement collision now supports registered dynamic blockers for source-driven moving office objects.
- The Meeting becomes a locked M7 stability contract.
- Future M8 run integration can use the same Meeting zone without rewriting the M1-M6 systems.

## D015 - Treat M8 As Integration And Pacing, Not A New System

Status: Accepted

Context:
M8 needs the first complete five-room run to work end to end with all approved systems active, but it must not add M9 assets, new hazards, enemies, combat, inventory, or future milestone systems.

Decision:
Keep M8 to integration: add small source-driven wayfinding signs in the existing five rooms, tune player-facing check-out wording from tactical extraction language to File Audit / Complete Check-Out, and expand browser smoke proof so it records all five room IDs plus report collection, Meeting behavior, Records visit, File Audit completion, and restart.

Rationale:
- The approved systems already exist; M8 should prove the loop, not expand scope.
- File Audit / Complete Check-Out wording better matches the corporate-audit fantasy.
- Source-driven signs preserve the AI-only workflow and avoid manual placement.

Consequences:
- Internal M4 extraction module names remain in code for continuity, but player-facing text avoids extraction wording.
- M8 smoke becomes the integration proof for the complete five-room run.
- M9 remains the first approved milestone for generated visual assets/textures.

## D016 - Offset Wall Signs And Render Only Readable Front Faces

Status: Accepted

Context:
Manual M8 playtest found that wall signs flickered and sometimes appeared mirrored or backwards. The behavior looked like z-fighting and backface readability, not intentional surrealism.

Decision:
Centralize wall-sign placement in the sign helper: offset wall signs a few centimeters along their readable facing normal, keep sign planes non-collidable, and enable backface culling so mirrored backside text is not used as the readable surface. Correct east/west wall sign rotations so the front face points into the room.

Rationale:
- A central sign-factory fix prevents repeated coordinate patching.
- Offsetting planes prevents wall coplanarity artifacts.
- Backface culling exposes orientation mistakes instead of showing mirrored text.
- The fix preserves procedural signs and avoids M9 asset work.

Consequences:
- Smoke proof checks sign wall offsets, front-facing normals for representative signs, and full M8 run completion.
- Future wall signs should be created through `createWallSign` unless they have a specific non-wall reason not to.

## D017 - Use Deterministic Procedural Placeholder Textures For M9

Status: Accepted

Context:
M9 introduces the first controlled visual asset batch, but no approved external AI image API, paid tool, credential, or manual editor workflow is available in the current environment.

Decision:
Create AI-intended prompt files and generate the first asset batch locally with `scripts/generate-procedural-textures.mjs`. Track every asset as `local_procedural_placeholder` in `asset_manifest.json`, then load them through Babylon materials and decorative wall planes from stable `public/assets/...` paths.

Rationale:
- Preserves the AI-only workflow without requiring credentials or manual import.
- Keeps assets deterministic, replaceable, and auditable.
- Lets M9 prove the asset pipeline before investing in final art.

Consequences:
- M9 assets are visual prototypes, not final AI-generated outputs.
- Future M10/M11 polish can replace files under the same IDs if style, readability, and stability contracts remain intact.
