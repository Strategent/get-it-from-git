import { ReactNode, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Search, Sun, Moon, X } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SyraChatWidget } from "@/components/syra-chat-widget";
import { useTheme } from "@/components/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouterState } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function Topbar() {
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [now, setNow] = useState<Date | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);
  const time = now
    ? now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    : "—";

  if (isMobile) {
    return (
      <header
        className="sticky top-0 z-20 relative flex items-center bg-background px-4 pb-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 22px)" }}
      >

        <div className="absolute bottom-0 left-4 right-4 h-px bg-white/[0.14]" />
        <div>
          <div className="text-[10.5px] font-medium uppercase tracking-[0.13em] text-foreground/[0.22]">
            Harwick &amp; Sterne
          </div>
          <div className="font-serif-display mt-0.5 text-[22px] font-normal leading-[1.1] tracking-[-0.01em] text-foreground/[0.92]">
            strategent
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            {theme === "dark" ? (
              <Moon className="h-[18px] w-[18px]" fill="currentColor" />
            ) : (
              <Sun className="h-[18px] w-[18px]" fill="currentColor" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Notifications"
                className="grid h-9 w-9 place-items-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              >
                <Bell className="h-[18px] w-[18px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-xs">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex-col items-start gap-0.5 text-xs">
                <span className="font-medium">Sarah replied to Proposal v2</span>
                <span className="text-muted-foreground">Two minutes ago - draft ready in Inbox</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-col items-start gap-0.5 text-xs">
                <span className="font-medium">Northwind security review</span>
                <span className="text-muted-foreground">SOC2 answer due before signing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex-col items-start gap-0.5 text-xs">
                <span className="font-medium">Helios renewal watch</span>
                <span className="text-muted-foreground">14 days remaining</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    );
  }

  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="px-6 py-3 flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-3 pr-1">
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
            <div
              className={`overflow-hidden transition-[width,margin,opacity] duration-300 ease-out ${
                searchOpen ? "ml-2 w-64 opacity-100" : "ml-0 w-0 opacity-0"
              }`}
            >
              <input
                ref={inputRef}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search workflows, clients, agents…"
                onBlur={(e) => {
                  if (!e.currentTarget.value) setSearchOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
                className="w-full h-8 px-3 rounded-lg bg-card/60 border border-border/60 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:border-border"
              />
              {searchOpen && globalSearch && (
                <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
                  {[
                    ["Client", "Acme Corp proposal thread"],
                    ["Inbox", "Sarah Lin - minor tweaks"],
                    ["Task", "Send updated SOW"],
                  ].map(([label, text]) => (
                    <button
                      key={text}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] hover:bg-foreground/[0.06]"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setGlobalSearch(text)}
                    >
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                        {label}
                      </span>
                      <span className="truncate">{text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            suppressHydrationWarning
            className="text-[13px] font-medium tracking-tight tabular-nums text-foreground/70 leading-none"
          >
            {time}
          </div>
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground leading-none">
            <Sun className="h-3 w-3 text-amber-400/80" />
            <span className="tabular-nums">64°</span>
            <span className="hidden md:inline">Sunny · Brentwood</span>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4" fill="currentColor" />
          ) : (
            <Sun className="h-4 w-4" fill="currentColor" />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-xs">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex-col items-start gap-0.5 text-xs">
              <span className="font-medium">Sarah replied to Proposal v2</span>
              <span className="text-muted-foreground">Two minutes ago - draft ready in Inbox</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5 text-xs">
              <span className="font-medium">Northwind security review</span>
              <span className="text-muted-foreground">SOC2 answer due before signing</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5 text-xs">
              <span className="font-medium">Helios renewal watch</span>
              <span className="text-muted-foreground">14 days remaining</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-6 border-b border-border/50 pb-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
            <span
              aria-hidden
              className="inline-block h-1 w-1 rounded-full bg-foreground/40"
            />
            {eyebrow}
          </div>
        )}
        <h1 className="font-serif-display mt-3 text-4xl md:text-[44px] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground max-w-xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 pt-5 md:pt-6 pb-28 md:pb-6 space-y-4 md:space-y-5">
        {children}
      </div>
      <SyraChatWidget />
    </>
  );
}
