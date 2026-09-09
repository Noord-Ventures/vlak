import { ToggleGroup } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return (
    <UseField name="toggle-group">
      <h3 className="rs-use-type">Set</h3>
      <div className="rs-use-body">
        <div className="rs-use-stack">
          <p className="rs-use-kicker">Default</p>
          <p className="rs-use-copy">Choose the alignment for the heading.</p>
        </div>
        <ToggleGroup
          aria-label="Heading alignment"
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
          defaultValue="left"
        />
        <div className="rs-use-stack">
          <p className="rs-use-kicker">Subtle</p>
          <p className="rs-use-copy">The caption uses a quieter control with the same selection behavior.</p>
        </div>
        <ToggleGroup
          variant="subtle"
          aria-label="Caption alignment"
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
          defaultValue="left"
        />
      </div>
    </UseField>
  );
}
