import { TABLE_QR_ONE_DEVICE_INSTRUCTION } from "@/lib/client/qr/qr-download-image";
import { MaterialIcon } from "../ui/MaterialIcon";

export function QrOneDeviceNotice({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "rounded-xl border border-[var(--color-surface-line)] bg-[#faf7f7] px-3.5 py-2.5 text-center text-zinc-700",
        className,
      ].join(" ")}
      role="note"
    >
      <p className="flex items-start justify-center gap-1.5 text-left text-sm leading-snug sm:text-center">
        <MaterialIcon
          name="smartphone"
          filled={false}
          className="mt-0.5 shrink-0 text-base text-[var(--color-primary)]"
        />
        <span>{TABLE_QR_ONE_DEVICE_INSTRUCTION}</span>
      </p>
    </div>
  );
}
