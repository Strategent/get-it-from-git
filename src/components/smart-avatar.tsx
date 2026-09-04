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
 * Avatar image with an instant initials fallback. Images are local assets, so
 * they paint immediately — no shimmer/loading state (cached images never fire
 * `onLoad` after hydration, which used to leave the placeholder stuck forever).
 */
export function SmartAvatar({ name, size = 96, className = "", alt }: SmartAvatarProps) {
  const [failed, setFailed] = useState(false);
  // Guard against callers that pass only a request `size` and no box classes —
  // without an explicit box the <img> would render at its natural size.
  const hasBox = /(^|\s)(h-|size-)/.test(className);

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-muted ${className}`}
      style={hasBox ? undefined : { height: 36, width: 36 }}
    >
      <span
        aria-hidden
        className="absolute inset-0 grid place-items-center text-[0.7em] font-semibold text-muted-foreground"
      >
        {initialsOf(name)}
      </span>
      {!failed && (
        <img
          src={avatarUrl(name, size)}
          alt={alt ?? ""}
          decoding="sync"
          loading="eager"
          onError={() => setFailed(true)}
          className="relative h-full w-full rounded-full object-cover"
        />
      )}
    </span>
  );
}

