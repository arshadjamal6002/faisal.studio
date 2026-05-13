/**
 * Server-only helpers to resolve a public Instagram reel/post page to a CDN video URL.
 * Best-effort: Instagram changes markup often; failures are expected — UI falls back to manual upload.
 */

const FETCH_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const MAX_VIDEO_BYTES = 120 * 1024 * 1024;

export type ParsedInstagramPost = {
  shortcode: string;
  embedPath: "reel" | "p";
};

export function parseInstagramShareUrl(urlStr: string): ParsedInstagramPost | null {
  let u: URL;
  try {
    u = new URL(urlStr.trim());
  } catch {
    return null;
  }

  const host = u.hostname.replace(/^www\./i, "").toLowerCase();
  if (host !== "instagram.com") return null;

  const parts = u.pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const kind = parts[0].toLowerCase();
  const shortcode = parts[1];
  if (!/^[A-Za-z0-9_-]+$/.test(shortcode)) return null;

  if (kind === "reel" || kind === "reels") {
    return { shortcode, embedPath: "reel" };
  }
  if (kind === "p" || kind === "tv") {
    return { shortcode, embedPath: "p" };
  }

  return null;
}

function decodeInstagramEscapedJsonSubstring(raw: string): string {
  return raw
    .replace(/\\u0026/g, "&")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, "/")
    .replace(/\\\\/g, "\\");
}

function extractVideoUrlFromEmbedHtml(html: string): string | null {
  const patterns = [
    /"video_url":"((?:[^"\\]|\\.)*)"/,
    /"playback_url":"((?:[^"\\]|\\.)*)"/,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const decoded = decodeInstagramEscapedJsonSubstring(m[1]);
      if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
        return decoded;
      }
    }
  }

  return null;
}

function isAllowedInstagramVideoHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h.endsWith(".cdninstagram.com") ||
    h.endsWith(".fbcdn.net") ||
    h === "cdninstagram.com"
  );
}

export async function resolveInstagramVideoDownloadUrl(pageUrl: string): Promise<string> {
  const parsed = parseInstagramShareUrl(pageUrl);
  if (!parsed) {
    throw new Error("That does not look like an Instagram reel or post link.");
  }

  const embedUrl =
    parsed.embedPath === "reel"
      ? `https://www.instagram.com/reel/${parsed.shortcode}/embed/`
      : `https://www.instagram.com/p/${parsed.shortcode}/embed/`;

  const pageRes = await fetch(embedUrl, {
    headers: {
      "User-Agent": FETCH_UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!pageRes.ok) {
    throw new Error("Instagram did not return the clip page.");
  }

  const html = await pageRes.text();
  const videoUrl = extractVideoUrlFromEmbedHtml(html);
  if (!videoUrl) {
    throw new Error("Could not read video info from Instagram.");
  }

  let videoOrigin: URL;
  try {
    videoOrigin = new URL(videoUrl);
  } catch {
    throw new Error("Invalid video URL from Instagram.");
  }

  if (videoOrigin.protocol !== "https:" || !isAllowedInstagramVideoHost(videoOrigin.hostname)) {
    throw new Error("Unexpected video host.");
  }

  return videoUrl;
}

export async function fetchInstagramVideoBytes(
  pageUrl: string,
): Promise<{ body: ArrayBuffer; contentType: string; fileBase: string }> {
  const parsed = parseInstagramShareUrl(pageUrl);
  const fileBase = parsed
    ? `instagram-${parsed.shortcode}`
    : "instagram-clip";

  const videoUrl = await resolveInstagramVideoDownloadUrl(pageUrl);

  const vidRes = await fetch(videoUrl, {
    headers: {
      "User-Agent": FETCH_UA,
      Referer: "https://www.instagram.com/",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!vidRes.ok) {
    throw new Error("Could not download the video file.");
  }

  const len = vidRes.headers.get("content-length");
  if (len && Number(len) > MAX_VIDEO_BYTES) {
    throw new Error("This clip is too large to import here.");
  }

  const buf = await vidRes.arrayBuffer();
  if (buf.byteLength > MAX_VIDEO_BYTES) {
    throw new Error("This clip is too large to import here.");
  }

  const ct = vidRes.headers.get("content-type") || "video/mp4";
  return { body: buf, contentType: ct.split(";")[0].trim() || "video/mp4", fileBase };
}

export { MAX_VIDEO_BYTES };
