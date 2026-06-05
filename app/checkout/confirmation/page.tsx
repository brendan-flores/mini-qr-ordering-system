import { redirect } from "next/navigation";
import { orderTrackUrl } from "@/lib/checkout-url";
import { MENU_PAGE_PATH } from "@/lib/routes";

type Props = {
  searchParams: Promise<{ orderId?: string; return?: string }>;
};

/** Legacy URL — forwards to order tracking. */
export default async function ConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderId = params.orderId;
  const returnTo = params.return;
  const homePath = returnTo?.startsWith("/") ? returnTo : MENU_PAGE_PATH;

  if (orderId) {
    redirect(orderTrackUrl(orderId, { placed: true, returnTo: homePath }));
  }
  redirect(MENU_PAGE_PATH);
}
