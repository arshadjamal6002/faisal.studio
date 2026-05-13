import { NextResponse } from "next/server";
import {
  fetchInstagramVideoBytes,
  parseInstagramShareUrl,
} from "@/lib/instagram-reel-resolve";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let url: string | undefined;
  try {
    const body = (await req.json()) as { url?: unknown };
    url = typeof body.url === "string" ? body.url.trim() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: "Missing link." }, { status: 400 });
  }

  if (!parseInstagramShareUrl(url)) {
    return NextResponse.json(
      { error: "That does not look like an Instagram reel or post link." },
      { status: 422 },
    );
  }

  try {
    const { body: buf, contentType, fileBase } = await fetchInstagramVideoBytes(url);
    const ext = contentType.includes("webm") ? "webm" : "mp4";
    const filename = `${fileBase}.${ext}`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Clip-Filename": filename,
      },
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Something went wrong fetching this clip.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
