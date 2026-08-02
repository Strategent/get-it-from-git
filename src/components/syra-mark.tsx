import { cn } from "@/lib/utils";
import syraLogo from "@/assets/syra-mark-3d.png.asset.json";

/**
 * SyraMark — the canonical brand mark for Syra.
 * Transparent 3D beveled "S" sphere; no backdrop needed since the
 * artwork already carries its own dark sphere.
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
        filter: flat ? undefined : "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
      }}
    >
      <img
        src={syraLogo.url}
        alt=""
        className="h-full w-full"
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}
