import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/page-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { RouteProgress } from "@/components/route-progress";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, minimum-scale=1, maximum-scale=5" },
      // Single unscoped theme-color as the authoritative default; ThemeProvider
      // rewrites this at runtime to match the current app surface. Media-scoped
      // variants are intentionally omitted — iOS Safari falls back to white
      // when the system scheme doesn't match the app's chosen theme.
      { name: "theme-color", content: "#111111" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "strategent" },
      { title: "strategent | demo build" },
      {
        name: "description",
        content:
          "Private wealth admin console for Harwick & Sterne: portfolios, client meetings, planner, documents and the Syra agent.",
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "strategent | demo build" },
      {
        property: "og:description",
        content:
          "Private wealth admin console for Harwick & Sterne across portfolios, meetings, planner and the Syra agent.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "strategent | demo build" },
      {
        name: "description",
        content:
          "Remix of v2 is a web application that allows users to import and integrate GitHub projects.",
      },
      {
        property: "og:description",
        content:
          "Remix of v2 is a web application that allows users to import and integrate GitHub projects.",
      },
      {
        name: "twitter:description",
        content:
          "Remix of v2 is a web application that allows users to import and integrate GitHub projects.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/3dhW02aB4wQmUB1Eatz5610D2Sl1/social-images/social-1781993614260-Image_6-19-26_at_12.49_AM.webp",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/3dhW02aB4wQmUB1Eatz5610D2Sl1/social-images/social-1781993614260-Image_6-19-26_at_12.49_AM.webp",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Radley:ital,wght@0,400;0,700;1,400&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Young+Serif&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-slim">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('nexus-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {/*
          iOS 26 Safari ignores the `theme-color` meta tag. It samples the
          toolbar/status-bar tint from (1) the background-color of a
          fixed/sticky element touching the viewport edge, then (2) <body>.
          This zero-height strip anchored to top:0 guarantees Safari picks
          up `var(--background)` — matching light/dark instantly — for the
          notch/Dynamic Island area on iPhone. The bottom twin does the
          same for the home-indicator area.
        */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "env(safe-area-inset-top, 0px)",
            background: "var(--background)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "env(safe-area-inset-bottom, 0px)",
            background: "var(--background)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background text-foreground">
            <div
              className="pointer-events-none fixed inset-0 opacity-0 dark:opacity-100"
              style={{
                background:
                  "radial-gradient(60% 50% at 20% 0%, oklch(0.22 0 0 / 0.35), transparent), radial-gradient(40% 40% at 100% 30%, oklch(0.2 0 0 / 0.25), transparent)",
              }}
            />
            <AppSidebar />
            <div className="relative flex-1 min-w-0 flex flex-col">
              <Topbar />
              <main className="flex-1 min-w-0 overflow-auto scrollbar-hide">
                <Outlet />
              </main>
            </div>
          </div>
          <MobileBottomNav />
          <RouteProgress />
          <Toaster />
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
