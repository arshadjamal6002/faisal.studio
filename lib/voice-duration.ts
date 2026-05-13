/**
 * Reliable duration from raw audio bytes (works when HTMLAudioElement metadata is late/wrong).
 */
export async function probeAudioDurationSecFromBlob(blob: Blob): Promise<number | null> {
  if (typeof AudioContext === "undefined") return null;
  try {
    const ctx = new AudioContext();
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    await ctx.close().catch(() => {});
    if (Number.isFinite(buf.duration) && buf.duration > 0) return buf.duration;
  } catch {
    /* decode failed — wrong format or empty */
  }
  return null;
}
