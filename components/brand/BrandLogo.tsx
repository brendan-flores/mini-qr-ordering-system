import Link from "next/link";

const LOGO_SRC = "/brencravings-logo.png";

export function BrandLogo({
  href = "/",
  textClassName = "text-3xl font-extrabold leading-none text-[var(--color-primary)]",
  className = "",
  showText = true,
  markScale = 1.45,
}: {
  href?: string;
  textClassName?: string;
  className?: string;
  showText?: boolean;
  markScale?: number;
}) {
  const content = (
    <span
      className={[
        "inline-flex min-w-0 items-center gap-1.5",
        textClassName,
        className,
      ].join(" ")}
    >
      <img
        src={LOGO_SRC}
        alt={showText ? "" : "BrenCravings"}
        className="shrink-0 object-contain [margin-right:-0.15em]"
        style={{
          height: `${markScale}em`,
          width: `${markScale}em`,
        }}
        decoding="async"
      />
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
