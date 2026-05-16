# The Building Is Fine - Plan

## Vision

The Building Is Fine is a first-person surreal corporate mystery game where the player audits an impossible office building, collects Incident Reports, survives absurd workplace Policies, and decides when to extract before the building becomes too personally invested in the player's performance.

The game should feel uncanny, strange, mysterious, dryly funny, quietly tense, dreamlike, psychologically off, corporate-absurd, and curious rather than terrifying.

The game must not become dark horror, panic horror, gore, monster horror, jump-scare horror, or oppressive survival horror.

## Player Experience

The player should feel intrigued, suspicious, amused, slightly unsettled, and compelled to explore. The building should feel calm, bureaucratic, sensitive, impossible, and inappropriately attentive.

Reference tone:
- Severance-style corporate weirdness.
- The Stanley Parable-style bureaucratic absurdity.
- Control-style impossible office architecture, but less dark and less combat-heavy.
- Liminal office surrealism.
- Dry workplace comedy.
- Surreal mystery rather than survival horror.

Example building voice:
- "Your scream has been logged as feedback."
- "The elevator is experiencing a brief disagreement with Floor 4."
- "Please do not correct the hallway. It is sensitive."
- "Your exit request has been received and emotionally misunderstood."
- "The company thanks you for noticing the impossible object. Please stop."
- "Unauthorized certainty must be reported to management."
- "The hallway has chosen a different interpretation of left."

## Core Loop

1. Enter building.
2. Explore strange office-like rooms.
3. Collect Incident Reports and irregular objects.
4. Survive absurd workplace Policies.
5. Choose: extract now or go deeper.
6. The building becomes more personally involved.
7. Escape with evidence or get reassigned.
8. Unlock new floors, tools, and context.

## MVP Target

Build the smallest playable version of the game:
- First-person movement.
- One office floor.
- Five small procedural or modular rooms.
- One extraction elevator.
- One collectible type: Incident Report.
- One meter: Clarity.
- One building voice system: Performance Review.
- One surreal hazard: The Meeting.
- One Policy: Performance Review.
- One win condition: escape after collecting enough reports.
- One fail condition: losing too much Clarity or being pulled into The Meeting.
- One restart flow.
- One HUD.
- Dry building/narrator messages.

## First Policy: Performance Review

The building comments on player mistakes, delays, backtracking, panic movement, hesitation, rule-breaking, and unnecessary confidence. The comments must be dry, bureaucratic, calm, sometimes misleading, and not evil.

## First Hazard: The Meeting

The Meeting is a self-scheduling conference-room event that rearranges chairs, tables, agendas, and projector screens around the player. It must not feel like a monster or chase sequence. It should feel like the building is trying to pull the player into a meeting that should not exist.

The threat is spatial, absurd, and puzzle-like rather than terrifying.

## Clarity System

As Clarity drops:
- Signs contradict themselves.
- Room labels change.
- The HUD becomes less reliable.
- Building messages become more personal.

This should feel surreal and funny-unsettling, not like madness horror.

## Visual Direction

Use liminal corporate surrealism:
- Fluorescent office lighting.
- Beige carpet.
- Concrete.
- Glass.
- Cubicles.
- Elevators.
- Exit signs.
- Forms.
- Conference rooms.
- Impossible architecture.
- Clean but wrong spaces.
- Low-poly or stylized rather than realistic.

No realistic humans for the MVP. Use office objects, signs, chairs, forms, lights, silhouettes, portraits, and architecture as the surreal language.

## Recommended Stack

Use Babylon.js + TypeScript + Vite unless a future decision proves another stack is more autonomous for this specific game.

Reasons:
- Source-driven scenes and systems.
- Procedural geometry is practical.
- Browser-first playtesting is easy to automate.
- Build and test commands are repeatable.
- Screenshots and logs can prove progress.
- No manual scene editor is required.

## Milestones

- M0 - Planning files only.
- M1 - Minimal 3D scene + movement + camera.
- M2 - Modular office room system.
- M3 - Incident Report collectible + HUD.
- M4 - Extraction elevator + win/restart loop.
- M5 - Clarity meter.
- M6 - Performance Review narrator system.
- M7 - The Meeting hazard.
- M8 - First complete 5-room run.
- M9 - AI-generated visual assets/textures.
- M10 - Polish, screenshots, browser smoke tests.
- M11 - First playable vertical slice.

## Hard Deferrals

Do not add these before the plan explicitly reaches a milestone that needs them:
- Inventory.
- Combat.
- Complex enemies.
- Multiplayer.
- Large open worlds.
- Realistic humans.
- Cinematic cutscenes.
- Dark horror.
- Gore.
- Jump scares.
- Advanced asset work.
- Manual scene-building workflows.
