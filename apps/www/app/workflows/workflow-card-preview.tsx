import type { WorkflowKitManifest } from "../../../../examples/workflows/catalog";

export function WorkflowCardPreview({ id }: { id: WorkflowKitManifest["id"] }) {
  if (id === "record-review") return <figure className="workflow-card-visual workflow-card-record" aria-label="Record review example with three supplied records and one selected record">
    <div className="workflow-visual-bar"><span>Records</span><span>3 supplied</span></div>
    <div className="workflow-record-scene">
      <ol aria-label="Example records">
        <li className="is-current"><strong>North quay inspection</strong><span>FIELD-1042</span></li>
        <li><strong>Warehouse door</strong><span>FIELD-1043</span></li>
        <li><strong>Loading ramp</strong><span>FIELD-1044</span></li>
      </ol>
      <div className="workflow-record-detail"><span>Needs information</span><strong>North quay inspection</strong><p>Revision 1 · local fixture</p></div>
    </div>
  </figure>;

  if (id === "action-approval") return <figure className="workflow-card-visual workflow-card-approval" aria-label="Pending approval for a frozen create task action">
    <div className="workflow-visual-bar"><span>Action review</span><span>Pending</span></div>
    <div className="workflow-approval-scene">
      <span className="workflow-visual-index">01</span>
      <div><p>Create task</p><strong>Inspect north quay notes</strong><dl><div><dt>Priority</dt><dd>Normal</dd></div><div><dt>Revision</dt><dd>1 · frozen</dd></div></dl></div>
    </div>
    <p className="workflow-visual-foot">Decision is bound to payload-v1-d8eafb66</p>
  </figure>;

  return <figure className="workflow-card-visual workflow-card-schedule" aria-label="Schedule edit extending a site walk by thirty minutes">
    <div className="workflow-visual-bar"><span>14 September</span><span>UTC</span></div>
    <div className="workflow-schedule-scene">
      <div className="workflow-time-axis"><span>09:00</span><span>10:00</span><span>10:30</span></div>
      <div className="workflow-event-block"><span>Site walk</span><strong>09:00–10:30</strong><small>Proposed · +30 min</small></div>
    </div>
  </figure>;
}
