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
