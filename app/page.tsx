import { redirect } from "next/navigation";
import { getIndexLocale } from "@/lib/locale";

/** `/` — locale を決めて Home へ */
export default function IndexPage() {
  const locale = getIndexLocale();
  redirect(`/${locale}/home`);
}