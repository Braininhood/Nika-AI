import { CONTENT_DISCLAIMER_SHORT } from "@/content/legal/constants";

type ContentDisclaimerProps = {
  className?: string;
  variant?: "short" | "inline";
};

/** Reusable content-sourcing disclaimer (public pages). */
export function ContentDisclaimer({
  className = "",
  variant = "short",
}: ContentDisclaimerProps) {
  const text = CONTENT_DISCLAIMER_SHORT;
  return (
    <p
      className={`text-xs leading-relaxed text-ink-soft ${className}`}
      role="note"
    >
      {variant === "inline" ? text : text}
    </p>
  );
}
