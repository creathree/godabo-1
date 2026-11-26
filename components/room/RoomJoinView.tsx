"use client";

import { useCallback, useEffect, useRef } from "react";
import { fetchPublicRoomKey } from "@/lib/room/fetchPublicRoomKey";
import { useRoomJoinQuery } from "@/hooks/useRoomJoinQuery";
import { RoomChatPanel } from "@/components/room/RoomChatPanel";
import { useRoomWss } from "@/hooks/useRoomWss";

const STATE_LABEL = {
  idle: "未接続（接続を開始します）",
  connecting: "ルームに接続中…",
  open: "接続済み",
  closing: "切断中…",
  closed: "切断",
  error: "接続エラー",
  unconfigured: "WSS URL 未設定",
} as const;

/**
 * 参加用ページ（`?k=` の公開鍵で同じ DO へ）。
 * Imaju Flash の wssconnect に近い「開いたらつなぐ」体験。
 */
export function RoomJoinView() {
  const { ready, publicKey, legacySlug } = useRoomJoinQuery();
  const {
    wssBase,
    state,
    detail,
    connectByPublicKey,
    publicRoomKey,
    chatLines,
    sendChat,
  } = useRoomWss();
  const startedRef = useRef(false);

  const startConnect = useCallback(
    async (key: string) => {
      connectByPublicKey(key);
    },
    [connectByPublicKey],
  );

  const resolveAndConnect = useCallback(async () => {
    if (publicKey) {
      await startConnect(publicKey);
      return;
    }
    if (legacySlug) {
      const key = await fetchPublicRoomKey(legacySlug);
      if (key) await startConnect(key);
    }
  }, [legacySlug, publicKey, startConnect]);

  useEffect(() => {
    if (!ready || !wssBase || startedRef.current) return;
    if (!publicKey && !legacySlug) return;

    startedRef.current = true;
    void resolveAndConnect();
  }, [ready, wssBase, publicKey, legacySlug, resolveAndConnect]);

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-6 text-center text-white">
        <p className="text-sm text-neutral-300">読み込み中…</p>
      </main>
    );
  }

  if (!publicKey && !legacySlug) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-6 text-center text-white">
        <p className="text-sm text-neutral-300">
          URL に `?k=`（ルーム鍵）が必要です
        </p>
      </main>
    );
  }

  const canRetry =
    state === "error" || state === "closed" || state === "idle";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center text-white">
      <p className="text-xs tracking-wide text-neutral-500 uppercase">
        godabo · room join
      </p>
      <h1 className="text-lg font-medium">ルーム参加</h1>
      <p className="text-sm text-neutral-300">{STATE_LABEL[state]}</p>
      {!wssBase ? (
        <p className="max-w-sm text-xs text-amber-300">
          `NEXT_PUBLIC_GODABO_WSS_URL` が未設定です（開発サーバーを再起動）
        </p>
      ) : null}
      {detail ? (
        <p className="max-w-sm break-all text-xs text-red-300">{detail}</p>
      ) : null}
      {publicRoomKey ? (
        <p className="max-w-sm break-all text-xs text-neutral-500">
          鍵: {publicRoomKey.slice(0, 12)}…
        </p>
      ) : null}
      {canRetry && wssBase && (publicKey || legacySlug) ? (
        <button
          type="button"
          onClick={() => {
            startedRef.current = true;
            void resolveAndConnect();
          }}
          className="rounded-lg border border-neutral-600 bg-neutral-900 px-4 py-2 text-sm font-medium hover:bg-neutral-800"
        >
          接続
        </button>
      ) : null}
      {state === "open" ? (
        <RoomChatPanel
          lines={chatLines}
          selfRole="join"
          disabled={state !== "open"}
          onSend={(text) => sendChat(text, "join")}
        />
      ) : null}
    </main>
  );
}