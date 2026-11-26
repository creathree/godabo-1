import type { RoomRouteSegment } from "./roomHub";

/** `wrangler tail` で追いやすいよう、イベント名は英語・値は短く。 */
const PREFIX = "[godabo-room]";

export function routeSegmentLabel(segment: RoomRouteSegment): string {
  if (segment.kind === "publicKey") {
    return `publicKey:${segment.value.slice(0, 8)}…`;
  }
  return `slug:${segment.value}`;
}

export function wssLog(
  event: string,
  fields?: Record<string, string | number | boolean | null | undefined>,
): void {
  const tail =
    fields && Object.keys(fields).length > 0
      ? ` ${JSON.stringify(fields)}`
      : "";
  console.log(`${PREFIX} ${event}${tail}`);
}