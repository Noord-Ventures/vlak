import { Icon } from "@noorddev/vlak-react";
import "./scene.css";

export function MicroscopyCrop() {
  return <div className="if-crop-scene mc-crop"><header><Icon name="crosshair" size={16} /><span>Slide 07</span><span>Local draft</span></header><div className="mc-crop-body"><span>Acquisition planning</span><strong>A position.<br />Every plane.</strong><svg viewBox="0 0 300 200" aria-hidden="true"><rect x="12" y="22" width="276" height="150" className="mc-slide" /><path d="M24 50H276M24 90H276M24 130H276M65 34V158M105 34V158M145 34V158M185 34V158M225 34V158M265 34V158" className="mc-grid-line" /><path d="M70 60L146 99L230 138" className="mc-route" /><rect x="57" y="50" width="26" height="20" className="mc-field-outline" /><rect x="133" y="89" width="26" height="20" fill="var(--text)" /><rect x="217" y="128" width="26" height="20" className="mc-field-outline" /><path d="M126 99H166M146 82V116" className="mc-crosshair" /></svg></div><footer><div><strong>120</strong><span>Planned frames</span></div><div><strong>3.9 s</strong><span>Total exposure</span></div></footer></div>;
}
