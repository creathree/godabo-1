"use client";

import { useCallback, useMemo, useState } from "react";
import { buildRoomJoinPageUrl } from "@/lib/room/buildRoomJoinUrl";
import { useQrDataUrl } from "@/hooks/useQrDataUrl";

type Props = {
  publicRoomKey: string;
};

export function RoomShareBlock({ publicRoomKey }: Props) {
  const joinUrl = useMemo(
    () => buildRoomJoinPageUrl(publicRoomKey),
    [publicRoomKey],
  );
  const qrDataUrl = useQrDataUrl(joinUrl);
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    if (!joinUrl || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [joinUrl]);

  if (!joinUrl) return null;

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-800">参加用 URL / QR</p>
      <p className="mt-1 text-xs text-slate-600">
        リンクを開くと参加用ページが開き、同じルームに WSS 接続します。
      </p>
      <a
        href={joinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block break-all text-sm font-medium text-sky-700 underline-offset-2 hover:underline"
      >
        {joinUrl}
      </a>
      <button
        type="button"
        onClick={() => void onCopy()}
        className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
      >
        {copied ? "コピーしました" : "URL をコピー"}
      </button>
      {qrDataUrl ? (
        <div className="mt-4 flex justify-center">
          <img
            src={qrDataUrl}
            width={200}
            height={200}
            alt="ルーム参加 QR"
            className="rounded-lg border border-slate-200 bg-white p-2"
          />
        </div>
      ) : null}
    </div>
  );
}