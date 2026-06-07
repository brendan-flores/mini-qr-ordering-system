import { redirect } from "next/navigation";
import { MENU_PAGE_PATH } from "@/lib/shared/config/routes";

export default function Home() {
  redirect(MENU_PAGE_PATH);
}
