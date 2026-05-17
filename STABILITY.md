# STABILITY.md

## Purpose

This file defines behavior contracts for the working M1-M3 foundation. Future milestones may refactor implementation, improve layout, replace placeholders, or add approved systems, but these contracts must remain true unless the current milestone explicitly updates this file and the matching tests with a clear reason.

Do not weaken, delete, or bypass tests to hide a broken change.

## Locked Contracts

### Movement And Camera

- The game launches into a first-person camera.
- Mouse look and keyboard movement remain usable in a browser.
- Movement feel should remain close to the accepted M1-M3 foundation unless a current milestone explicitly requires a narrow change.
- The player must remain at a human-scale standing height.

### Restart Flow

- The audit can be restarted from the HUD button or `R`.
- Restart returns the player to the starting audit position.
- Restart resets milestone-owned transient state, including collected Incident Reports.
- Restart must not require a page reload.

### Five-Room Modular Layout

- The first playable floor has at least five source-defined office rooms.
- The required room IDs are `lobby`, `cubicles`, `conference`, `records`, and `elevator`.
- Room definitions stay in source-controlled data or source-derived modules.
- Layout details may change, but the rooms must remain readable as a calm, strange office floor.

### Room Connectivity

- The five required rooms must be reachable through intended connections.
- Doorways/openings must remain traversable.
- Future layout changes should preserve clear navigation unless the current milestone explicitly changes the layout contract.

### Collision And Walkable Behavior

- The player must not walk through room walls.
- Major hard office objects should block movement when they read as solid.
- Small signs, posters, paperwork, and decorative panels may be intentionally non-collidable.
- Collision may be refactored or improved, but wall blocking and intended doorway traversal must keep working.

### Incident Report System

- At least three source-defined Incident Reports exist before M4 begins.
- The required report IDs are `IR-01`, `IR-02`, and `IR-03`.
- Reports are visible and reachable.
- Reports can be collected.
- Collected reports become clearly distinct or disappear.
- Restart restores reports to an uncollected state.

### HUD Behavior

- The HUD is visible after scene load.
- The HUD shows Incident Report progress as collected count and total count.
- The HUD shows Clarity once M5 begins.
- Collecting a report updates HUD text/status.
- Restart updates HUD state back to the reset report count.

### Sign Readability

- Wall-mounted signs must be offset from wall surfaces enough to avoid z-fighting during normal movement.
- Wall-mounted sign text must face the intended room-side viewing direction.
- Wall-mounted signs must not rely on mirrored backface rendering for readability.
- Decorative signs must remain non-collidable unless a future approved milestone explicitly changes that contract.
- Sign readability fixes must preserve doorway traversal and the complete five-room run.

### Extraction And Win Loop

- Extraction must remain source-driven and associated with the elevator room.
- Extraction is unavailable until all required Incident Reports are collected.
- Approaching locked extraction gives dry corporate feedback instead of ending the run.
- After all required reports are collected, extraction becomes available.
- The HUD must clearly tell the player how to complete available extraction.
- Using active extraction through its displayed interaction triggers a minimal, restrained win/completion state.
- Restart clears the win state and returns extraction to locked.

### Clarity System

- Clarity starts at 100.
- Clarity appears in the HUD.
- Clarity can change through source-defined events.
- Restart restores Clarity to the baseline value.
- M5 Clarity must remain subtle, non-punitive, and non-horror.
- Clarity must not make the HUD unreadable or introduce nausea-inducing effects.

### Performance Review Narrator

- The narrator exists as a source-driven text system once M6 begins.
- The narrator reacts to existing game events without blocking gameplay.
- Narrator messages remain dry, calm, bureaucratic, surreal, and non-dark.
- Narrator messages must be rate-limited or cooldown-gated to avoid spam.
- The narrator must not add voice audio, text-to-speech, hazards, enemies, or M7+ behavior.

### The Meeting Hazard

- The Meeting exists as a source-driven event system once M7 begins.
- The Meeting is associated with the conference room and must not behave like a creature, enemy, chase, combatant, or jump scare.
- The Meeting may rearrange source-defined office objects into a partial ring, corridor, or agenda-like pressure shape.
- The Meeting must leave a readable escape path and must not permanently trap the player or block required progress.
- Meeting exposure may affect Clarity subtly, but it must remain non-punitive, non-horror, and restartable.
- Leaving the Meeting zone must end or reduce the hazard pressure.
- Restart must return The Meeting to its idle source-defined state.
- Meeting HUD/status/narrator output must remain calm, dry, bureaucratic, readable, and rate-limited.

### Complete Five-Room Run

- Once M8 begins, one complete run must connect all five approved rooms: `lobby`, `cubicles`, `conference`, `records`, and `elevator`.
- The complete run must allow the player to collect all required Incident Reports, experience or avoid The Meeting, visit Records, reach Complete Check-Out, file the audit, and restart without a page reload.
- Required progress must not depend on manual scene edits, external assets, generated textures, inventory, combat, enemies, chase logic, or future milestone systems.
- Player-facing check-out wording should prefer File Audit, Submit Findings, or Complete Check-Out. Internal code may keep historical extraction names where they refer to existing M4 architecture.
- Smoke proof must cover the full run path or an equivalent scripted browser path before M8 is considered complete.

### Tone Constraints

- The game remains uncanny, strange, dryly funny, corporate-surreal, and quietly tense.
- The game must not drift into dark horror, panic horror, gore, jumpscares, monster horror, or oppressive survival horror.
- Building/system text should remain calm, bureaucratic, understated, and sometimes misleading.

### AI-Only Workflow

- Gameplay, scenes, assets, tests, and verification must remain source-driven and scriptable.
- Do not introduce workflows that require manual scene building, manual asset imports, hidden editor state, manual animation wiring, or repetitive director labor.
- Babylon.js + TypeScript + Vite remains the active stack unless a future approved milestone explicitly changes the stack decision.

## Future Changes

Implementation may change. Contracts may change only when a future milestone intentionally changes behavior and updates:

- this file,
- the relevant tests or validation scripts,
- the milestone log explaining why.
