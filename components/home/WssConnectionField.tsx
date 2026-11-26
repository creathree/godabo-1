"use client";

/** ホスト用: ルーム作成・QR 共有・WSS 接続・ルーム内チャット（第三回） */
import { useCallback, useEffect } from "react";
import {
  generateRoomUserSlug,
  sanitizeRoomUserSlug,
} from "@/lib/room/slug";
import {
  readRoomUserSlugFromSession,
  writeRoomUserSlugToSession,
} from "@/lib/room/sessionStorage";
import { useRoomWss } from "@/hooks/useRoomWss";
import { RoomShareBlock } from "@/components/home/RoomShareBlock";
import { RoomChatPanel } from "@/components/room/RoomChatPanel";
import type { WssConnectionState } from "@/types/wss";

const STATE_LABEL: Record<WssConnectionState, string> = {
  idle: "未接続",
  connecting: "接続中…",
  open: "接続済み（ルーム作成）",
  closing: "切断中…",
  closed: "切断",
  error: "エラー",
  unconfigured: "WSS URL 未設定",
};

function buttonClass(state: WssConnectionState): string {
  const base =
    "flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";
  switch (state) {
    case "open":
      return `${base} border-emerald-500 bg-emerald-50 text-emerald-900`;
    case "connecting":
    case "closing":
      return `${base} border-amber-400 bg-amber-50 text-amber-900`;
    case "error":
      return `${base} border-red-500 bg-red-50 text-red-900`;
    case "unconfigured":
      return `${base} border-slate-300 bg-slate-100 text-slate-500`;
    default:
      return `${base} border-slate-400 bg-white text-slate-800 hover:bg-slate-50`;
  }
}

export function WssConnectionField() {
  const {
    wssBase,
    roomSlug,
    setRoomSlug,
    publicRoomKey,
    state,
    detail,
    connectBySlug,
    disconnect,
    chatLines,
    sendChat,
  } = useRoomWss();

  useEffect(() => {
    const saved = readRoomUserSlugFromSession();
    if (saved) setRoomSlug(saved);
  }, [setRoomSlug]);

  const persistSlug = useCallback((slug: string) => {
    const ok = sanitizeRoomUserSlug(slug);
    if (ok) writeRoomUserSlugToSession(ok);
  }, []);

  const onGenerateId = () => {
    const id = generateRoomUserSlug();
    setRoomSlug(id);
    writeRoomUserSlugToSession(id);
  };

  const onSlugChange = (value: string) => {
    setRoomSlug(value);
  };

  const onSlugBlur = () => {
    persistSlug(roomSlug);
  };

  const onToggle = () => {
    if (!wssBase) return;

    if (state === "open" || state === "connecting") {
      disconnect();
      return;
    }

    let slug = sanitizeRoomUserSlug(roomSlug);
    if (!slug) {
      slug = generateRoomUserSlug();
      setRoomSlug(slug);
      writeRoomUserSlugToSession(slug);
    } else {
      persistSlug(slug);
    }

    void connectBySlug(slug);
  };

  const activeSlug = sanitizeRoomUserSlug(roomSlug);
  const buttonLabel =
    state === "open" || state === "connecting" ? "切断" : "接続";

  return (
    <section
      className="w-full max-w-md rounded-2xl border border-white/20 bg-white/90 p-6 text-slate-900 shadow-lg backdrop-blur-sm"
      aria-labelledby="wss-field-title"
    >
      <h2 id="wss-field-title" className="text-lg font-semibold">
        Room / WSS
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        接続 = ルーム作成。QR / URL で他デバイスを同じルームへ。
      </p>

      <div className="mt-4 flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="room-id">
          ルーム ID
        </label>
        <div className="flex gap-2">
          <input
            id="room-id"
            type="text"
            value={roomSlug}
            onChange={(e) => onSlugChange(e.target.value)}
            onBlur={onSlugBlur}
            placeholder="例: apple_1"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onGenerateId}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            IDを生成
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <button
          type="button"
          className={buttonClass(state)}
          onClick={onToggle}
          disabled={state === "unconfigured" || state === "closing"}
          aria-pressed={state === "open"}
          aria-label={`WSS ${buttonLabel}`}
        >
          {buttonLabel}
        </button>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-base font-medium">{STATE_LABEL[state]}</p>
          {wssBase ? (
            <p className="mt-1 break-all text-xs text-slate-500">{wssBase}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              `.env.local` に `NEXT_PUBLIC_GODABO_WSS_URL=wss://...`
            </p>
          )}
          {detail ? (
            <p className="mt-2 text-xs text-slate-600">{detail}</p>
          ) : null}
        </div>
      </div>

      {state === "open" && publicRoomKey ? (
        <>
          <RoomShareBlock publicRoomKey={publicRoomKey} />
          <RoomChatPanel
            lines={chatLines}
            selfRole="host"
            disabled={state !== "open"}
            onSend={(text) => sendChat(text, "host")}
          />
        </>
      ) : null}
    </section>
  );
}