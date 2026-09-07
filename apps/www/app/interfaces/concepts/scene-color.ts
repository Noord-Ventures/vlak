import { Color, SRGBColorSpace } from "three";

/** Resolve modern CSS colors (including color-mix) into the renderer's linear space. */
export function sceneColor(cssColor: string, background?: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d");
  if (!context) return new Color(cssColor);
  if (background) { context.fillStyle = background; context.fillRect(0, 0, 1, 1); }
  context.fillStyle = cssColor;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = context.getImageData(0, 0, 1, 1).data;
  return new Color().setRGB(r / 255, g / 255, b / 255, SRGBColorSpace);
}
