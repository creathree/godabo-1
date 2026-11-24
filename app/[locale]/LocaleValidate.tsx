import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locale";

export async function LocaleValidate({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div
      data-locale={locale as Locale}
      className="relative z-10 flex flex-1 flex-col"
    >
      {children}
    </div>
  );
}