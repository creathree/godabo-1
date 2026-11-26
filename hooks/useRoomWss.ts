"use client";

/**
 * ルーム用 WebSocket（ホスト `/home` と参加 `/room/join` で共有）。
 * 接続フロー: スラグ → API で公開鍵 → `wss://Worker/room/{鍵}` → Worker DO
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { buildWssRoomUrl } from "@/lib/room/buildWssRoomUrl";
import { fetchPublicRoomKey } from "@/lib/room/fetchPublicRoomKey";
import { sanitizePublicRoomKey } from "@/lib/room/publicRoomKey";
import { sanitizeRoomUserSlug } from "@/lib/room/slug";
import { getGodaboWssUrl } from "@/lib/wssUrl";
import type { RoomChatLine, RoomChatRole } from "@/types/roomChat";
import type { WssConnectionState } from "@/types/wss";

export function useRoomWss(initialSlug = "") {
  const wssBase = getGodaboWssUrl();
  const [roomSlug, setRoomSlug] = useState(initialSlug);
  const [publicRoomKey, setPublicRoomKey] = useState<string | null>(null);
  const [state, setState] = useState<WssConnectionState>(
    wssBase ? "idle" : "unconfigured",
  );
  const [detail, setDetail] = useState("");
  const [chatLines, setChatLines] = useState<RoomChatLine[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const appendChatLine = useCallback((line: RoomChatLine) => {
    setChatLines((prev) => [...prev.slice(-49), line]);
  }, []);

  const closeSocket = useCallback(() => {
    const ws = wsRef.current;
    if (!ws) return;
    wsRef.current = null;
    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    ) {
      setState("closing");
      ws.close(1000, "client");
    }
  }, []);

  useEffect(() => () => closeSocket(), [closeSocket]);

  const openSocket = useCallback(
    (segment: string): boolean => {
      if (!wssBase) return false;

      const roomUrl = buildWssRoomUrl(segment);
      if (!roomUrl) {
        setState("error");
        setDetail("接続 URL を組み立てられません");
        return false;
      }

      closeSocket();
      setChatLines([]);
      setDetail(`Worker へ接続中… ${roomUrl}`);
      setState("connecting");

      try {
        const ws = new WebSocket(roomUrl);
        wsRef.current = ws;

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(String(ev.data)) as {
              type?: string;
              text?: string;
              role?: string;
              at?: number;
            };
            if (data.type === "relay" && typeof data.text === "string") {
              appendChatLine({
                text: data.text,
                role:
                  typeof data.role === "string" && data.role
                    ? data.role
                    : "peer",
                at: typeof data.at === "number" ? data.at : Date.now(),
              });
            }
          } catch {
            // 非 JSON は無視
          }
        };

        ws.onopen = () => {
          setState("open");
          setDetail("");
        };

        ws.onerror = () => {
          setState("error");
          setDetail(
            `WebSocket エラー（Worker 未到達のことが多い）→ ${roomUrl}`,
          );
        };

        ws.onclose = (ev) => {
          wsRef.current = null;
          setState((prev) => {
            if (prev === "closing") return "closed";
            if (prev === "error") return "error";
            if (prev === "connecting") return "error";
            return "closed";
          });
          if (ev.code !== 1000) {
            setDetail(
              `close code=${ev.code}${ev.reason ? ` ${ev.reason}` : ""} · ${roomUrl}`,
            );
          }
        };
      } catch (err) {
        setState("error");
        setDetail(err instanceof Error ? err.message : "接続できません");
        return false;
      }

      return true;
    },
    [appendChatLine, closeSocket, wssBase],
  );

  const sendChat = useCallback((text: string, role: RoomChatRole): boolean => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    const payload = text.trim().slice(0, 500);
    if (!payload) return false;
    ws.send(JSON.stringify({ type: "say", text: payload, role }));
    return true;
  }, []);

  const connectByPublicKey = useCallback(
    (keyInput: string) => {
      if (state === "open" || state === "connecting") {
        closeSocket();
        return true;
      }

      const key = sanitizePublicRoomKey(keyInput);
      if (!key) {
        setState("error");
        setDetail("ルーム鍵が不正です（64桁 hex）");
        return false;
      }

      setPublicRoomKey(key);
      return openSocket(key);
    },
    [closeSocket, openSocket, state],
  );

  const connectBySlug = useCallback(
    async (slugInput?: string) => {
      if (!wssBase) return false;

      if (state === "open" || state === "connecting") {
        closeSocket();
        return true;
      }

      const raw = (slugInput ?? roomSlug).trim();
      const slug = sanitizeRoomUserSlug(raw);
      if (!slug) {
        setState("error");
        setDetail("ルーム ID が不正です（英数字・-_ のみ、1〜32文字）");
        return false;
      }

      if (slug !== roomSlug) setRoomSlug(slug);

      setState("connecting");
      setDetail("ルーム鍵を取得中…");

      const publicKey = await fetchPublicRoomKey(slug);
      if (!publicKey) {
        setState("error");
        setDetail(
          "公開鍵を取得できません（この段階では Worker へ未送信）。DevTools の Console / Network で POST /api/room/public-key を確認",
        );
        return false;
      }

      setPublicRoomKey(publicKey);
      return openSocket(publicKey);
    },
    [closeSocket, openSocket, roomSlug, state, wssBase],
  );

  const disconnect = useCallback(() => {
    closeSocket();
  }, [closeSocket]);

  return {
    wssBase,
    roomSlug,
    setRoomSlug,
    publicRoomKey,
    state,
    detail,
    connectBySlug,
    connectByPublicKey,
    disconnect,
    chatLines,
    sendChat,
    isOpen: state === "open",
    isConnecting: state === "connecting",
  };
}