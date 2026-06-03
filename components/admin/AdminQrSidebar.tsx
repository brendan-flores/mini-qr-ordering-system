"use client";

import { TableQrGenerator } from "../qr/TableQrGenerator";
import { MaterialIcon } from "../ui/MaterialIcon";

export function AdminQrSidebar({ className = "" }: { className?: string }) {
  return (
    <section
      className={["admin-qr-panel", className].join(" ")}
      aria-labelledby="admin-qr-heading"
    >
      <div className="overflow-hidden rounded-2xl border border-white/40 shadow-[0_20px_50px_rgba(146,0,40,0.18)]">
        <div className="relative bg-gradient-to-br from-[#6d001f] via-[var(--color-primary)] to-[#e8365f] px-4 py-4">
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-4 left-2 h-16 w-16 rounded-full bg-black/10 blur-xl"
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
              <MaterialIcon name="qr_code_2" filled className="text-2xl" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2
                id="admin-qr-heading"
                className="text-base font-bold leading-tight text-white"
              >
                Table QR codes
              </h2>
              <p className="mt-1 text-xs leading-snug text-white/85">
                Print & place on tables — guests scan to order
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--color-surface-line)] bg-white px-4 py-4">
          <TableQrGenerator layout="sidebar" />
        </div>

        <ul className="flex flex-col gap-2 border-t border-[var(--color-surface-line)] bg-[#faf8f9] px-4 py-3.5">
          {[
            { step: "1", text: "Enter table number" },
            { step: "2", text: "Preview & download PNG" },
            { step: "3", text: "Display QR at the table" },
          ].map((item) => (
            <li
              key={item.step}
              className="flex items-center gap-2.5 text-xs text-[var(--color-text-muted)]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                {item.step}
              </span>
              <span className="font-medium">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 px-1 text-center text-[10px] leading-relaxed text-[var(--color-text-muted)]/80">
        Without a table QR, guests can still order takeout from the menu; the
        table number appears only after scanning.
      </p>
    </section>
  );
}
