"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  IntegerTableNumberError,
  menuUrlWithTable,
  validateIntegerTableNumber,
} from "@/lib/client/session/table";
import { resolveMenuBaseUrlForQr } from "@/lib/shared/config/app-hosts";
import {
  getAdminQrTableNumber,
  setAdminQrTableNumber,
} from "@/lib/client/session/admin-qr-table";
import { tableQrDownloadLabel } from "@/lib/client/qr/qr-download-image";
import { MaterialIcon } from "../ui/MaterialIcon";
import { Button } from "../ui/Button";
import { QrDownloadModal } from "./QrDownloadModal";

export function TableQrGenerator({
  initialTable,
  layout = "default",
  className = "",
}: {
  initialTable?: string;
  layout?: "default" | "sidebar";
  className?: string;
}) {
  const [tableNumber, setTableNumber] = useState(initialTable ?? "");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [restoringQr, setRestoringQr] = useState(false);
  const restoredRef = useRef(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  const isSidebar = layout === "sidebar";
  const qrSize = isSidebar ? 168 : 220;
  const validation = validateIntegerTableNumber(tableNumber);
  const displayTable = validation.ok ? validation.table : "";
  const tableLabel = validation.ok
    ? tableQrDownloadLabel(displayTable)
    : "Table —";
  const canUseTable = validation.ok;

  async function generate(
    tableOverride?: string,
    options?: { showProgress?: boolean }
  ) {
    const showProgress = options?.showProgress !== false;
    const checked = validateIntegerTableNumber(tableOverride ?? tableNumber);
    if (!checked.ok) {
      setTableError(checked.message);
      setQrDataUrl(null);
      setScanUrl(null);
      return;
    }
    setTableError(null);
    const table = checked.table;
    setAdminQrTableNumber(table);
    if (showProgress) {
      setGenerating(true);
    } else {
      setRestoringQr(true);
    }
    try {
      const tokenRes = await fetch("/api/admin/table-qr-token", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_number: table }),
      });
      if (!tokenRes.ok) {
        const errBody = (await tokenRes.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(
          errBody?.error?.message ?? "Could not issue a secure QR code."
        );
      }
      const { access_token: accessToken } = (await tokenRes.json()) as {
        access_token: string;
      };
      const url = menuUrlWithTable(
        await resolveMenuBaseUrlForQr(),
        table,
        accessToken
      );
      setScanUrl(url);
      const dataUrl = await QRCode.toDataURL(url, {
        margin: 2,
        width: Math.max(360, qrSize * 3),
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(dataUrl);
    } catch (e: unknown) {
      const message =
        e instanceof IntegerTableNumberError
          ? e.message
          : "Could not generate QR code.";
      setTableError(message);
      setQrDataUrl(null);
      setScanUrl(null);
    } finally {
      if (showProgress) {
        setGenerating(false);
      } else {
        setRestoringQr(false);
      }
    }
  }

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const stored =
      initialTable === undefined ? getAdminQrTableNumber() : initialTable;
    if (stored && stored !== tableNumber) {
      setTableNumber(stored);
    }

    const checked = validateIntegerTableNumber(stored || tableNumber);
    if (!checked.ok) return;

    // Silent restore — avoids QR panel flash and hydration mismatch on admin load.
    void generate(checked.table, { showProgress: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          onChange={(e) => {
            setTableNumber(e.target.value);
            if (tableError) setTableError(null);
          }}
          onBlur={() => {
            const checked = validateIntegerTableNumber(tableNumber);
            if (!checked.ok) {
              setTableError(checked.message);
              setQrDataUrl(null);
              setScanUrl(null);
              return;
            }
            setAdminQrTableNumber(checked.table);
          }}
          inputMode="numeric"
          aria-invalid={!!tableError}
          aria-describedby={tableError ? "table-number-error" : undefined}
          className={[
            "min-w-0 flex-1 rounded-xl border bg-white font-semibold text-zinc-900 outline-none transition focus:ring-2",
            tableError
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-[var(--color-surface-line)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/15",
            isSidebar ? "px-3 py-2 text-sm" : "px-3 py-2 text-sm",
          ].join(" ")}
          placeholder="e.g. 5"
          maxLength={12}
        />
        <button
          type="button"
          disabled={generating}
          onClick={() => void generate(undefined, { showProgress: true })}
          className={[
            "shrink-0 cursor-pointer rounded-xl border border-[var(--color-surface-line)] bg-white font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)] disabled:opacity-50",
            isSidebar ? "px-3 py-2 text-xs" : "px-4 py-2 text-sm",
          ].join(" ")}
        >
          {generating ? "…" : "Go"}
        </button>
      </div>
      {tableError ? (
        <p
          id="table-number-error"
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-xs font-medium text-rose-700"
        >
          <MaterialIcon
            name="error_outline"
            filled={false}
            className="mt-px shrink-0 text-base"
          />
          {tableError}
        </p>
      ) : null}

      <div
        className={[
          "relative mt-4 overflow-hidden rounded-2xl",
          isSidebar
            ? "bg-gradient-to-b from-zinc-50 to-white ring-1 ring-[var(--color-surface-line)]"
            : "rounded-xl bg-zinc-50",
        ].join(" ")}
      >
        <div className="border-b border-[var(--color-surface-line)] bg-[var(--color-primary-soft)]/50 px-3 py-2.5 text-center">
          <p
            className={[
              "font-bold text-[var(--color-primary)]",
              isSidebar ? "text-lg" : "text-xl",
            ].join(" ")}
          >
            {tableLabel}
          </p>
          <p className="text-[10px] font-medium text-[var(--color-text-muted)]">
            Scan to order
          </p>
        </div>

        <div className="flex justify-center p-3 sm:p-4">
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
                alt={`QR for ${tableLabel}`}
                className="relative rounded-xl bg-white p-1.5 shadow-md"
                style={{ width: qrSize, height: qrSize }}
              />
            </div>
          ) : restoringQr ? (
            <div
              className="flex items-center justify-center text-sm text-zinc-400"
              style={{ width: qrSize, height: qrSize }}
              aria-hidden
            />
          ) : (
            <p
              className="flex items-center justify-center text-sm text-zinc-500"
              style={{ width: qrSize, height: qrSize }}
            >
              {canUseTable ? "Press Go to generate" : "Enter a table number"}
            </p>
          )}
        </div>
      </div>

      {canUseTable ? (
        <p
          className={[
            "mt-3 text-center font-medium text-[var(--color-text-muted)]",
            isSidebar ? "text-[10px]" : "text-xs",
          ].join(" ")}
        >
          Guests must scan this QR — typing a table number in the browser will
          not unlock ordering.
        </p>
      ) : null}

      <div className={isSidebar ? "mt-3" : "mt-4"}>
        <Button
          type="button"
          className={[
            "w-full whitespace-nowrap",
            isSidebar ? "py-2.5 text-xs" : "",
          ].join(" ")}
          disabled={!qrDataUrl || !canUseTable}
          onClick={() => setDownloadOpen(true)}
        >
          <MaterialIcon
            name="download"
            filled={false}
            className="shrink-0 text-lg"
          />
          Download PNG
        </Button>
      </div>

      {downloadOpen && qrDataUrl && canUseTable ? (
        <QrDownloadModal
          qrDataUrl={qrDataUrl}
          tableNumber={displayTable}
          scanUrl={scanUrl}
          onClose={() => setDownloadOpen(false)}
        />
      ) : null}
    </div>
  );
}
