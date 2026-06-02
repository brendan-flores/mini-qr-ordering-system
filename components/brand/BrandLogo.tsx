import Link from "next/link";

const LOGO_SRC = "/brencravings-logo.png";

export function BrandLogo({
  href = "/",
  textClassName = "text-3xl font-extrabold leading-none text-[var(--color-primary)]",
  className = "",
  showText = true,
  /** Logo mark size relative to the text line (1 = same cap height) */
  markScale = 1.1,
}: {
  href?: string;
  textClassName?: string;
  className?: string;
  showText?: boolean;
  markScale?: number;
}) {
  const markStyle = {
    width: `${markScale}em`,
    height: `${markScale}em`,
  };

  const content = (
    <span
      className={[
        "inline-flex min-w-0 items-center gap-2.5",
        textClassName,
        className,
      ].join(" ")}
    >
      {/* Native img avoids Next/Image optimizer flattening PNG alpha to black */}
      <img
        src={LOGO_SRC}
        alt={showText ? "" : "BrenCravings"}
        className="shrink-0 object-contain"
        style={markStyle}
        decoding="async"
      />
      {showText ? <span className="truncate leading-none">BrenCravings</span> : null}
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
