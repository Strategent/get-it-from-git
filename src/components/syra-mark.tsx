import { cn } from "@/lib/utils";
import syraLogo from "@/assets/stg-icon.png.asset.json";

/**
 * SyraMark — the canonical brand mark for Syra.
 * The blue glass "S" logo on a dark gray circular backdrop.
 */
export function SyraMark({
  size = 16,
  className,
  flat = false,
}: {
  size?: number;
  className?: string;
  flat?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid place-items-center select-none rounded-full",
        className,
      )}
      style={{
        height: size,
        width: size,
        background:
          "radial-gradient(circle at 30% 25%, #3a3a40 0%, #1f1f24 60%, #141418 100%)",
        boxShadow: flat
          ? undefined
          : "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 4px 12px -4px rgba(0,0,0,0.5)",
      }}
    >
      <img
        src={syraLogo}
        alt=""
        className="grayscale"
        style={{
          width: Math.round(size * 0.62),
          height: Math.round(size * 0.62),
          objectFit: "contain",
        }}
      />
    </span>
  );
}