import { Icon } from "@noorddev/vlak-react";
import { ActivityRings, AudioMeter } from "@noorddev/vlak-react";
import "./specialist-crops.css";

function CropTop({ left, right }: { left: string; right: string }) { return <div className="if-sc-top"><span>{left}</span><span>{right}</span></div>; }
export function MicrobiologyCrop() {
  return <div className="if-sc if-sc-micro"><CropTop left="Culture 024" right="Observation 03" /><div className="if-sc-plate"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="99" /><circle cx="110" cy="110" r="91" />{[[64, 78, 7], [97, 51, 4], [128, 73, 6], [153, 103, 10], [83, 130, 5], [119, 135, 8], [73, 164, 4], [141, 159, 5], [50, 107, 4], [164, 142, 3]].map(([x, y, r], index) => <circle key={index} cx={x} cy={y} r={r} fill="currentColor" />)}<circle cx="153" cy="103" r="17" strokeDasharray="2 3" /></svg><div><span>Selected annotation</span><strong>Colony 04</strong><p>Position recorded<br />Note ready for review</p></div></div></div>;
}
export function GenomeCrop() {
  return <div className="if-sc if-sc-genome"><CropTop left="Reference / chr7" right="1-based, inclusive" /><div className="if-sc-region"><b>101</b><span>Region in focus</span><b>116</b></div><div className="if-sc-coverage">{[12, 24, 32, 21, 35, 46, 57, 49, 31, 43, 60, 46, 36, 42, 26, 38].map((height, index) => <i key={index} style={{ height }} />)}</div><div className="if-sc-bases">{["ACGTACGTACGTACGT", "ACGTACCTACGTACGT", "ACGTACGTACG-ACGT"].map((sequence, row) => <div key={row}>{[...sequence].map((base, index) => <span key={index} data-selected={index === 6}>{base}</span>)}</div>)}</div></div>;
}
export function ProteinCrop() {
  return <div className="if-sc if-sc-protein"><CropTop left="Sequence workbench" right="Draft 02" /><div className="if-sc-protein-main"><svg viewBox="0 0 210 160"><path d="M15 105C135 145 18 -12 154 37S41 147 177 133" strokeWidth="12" /><path d="M15 105C135 145 18 -12 154 37S41 147 177 133" stroke="var(--bg)" strokeWidth="1" /><path d="M58 77L150 87M69 99L161 108M47 56L126 63" strokeWidth="2" /></svg><div><span>Residue selected</span><strong>Glycine</strong><p>Position 07<br />One draft change</p></div></div><div className="if-sc-residues">A G S T A S <b>G</b> A S T G A</div><small>Illustrative shape / no structure prediction</small></div>;
}
export function RoboticsCrop() {
  return <div className="if-sc if-sc-robot"><CropTop left="Robot 01 / joint state" right="Sample telemetry" /><div className="if-sc-robot-main"><svg viewBox="0 0 220 170"><path d="M43 150H177M86 150V128H123V150" /><path d="M105 129L78 68L147 40L174 74" strokeWidth="9" /><circle cx="78" cy="68" r="12" /><circle cx="147" cy="40" r="10" /><circle cx="105" cy="129" r="10" /><path d="M163 85L184 64M175 73L192 79" /><path d="M28 152V19M18 29L28 19L38 29" strokeDasharray="2 3" /></svg><div><span>Shoulder</span><strong>32.4°</strong><p>Reported position</p></div></div><div className="if-sc-event"><Icon name="activity" size={16} /><span>Telemetry received<span>Frame / base_link</span></span></div></div>;
}
export function CircuitryCrop() {
  return <div className="if-sc if-sc-circuit"><CropTop left="Sensor board" right="Revision 04" /><svg viewBox="0 0 380 175"><rect x="24" y="10" width="290" height="148" /><rect x="131" y="53" width="57" height="54" /><path d="M40 37H105V65H131M40 53H91V78H131M188 65H244V36H297M188 79H258V104H297M188 92H230V139H53V116H131" />{[0, 1, 2, 3].map(i => <g key={i}><rect x="124" y={58 + i * 13} width="7" height="5" fill="currentColor" /><rect x="188" y={58 + i * 13} width="7" height="5" fill="currentColor" /><circle cx="41" cy={36 + i * 24} r="5" /><circle cx="297" cy={36 + i * 24} r="5" /></g>)}<circle cx="278" cy="129" r="10" strokeDasharray="2 3" /></svg><div className="if-sc-prompt"><Icon name="message" size={16} /><span>Rename selected net to Power input</span><Icon name="arrow-right" size={16} /></div></div>;
}
export function IdentityCrop() {
  return <div className="if-sc if-sc-identity"><CropTop left="Your application" right="Step 3 of 3" /><div className="if-sc-document"><Icon name="user" size={24} /><div><span>Identity document</span><strong>Alex Morgan</strong><p>Renewal / sample application</p></div><Icon name="check" size={16} /></div><div className="if-sc-evidence"><span><Icon name="check" size={16} />Applicant details</span><span><Icon name="check" size={16} />Supporting documents</span><span><Icon name="arrow-right" size={16} />Review your application</span></div></div>;
}
export function PatientCrop() {
  return <div className="if-sc if-sc-patient"><CropTop left="Good morning, Alex" right="Your day" /><ActivityRings animate={false} encouragement={false} label="A little progress" goals={[{ id: "move", label: "Movement", current: 24, target: 40, unit: "min" }, { id: "outside", label: "Time outside", current: 18, target: 30, unit: "min" }]} /></div>;
}
export function MusicCrop() {
  return <div className="if-sc if-sc-music"><CropTop left="A little room" right="112 bpm / 4:4" /><div className="if-sc-clips">{["Drum machine", "Closed hats", "Round bass", "Soft keys"].map((name, index) => <div key={name}><span>{name}</span>{[0, 1, 2].map(row => <b key={row} data-active={row === 0}><Icon name="play" size={12} />{["First light", "Open space", "After hours"][row]}<i>{Array.from({ length: 8 }, (_, step) => <em key={step} data-active={(step + index + row) % 3 === 0} />)}</i></b>)}</div>)}</div><AudioMeter label="Master" channels={[{ id: "out", label: "Output", level: -16 }]} /></div>;
}
