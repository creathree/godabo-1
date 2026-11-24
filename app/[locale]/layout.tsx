import { Suspense } from "react";
import { LOCALES } from "@/lib/locale";
import { LocaleValidate } from "./LocaleValidate";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  return (
    <Suspense
      fallback={
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      }
    >
      <LocaleValidate params={params}>{children}</LocaleValidate>
    </Suspense>
  );
}