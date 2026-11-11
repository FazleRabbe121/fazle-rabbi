/** Base path the app is served from ("/" in Lovable, "/repo/" on GitHub Pages). */
export const BASE_URL = import.meta.env.BASE_URL || "/";
export const publicAsset = (file: string) => `${BASE_URL.replace(/\/$/, "")}/${file.replace(/^\//, "")}`;

/** Replace public/hero.mp4 with your own video. The poster image shows if the file is missing. */
export const HERO_VIDEO_SRC = publicAsset("hero.mp4");
/** Replace public/Fazle-Rabbi-CV.pdf with your real CV. */
export const CV_URL = publicAsset("Fazle-Rabbi-CV.pdf");
