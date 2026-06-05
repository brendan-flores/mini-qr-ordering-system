"use client";

import { MaterialIcon } from "../ui/MaterialIcon";

/** Fixed banner when the guest QR session ends (admin terminate, inactivity, etc.). */
export function QrSessionAlert({ message }: { message: string }) {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] border-b border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm sm:px-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto flex max-w-3xl items-start gap-2">
        <MaterialIcon
          name="info"
          filled={false}
          className="mt-0.5 shrink-0 text-base text-amber-700"
        />
        <p className="leading-snug">{message}</p>
      </div>
    </div>
  );
}
