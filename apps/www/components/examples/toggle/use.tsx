import { Toggle } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return (
    <UseField name="toggle">
      <h3 className="rs-use-type">Grid</h3>
      <div className="rs-use-body">
        <p className="rs-use-copy">Keep the grid visible and choose the helpers used while arranging the sheet.</p>
        <div className="rs-use-actions">
          <Toggle defaultPressed>Show grid</Toggle>
          <Toggle variant="subtle" defaultPressed>Snap to grid</Toggle>
          <Toggle variant="subtle">Show margins</Toggle>
          <Toggle variant="subtle" disabled>Show bleed</Toggle>
        </div>
      </div>
    </UseField>
  );
}
