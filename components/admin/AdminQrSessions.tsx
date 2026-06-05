"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listAdminQrSessions,
  terminateAdminQrSession,
  type AdminQrSession,
} from "@/client/services/qr-sessions";
import { useLiveOrderSync } from "@/hooks/useLiveOrderSync";
import { isQrBindingActiveForAdminDisplay } from "@/lib/qr-admin-session-status";
import { MaterialIcon } from "../ui/MaterialIcon";
import { AdminShell } from "./AdminShell";
import { LiveOrdersSection } from "./LiveOrdersSection";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function shortId(value: string, head = 8, tail = 4) {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function SessionStatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200/80">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Idle
    </span>
  );
}

function QrSessionRow({
  session,
  isActive,
  terminating,
  onTerminate,
}: {
  session: AdminQrSession;
  isActive: boolean;
  terminating: boolean;
  onTerminate: (session: AdminQrSession) => void;
}) {
  return (
    <article className="admin-animate-fade-up border-b border-[var(--color-surface-line)]/70 px-3 py-3.5 last:border-b-0 sm:px-4 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Table {session.table_number}
            </h3>
            <SessionStatusBadge active={isActive} />
          </div>

          <dl className="grid gap-1.5 text-xs text-[var(--color-text-muted)] sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]/70">
                Session ID
              </dt>
              <dd
                className="mt-0.5 font-mono text-[11px] text-zinc-700"
                title={session.access_jti}
              >
                {shortId(session.access_jti)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]/70">
                Device
              </dt>
              <dd
                className="mt-0.5 font-mono text-[11px] text-zinc-700"
                title={session.device_id}
              >
                {shortId(session.device_id)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]/70">
                Started
              </dt>
              <dd className="mt-0.5 text-zinc-700">
                {formatTimestamp(session.bound_at)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]/70">
                Last active
              </dt>
              <dd className="mt-0.5 text-zinc-700">
                {formatTimestamp(session.last_active_at)}
              </dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          disabled={terminating}
          onClick={() => onTerminate(session)}
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
        >
          <MaterialIcon name="link_off" filled={false} className="text-base" />
          {terminating ? "Ending…" : "Terminate Session"}
        </button>
      </div>
    </article>
  );
}

