"use client";

import { useState } from "react";
import type { RoomChatLine } from "@/types/roomChat";

type Props = {
  lines: RoomChatLine[];
  disabled?: boolean;
  selfRole: string;
  onSend: (text: string) => boolean;
};

export function RoomChatPanel({ lines, disabled, selfRole, onSend }: Props) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text || disabled) return;
    if (onSend(text)) setDraft("");
  };

  return (
    <div className="mt-4 w-full max-w-md rounded-xl border border-slate-200 bg-white/95 p-3 text-left text-slate-900">
      <p className="text-xs font-semibold text-slate-700">
        ルーム内チャット（疎通確認）
      </p>
      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
        {lines.length === 0 ? (
          <li className="text-slate-500">まだメッセージはありません</li>
        ) : (
          lines.map((line) => (
            <li key={`${line.at}-${line.role}-${line.text}`}>
              <span className="font-medium text-slate-600">
                [{line.role === selfRole ? "自分" : line.role}]
              </span>{" "}
              {line.text}
            </li>
          ))
        )}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="メッセージを送信"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          disabled={disabled || !draft.trim()}
          onClick={submit}
          className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          送信
        </button>
      </div>
    </div>
  );
}