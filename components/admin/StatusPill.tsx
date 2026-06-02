import type { Order } from "../../client/services/orders";
import { effectivePaymentStatus } from "../../lib/orders/order-rules";

const styles: Record<"Pending" | "Paid" | "Failed", string> = {
  Pending:
    "bg-[#e6eeff] text-[#121c2a] [&_.dot]:bg-[#906f70]",
  Paid: "bg-[#ffddb8] text-[#2a1700] [&_.dot]:bg-[#815100]",
  Failed: "bg-[#ffdad6] text-[#93000a] [&_.dot]:bg-[#ba1a1a]",
};

export function StatusPill({ status }: { status: Order["payment_status"] }) {
  const label = effectivePaymentStatus(status);
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[label],
      ].join(" ")}
    >
      <span className="dot h-1.5 w-1.5 shrink-0 rounded-full" />
      {label}
    </span>
  );
}
