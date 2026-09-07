import { Icon } from "@noorddev/vlak-react";
import "./scene.css";

export function MusicPlayerCrop() {
  return <div className="if-crop-scene mp-crop"><header><Icon name="music" /><span>Personal collection</span><span>23 tracks</span></header><div className="mp-crop-columns"><div className="mp-crop-library"><strong>Saved tracks</strong>{[["01", "Fortress Down", "Loathe"], ["02", "Silk In the Strings", "Spiritbox"], ["03", "UNETHICAL", "Faouzia"], ["04", "Arkangel", "Thornhill"]].map(([number, title, artist]) => <div key={number} className="mp-crop-record" data-selected={number === "01"}><span>{number}</span><div><strong>{title}</strong><small>{artist}</small></div></div>)}</div><div className="mp-crop-listening"><span>Selected recording</span><strong>Fortress Down</strong><small>Loathe</small><img src="https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6a/72/76/6a72767b-3119-d895-e8dd-649b45ab25ba/cover.jpg/600x600bb.jpg" alt="" /><div className="mp-crop-controls"><span><Icon name="skip-back" /></span><span><Icon name="play" /></span><span><Icon name="skip-forward" /></span></div></div></div></div>;
}
