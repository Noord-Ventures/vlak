"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { vlak } from "../tokens.stylex";
import { rs } from "../rs";
import { Button } from "./button";
import { Icon } from "./icon";

export interface PlaybackControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  playing?: boolean;
  defaultPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onStop?: () => void;
  disabled?: boolean;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  label?: string;
}
const styles = stylex.create({
  root: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", paddingBottom: "0.75rem", color: vlak.ink },
  action: { width: vlak.hit, minWidth: vlak.hit, height: vlak.hit, padding: 0, flexShrink: 0 },
});

/** Named, keyboard-operable transport buttons. Playback state may be owned by a media element. */
export const PlaybackControls = React.forwardRef<HTMLDivElement, PlaybackControlsProps>(function PlaybackControls({ playing, defaultPlaying = false, onPlayingChange, onPrevious, onNext, onStop, disabled = false, previousDisabled = false, nextDisabled = false, previousLabel = "Previous track", nextLabel = "Next track", label = "Playback controls", className, style, ...props }, ref) {
  const [inner, setInner] = React.useState(defaultPlaying);
  const active = playing ?? inner;
  const change = (next: boolean) => { if (playing === undefined) setInner(next); onPlayingChange?.(next); };
  const root = rs(["rs-playback-controls", className], styles.root);
  const action = rs(["rs-playback-action"], styles.action);
  return <div ref={ref} role="group" aria-label={label} {...props} className={root.className} style={{ ...root.style, ...style }}>
    {onPrevious && <Button {...action} variant="ghost" disabled={disabled || previousDisabled} aria-label={previousLabel} onClick={onPrevious}><Icon name="skip-back" /></Button>}
    <Button {...action} disabled={disabled} aria-label={active ? "Pause" : "Play"} onClick={() => change(!active)}><Icon name={active ? "pause" : "play"} /></Button>
    {onNext && <Button {...action} variant="ghost" disabled={disabled || nextDisabled} aria-label={nextLabel} onClick={onNext}><Icon name="skip-forward" /></Button>}
    {onStop && <Button {...action} variant="ghost" disabled={disabled} aria-label="Stop" onClick={() => { change(false); onStop(); }}><Icon name="stop" /></Button>}
  </div>;
});
