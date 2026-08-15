import { useState } from "react";
import { avatarUrl } from "@/lib/avatar";

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

type SmartAvatarProps = {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
};

/**
 * Avatar image with a shimmer placeholder while the photo loads and an
 * initials fallback if it fails. Prevents blank/pop-in profile pictures.
 */
export function SmartAvatar({ name, size = 96, className = "", alt }: SmartAvatarProps) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  // Guard against callers that pass only a request `size` and no box classes —
  // without an explicit box the <img> would render at its natural size.
  const hasBox = /(^|\s)(h-|size-)/.test(className);

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={hasBox ? undefined : { height: 36, width: 36 }}
    >
      {state !== "loaded" && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-muted"
        >
          {state === "loading" ? (
            <span className="avatar-shimmer absolute inset-0 rounded-full" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-[0.7em] font-semibold text-muted-foreground">
              {initialsOf(name)}
            </span>
          )}
        </span>
      )}
      <img
        src={avatarUrl(name, size)}
        alt={alt ?? ""}
        decoding="async"
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
        className={`h-full w-full rounded-full object-cover transition-opacity duration-300 ${
          state === "loaded" ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}
