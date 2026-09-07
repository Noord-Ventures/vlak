"use client";

import * as React from "react";
import { Button, Icon, Input, MediaScrubber, PlaybackControls, Slider, ToggleGroup } from "@noorddev/vlak-react";
import { ListeningAudioGraph } from "./audio-graph";
import type { ProcessingMode } from "./audio-graph";
import { SoundPanel } from "./sound-panel";

type Track = { id: string; title: string; artist: string; album: string; artwork: string; preview: string; previewDuration: number; duration: string; url: string; genre: string };
// Verified against the official iTunes Search API, 7 September 2026. Promotional media streams from Apple.
const tracks: readonly Track[] = [
  {
    "id": "6763148043",
    "title": "Fortress Down",
    "artist": "Loathe",
    "album": "A Stranger To You",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6a/72/76/6a72767b-3119-d895-e8dd-649b45ab25ba/cover.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/48/67/51/486751a4-7c77-be49-e9a2-297e384f0bba/mzaf_151061685052122612.plus.aac.p.m4a",
    "previewDuration": 30.012993,
    "duration": "3:25",
    "url": "https://music.apple.com/us/album/fortress-down/1895184628?i=6763148043&uo=4",
    "genre": "Metal"
  },
  {
    "id": "1584622650",
    "title": "Silk In the Strings",
    "artist": "Spiritbox",
    "album": "Eternal Blue",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6a/dc/82/6adc8230-3041-26c5-9d8f-d5b97acc09d0/4050538694772.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ec/d3/25/ecd325a5-fe7f-6c8b-fe64-555bf3d4b953/mzaf_4286927047602468450.plus.aac.p.m4a",
    "previewDuration": 30.020998,
    "duration": "2:57",
    "url": "https://music.apple.com/us/album/silk-in-the-strings/1584622643?i=1584622650&uo=4",
    "genre": "Metal"
  },
  {
    "id": "1845118686",
    "title": "UNETHICAL",
    "artist": "Faouzia",
    "album": "FILM NOIR",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c5/6d/c3/c56dc3b8-3439-3c7b-f713-424ce83a5e24/193436445610_FINALEDIT.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9a/d5/13/9ad513ed-24c3-132a-9c22-bf040427ee3d/mzaf_7743631250326434214.plus.aac.p.m4a",
    "previewDuration": 30.016009,
    "duration": "3:39",
    "url": "https://music.apple.com/us/album/unethical/1845118680?i=1845118686&uo=4",
    "genre": "Pop"
  },
  {
    "id": "1761398489",
    "title": "Arkangel",
    "artist": "Thornhill",
    "album": "Heroine",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cf/33/98/cf339817-853a-254a-9fd8-a6b2d34ecb16/196626472588.png/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f0/84/95/f08495a6-520e-bc93-eb85-218dc5d7a180/mzaf_13711330507039106594.plus.aac.p.m4a",
    "previewDuration": 30.003991,
    "duration": "4:10",
    "url": "https://music.apple.com/us/album/arkangel/1761398485?i=1761398489&uo=4",
    "genre": "Rock"
  },
  {
    "id": "1891830326",
    "title": "the precipice",
    "artist": "Jessie Mazin",
    "album": "untitled.jpeg - EP",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4c/60/e6/4c60e6ac-d1a6-4840-381f-e2a1eaf24caf/075679584786.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/88/c8/70/88c8707a-ee27-c31e-ccd4-b73153637706/mzaf_11189834522928755350.plus.aac.p.m4a",
    "previewDuration": 30.005011,
    "duration": "3:52",
    "url": "https://music.apple.com/us/album/the-precipice/1891830323?i=1891830326&uo=4",
    "genre": "Pop"
  },
  {
    "id": "1883675686",
    "title": "Stockholm (feat. Yamê)",
    "artist": "Zaho",
    "album": "VERSATILE",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/6b/2b/e9/6b2be9fc-8832-cbb0-7152-a1c1194f330f/196874072356.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/43/d3/95/43d395c4-ae82-c578-4411-d44dcf0c0c38/mzaf_14953419061774778439.plus.aac.p.m4a",
    "previewDuration": 30.019002,
    "duration": "3:02",
    "url": "https://music.apple.com/us/album/stockholm-feat-yam%C3%AA/1883675527?i=1883675686&uo=4",
    "genre": "Pop"
  },
  {
    "id": "1886485698",
    "title": "SORRY! CRASH!",
    "artist": "Ecca Vandal",
    "album": "LOOKING FOR PEOPLE TO UNFOLLOW",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/33/53/a4/3353a48d-e9c8-0bc0-5fcc-5b28aa2edffe/26CRGIM53707.rgb.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1b/b6/b2/1bb6b2d7-c120-3585-7913-bfe0c2cb12c4/mzaf_13471573622063469716.plus.aac.p.m4a",
    "previewDuration": 30.001995,
    "duration": "3:09",
    "url": "https://music.apple.com/us/album/sorry-crash/1886485694?i=1886485698&uo=4",
    "genre": "Rock"
  },
  {
    "id": "1885698613",
    "title": "Lo Quiero Ya !",
    "artist": "CA7RIEL & Paco Amoroso & Fred again..",
    "album": "FREE SPIRITS",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ba/8c/d9/ba8cd968-5658-5149-596c-6c8140a4c06a/196874217917.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/be/71/f0/be71f0cc-d549-eab8-3817-ef9369cf6ad0/mzaf_13474274591442149412.plus.aac.p.m4a",
    "previewDuration": 30.019002,
    "duration": "3:17",
    "url": "https://music.apple.com/us/album/lo-quiero-ya/1885698497?i=1885698613&uo=4",
    "genre": "Rock y Alternativo"
  },
  {
    "id": "1872527084",
    "title": "The Turning",
    "artist": "The Notwist",
    "album": "News from Planet Zombie",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/d1/55/4c/d1554cc4-f0f2-7ede-1a70-1342fcad2f10/880918820705.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/55/bb/98/55bb9850-ce39-6208-251b-aeb2e94071be/mzaf_4581783237957678397.plus.aac.p.m4a",
    "previewDuration": 30.007007,
    "duration": "5:03",
    "url": "https://music.apple.com/us/album/the-turning/1872527079?i=1872527084&uo=4",
    "genre": "Indie Pop"
  },
  {
    "id": "1099844649",
    "title": "Sextape",
    "artist": "Deftones",
    "album": "Diamond Eyes",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music49/v4/b7/4b/2e/b74b2e91-c3a6-2f74-5f3f-f38e9e2b100d/093624919766.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e5/ee/7c/e5ee7c81-f3b6-eeb5-bb11-804bca77b2cb/mzaf_7631749206212352802.plus.aac.p.m4a",
    "previewDuration": 30.016009,
    "duration": "4:01",
    "url": "https://music.apple.com/us/album/sextape/1099844360?i=1099844649&uo=4",
    "genre": "Hard Rock"
  },
  {
    "id": "1787022842",
    "title": "BAILE INoLVIDABLE",
    "artist": "Bad Bunny",
    "album": "DeBÍ TiRAR MáS FOToS",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/90/5e/7e/905e7ed5-a8fa-a8f3-cd06-0028fdf3afaa/199066342442.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3a/ea/38/3aea38e3-106b-db96-7beb-5d2bc02bdf70/mzaf_17568275540135957611.plus.aac.p.m4a",
    "previewDuration": 30.000181,
    "duration": "6:07",
    "url": "https://music.apple.com/us/album/baile-inolvidable/1787022393?i=1787022842&uo=4",
    "genre": "Latin"
  },
  {
    "id": "1669569396",
    "title": "The Apparition",
    "artist": "Sleep Token",
    "album": "Take Me Back To Eden",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e2/c6/0f/e2c60f68-7cec-fa08-6dd3-891aa72c247e/5401148000849_cover.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/dc/a0/67/dca0677d-a8fe-57ba-09cd-b3f56618d28f/mzaf_187678863196737355.plus.aac.p.m4a",
    "previewDuration": 30,
    "duration": "4:28",
    "url": "https://music.apple.com/us/album/the-apparition/1669567703?i=1669569396&uo=4",
    "genre": "Hard Rock"
  },
  {
    "id": "1757678613",
    "title": "Lithonia",
    "artist": "Childish Gambino",
    "album": "Bando Stone and The New World",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3c/d3/37/3cd3376c-55f6-26ea-1dad-5d26b9391a45/196872224030.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c7/f8/cc/c7f8cc7d-a8e0-0dfb-8e30-41277c17c6e4/mzaf_5738271699367924361.plus.aac.p.m4a",
    "previewDuration": 30.019002,
    "duration": "2:58",
    "url": "https://music.apple.com/us/album/lithonia/1757678472?i=1757678613&uo=4",
    "genre": "Pop"
  },
  {
    "id": "1566166998",
    "title": "Götterdämmerung",
    "artist": "Zeal & Ardor",
    "album": "Zeal & Ardor",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/bf/52/00/bf5200ae-b3b4-d95e-10c9-ceeff21be1db/190296726446.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a3/cc/67/a3cc6712-e620-0393-f681-e5f39132deba/mzaf_536563936618361066.plus.aac.p.m4a",
    "previewDuration": 30.003991,
    "duration": "3:03",
    "url": "https://music.apple.com/us/album/g%C3%B6tterd%C3%A4mmerung/1566166376?i=1566166998&uo=4",
    "genre": "Metal"
  },
  {
    "id": "1774393630",
    "title": "Blackhole",
    "artist": "Architects",
    "album": "The Sky, the Earth & All Between",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2d/4a/fa/2d4afae7-9309-63db-4434-1959d2eda5c4/0045778806461.png/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/12/88/8b/12888bf9-b752-526c-a181-99e19fbb2210/mzaf_12993831843733318579.plus.aac.p.m4a",
    "previewDuration": 30.003991,
    "duration": "3:20",
    "url": "https://music.apple.com/us/album/blackhole/1774393621?i=1774393630&uo=4",
    "genre": "Hard Rock"
  },
  {
    "id": "1190130265",
    "title": "Always: Your Way",
    "artist": "My Vitriol",
    "album": "Finelines",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f9/4e/a7/f94ea756-ccff-cc7b-65d8-512d865b3cf5/artwork.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/62/5f/14/625f14f9-52b3-a85f-9658-528a5d882ed3/mzaf_1969738653067641613.plus.aac.p.m4a",
    "previewDuration": 29.976961,
    "duration": "3:49",
    "url": "https://music.apple.com/us/album/always-your-way/1190130261?i=1190130265&uo=4",
    "genre": "Alternative"
  },
  {
    "id": "1519618014",
    "title": "If We Want It, It's Right",
    "artist": "Thomas Dybdahl",
    "album": "One Day You'll Dance for Me, New York City",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/93/ad/19/93ad1902-0293-382d-0e24-250bc8a0d4b7/8717931331944.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/bb/41/a5/bb41a5f2-73a2-bca9-232d-ec9e2d484382/mzaf_2797502289141694432.plus.aac.p.m4a",
    "previewDuration": 29.976961,
    "duration": "3:46",
    "url": "https://music.apple.com/us/album/if-we-want-it-its-right/1519618006?i=1519618014&uo=4",
    "genre": "Pop"
  },
  {
    "id": "1605085575",
    "title": "Something of an End",
    "artist": "My Brightest Diamond",
    "album": "Bring Me the Workhorse",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/93/16/39/931639df-e9d9-8bd7-44c7-66ae1d863e1f/656605829562_cover.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/c7/66/24/c76624a7-6e8c-ed61-c4cd-4624eb181fb7/mzaf_10364464593115925136.plus.aac.p.m4a",
    "previewDuration": 29.976961,
    "duration": "4:51",
    "url": "https://music.apple.com/us/album/something-of-an-end/1605085407?i=1605085575&uo=4",
    "genre": "Alternative"
  },
  {
    "id": "1109715469",
    "title": "Jigsaw Falling Into Place",
    "artist": "Radiohead",
    "album": "In Rainbows",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dd/50/c7/dd50c790-99ac-d3d0-5ab8-e3891fb8fd52/634904032463.png/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/76/0b/04/760b0415-ed76-cc02-b688-1a49789dbc34/mzaf_10830186063789872228.plus.aac.p.m4a",
    "previewDuration": 30,
    "duration": "4:08",
    "url": "https://music.apple.com/us/album/jigsaw-falling-into-place/1109714933?i=1109715469&uo=4",
    "genre": "Alternative"
  },
  {
    "id": "1203296308",
    "title": "Desafío",
    "artist": "Arca",
    "album": "Arca",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/5f/be/33/5fbe33cc-f182-8909-1b0f-1c6b43abc77f/cover.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/20/e6/05/20e605d2-c1ed-d1c4-de46-4fd6d9a45377/mzaf_17334526175598260098.plus.aac.p.m4a",
    "previewDuration": 30,
    "duration": "3:53",
    "url": "https://music.apple.com/us/album/desaf%C3%ADo/1203295856?i=1203296308&uo=4",
    "genre": "Electronic"
  },
  {
    "id": "1450153436",
    "title": "Dawan",
    "artist": "Apparat",
    "album": "LP5",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/29/93/9a/29939a27-59e6-be66-4da5-68e61d23d1f9/724596983058.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/44/b0/b2/44b0b22c-4798-bcc9-3a35-853b3789d4f9/mzaf_6135640108424005846.plus.aac.p.m4a",
    "previewDuration": 29.976961,
    "duration": "4:30",
    "url": "https://music.apple.com/us/album/dawan/1450153254?i=1450153436&uo=4",
    "genre": "Alternative"
  },
  {
    "id": "1440827262",
    "title": "Survivalism",
    "artist": "Nine Inch Nails",
    "album": "Year Zero",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/58/90/13/589013be-cf23-0db1-6108-7eacfef3aa5e/00602547582812.rgb.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/71/19/af/7119af5d-1a3d-cd60-7e4c-a063e8d8846b/mzaf_10306292609107554402.plus.aac.p.m4a",
    "previewDuration": 30.000998,
    "duration": "4:23",
    "url": "https://music.apple.com/us/album/survivalism/1440826538?i=1440827262&uo=4",
    "genre": "Alternative"
  },
  {
    "id": "1451077338",
    "title": "Looped",
    "artist": "Kiasmos",
    "album": "Kiasmos",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/60/f2/63/60f263ac-0348-2f85-30e7-2e4fb6655724/4050486109618_cover.jpg/600x600bb.jpg",
    "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/63/25/5e/63255ea9-3247-2149-5691-360c3d7866c8/mzaf_1080125908023687129.plus.aac.p.m4a",
    "previewDuration": 30,
    "duration": "6:00",
    "url": "https://music.apple.com/us/album/looped/1451077320?i=1451077338&uo=4",
    "genre": "Electronic"
  }
];
type LocalAudio = { url: string; name: string };
type Screen = "library" | "playing" | "queue";
type Repeat = "off" | "one" | "all";

