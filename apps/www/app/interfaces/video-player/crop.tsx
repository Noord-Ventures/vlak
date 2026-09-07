import { Icon } from "@noorddev/vlak-react";
import { videos } from "./data";
import "./scene.css";

export function VideoPlayerCrop() {
  return <div className="if-crop-scene vp-crop"><header><Icon name="video" size={16} /><span>Screening room</span><span>Three selected films</span></header><img src={videos[1].thumbnail} alt="" /><footer><div><span>Foals</span><strong>Spanish Sahara</strong></div><Icon name="skip-back" size={16} /><Icon name="play" size={16} /><Icon name="skip-forward" size={16} /></footer></div>;
}
