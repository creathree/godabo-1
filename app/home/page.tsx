import { HeroTitleBanner } from "@/components/home/HeroTitleBanner";
// import { JellySpringRect } from "@/components/home/JellySpringRect";
import { WssConnectionField } from "@/components/home/WssConnectionField";
import { ScrollingBackground } from "@/components/ScrollingBackground";

export default function HomePage() {
  return (
    <>
      <ScrollingBackground />
      <main className="relative z-10 flex min-h-dvh flex-1 flex-col items-center justify-center gap-10 px-4 py-10">
        {/* <JellySpringRect /> — ゼリーバネデモ保留 */}
        <HeroTitleBanner />
        <WssConnectionField />
      </main>
    </>
  );
}