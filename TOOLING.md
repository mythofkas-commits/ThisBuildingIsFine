# TOOLING.md

## Selection Principle

Choose tools by AI autonomy. The best tool is the one Codex can operate through source files, terminal commands, scripts, browser automation, APIs, generated prompts, and repeatable verification.

Recommended default: Babylon.js + TypeScript + Vite.

## Babylon.js + TypeScript + Vite

What it does:
- Babylon.js provides browser-based 3D rendering, cameras, materials, collisions, input, GUI, and scene systems.
- TypeScript provides typed source-driven implementation.
- Vite provides fast development server and production builds.

AI-only suitability:
- Strong fit. Scenes, materials, cameras, procedural rooms, collision rules, HUD, and game state can be created in code.
- Minimal hidden editor state.
- Procedural geometry can carry the MVP before generated assets are needed.

How Codex can operate it:
- Create and edit TypeScript modules.
- Run `npm install` when M1 begins.
- Run `npm run dev`, `npm run build`, and browser smoke checks.
- Generate room layouts, materials, HUD, and gameplay logic from source files.

How Codex can test it:
- Build with TypeScript/Vite.
- Open the local dev server in browser automation.
- Capture screenshots.
- Check canvas is nonblank.
- Inspect console logs.
- Run deterministic game-state tests where practical.

Failure modes:
- Browser pointer-lock and input behavior may need test harness accommodations.
- Performance can degrade if procedural meshes are not batched or cleaned up.
- Game architecture can become tangled if scene code is not modular.

Manual work avoided:
- Manual scene placement.
- Manual material assignment.
- Manual asset import.
- Manual editor settings.
- Manual level-building.

Decision:
- Use as the default MVP stack.

## Three.js + TypeScript + Vite

What it does:
- Three.js provides low-level browser 3D rendering primitives.
- TypeScript and Vite provide the same source and build advantages as the Babylon stack.

AI-only suitability:
- Good fit for source-driven development.
- Less complete as a game framework, so Codex must implement more camera, collision, GUI, loading, and gameplay infrastructure.

How Codex can operate it:
- Create TypeScript scene modules and procedural geometry.
- Run Vite build/dev commands.
- Use browser automation for screenshots and console checks.

How Codex can test it:
- Same browser checks as Babylon.
- Additional custom tests for collision, camera, and UI systems would be needed.

Failure modes:
- More custom engine code means more surface area for bugs.
- Common features like first-person controllers, HUD integration, and interaction systems require more assembly.

Manual work avoided:
- Manual editor workflows are still avoided.
- More engineering work is required to avoid manual tuning.

Decision:
- Keep as fallback if Babylon.js creates a blocker.

## React Three Fiber + TypeScript + Vite

What it does:
- React Three Fiber lets React drive Three.js scenes declaratively.
- TypeScript and Vite support source-driven builds.

AI-only suitability:
- Good for 3D web apps with React UI.
- Less ideal for this MVP because first-person game loops, pointer lock, world state, and procedural level mutation do not need React complexity.

How Codex can operate it:
- Create React components for scene entities and HUD.
- Run Vite build/dev commands.
- Use browser automation for UI and canvas checks.

How Codex can test it:
- Browser smoke tests.
- Component tests where useful.
- Screenshot and console checks.

Failure modes:
- React state can fight real-time game-loop state.
- Extra abstraction can make performance and input bugs harder to reason about.
- More dependency surface than needed.

Manual work avoided:
- Avoids editor workflows, but does not reduce game-specific implementation burden.

Decision:
- Reject for MVP unless the project later needs a React-heavy interface.

## Godot

What it does:
- Godot is a full game engine with rendering, physics, scenes, scripting, import tools, UI, and export support.

AI-only suitability:
- Mixed. GDScript and text scene files are scriptable, but many workflows still expect editor usage.
- Scene composition, import settings, nodes, materials, and inspector state can become fragile without manual inspection.

How Codex can operate it:
- Generate scripts and some scene files.
- Run headless import/export commands if the local editor/runtime is installed.
- Inspect text scene files.

How Codex can test it:
- Run command-line builds.
- Launch test scenes if runtime support exists.
- Capture screenshots with external automation only after more setup.

Failure modes:
- Editor version mismatch.
- Import database churn.
- Hidden scene or project settings.
- More friction on Windows if headless/editor commands are unavailable.

Manual work avoided:
- Some manual editor work can be avoided, but not as cleanly as with browser-first code scenes.

Decision:
- Reject for MVP due to editor-state risk.

## Unity

What it does:
- Unity is a full commercial game engine with scene editor, physics, rendering, animation, UI, asset import, and builds.

AI-only suitability:
- Weak for this project. Unity is powerful, but normal workflows depend heavily on editor configuration, inspector state, prefab wiring, serialized scene files, and asset import settings.

How Codex can operate it:
- Generate C# scripts.
- Run command-line editor builds if Unity is installed.
- Edit some serialized assets carefully.

How Codex can test it:
- Batchmode builds.
- Playmode or editmode tests if the project is configured.
- Screenshots require more harness work.

Failure modes:
- Missing Unity install or license.
- Serialized scene and prefab conflicts.
- Manual inspector tuning.
- Asset import and material settings not visible in code review.

Manual work avoided:
- Some scripting work, but too much scene, prefab, and inspector work remains.

Decision:
- Reject for MVP.

## Unreal

What it does:
- Unreal is a high-end game engine with advanced rendering, Blueprint visual scripting, editor tools, physics, animation, assets, and packaging.

AI-only suitability:
- Weakest fit for the MVP. Unreal's strengths are tied to editor workflows, content browser management, Blueprint graphs, heavy assets, and complex build tooling.

How Codex can operate it:
- Generate C++ or config files.
- Run command-line builds if Unreal is installed and configured.
- Limited ability to reason about Blueprint/editor state from source alone.

How Codex can test it:
- Command-line builds.
- Automation framework if configured.
- Screenshots and packaged runs require substantial setup.

Failure modes:
- Large installs and build times.
- Binary assets.
- Blueprint state not reviewable as source.
- Manual editor dependency.

Manual work avoided:
- Too little manual work is avoided for an AI-only MVP.

Decision:
- Reject for MVP.

## Immediate Tools

- Markdown planning files.
- JSON asset manifest.
- `rg` for exact search.
- `osgrep` for semantic discovery.
- Git status checks.

## Deferred Tools

- Node.js/npm dependency installation.
- Babylon.js, TypeScript, and Vite.
- Playwright or browser plugin smoke tests.
- Image or texture generation tools.
- Asset optimization scripts.
- Audio tools.
