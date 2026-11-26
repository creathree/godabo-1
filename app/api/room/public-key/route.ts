/**
 * ホストだけが呼ぶ API: スラグ → 共有用の公開鍵（HMAC hex）。
 * 秘密鍵はサーバーにだけあり、ブラウザに渡しません。
 */
import { NextResponse } from "next/server";
import { resolveRoomDoName } from "@/lib/room/roomKey";
import { getRoomKeyServerEnv } from "@/lib/room/roomServerEnv";
import { sanitizePublicRoomKey } from "@/lib/room/publicRoomKey";
import { sanitizeRoomUserSlug } from "@/lib/room/slug";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const slugRaw =
    body && typeof body === "object" && "slug" in body
      ? String((body as { slug: unknown }).slug)
      : "";
  const slug = sanitizeRoomUserSlug(slugRaw);
  if (!slug) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  try {
    const publicKey = await resolveRoomDoName(slug, getRoomKeyServerEnv());
    const checked = sanitizePublicRoomKey(publicKey);
    if (!checked) {
      return NextResponse.json({ error: "key generation failed" }, { status: 500 });
    }
    return NextResponse.json({ publicKey: checked });
  } catch {
    return NextResponse.json({ error: "room key unavailable" }, { status: 503 });
  }
}