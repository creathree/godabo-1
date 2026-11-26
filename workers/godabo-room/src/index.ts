/**
 * godabo-room Worker（エッジ入口）
 *
 * ブラウザは Next ではなく、ここへ直接 WebSocket 接続します。
 * `/room/{公開鍵 or スラグ}` → 該当する Durable Object（RoomHub）へ振り分け。
 */
import { parseRoomRouteSegment, resolveRoomHub } from "./roomHub";
import { routeSegmentLabel, wssLog } from "./wssLog";

export { RoomHub } from "./roomHub";

export interface Env {
  ROOM_HUB: DurableObjectNamespace;
  GODABO_MASTER_ID: string;
  GODABO_ROOM_EPOCH?: string;
  GODABO_ROOM_HMAC_SECRET?: string;
  ENABLE_ROOM_AUTH?: string;
}

const worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response("ok", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    const isWs = request.headers.get("Upgrade") === "websocket";
    const segment = parseRoomRouteSegment(url.pathname);
    if (!segment) {
      wssLog("room.route.reject", {
        path: url.pathname,
        upgrade: isWs,
      });
      return new Response("Not Found", { status: 404 });
    }

    wssLog("room.route.hit", {
      route: routeSegmentLabel(segment),
      kind: segment.kind,
      upgrade: isWs,
    });

    if (env.ENABLE_ROOM_AUTH === "true") {
      const auth = request.headers.get("Authorization");
      if (auth !== `Bearer ${env.GODABO_MASTER_ID}`) {
        wssLog("room.auth.reject", { route: routeSegmentLabel(segment) });
        return new Response("Unauthorized", { status: 401 });
      }
    }

    try {
      const hub = await resolveRoomHub(env, segment);
      wssLog("room.do.stub", { route: routeSegmentLabel(segment) });
      const res = await hub.fetch(request);
      wssLog("room.upgrade.response", {
        route: routeSegmentLabel(segment),
        status: res.status,
      });
      return res;
    } catch (err) {
      wssLog("room.resolve.error", {
        route: routeSegmentLabel(segment),
        message: err instanceof Error ? err.message : "unknown",
      });
      return new Response("Room unavailable", { status: 503 });
    }
  },
};

export default worker;