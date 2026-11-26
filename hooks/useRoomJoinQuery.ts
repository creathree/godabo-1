"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { sanitizePublicRoomKey } from "@/lib/room/publicRoomKey";
import { sanitizeRoomUserSlug } from "@/lib/room/slug";

/** Next の searchParams が空になる瞬間があるため `location.search` も見る */
export function useRoomJoinQuery(): {
  ready: boolean;
  publicKey: string | null;
  legacySlug: string | null;
} {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [legacySlug, setLegacySlug] = useState<string | null>(null);

  useEffect(() => {
    const fromRouterK = (searchParams.get("k") ?? "").trim();
    const fromRouterRoom = (searchParams.get("room") ?? "").trim();
    const sp =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const fromWindowK = (sp?.get("k") ?? "").trim();
    const fromWindowRoom = (sp?.get("room") ?? "").trim();

    const kRaw = fromRouterK || fromWindowK;
    const roomRaw = fromRouterRoom || fromWindowRoom;

    setPublicKey(sanitizePublicRoomKey(kRaw));
    setLegacySlug(sanitizeRoomUserSlug(roomRaw));
    setReady(true);
  }, [searchParams]);

  return { ready, publicKey, legacySlug };
}