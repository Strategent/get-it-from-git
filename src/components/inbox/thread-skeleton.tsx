/**
 * ThreadSkeleton — iOS-style placeholder shown while an email thread is being
 * opened (push) or dismissed (pop). Mirrors the real layout's rhythm so the
 * transition to content has no visual jump.
 */
export function ThreadSkeleton({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const mobile = variant === "mobile";
  return (
    <div
      aria-hidden
      className={`ios-skeleton-fade ${mobile ? "px-5 pt-5" : "mx-auto max-w-[820px] pt-1"}`}
    >
      {mobile && (
        <>
          <div className="ios-skeleton h-3 w-24" />
          <div className="ios-skeleton mt-3 h-6 w-[78%]" />
          <div className="ios-skeleton mt-2 h-6 w-[52%]" />
        </>
      )}

      {/* summary card */}
      <div
        className={`rounded-xl bg-foreground/[0.035] px-5 py-4 ${mobile ? "mt-5" : "mb-6"}`}
      >
        <div className="ios-skeleton h-3 w-28" />
        <div className="ios-skeleton mt-3 h-3 w-full" />
        <div className="ios-skeleton mt-2 h-3 w-[86%]" />
        <div className="ios-skeleton mt-3 h-3 w-1/3" />
      </div>

      {/* message block */}
      <div className={`${mobile ? "mt-4" : "border-t border-border/50 pt-6"}`}>
        <div className="flex items-center gap-3">
          <div className="ios-skeleton h-9 w-9 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="ios-skeleton h-3 w-40" />
            <div className="ios-skeleton mt-2 h-2.5 w-56" />
          </div>
          <div className="ios-skeleton h-2.5 w-14" />
        </div>
        <div className={`${mobile ? "mt-5" : "mt-6 sm:pl-[46px]"} space-y-2.5`}>
          {[100, 96, 92, 99, 74, 88, 45].map((w, i) => (
            <div
              key={i}
              className="ios-skeleton h-3"
              style={{ width: `${w}%`, animationDelay: `${i * 70}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