function Cover({ track, large = false }: { track: Track; large?: boolean }) {
  const [failed, setFailed] = React.useState("");
  return failed === track.artwork ? <span className={`mp-cover mp-cover-fallback${large ? " mp-cover-large" : ""}`}><Icon name="music" size={24} /><span>Artwork unavailable</span></span> : <img className={`mp-cover${large ? " mp-cover-large" : ""}`} src={track.artwork} alt={large ? `${track.album} album artwork` : ""} loading={large ? "eager" : "lazy"} onError={() => setFailed(track.artwork)} />;
}

export function MusicPlayerBoard() {
  const [selected, setSelected] = React.useState(tracks[0]!.id);
  const [screen, setScreen] = React.useState<Screen>("library");
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [queue, setQueue] = React.useState<string[]>(tracks.map(track => track.id));
  const [localFiles, setLocalFiles] = React.useState<Record<string, LocalAudio>>({});
  const [playing, setPlaying] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(70);
  const [muted, setMuted] = React.useState(false);
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState<Repeat>("off");
  const [soundOpen, setSoundOpen] = React.useState(false);
  const [gains, setGains] = React.useState([0, 0, 0, 0, 0]);
  const [bypass, setBypass] = React.useState(false);
  const [processing, setProcessing] = React.useState<ProcessingMode>("ready");
  const [compatibility, setCompatibility] = React.useState("checking");
  const soundId = React.useId();
  const graphRef = React.useRef<ListeningAudioGraph | null>(null);
  if (!graphRef.current) graphRef.current = new ListeningAudioGraph();
  const graph = graphRef.current;
  const [notice, setNotice] = React.useState("Choose a track, then play its preview.");
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const focusSelection = React.useRef(false);
  const urls = React.useRef(new Set<string>());
  const request = React.useRef(0);
  const autoLocal = React.useRef(false);
  const current = tracks.find(track => track.id === selected) ?? tracks[0]!;
  const local = localFiles[current.id];
  const source = local?.url ?? current.preview;
  const localQueue = queue.filter(id => localFiles[id]);
  const queueIndex = queue.indexOf(current.id);
  const visible = tracks.filter(track => (filter !== "favorites" || favorites.includes(track.id)) && (filter !== "local" || localFiles[track.id]) && `${track.title} ${track.artist} ${track.album}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));

  graph.onInterrupted = () => { request.current += 1; audioRef.current?.pause(); setPlaying(false); setLoading(false); setNotice("The browser paused audio. Press Play to resume."); };
  React.useEffect(() => { graph.activate(); return () => graph.dispose(); }, [graph]);
  React.useEffect(() => graph.update(gains, bypass), [graph, gains, bypass]);

  const play = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    const token = ++request.current;
    setLoading(true);
    try {
      if (audio.ended) audio.currentTime = 0;
      const preparation = graphRef.current!.prepare(audio);
      const playback = audio.play();
      const [mode] = await Promise.all([preparation, playback]);
      if (token !== request.current) return;
      setProcessing(mode);
      if (token === request.current) { setPlaying(!audio.paused); setLoading(false); setNotice(""); }
    } catch {
      if (token === request.current) { audio.pause(); setPlaying(false); setLoading(false); setNotice("Playback could not start. Try Play again or open the track in the store."); }
    }
  }, []);
  const pause = () => { request.current += 1; audioRef.current?.pause(); setPlaying(false); setLoading(false); };
  // biome-ignore lint/correctness/useExhaustiveDependencies: A source change alone resets playback; current volume is applied to the new element.
  React.useEffect(() => {
    const audio = audioRef.current;
    setPlaying(false); setLoading(false); setPosition(0); setDuration(0); setProcessing("ready");
    if (audio) { if (audio.getAttribute("src") !== source) audio.src = source; audio.volume = volume / 100; audio.muted = muted; }
    let active = true; setCompatibility("checking");
    void graphRef.current!.probe(source).then(allowed => { if (active) setCompatibility(allowed ? "available" : "direct"); });
    if (autoLocal.current) { autoLocal.current = false; void play(); }
    return () => { active = false; request.current += 1; if (audio) { graphRef.current?.detach(audio); audio.pause(); audio.removeAttribute("src"); audio.load(); } };
  }, [source, play]);
  React.useEffect(() => { if (audioRef.current) { audioRef.current.volume = volume / 100; audioRef.current.muted = muted; } }, [volume, muted]);
  React.useEffect(() => () => { request.current += 1; for (const url of urls.current) URL.revokeObjectURL(url); }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: A selection or screen change may make the requested heading focusable.
  React.useEffect(() => { if (focusSelection.current && screen === "playing") { focusSelection.current = false; titleRef.current?.focus(); } }, [screen, selected]);

  function choose(id: string, open = true) {
    if (id !== selected) { pause(); autoLocal.current = false; setSelected(id); setNotice("Ready when you are. Press Play to start."); }
    if (open) { focusSelection.current = true; setScreen("playing"); if (id === selected && screen === "playing") { focusSelection.current = false; titleRef.current?.focus(); } }
  }
  function next(direction: number) {
    if (!queue.length) return;
    const index = queueIndex < 0 ? (direction > 0 ? 0 : queue.length - 1) : (queueIndex + direction + queue.length) % queue.length;
    const id = queue[index];
    if (id) choose(id, false);
  }
  function finish() {
    setPlaying(false); setLoading(false);
    if (!local) { setNotice("Preview finished. Open the full track in the store, or choose another preview."); return; }
    if (repeat === "one") { if (audioRef.current) audioRef.current.currentTime = 0; void play(); return; }
    const index = localQueue.indexOf(current.id);
    let nextId = localQueue[index + 1];
    if (!nextId && repeat === "all") nextId = localQueue[0];
    if (nextId === current.id) { if (audioRef.current) audioRef.current.currentTime = 0; void play(); }
    else if (nextId) { request.current += 1; autoLocal.current = true; setSelected(nextId); }
    else setNotice("Your local queue has finished.");
  }
  function shuffleQueue() {
    if (shuffle) { setQueue(items => [...items].sort((a, b) => tracks.findIndex(track => track.id === a) - tracks.findIndex(track => track.id === b))); }
    else setQueue(items => {
      const localIds = items.filter(id => localFiles[id]);
      for (let index = localIds.length - 1; index > 0; index -= 1) { const other = Math.floor(Math.random() * (index + 1)); [localIds[index], localIds[other]] = [localIds[other]!, localIds[index]!]; }
      let localIndex = 0;
      return items.map(id => localFiles[id] ? localIds[localIndex++]! : id);
    });
    setShuffle(value => !value);
    setNotice(shuffle ? "Playlist order restored for remaining queued tracks." : "Attached files shuffled within the queue.");
  }
  function favorite(id: string) { setFavorites(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]); }
  function move(id: string, direction: number) {
    setQueue(items => { const index = items.indexOf(id); const next = index + direction; if (next < 0 || next >= items.length) return items; const result = [...items]; [result[index], result[next]] = [result[next]!, result[index]!]; return result; });
    setNotice(`${tracks.find(track => track.id === id)?.title} moved ${direction < 0 ? "up" : "down"} in the queue.`);
  }
  function remove(id: string) {
    setQueue(items => items.filter(item => item !== id));
    setNotice("Removed from the queue. The track remains in your library.");
  }
  function attach(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|aac|wav|ogg|flac|opus)$/i.test(file.name)) { setNotice("Choose an audio file such as a wave, mp3 or m4a recording."); return; }
    pause(); const url = URL.createObjectURL(file); urls.current.add(url);
    const previous = localFiles[selected];
    if (previous) { URL.revokeObjectURL(previous.url); urls.current.delete(previous.url); }
    setLocalFiles(items => ({ ...items, [selected]: { url, name: file.name } }));
    setNotice("Local audio attached to this track. It stays in this browser session; nothing is uploaded.");
  }
  function detach() {
    pause(); if (local) { URL.revokeObjectURL(local.url); urls.current.delete(local.url); }
    setLocalFiles(items => { const next = { ...items }; delete next[selected]; return next; });
    setNotice("Local audio removed. The official preview is available again.");
  }
  const length = duration || (local ? 0 : current.previewDuration);

  return <section className="mp-player" data-screen={screen} data-playing={playing} data-audio-compatibility={compatibility} aria-label="Personal listening workspace">
    {/* biome-ignore lint/a11y/useMediaCaption: Licensed music previews have no supplied caption track; titles and artists are visible. Local files are user supplied. */}
    <audio key={source} ref={audioRef} src={source} preload="none" onLoadedMetadata={event => { const value = event.currentTarget.duration; setDuration(Number.isFinite(value) ? value : 0); }} onDurationChange={event => { const value = event.currentTarget.duration; if (Number.isFinite(value)) setDuration(value); }} onTimeUpdate={event => setPosition(event.currentTarget.currentTime)} onPlaying={() => { setPlaying(true); setLoading(false); }} onPause={() => setPlaying(false)} onWaiting={() => setLoading(true)} onEnded={finish} onError={() => { setPlaying(false); setLoading(false); setNotice(local ? "This local file could not be decoded. Attach a supported audio file." : "This preview is unavailable right now. Open the full track in the store."); }} />
    <header className="mp-header"><span className="mp-brand"><span className="mp-mark"><Icon name="music" size={16} /></span><span>Personal collection<small>Local listening session</small></span></span><span className="mp-header-count">{tracks.length} tracks</span><Button variant="ghost" className="mp-queue-toggle" aria-pressed={screen === "queue"} onClick={() => setScreen(screen === "queue" ? "library" : "queue")}><Icon name="list-ordered" />Queue <span>{queue.length}</span></Button></header>
    <div className="mp-body">
      <section className="mp-library" aria-label="Track library">
        <div className="mp-library-heading"><h2>Saved tracks</h2><span className="mp-kicker">Playlist</span></div>
        <div className="mp-search"><Input plain aria-label="Search tracks" placeholder="Search title, artist or album" value={query} onChange={event => setQuery(event.target.value)} /><ToggleGroup aria-label="Library filter" value={filter} onValueChange={setFilter} options={[{ value: "all", label: "All tracks" }, { value: "favorites", label: "Favorites" }, { value: "local", label: "Local files" }]} /></div>
        <div className="mp-list-head"><span>{visible.length} {visible.length === 1 ? "track" : "tracks"}</span><span>Full track</span></div>
        <div className="mp-library-scroll"><ol className="mp-track-list">{visible.map(track => <li key={track.id} data-selected={track.id === selected}><Button variant="ghost" className="mp-track" aria-label={`Select ${track.title} by ${track.artist}`} aria-pressed={track.id === selected} onClick={() => choose(track.id)}><span className="mp-track-number">{String(tracks.findIndex(item => item.id === track.id) + 1).padStart(2, "0")}</span><span className="mp-track-copy"><strong>{track.title}</strong><span>{track.artist}</span></span><span className="mp-track-duration">{track.duration}</span></Button><Button variant="ghost" className="mp-favorite" aria-label={`Favorite ${track.title}`} aria-pressed={favorites.includes(track.id)} onClick={() => favorite(track.id)}><Icon name="star" variant={favorites.includes(track.id) ? "filled" : "line"} /></Button></li>)}</ol>{!visible.length && <p className="mp-empty">{filter === "local" ? "Attach your audio from the Playing screen. Your files stay on this device." : "No tracks here yet. Try another search or add a favorite."}</p>}</div>
      </section>
      <section className="mp-now" aria-label="Selected recording">
        <div className="mp-now-scroll"><div className="mp-now-heading"><span className="mp-kicker">{playing ? "Now playing" : "Selected recording"}</span><div className="mp-now-tools"><Button variant="ghost" className="mp-sound-toggle" aria-expanded={soundOpen} aria-controls={soundId} onClick={() => setSoundOpen(value => !value)}><Icon name="sliders" />Sound</Button><Button variant="ghost" className="mp-icon" aria-label={`Favorite selected track, ${current.title}`} aria-pressed={favorites.includes(current.id)} onClick={() => favorite(current.id)}><Icon name="star" variant={favorites.includes(current.id) ? "filled" : "line"} /></Button></div></div>
          <div className="mp-title"><h2 ref={titleRef} tabIndex={-1}>{current.title}</h2><p>{current.artist}<span>{current.genre}</span></p></div>
          <div id={soundId}>{soundOpen ? <SoundPanel graph={graph} playing={playing} mode={processing} gains={gains} bypass={bypass} onGainsChange={setGains} onBypassChange={setBypass} /> : <>
          <div className="mp-artwork"><Cover track={current} large /><span className="mp-artwork-caption">{current.album}</span></div>

          <div className="mp-local"><div><Icon name="folder" /><span>{local ? local.name : "Local audio"}<small>{local ? "Attached for this session. Nothing is uploaded." : "Attach your own file for continuous queue playback."}</small></span></div><input ref={fileRef} type="file" accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac,.opus" aria-label={`Attach local audio to ${current.title}`} className="mp-file" onChange={event => { attach(event.target.files?.[0]); event.currentTarget.value = ""; }} /><Button variant="ghost" onClick={() => fileRef.current?.click()}><Icon name="attachment" />{local ? "Replace file" : "Attach audio"}</Button>{local && <Button variant="ghost" onClick={detach}>Use preview</Button>}</div>
          </>}</div>
        </div>
        <div className="mp-playback-dock">
          <div className="mp-source"><span>{local ? "Local audio" : "30-second preview"}</span><span>{local ? "On this device" : "Provided courtesy of iTunes"}</span></div>
          <div className="mp-seek"><MediaScrubber duration={length} value={position} step={0.1} aria-label={local ? "Local audio position" : "Preview position"} disabled={!duration} onValueChange={value => { const audio = audioRef.current; if (audio && duration) { audio.currentTime = value; setPosition(value); } }} /></div>
          <div className="mp-transport"><PlaybackControls playing={playing} onPlayingChange={active => active ? void play() : pause()} onPrevious={() => next(-1)} onNext={() => next(1)} previousDisabled={!queue.length} nextDisabled={!queue.length} label={local ? "Local audio playback" : "Preview playback"} /><div className="mp-volume"><Button variant="ghost" className="mp-icon" aria-label={muted ? "Unmute audio" : "Mute audio"} aria-pressed={muted} onClick={() => setMuted(value => !value)}><Icon name={muted || volume === 0 ? "volume-off" : "volume"} /></Button><Slider aria-label="Volume" min={0} max={100} value={volume} onValueChange={setVolume} aria-valuetext={`${volume} percent`} /><span>{muted ? "Muted" : `${volume}%`}</span></div></div>
          <a className="mp-store" href={current.url} target="_blank" rel="noreferrer"><img src="/interfaces/music-player/itunes-store-badge.svg" alt="Get it on iTunes Store" /><span>Listen to the full track<span>{current.artist} · {current.title}</span></span></a>
</div>
      </section>
      <section className="mp-queue" aria-label="Listening queue"><header><div><span className="mp-kicker">Up next</span><h2>Your queue</h2></div><Button variant="ghost" className="mp-icon" aria-label="Close queue" onClick={() => setScreen("library")}><Icon name="close" /></Button></header><div className="mp-queue-options"><Button variant="ghost" aria-pressed={shuffle} disabled={localQueue.length < 2} onClick={shuffleQueue}><Icon name="sort" />Shuffle</Button><Button variant="ghost" disabled={!localQueue.length} onClick={() => setRepeat(value => value === "off" ? "one" : value === "one" ? "all" : "off")} aria-label={`Repeat local audio: ${repeat}`}> <Icon name="refresh" />{repeat === "off" ? "Repeat off" : repeat === "one" ? "Repeat one" : "Repeat queue"}</Button><p>Shuffle and repeat apply to attached files.</p></div><div className="mp-queue-scroll"><ol>{queue.map((id, index) => { const track = tracks.find(item => item.id === id)!; return <li key={id} data-selected={id === selected}><Button variant="ghost" className="mp-queue-track" aria-label={`Select queued ${track.title}`} onClick={() => choose(id)}><span className="mp-queue-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{track.title}</strong><small>{track.artist} · {localFiles[id] ? "Local file" : "Preview"}</small></span></Button><div className="mp-queue-actions"><Button variant="ghost" className="mp-icon" disabled={index === 0} aria-label={`Move ${track.title} up`} onClick={() => move(id, -1)}><Icon name="arrow-up" /></Button><Button variant="ghost" className="mp-icon" disabled={index === queue.length - 1} aria-label={`Move ${track.title} down`} onClick={() => move(id, 1)}><Icon name="arrow-down" /></Button><Button variant="ghost" className="mp-icon" aria-label={`Remove ${track.title} from queue`} onClick={() => remove(id)}><Icon name="close" /></Button></div></li>; })}</ol>{!queue.length && <p className="mp-empty">The queue is empty. Your source playlist is still in the library.</p>}</div><div className="mp-queue-footer"><Button variant="ghost" onClick={() => { setQueue(tracks.map(track => track.id)); setShuffle(false); setNotice("The original 23-track queue has been restored."); }}>Restore playlist order</Button></div></section>
    </div>
    <footer className="mp-status"><span role="status">{loading ? "Loading audio…" : notice || (playing ? "Playing" : local ? "Local audio ready" : "Preview ready")}</span><span>{String(tracks.findIndex(track => track.id === current.id) + 1).padStart(2, "0")} / {tracks.length}</span></footer>
    <nav className="mp-mobile-nav" aria-label="Listening screens">{([{ id: "library", label: "Library", icon: "music" }, { id: "playing", label: "Playing", icon: "headphones" }, { id: "queue", label: "Queue", icon: "list-ordered" }] as const).map(item => <Button key={item.id} variant="ghost" aria-pressed={screen === item.id} onClick={() => setScreen(item.id)}><Icon name={item.icon} />{item.label}</Button>)}</nav>
  </section>;
}
