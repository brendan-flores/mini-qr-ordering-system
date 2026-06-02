"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { menuUrlWithTable } from "@/lib/table";
import { Button } from "../ui/Button";

export function QrModal({
  initialTable = "1",
  onClose,
  onDownload,
}: {
  initialTable?: string;
  onClose(): void;
  onDownload(dataUrl: string): void;
}) {
  const [tableNumber, setTableNumber] = useState(initialTable);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function generate() {
    const table = tableNumber.trim() || "1";
    setGenerating(true);
    try {
      const base =
        process.env.NEXT_PUBLIC_APP_URL ??
        (typeof window !== "undefined" ? `${window.location.origin}/` : "/");
      const url = menuUrlWithTable(base, table);
      const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 220 });
      setQrDataUrl(dataUrl);
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold text-zinc-900">Table QR Code</div>
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

        <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-zinc-500">
          Table number
        </label>
        <div className="mt-1 flex gap-2">
          <input
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--color-surface-line)] px-3 py-2 text-sm font-semibold outline-none focus:border-[var(--color-primary)]"
            placeholder="e.g. 5"
            maxLength={12}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={generating}
            onClick={() => void generate()}
          >
            {generating ? "…" : "Update"}
          </Button>
        </div>

        <div className="mt-4 flex justify-center rounded-xl bg-zinc-50 p-4">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt={`QR for table ${tableNumber}`} className="h-[220px] w-[220px]" />
          ) : (
            <p className="py-16 text-sm text-zinc-500">Generating…</p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            className="flex-1"
            variant="secondary"
            disabled={!qrDataUrl}
            onClick={() => qrDataUrl && onDownload(qrDataUrl)}
          >
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
