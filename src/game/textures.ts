import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import type { Scene } from "@babylonjs/core/scene";

export interface TextMaterialOptions {
  background: string;
  color: string;
  accent?: string;
  width?: number;
  height?: number;
  fontSize?: number;
}

export function createTextMaterial(
  scene: Scene,
  name: string,
  lines: string[],
  options: TextMaterialOptions
): StandardMaterial {
  const width = options.width ?? 512;
  const height = options.height ?? 256;
  const texture = new DynamicTexture(`${name}-texture`, { width, height }, scene, false);
  const context = texture.getContext() as unknown as CanvasRenderingContext2D;

  context.fillStyle = options.background;
  context.fillRect(0, 0, width, height);

  if (options.accent) {
    context.fillStyle = options.accent;
    context.fillRect(0, 0, width, Math.max(16, height * 0.12));
  }

  context.fillStyle = options.color;
  context.font = `${options.fontSize ?? 34}px Arial`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  const lineHeight = options.fontSize ? options.fontSize * 1.35 : 46;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    context.fillText(line, width / 2, startY + index * lineHeight, width - 40);
  });

  texture.update();

  const material = new StandardMaterial(`${name}-material`, scene);
  material.diffuseTexture = texture;
  material.emissiveColor = new Color3(0.22, 0.2, 0.16);
  material.specularColor = new Color3(0.04, 0.04, 0.04);
  return material;
}
