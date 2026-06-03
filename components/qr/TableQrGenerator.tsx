"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { menuUrlWithTable } from "@/lib/table";
import { MaterialIcon } from "../ui/MaterialIcon";
import { Button } from "../ui/Button";

export function TableQrGenerator({
  initialTable = "1",
  onDownload,
  layout = "default",
  className = "",
}: {
  initialTable?: string;
  onDownload?(dataUrl: string, tableNumber: string): void;
  layout?: "default" | "sidebar";
  className?: string;
}) {
  const [tableNumber, setTableNumber] = useState(initialTable);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSidebar = layout === "sidebar";
  const qrSize = isSidebar ? 168 : 220;

  async function generate() {
    const table = tableNumber.trim() || "1";
    setGenerating(true);
    try {
      const base =
        process.env.NEXT_PUBLIC_APP_URL ??
        (typeof window !== "undefined" ? `${window.location.origin}/` : "/");
      const url = menuUrlWithTable(base, table);
      setScanUrl(url);
      const dataUrl = await QRCode.toDataURL(url, {
        margin: 1,
        width: qrSize * 2,
      });
      setQrDataUrl(dataUrl);
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyLink() {
    if (!scanUrl) return;
    try {
      await navigator.clipboard.writeText(scanUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={className}>
      <label
        className={[
          "block font-bold uppercase tracking-wider text-zinc-500",
          isSidebar ? "text-[10px]" : "text-xs",
        ].join(" ")}
      >
        Table number
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className={[
            "min-w-0 flex-1 rounded-xl border border-[var(--color-surface-line)] bg-white font-semibold text-zinc-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15",
            isSidebar ? "px-3 py-2 text-sm" : "px-3 py-2 text-sm",
          ].join(" ")}
          placeholder="e.g. 5"
          maxLength={12}
        />
        <button
          type="button"
          disabled={generating}
          onClick={() => void generate()}
          className={[
            "shrink-0 cursor-pointer rounded-xl border border-[var(--color-surface-line)] bg-white font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)] disabled:opacity-50",
            isSidebar ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm",
          ].join(" ")}
        >
          {generating ? "…" : "Go"}
        </button>
      </div>

      <div
        className={[
          "relative mt-4 flex justify-center overflow-hidden rounded-2xl",
          isSidebar
            ? "bg-gradient-to-b from-zinc-50 to-white p-3 ring-1 ring-[var(--color-surface-line)]"
            : "rounded-xl bg-zinc-50 p-4",
        ].join(" ")}
      >
        {generating && !qrDataUrl ? (
          <div
            className="flex items-center justify-center text-sm text-zinc-500"
            style={{ width: qrSize, height: qrSize }}
          >
            <MaterialIcon
              name="progress_activity"
              className="animate-spin text-3xl text-[var(--color-primary)]"
            />
          </div>
        ) : qrDataUrl ? (
          <div className="relative">
            <div
              className={[
                "absolute -inset-1 rounded-2xl bg-[var(--color-primary)]/10 blur-md",
                isSidebar ? "opacity-80" : "",
              ].join(" ")}
              aria-hidden
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`QR for table ${tableNumber}`}
              className="relative rounded-xl bg-white p-1.5 shadow-md"
              style={{ width: qrSize, height: qrSize }}
            />
          </div>
        ) : (
          <p
            className="text-sm text-zinc-500"
            style={{ width: qrSize, height: qrSize }}
          >
            Generating…
          </p>
        )}
      </div>

      {scanUrl ? (
        <div className="mt-3 space-y-2">
          <p
            className={[
              "font-bold uppercase tracking-wider text-zinc-400",
              isSidebar ? "text-[10px]" : "text-xs",
            ].join(" ")}
          >
            Scan link
          </p>
          <p
            className="break-all rounded-lg bg-zinc-50 px-2.5 py-2 font-mono text-[10px] leading-snug text-zinc-600 ring-1 ring-[var(--color-surface-line)]"
            title={scanUrl}
          >
            {scanUrl}
          </p>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[var(--color-surface-line)] bg-white py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            <MaterialIcon
              name={copied ? "check" : "content_copy"}
              filled={false}
              className="text-base"
            />
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      ) : null}

      {onDownload ? (
        <div className={isSidebar ? "mt-3" : "mt-4"}>
          <Button
            type="button"
            className={[
              "w-full gap-2",
              isSidebar ? "py-2.5 text-sm" : "",
            ].join(" ")}
            disabled={!qrDataUrl}
            onClick={() =>
              qrDataUrl && onDownload(qrDataUrl, tableNumber.trim() || "1")
            }
          >
            <MaterialIcon name="download" filled={false} className="text-lg" />
            Download PNG
          </Button>
        </div>
      ) : null}
    </div>
  );
}
