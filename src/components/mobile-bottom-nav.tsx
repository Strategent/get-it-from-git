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
import { useEffect, useState } from "react";
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
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

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
          {/* Morphing nav bar — fluidly shrinks into / expands from the chevron */}
          <nav
            className="pointer-events-auto"
            onClick={(e) => {
              if (hidden) {
                e.preventDefault();
                setHidden(false);
              }
            }}
            style={{
              width: hidden ? 44 : "100%",
              height: hidden ? 44 : 60,
              padding: hidden ? 0 : "8px 10px",
              borderRadius: hidden ? 14 : 24,
              marginLeft: hidden ? "auto" : 0,
              background: pillBg,
              border: pillBorder,
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              boxShadow: pillShadow,
              overflow: "hidden",
              position: "relative",
              transition: `width 0.45s cubic-bezier(0.32, 0.72, 0, 1) ${hidden ? "0.08s" : "0s"}, height 0.35s cubic-bezier(0.32, 0.72, 0, 1) ${hidden ? "0.08s" : "0s"}, padding 0.35s cubic-bezier(0.32, 0.72, 0, 1) ${hidden ? "0.08s" : "0s"}, border-radius 0.35s cubic-bezier(0.32, 0.72, 0, 1) ${hidden ? "0.08s" : "0s"}, margin-left 0.45s cubic-bezier(0.32, 0.72, 0, 1) ${hidden ? "0.08s" : "0s"}`,
              transformOrigin: "right center",
              willChange: "width, height, padding, border-radius, margin-left",
            }}
          >
            {/* Nav content — fades/scale out as the bar shrinks into the chevron */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "100%",
                opacity: hidden ? 0 : 1,
                transform: hidden ? "scale(0.92)" : "scale(1)",
                pointerEvents: hidden ? "none" : "auto",
                transition: "opacity 0.2s ease-out, transform 0.25s ease-out",
                transitionDelay: hidden ? "0s" : "0.18s",
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

              {/* More button — never appears selected; it only reveals other views */}
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
                    color: iconColor(false),
                    background: iconBg(false),
                    border: iconBorder(false),
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <MoreHorizontal className="h-[18px] w-[18px]" />
              </button>

              {/* Collapse toggle — inline, last item in the row */}
              <button
                aria-label="Hide navigation"
                onClick={() => setHidden(true)}
                className="active:scale-90 transition-transform"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  flexShrink: 0,
                  color: iconColor(false),
                  background: iconBg(false),
                  border: iconBorder(false),
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <ChevronLeft className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Expand affordance — only inside the collapsed 44px pill */}
            <button
              aria-label="Show navigation"
              onClick={() => setHidden(false)}
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                color: iconColor(true),
                opacity: hidden ? 1 : 0,
                pointerEvents: hidden ? "auto" : "none",
                transition: "opacity 0.2s ease-out",
                transitionDelay: hidden ? "0.18s" : "0s",
              }}
            >
              <ChevronUp className="h-[18px] w-[18px]" />
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
