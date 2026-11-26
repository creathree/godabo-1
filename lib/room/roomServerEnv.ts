import { requireGodaboMasterId } from "@/lib/godaboMasterId";

/** Next API / Route で `resolveRoomDoName` するとき Worker と同じ env 形 */
export function getRoomKeyServerEnv(): {
  GODABO_ROOM_EPOCH?: string;
  GODABO_MASTER_ID: string;
  GODABO_ROOM_HMAC_SECRET?: string;
} {
  return {
    GODABO_ROOM_EPOCH: process.env.GODABO_ROOM_EPOCH?.trim(),
    GODABO_MASTER_ID: requireGodaboMasterId(),
    GODABO_ROOM_HMAC_SECRET: process.env.GODABO_ROOM_HMAC_SECRET?.trim(),
  };
}