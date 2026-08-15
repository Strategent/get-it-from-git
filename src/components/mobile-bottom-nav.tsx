import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home as HomeIcon,
  Inbox,
  Users,
  Phone,
  CheckSquare,
  UserCog,
  Hash,
  CreditCard,
  FileText,
  Settings,
  CalendarDays,
  Plug,
  LifeBuoy,
  MoreHorizontal,
  ChevronLeft,
  ChevronUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/theme-provider";
import syraSidebarIcon from "@/assets/sidebar-icon.png";

const SyraIcon = ({ isDark, active }: { isDark: boolean; active: boolean }) => (
  <img
    src={syraSidebarIcon}
    alt=""
    className="h-[22px] w-[22px] object-contain"
    style={{
      // The mark is a light glyph; invert it in light mode so it reads black-ish.
      filter: isDark ? "none" : "invert(1)",
      opacity: active ? 0.9 : 0.42,
    }}
  />
);

const primaryNav = [
  { title: "Home", url: "/", icon: HomeIcon },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Syra", url: "/syra", isSyra: true },
  { title: "Team", url: "/team", icon: UserCog },
];

const moreNav = [
  { title: "Calls", url: "/calls", icon: Phone },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Connectors", url: "/connectors", icon: Plug },
  { title: "Channels", url: "/channels", icon: Hash },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Support", url: "/support", icon: LifeBuoy },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function MobileBottomNav() {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [moreOpen, setMoreOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const pinnedUntil = useRef(0);
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);
  const anyMoreActive = moreNav.some((item) => isActive(item.url));

  const onAnyScroll = useCallback((e: Event) => {
    const t = e.target as HTMLElement | Document | null;
    const y =
      t && (t as HTMLElement).scrollTop !== undefined && t !== document
        ? (t as HTMLElement).scrollTop
        : window.scrollY;
    const delta = y - lastY.current;
    lastY.current = y;
    if (Date.now() < pinnedUntil.current) return;
    if (Math.abs(delta) < 6) return;
    if (delta > 0 && y > 48) setHidden(true);
    else if (delta < 0) setHidden(false);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    window.addEventListener("scroll", onAnyScroll, { passive: true, capture: true });
    return () =>
      window.removeEventListener("scroll", onAnyScroll, { capture: true } as EventListenerOptions);
  }, [isMobile, onAnyScroll]);

  // Any route change re-reveals the bar, like iOS does on new screens.
  useEffect(() => {
    setHidden(false);
  }, [currentPath]);

  useEffect(() => {
    if (moreOpen) setHidden(false);
  }, [moreOpen]);

  if (!isMobile) return null;

  const pillBg = isDark ? "rgba(10,10,10,0.94)" : "rgba(255,255,255,0.97)";
  const pillBorder = isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)";
  const pillShadow = isDark
    ? "0 8px 32px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 4px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)";

  const iconColor = (active: boolean) =>
    active
      ? isDark
        ? "rgba(255,255,255,0.92)"
        : "rgba(0,0,0,0.85)"
      : isDark
        ? "rgba(255,255,255,0.38)"
        : "rgba(0,0,0,0.36)";

  const iconBg = (active: boolean) =>
    active ? (isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)") : "transparent";

  const iconBorder = (active: boolean) =>
    active
      ? isDark
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(0,0,0,0.08)"
      : "1px solid transparent";

  const drawerBg = isDark ? "rgba(10,10,10,0.97)" : "rgba(255,255,255,0.99)";
  const drawerBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[45] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          moreOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMoreOpen(false)}
      />

      {/* More drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[48] transition-transform duration-300 ease-out ${
          moreOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          background: drawerBg,
          borderTop: `1px solid ${drawerBorder}`,
          borderRadius: "24px 24px 0 0",
        }}
      >
        <div className="px-5 pb-1 pt-4">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.30)" }}
          >
            More
          </span>
        </div>
        <div
          className="grid grid-cols-3 gap-1 px-3 pt-2"
          style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))" }}
        >
          {moreNav.map((item) => {
            const active = isActive(item.url);
            return (
              <Link
                key={item.title}
                to={item.url}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-colors"
                style={{
                  color: iconColor(active),
                  background: iconBg(active),
                }}
              >
                <item.icon strokeWidth={1.5} className="h-5 w-5 shrink-0" />
                <span className="text-[11px] font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom nav assembly */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div
          className="relative mx-auto"
          style={{
            width: "min(calc(100% - 28px), 402px)",
            marginBottom: 14,
          }}
        >
          {/* Expand handle — appears in the same right-hand spot after the bar is condensed */}
          <button
            aria-label="Show navigation"
            onClick={() => {
              pinnedUntil.current = Date.now() + 1200;
              setHidden(false);
            }}
            className="absolute grid place-items-center rounded-[14px]"
            style={{
              right: 10,
              top: "50%",
              marginTop: -22,
              width: 44,
              height: 44,
              background: pillBg,
              border: pillBorder,
              boxShadow: pillShadow,
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              color: iconColor(true),
              opacity: hidden ? 1 : 0,
              transform: hidden ? "scale(1)" : "scale(0.9)",
              pointerEvents: hidden ? "auto" : "none",
              transition: "opacity 0.24s ease-out, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
              willChange: "opacity, transform",
            }}
          >
            <ChevronUp className="h-[18px] w-[18px]" />
          </button>

          {/* Nav bar */}
          <nav
            className="pointer-events-auto"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 24,
              background: pillBg,
              border: pillBorder,
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              boxShadow: pillShadow,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transform: hidden ? "translateY(calc(100% + 8px))" : "translateY(0)",
              opacity: hidden ? 0 : 1,
              transition: "transform 0.42s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.24s ease-out",
              transformOrigin: "center bottom",
              willChange: "transform, opacity",
            }}
          >
            {primaryNav.map((item) => {
              const active = isActive(item.url);
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  aria-label={item.title}
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    flexShrink: 0,
                    color: iconColor(active),
                    background: iconBg(active),
                    border: iconBorder(active),
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {item.isSyra ? (
                    <SyraIcon isDark={isDark} active={active} />
                  ) : item.icon ? (
                    <item.icon strokeWidth={1.5} className="h-[18px] w-[18px]" />
                  ) : null}
                </Link>
              );
            })}

            {/* More button */}
            <button
              onClick={() => setMoreOpen((v) => !v)}
              aria-label="More navigation"
              style={{
                display: "grid",
                placeItems: "center",
                width: 44,
                height: 44,
                borderRadius: 14,
                flexShrink: 0,
                color: iconColor(moreOpen || anyMoreActive),
                background: iconBg(moreOpen || anyMoreActive),
                border: iconBorder(moreOpen || anyMoreActive),
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </button>

            {/* Condense toggle — sits next to More, uses a “<” chevron to indicate the bar can be tucked away */}
            <button
              aria-label="Hide navigation"
              onClick={() => {
                pinnedUntil.current = Date.now() + 1200;
                setHidden(true);
              }}
              style={{
                display: "grid",
                placeItems: "center",
                width: 44,
                height: 44,
                borderRadius: 14,
                flexShrink: 0,
                color: iconColor(false),
                background: "transparent",
                border: "1px solid transparent",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
