"use client";

import type { CSSProperties } from "react";
import { CardLabel, Toggle } from "@noorddev/vlak-react";
import type { ReferenceCaption } from "../about/reference-captions";
import type { Study } from "./collection";
import "./reference-tile.css";

export interface ReferenceTileProps {
  study: Study;
  caption?: ReferenceCaption;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}

const metaType: CSSProperties = { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.45, color: "inherit", margin: 0, overflowWrap: "anywhere" };
const artistType: CSSProperties = { ...metaType, fontSize: "clamp(0.9375rem, 0.875rem + 0.15vw, 1rem)", fontWeight: 600, textWrap: "balance" };
const workType: CSSProperties = { ...metaType, fontSize: "0.875rem", fontWeight: 600, textWrap: "balance" };
const bodyType: CSSProperties = { ...metaType, fontSize: "0.875rem", textWrap: "pretty" };

/** One flat selectable reference, with its context kept beside the thumbnail. */
export function ReferenceTile({ study, caption, index, selected, onSelect }: ReferenceTileProps) {
  const artist = caption?.name ?? study.artist;
  const work = `${study.title}, ${study.year}`;
  const note = caption?.mark.startsWith(`${work}.`)
    ? caption.mark.slice(work.length + 1).trim()
    : undefined;
  const detailsId = `study-details-${index}`;
  return (
    <div className="inspiration-thumbnail-cell">
      <Toggle
        id={`study-select-${index}`}
        className="inspiration-thumbnail reference-tile"
        data-work-id={study.id}
        style={{ height: "100%", width: "100%", minWidth: 0, padding: "20px", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start", gap: "16px", textAlign: "left", borderWidth: 0, borderRadius: 0, outlineOffset: "-2px" }}
        aria-label={`${index + 1}. ${study.title}, ${artist}`}
        aria-describedby={detailsId}
        pressed={selected}
        onPressedChange={() => onSelect(index)}
      >
        <span className="inspiration-thumbnail-meta">
          <CardLabel style={metaType}>{String(index + 1).padStart(2, "0")}</CardLabel>
          <CardLabel style={metaType}>{study.kind}</CardLabel>
        </span>
        <span className="inspiration-thumbnail-image">
          <img src={study.poster ?? study.image} alt="" loading="lazy" onError={(event) => {
            if (event.currentTarget.getAttribute("src") !== study.image) event.currentTarget.src = study.image;
          }} />
        </span>
        <span className="reference-tile-identity">
          <CardLabel className="reference-tile-artist" style={artistType}>{artist}</CardLabel>
          {caption && <CardLabel className="reference-tile-dates" style={metaType}>{caption.years} · {caption.place}</CardLabel>}
          <CardLabel className="reference-tile-work" style={workType}>{work}</CardLabel>
        </span>
        <span className="reference-tile-details" id={detailsId}>
          <span className="reference-tile-description reference-tile-copy" style={bodyType}>{study.description}</span>
          {note && <span className="reference-tile-caption-note reference-tile-copy" style={bodyType}>{note}</span>}
        </span>
        <span className="reference-tile-materials">
          <CardLabel className="reference-tile-kind" style={metaType}>{study.model ? "Spatial study" : "From the archive"}</CardLabel>
          <span className="reference-tile-material reference-tile-copy" style={bodyType}>{study.material}</span>
        </span>
      </Toggle>
    </div>
  );
}
