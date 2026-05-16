import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { MovementCollision } from "./navigation/collision";

export interface PlayerController {
  camera: UniversalCamera;
  update: () => void;
  reset: () => void;
  dispose: () => void;
}

const START_POSITION = new Vector3(0, 1.65, -2.6);
const START_TARGET = new Vector3(0, 1.55, 0);

export function createPlayer(
  scene: Scene,
  canvas: HTMLCanvasElement,
  collision: MovementCollision
): PlayerController {
  const camera = new UniversalCamera("auditor-camera", START_POSITION.clone(), scene);
  camera.setTarget(START_TARGET);
  camera.fov = 0.88;
  camera.minZ = 0.05;
  camera.speed = 0;
  camera.angularSensibility = 2600;
  camera.checkCollisions = true;
  camera.ellipsoid = new Vector3(0.45, 0.8, 0.45);
  camera.ellipsoidOffset = new Vector3(0, 0.75, 0);
  camera.inputs.clear();
  camera.inputs.addMouse();
  camera.attachControl(canvas, true);
  scene.activeCamera = camera;

  const pressed = new Set<string>();

  const onKeyDown = (event: KeyboardEvent) => {
    pressed.add(event.code);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    pressed.delete(event.code);
  };

  const onClick = () => {
    if (document.pointerLockElement !== canvas) {
      void canvas.requestPointerLock?.();
    }
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("click", onClick);

  function update(): void {
    const deltaSeconds = scene.getEngine().getDeltaTime() / 1000;
    const speed = pressed.has("ShiftLeft") || pressed.has("ShiftRight") ? 4.6 : 2.7;
    const move = new Vector3(0, 0, 0);

    const forward = camera.getDirection(Vector3.Forward());
    forward.y = 0;
    forward.normalize();

    const right = camera.getDirection(Vector3.Right());
    right.y = 0;
    right.normalize();

    if (pressed.has("KeyW") || pressed.has("ArrowUp")) {
      move.addInPlace(forward);
    }
    if (pressed.has("KeyS") || pressed.has("ArrowDown")) {
      move.subtractInPlace(forward);
    }
    if (pressed.has("KeyD") || pressed.has("ArrowRight")) {
      move.addInPlace(right);
    }
    if (pressed.has("KeyA") || pressed.has("ArrowLeft")) {
      move.subtractInPlace(right);
    }

    if (move.lengthSquared() > 0) {
      move.normalize().scaleInPlace(speed * deltaSeconds);
      const resolvedPosition = collision.resolve(camera.position, move);
      camera.position.x = resolvedPosition.x;
      camera.position.y = START_POSITION.y;
      camera.position.z = resolvedPosition.z;
    }
  }

  function reset(): void {
    pressed.clear();
    camera.position.copyFrom(START_POSITION);
    camera.setTarget(START_TARGET);
  }

  function dispose(): void {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    canvas.removeEventListener("click", onClick);
    camera.dispose();
  }

  return {
    camera,
    update,
    reset,
    dispose
  };
}
