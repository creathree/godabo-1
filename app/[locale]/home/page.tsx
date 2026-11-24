import { ScrollingBackground } from "@/components/ScrollingBackground";

export default function HomePage() {
  return (
    <>
      <ScrollingBackground />
      <main className="relative z-10 flex min-h-dvh flex-1 items-center justify-center">
        <h1 className="text-2xl font-semibold text-black drop-shadow-sm">
          Hello World
        </h1>
      </main>
    </>
  );
}