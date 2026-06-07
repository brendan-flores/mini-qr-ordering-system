import Link from "next/link";
import { BRAND_LOGO_PATH } from "@/lib/shared/products/brand";
import { MENU_PAGE_PATH } from "@/lib/shared/config/routes";

export function BrandLogo({
  href = MENU_PAGE_PATH,
  textClassName = "text-3xl font-extrabold leading-none text-[var(--color-primary)]",
  subtitleClassName = "text-sm text-[var(--color-text-muted)]",
  className = "",
  showText = true,
  markScale = 1.45,
  subtitle,
}: {
  href?: string;
  textClassName?: string;
  subtitleClassName?: string;
  className?: string;
  showText?: boolean;
  markScale?: number;
  /** Renders below the title; uses a taller mark aligned to both lines */
  subtitle?: string;
}) {
  const markSize = subtitle ? "3rem" : `${markScale}em`;

  const mark = (
    <img
      src={BRAND_LOGO_PATH}
      alt={showText && !subtitle ? "" : "BrenCravings"}
      className="shrink-0 object-contain object-center"
      style={{
        height: markSize,
        width: markSize,
        ...(subtitle ? {} : { marginRight: "-0.12em" }),
      }}
      decoding="async"
    />
  );

  const content = subtitle ? (
    <span className={["flex min-w-0 items-center gap-3", className].join(" ")}>
      {mark}
      <span className="min-w-0">
        {showText ? (
          <span
            className={["block truncate leading-tight", textClassName].join(" ")}
          >
            BrenCravings
          </span>
        ) : null}
        <span className={["mt-0.5 block leading-snug", subtitleClassName].join(" ")}>
          {subtitle}
        </span>
      </span>
    </span>
  ) : (
    <span
      className={[
        "inline-flex min-w-0 items-center gap-1.5",
        textClassName,
        className,
      ].join(" ")}
    >
      {mark}
      {showText ? (
        <span className="truncate leading-none">BrenCravings</span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="cursor-pointer bg-transparent transition-opacity hover:opacity-90"
      >
        {content}
      </Link>
    );
  }

  return content;
}
