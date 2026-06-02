"use client";

import { Button } from "../ui/Button";

export function QrModal({
  qrDataUrl,
  onClose,
  onDownload,
}: {
  qrDataUrl: string;
  onClose(): void;
  onDownload(): void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold text-zinc-900">Menu QR Code</div>
            <div className="mt-1 text-sm text-zinc-600">
              Scan to open the ordering page
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
        <div className="mt-4 flex justify-center rounded-xl bg-zinc-50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR code" className="h-[220px] w-[220px]" />
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="button" className="flex-1" variant="secondary" onClick={onDownload}>
            Download
          </Button>
          <Button type="button" className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
