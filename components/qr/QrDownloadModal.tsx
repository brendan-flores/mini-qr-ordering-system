"use client";

import { useEffect, useState } from "react";
import {
  buildTableQrDownloadImage,
  tableQrDownloadLabel,
  triggerQrPngDownload,
} from "@/lib/qr-download-image";
import { MaterialIcon } from "../ui/MaterialIcon";
import { Button } from "../ui/Button";

export function QrDownloadModal({
  qrDataUrl,
  tableNumber,
  scanUrl,
  onClose,
}: {
  qrDataUrl: string;
  tableNumber: string;
  scanUrl?: string | null;
  onClose(): void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [building, setBuilding] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const label = tableQrDownloadLabel(tableNumber);

  useEffect(() => {
    let cancelled = false;
    setBuilding(true);
    setError(null);
    void buildTableQrDownloadImage(qrDataUrl, tableNumber)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError("Could not prepare download preview.");
      })
      .finally(() => {
        if (!cancelled) setBuilding(false);
      });
    return () => {
      cancelled = true;
    };
  }, [qrDataUrl, tableNumber]);

  async function handleDownload() {
    if (!previewUrl) return;
    setDownloading(true);
    setError(null);
    try {
      triggerQrPngDownload(previewUrl, tableNumber);
      setDone(true);
      window.setTimeout(() => onClose(), 1200);
    } catch {
      setError("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-download-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-surface-line)] px-5 py-4">
          <div>
            <h2
              id="qr-download-title"
              className="text-lg font-bold text-[var(--foreground)]"
            >
              Download QR code
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Print-ready image includes the table number and one-device
              instructions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100"
            aria-label="Close"
          >
            <MaterialIcon name="close" filled={false} className="text-xl" />
          </button>
        </div>

        <div className="bg-[var(--color-surface-subtle)] px-5 py-5">
          <div className="mx-auto flex max-w-[300px] flex-col items-center justify-center rounded-2xl border border-[var(--color-surface-line)] bg-white p-3 shadow-sm sm:max-w-[340px]">
            {building ? (
              <div className="flex aspect-[440/700] w-full items-center justify-center">
                <MaterialIcon
                  name="progress_activity"
                  className="animate-spin text-4xl text-[var(--color-primary)]"
                />
              </div>
            ) : previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt={`Printable QR for ${label}`}
                className="block h-auto w-full rounded-lg"
              />
            ) : (
              <p className="py-12 text-center text-sm text-rose-700">{error}</p>
            )}
          </div>

          {scanUrl ? (
            <p
              className="mt-3 break-all text-center font-mono text-[10px] text-[var(--color-text-muted)]"
              title={scanUrl}
            >
              {scanUrl}
            </p>
          ) : null}
        </div>

        {error && !building ? (
          <p className="px-5 pb-2 text-center text-sm text-rose-700">{error}</p>
        ) : null}

        {done ? (
          <div className="flex items-center justify-center gap-2 border-t border-[var(--color-surface-line)] bg-[var(--color-primary-soft)] px-5 py-4 text-sm font-semibold text-[var(--color-primary-dark)]">
            <MaterialIcon name="check_circle" filled className="text-lg" />
            Download started
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-surface-line)] px-5 py-4 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full whitespace-nowrap sm:flex-1"
              disabled={!previewUrl || building || downloading}
              onClick={() => void handleDownload()}
            >
              <MaterialIcon
                name="download"
                filled={false}
                className="shrink-0 text-lg"
              />
              {downloading ? "Saving…" : "Download PNG"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
