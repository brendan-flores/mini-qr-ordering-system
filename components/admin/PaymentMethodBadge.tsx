import { paymentMethodLabel, type Order } from "../../client/services/orders";

export function PaymentMethodBadge({
  method,
  serviceType = "dine_in",
}: {
  method: Order["payment_method"];
  serviceType?: Order["service_type"];
}) {
  const isGcash = method === "gcash";
  return (
    <span
      className={[
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        isGcash
          ? "bg-[#e8f4ff] text-[#0057b8]"
          : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
      ].join(" ")}
    >
      {paymentMethodLabel(method, serviceType ?? "dine_in")}
    </span>
  );
}
