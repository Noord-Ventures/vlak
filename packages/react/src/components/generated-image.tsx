import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { rs } from "../rs";
import { vlak } from "../tokens.stylex";

export interface GeneratedImageData { base64: string; mediaType: string }
export interface GeneratedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> { image: GeneratedImageData; alt: string }
const styles = stylex.create({ root: { display: "block", maxWidth: "100%", height: "auto", borderRadius: vlak.radiusSm } });
/** Displays supplied image bytes; image generation remains application-owned. */
export const GeneratedImage = React.forwardRef<HTMLImageElement, GeneratedImageProps>(function GeneratedImage({ image, alt, className, style, ...props }, ref) {
  const root = rs(["rs-generated-image", className], styles.root);
  const source = /^image\/(?:png|jpeg|jpg|gif|webp|avif|svg\+xml)$/.test(image.mediaType) ? `data:${image.mediaType};base64,${image.base64}` : undefined;
  return <img ref={ref} loading="lazy" {...props} src={source} alt={alt} className={root.className} style={{ ...root.style, ...style }} />;
});
