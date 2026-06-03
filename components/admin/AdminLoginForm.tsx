"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "../brand/BrandLogo";
import { MaterialIcon } from "../ui/MaterialIcon";
import { ApiError } from "@/client/services/api";
import { parseJsonText } from "@/lib/json";

const BG_IMAGE = "/admin-login-background.png";

const inputClass =
  "admin-login-input w-full rounded-lg border border-[#e2bebe] bg-white py-4 pl-12 pr-4 text-base outline-none transition-all placeholder:text-[#8e7070]/80 disabled:cursor-not-allowed disabled:opacity-60";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";
  const bgRef = useRef<HTMLImageElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setCardVisible(true), 100);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const bg = bgRef.current;
      if (!bg) return;
      const moveX = (e.clientX - window.innerWidth / 2) / 150;
      const moveY = (e.clientY - window.innerHeight / 2) / 150;
      bg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const text = await res.text();
      const json = parseJsonText(text);
      if (!res.ok) {
        const message =
          (json as { error?: { message?: string } } | null)?.error?.message ??
          "Login failed";
        throw new ApiError(message, res.status, json);
      }
      const target = nextPath.startsWith("/admin") ? nextPath : "/admin";
      window.location.assign(target);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f6faff]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bgRef}
          src={BG_IMAGE}
          alt=""
          className="admin-login-bg-float h-full w-full object-cover transition-transform duration-700 ease-out"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md -translate-y-8 flex-col items-center justify-center px-4 sm:-translate-y-12 sm:px-6">
        <div className="admin-login-logo-enter mb-8 flex w-full flex-col items-center">
          <BrandLogo
            href="/admin/login"
            subtitle="Admin Console"
            className="flex-col items-center gap-3 text-center"
            textClassName="admin-login-brand-gradient font-[family-name:var(--font-admin-display)] text-[26px] font-semibold leading-tight tracking-tight sm:text-[30px]"
            subtitleClassName="text-xs font-semibold uppercase tracking-[0.2em] text-[#5a4041]"
          />
        </div>

        <div
          className={[
            "admin-login-glass-card mx-auto w-full rounded-xl p-6 sm:p-8",
            cardVisible ? "is-visible" : "",
          ].join(" ")}
        >
            <div className="mb-10">
              <h2 className="font-[family-name:var(--font-admin-display)] text-[28px] font-semibold text-[#78001f] sm:text-[32px]">
                Sign in
              </h2>
              <p className="mt-2 text-base text-[#5a4041]">
                Enter your credentials to manage the platform.
              </p>
            </div>

            {error ? (
              <div
                className="mb-6 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-900"
                role="alert"
              >
                <MaterialIcon
                  name="error_outline"
                  filled={false}
                  className="shrink-0 text-lg"
                />
                <span>{error}</span>
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="admin-username"
                  className="block text-sm font-medium text-[#5a4041]"
                >
                  Username
                </label>
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8e7070] transition-colors group-focus-within:text-[#a3002d]">
                    <MaterialIcon name="person" filled={false} className="text-2xl" />
                  </span>
                  <input
                    id="admin-username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    required
                    disabled={loading}
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-[#5a4041]"
                >
                  Password
                </label>
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8e7070] transition-colors group-focus-within:text-[#a3002d]">
                    <MaterialIcon name="lock" filled={false} className="text-2xl" />
                  </span>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#8e7070] transition-colors hover:text-[#a3002d]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <MaterialIcon
                      name={showPassword ? "visibility_off" : "visibility"}
                      filled={false}
                      className="text-2xl"
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#a3002d] py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <MaterialIcon
                        name="arrow_forward"
                        filled={false}
                        className="text-xl transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
