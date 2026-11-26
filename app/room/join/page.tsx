import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomJoinView } from "@/components/room/RoomJoinView";

export const metadata: Metadata = {
  title: "Room join · godabo",
  robots: { index: false, follow: false },
};

function RoomJoinFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-6 text-center text-white">
      <p className="text-sm text-neutral-300">読み込み中…</p>
    </main>
  );
}

export default function RoomJoinPage() {
  return (
    <Suspense fallback={<RoomJoinFallback />}>
      <RoomJoinView />
    </Suspense>
  );
}