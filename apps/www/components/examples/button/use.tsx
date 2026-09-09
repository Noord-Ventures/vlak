import { Button, Icon } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

/** Press ticket: primary, secondary, and supporting actions. */
export function Use() {
  return (
    <UseField name="button">
      <h3 className="rs-use-type">Print</h3>
      <div className="rs-use-body">
        <div className="rs-use-stack">
          <p className="rs-use-kicker">Studio / Alkmaar</p>
          <p className="rs-use-copy">Issue 03 goes on the press at 06:00. Print is the primary action; the proof stays close for review.</p>
        </div>
        <div className="rs-use-actions">
          <Button>Print the sheet</Button>
          <Button variant="ghost">Hold</Button>
          <Button variant="subtle">Preview proof</Button>
          <Button variant="subtle" size="icon" aria-label="Download print proof"><Icon name="download" /></Button>
          <Button variant="subtle" disabled>Reprint</Button>
        </div>
      </div>
    </UseField>
  );
}
