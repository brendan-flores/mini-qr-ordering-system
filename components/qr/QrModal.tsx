"use client";

import { TableQrGenerator } from "./TableQrGenerator";
import { Button } from "../ui/Button";

export function QrModal({
  initialTable = "1",
  onClose,
}: {
  initialTable?: string;
  onClose(): void;
  /** @deprecated Download is handled inside TableQrGenerator modal. */
  onDownload?: (dataUrl: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold text-zinc-900">
              Table QR Code
            </div>
            <div className="mt-1 text-sm text-zinc-600">
              Guests scan to open the menu for this table.
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="px-2"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </Button>
        </div>

        <TableQrGenerator initialTable={initialTable} className="mt-4" />

        <div className="mt-4">
          <Button type="button" className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
