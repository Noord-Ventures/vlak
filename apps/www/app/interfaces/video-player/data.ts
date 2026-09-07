// Official publisher / artist uploads. Vimeo Iron playback verified 8 September 2026.
export const videos = [
  { id: "MSUGmeWqbCY", provider: "youtube", artist: "Loathe", title: "Two-Way Mirror", publisher: "SharpTone Records", thumbnail: "https://i.ytimg.com/vi/MSUGmeWqbCY/hqdefault.jpg" },
  { id: "eYoINidnLRQ", provider: "youtube", artist: "Foals", title: "Spanish Sahara", publisher: "Foals", thumbnail: "https://i.ytimg.com/vi/eYoINidnLRQ/hqdefault.jpg" },
  { id: "21604065", provider: "vimeo", artist: "Woodkid", title: "Iron", publisher: "Woodkid", thumbnail: "https://i.vimeocdn.com/video/139202680-d7c9d4a9bee7b25171b2cec24c0008491f087e0db1004ccec6d869300b1c9dc3-d_295x166" },
] as const;
export type MusicVideo = (typeof videos)[number];
export const providerName = (video: MusicVideo) => video.provider === "vimeo" ? "Vimeo" : "YouTube";
export const watchUrl = (video: MusicVideo) => video.provider === "vimeo" ? `https://vimeo.com/${video.id}` : `https://www.youtube.com/watch?v=${video.id}`;
