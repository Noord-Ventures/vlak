export type Platform = "ios" | "android";
export type DisplayProfile = {
  width: number;
  height: number;
  radius: number;
  bezel: number;
  safeTop: number;
  cutout: "island" | "punch" | "notch";
};
export type DeviceProfile = {
  id: string;
  name: string;
  platform: Platform;
  system: string;
  display: DisplayProfile;
  expanded?: DisplayProfile;
  source: string;
};

// Screen ratios come from published display pixels. CSS sizes and safe areas
// are explicit browser study targets, not claims about device point/dp defaults.
export const deviceProfiles: readonly DeviceProfile[] = [
  { id: "iphone-duo", name: "iPhone Duo", platform: "ios", system: "iOS 27", display: { width: 466, height: 678, radius: 36, bezel: 12, safeTop: 59, cutout: "island" }, expanded: { width: 951, height: 669, radius: 24, bezel: 12, safeTop: 59, cutout: "island" }, source: "https://www.apple.com/iphone-duo/specs/" },
  { id: "iphone-18-pro", name: "iPhone 18 Pro", platform: "ios", system: "iOS 27", display: { width: 402, height: 874, radius: 48, bezel: 9, safeTop: 59, cutout: "island" }, source: "https://www.apple.com/iphone-18-pro/specs/" },
  { id: "iphone-18-pro-max", name: "iPhone 18 Pro Max", platform: "ios", system: "iOS 27", display: { width: 440, height: 956, radius: 48, bezel: 9, safeTop: 59, cutout: "island" }, source: "https://www.apple.com/iphone-18-pro/specs/" },
  { id: "pixel-11", name: "Google Pixel 11", platform: "android", system: "Android 17", display: { width: 412, height: 925, radius: 38, bezel: 9, safeTop: 48, cutout: "punch" }, source: "https://store.google.com/product/pixel_11_specs?hl=en-US" },
  { id: "galaxy-s26-ultra", name: "Samsung Galaxy S26 Ultra", platform: "android", system: "Android 16", display: { width: 448, height: 971, radius: 20, bezel: 8, safeTop: 48, cutout: "punch" }, source: "https://news.samsung.com/global/samsung-unveils-galaxy-s26-series-the-most-intuitive-galaxy-ai-phone-yet" },
  { id: "galaxy-a17", name: "Samsung Galaxy A17 5G", platform: "android", system: "Android 16", display: { width: 412, height: 893, radius: 28, bezel: 12, safeTop: 48, cutout: "notch" }, source: "https://shop.samsung.com/ie/galaxy-a17-5g-blue-128gb" },
];
