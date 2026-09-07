import { Icon } from "@noorddev/vlak-react";
import { guides } from "./data";
import "./scene.css";

export function DocumentationCrop() {
  return <div className="if-crop-scene dc-crop"><header><Icon name="file-text" size={16} /><span>Field guide</span><Icon name="sliders" size={16} /></header><div className="dc-crop-title"><span>Documentation</span><strong>Guides.</strong></div><div className="dc-crop-list">{guides.slice(0, 3).map(guide => <div key={guide.id}><strong>{guide.title}</strong><p>{guide.description}</p><span>{guide.category} · {guide.readTime}</span></div>)}</div></div>;
}
