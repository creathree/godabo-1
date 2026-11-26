import { redirect } from "next/navigation";

/** `/` → トップ（サブドメイン側で製品名、パスは `/home`） */
export default function IndexPage() {
  redirect("/home");
}