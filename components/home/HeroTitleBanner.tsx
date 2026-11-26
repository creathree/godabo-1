import Image from "next/image";

/** タイトルバナー置き場（初回プリンアニメは後付け） */
export function HeroTitleBanner() {
  return (
    <section
      className="absolute left-0 right-0 top-[30px] z-20 flex w-full justify-center px-[max(1.5rem,10vw)]"
      aria-label="タイトルバナー"
    >
      <div
        className="flex h-[200px] w-full max-w-3xl items-center justify-center p-4 sm:max-w-4xl"
        role="banner"
      >
        <Image
          src="/images/title_ja.png"
          alt="ゴダボーワン"
          width={640}
          height={160}
          className="h-auto max-h-[168px] w-full max-w-full object-contain"
          priority
        />
      </div>
    </section>
  );
}