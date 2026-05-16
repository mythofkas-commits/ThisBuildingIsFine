# ASSET_PIPELINE.md

## Goal

The asset pipeline must support an AI-only workflow. Codex should be able to generate, track, import, validate, replace, and prove assets without manual editor import, hidden material tuning, or hand placement.

## Asset Strategy

Use procedural geometry and generated materials first. Prioritize consistency over realism.

M0-M8 should rely mostly on:
- Procedural walls, doors, elevators, cubicles, lights, tables, chairs, forms, reports, and signs.
- Simple generated colors and materials.
- Text labels rendered from data.
- Placeholder meshes that are tracked and replaceable.

M9 introduces AI-generated visual assets/textures after the gameplay loop works.

## Prompt Storage

Every generated asset starts from a prompt file or prompt entry:
- `.prompts/visual_style.md`
- `.prompts/environment_assets.md`
- `.prompts/office_props.md`
- `.prompts/abstract_entities.md`
- `.prompts/narrator_voice.md`

Prompts must preserve the tone:
- Corporate surreal.
- Dryly funny.
- Low-poly or stylized.
- Clean but wrong.
- Not dark horror.
- No gore.
- No jump scares.
- No realistic humans for MVP.

## Manifest Tracking

Every asset or placeholder must be tracked in `asset_manifest.json`.

Required tracking fields:
- `id`
- `name`
- `category`
- `status`
- `source_type`
- `prompt_ref`
- `source_path`
- `game_path`
- `format`
- `scale_notes`
- `style_notes`
- `validation`
- `replacement_notes`

Allowed statuses:
- `planned`
- `placeholder`
- `generated`
- `imported`
- `validated`
- `replace_later`
- `rejected`

## Generation

Codex should generate or request assets through:
- Prompt files.
- Scripts.
- APIs.
- Local procedural generation.
- Manifest entries.

Do not manually clean or import assets. If cleanup is needed, create or use a repeatable script.

## Import

Imports must be source-driven:
- Assets live in predictable project folders once the game scaffold exists.
- Asset paths are referenced by code or data manifests.
- Materials are assigned in code or generated data, not hidden editor state.
- Scale is normalized through loader code or metadata.

## Validation

Validate assets before calling them complete:
- Format loads in the game.
- Scale is appropriate relative to doors, chairs, player height, and room size.
- Style matches liminal corporate surrealism.
- Asset does not introduce horror, gore, realistic humans, or visual clutter.
- Placeholder status is updated when replaced.
- Browser screenshot or automated check proves the asset appears in-game.

## Placeholder Replacement

Placeholders are allowed when they keep development moving.

Rules:
- Every placeholder must be listed in `asset_manifest.json`.
- Every placeholder must have `replacement_notes`.
- Replacements must preserve gameplay collision and interaction contracts.
- Replacements must include proof in the relevant milestone verification.

## Proof Requirement

An imported asset is not considered complete until Codex can provide:
- Manifest entry.
- Source prompt or generation method.
- Game path.
- Build result.
- Browser screenshot or console/log proof that the asset loaded.

## M0 State

No assets are created in M0. `asset_manifest.json` is initialized with metadata and empty asset arrays only.