export function AdminQrSessions() {
  const [sessions, setSessions] = useState<AdminQrSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminQrSession | null>(
    null
  );

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await listAdminQrSessions();
      setSessions(data);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to load QR sessions";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const syncSessions = useCallback(() => {
    if (document.visibilityState !== "visible") return;
    listAdminQrSessions()
      .then(({ data }) => setSessions(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    void refresh();
  }, []);

  useLiveOrderSync(syncSessions, { scopeKey: "admin-qr-sessions" });

  // Re-evaluate Active vs Idle badges every second (10s idle threshold).
  const [badgeTick, setBadgeTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setBadgeTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const sessionActivity = useMemo(() => {
    void badgeTick;
    return new Map(
      sessions.map((s) => [
        s.access_jti,
        isQrBindingActiveForAdminDisplay(s.last_active_at),
      ])
    );
  }, [sessions, badgeTick]);

  const activeCount = useMemo(
    () =>
      sessions.filter((s) => sessionActivity.get(s.access_jti) === true).length,
    [sessions, sessionActivity]
  );

  async function confirmTerminate() {
    if (!confirmTarget) return;

    const accessJti = confirmTarget.access_jti;
    setTerminatingId(accessJti);
    setError(null);

    try {
      await terminateAdminQrSession(accessJti);
      setSessions((prev) => prev.filter((s) => s.access_jti !== accessJti));
      setConfirmTarget(null);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to terminate session";
      setError(message);
    } finally {
      setTerminatingId(null);
    }
  }

  return (
    <AdminShell>
      <main className="admin-live mx-auto max-w-[1440px] space-y-4 p-3 pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:space-y-5 sm:p-4 sm:pb-24 lg:space-y-6 lg:p-6 lg:pb-6">
        <LiveOrdersSection
          header={
            <header className="admin-animate-fade-in overflow-visible bg-white px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)] sm:text-xl">
                    Active QR Sessions
                  </h1>
                  <p className="admin-transition-smooth mt-1 text-[11px] text-[var(--color-text-muted)] sm:mt-1.5 sm:text-xs">
                    <span className="font-medium text-[var(--color-primary)]">
                      {sessions.length} in use
                    </span>
                    <span className="mx-1.5 text-[var(--color-text-muted)]/35">
                      —
                    </span>
                    {activeCount} active · idle after 10s without activity ·
                    list refreshes every 5s
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={loading}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[var(--color-surface-line)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)]/25 hover:text-[var(--color-primary)] disabled:opacity-60"
                  aria-label="Refresh sessions"
                >
                  <MaterialIcon
                    name="refresh"
                    filled={false}
                    className={`text-base ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </header>
          }
          filters={
            <div className="admin-animate-fade-up text-[11px] leading-relaxed text-[var(--color-text-muted)]">
              Sessions auto-remove when guests time out (2 min idle), close the
              tab, or lose connection (~45s). Idle badge means no heartbeat for
              10s — the session stays until automatic rules end it. Use
              Terminate Session to release a QR immediately.
            </div>
          }
        >
          {error ? (
            <div
              className="admin-animate-fade-in mx-3 mb-3 mt-3 flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50/80 px-3 py-2.5 text-xs text-rose-800 sm:mx-4 sm:text-sm"
              role="alert"
            >
              <MaterialIcon
                name="error_outline"
                filled={false}
                className="shrink-0 text-base opacity-80"
              />
              <span>{error}</span>
            </div>
          ) : null}

          {loading && sessions.length === 0 ? (
            <div className="admin-animate-fade-in px-4 py-12 text-center sm:py-14">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] motion-reduce:animate-none sm:h-7 sm:w-7" />
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                Loading QR sessions…
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="admin-animate-fade-up px-4 py-12 text-center sm:px-6 sm:py-14">
              <MaterialIcon
                name="qr_code_scanner"
                filled={false}
                className="mx-auto text-3xl text-zinc-200/90 sm:text-4xl"
              />
              <p className="mt-3 text-sm font-medium text-zinc-800">
                No active QR sessions
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[var(--color-text-muted)]/80">
                Sessions appear when a guest scans a table QR code. Stuck
                bindings can be cleared here so the QR is available again.
              </p>
            </div>
          ) : (
            <div>
              {sessions.map((session) => (
                <QrSessionRow
                  key={session.access_jti}
                  session={session}
                  isActive={sessionActivity.get(session.access_jti) ?? false}
                  terminating={terminatingId === session.access_jti}
                  onTerminate={setConfirmTarget}
                />
              ))}
            </div>
          )}
        </LiveOrdersSection>
      </main>

      {confirmTarget ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terminate-session-title"
        >
          <button
            type="button"
            className="admin-animate-modal-backdrop absolute inset-0 cursor-pointer bg-black/45 backdrop-blur-[2px]"
            aria-label="Cancel"
            onClick={() =>
              !terminatingId && setConfirmTarget(null)
            }
          />
          <div className="admin-animate-modal-panel relative w-full max-w-md rounded-2xl border border-[var(--color-surface-line)] bg-white p-5 shadow-xl sm:p-6">
            <h2
              id="terminate-session-title"
              className="text-base font-semibold text-[var(--foreground)]"
            >
              Terminate session for Table {confirmTarget.table_number}?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              This immediately releases the QR code for another customer to scan.
              The current guest will be signed out and cannot continue ordering
              without scanning again.
            </p>
            <p className="mt-2 font-mono text-[11px] text-zinc-500">
              Session {shortId(confirmTarget.access_jti)}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={Boolean(terminatingId)}
                onClick={() => setConfirmTarget(null)}
                className="flex-1 cursor-pointer rounded-xl border border-[var(--color-surface-line)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-subtle)] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(terminatingId)}
                onClick={() => void confirmTerminate()}
                className="flex-1 cursor-pointer rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {terminatingId ? "Terminating…" : "Terminate Session"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
