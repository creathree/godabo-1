/**
 * RoomHub = 1 ルームにつき 1 つの Durable Object。
 * 同じ DO に接続した端末同士でメッセージを中継します（デモは簡易チャット）。
 */
import { resolveRoomDoName } from "../../../lib/room/roomKey";

import { PUBLIC_ROOM_DO_NAME_RE } from "../../../lib/room/publicRoomKey";
import { wssLog } from "./wssLog";

const SLUG_RE = /^[a-zA-Z0-9_-]{1,32}$/;

export type RoomRouteSegment =
  | { kind: "publicKey"; value: string }
  | { kind: "slug"; value: string };

export interface RoomEnv {
  GODABO_MASTER_ID: string;
  GODABO_ROOM_EPOCH?: string;
  GODABO_ROOM_HMAC_SECRET?: string;
  ROOM_HUB: DurableObjectNamespace;
}

export class RoomHub implements DurableObject {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      wssLog("do.upgrade.reject", { reason: "not-websocket" });
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.state.acceptWebSocket(server);
    const sockets = this.state.getWebSockets();
    wssLog("do.ws.accept", { openCount: sockets.length });

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    const len = typeof message === "string" ? message.length : message.byteLength;
    wssLog("do.ws.message", { bytes: len, textMode: typeof message === "string" });
    if (typeof message !== "string") return;

    let relayText: string | null = null;
    let role = "peer";
    try {
      const data = JSON.parse(message) as {
        type?: string;
        text?: string;
        role?: string;
      };
      if (data.type === "say" && typeof data.text === "string") {
        relayText = data.text.slice(0, 500);
        role =
          typeof data.role === "string" && data.role.trim()
            ? data.role.trim().slice(0, 16)
            : "peer";
      }
    } catch {
      relayText = message.slice(0, 500);
    }

    if (!relayText) return;

    // ルーム内の全員に同じ JSON を配る（自分にも返る）
    const out = JSON.stringify({
      type: "relay",
      text: relayText,
      role,
      at: Date.now(),
    });
    for (const peer of this.state.getWebSockets()) {
      try {
        peer.send(out);
      } catch {
        // 切断済みソケットは無視
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string) {
    wssLog("do.ws.close", { code, reason: reason || null });
    ws.close(code, reason);
  }
}

export function parseRoomRouteSegment(
  pathname: string,
): RoomRouteSegment | null {
  const m = /^\/room\/([^/]+)$/.exec(pathname);
  if (!m) return null;
  try {
    const raw = decodeURIComponent(m[1]);
    if (PUBLIC_ROOM_DO_NAME_RE.test(raw)) {
      return { kind: "publicKey", value: raw.toLowerCase() };
    }
    if (SLUG_RE.test(raw)) {
      return { kind: "slug", value: raw };
    }
    return null;
  } catch {
    return null;
  }
}

/** @deprecated use parseRoomRouteSegment */
export function parseUserSlugFromPath(pathname: string): string | null {
  const seg = parseRoomRouteSegment(pathname);
  return seg?.kind === "slug" ? seg.value : null;
}

export async function resolveRoomHub(
  env: RoomEnv,
  segment: RoomRouteSegment,
): Promise<DurableObjectStub> {
  const doName =
    segment.kind === "publicKey"
      ? segment.value
      : await resolveRoomDoName(segment.value, env);
  const id = env.ROOM_HUB.idFromName(doName);
  wssLog("room.do.name", {
    kind: segment.kind,
    doPrefix: doName.slice(0, 8) + "…",
  });
  return env.ROOM_HUB.get(id);
}