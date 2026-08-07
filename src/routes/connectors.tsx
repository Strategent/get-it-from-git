import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Link2, Plus, Check } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/connectors")({
  component: ConnectorsPage,
  head: () => ({
    meta: [
      { title: "Apps integration — strategent" },
      {
        name: "description",
        content:
          "Browse and connect the business apps that power your workspace — email, calendar, CRM, payments, documents and more.",
      },
      { property: "og:title", content: "Apps integration — strategent" },
      {
        property: "og:description",
        content:
          "Browse and connect the business apps that power your workspace — email, calendar, CRM, payments, documents and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Connector = {
  name: string;
  slug: string;
  desc: string;
  brand: string;
  tags: string[];
  categories: string[];
  connected: boolean;
  darkIcon?: boolean;
};

const CATEGORIES = [
  "Analytics",
  "Scheduling",
  "CRM",
  "Marketing",
  "Documents",
  "Payments",
] as const;

const CONNECTORS: Connector[] = [
  {
    name: "DocuSign",
    slug: "docusign",
    desc: "Send agreements out for e-signature and track every envelope from one place.",
    brand: "#FFCC00",
    tags: ["Documents", "Agreements"],
    categories: ["Documents"],
    connected: true,
    darkIcon: true,
  },
  {
    name: "Stripe",
    slug: "stripe",
    desc: "Invoice clients, collect fees and reconcile payouts without leaving the workspace.",
    brand: "#635BFF",
    tags: ["Payments", "Billing"],
    categories: ["Payments"],
    connected: true,
  },
  {
    name: "Gmail",
    slug: "gmail",
    desc: "Sync client threads and let Syra draft replies straight from your inbox.",
    brand: "#EA4335",
    tags: ["Marketing", "Communication"],
    categories: ["Marketing"],
    connected: true,
  },
  {
    name: "Google Drive",
    slug: "googledrive",
    desc: "Keep proposals, statements and client files searchable and always current.",
    brand: "#1FA463",
    tags: ["Documents", "Storage"],
    categories: ["Documents"],
    connected: false,
  },
  {
    name: "Slack",
    slug: "slack",
    desc: "Push agent updates and deal alerts into the channels your team already lives in.",
    brand: "#4A154B",
    tags: ["Communication"],
    categories: ["Marketing"],
    connected: true,
  },
  {
    name: "Google Calendar",
    slug: "googlecalendar",
    desc: "Book client meetings, hold prep blocks and sync availability automatically.",
    brand: "#1A73E8",
    tags: ["Scheduling", "Meetings"],
    categories: ["Scheduling"],
    connected: false,
  },
  {
    name: "HubSpot",
    slug: "hubspot",
    desc: "Two-way sync of contacts, pipeline stages and notes with your household records.",
    brand: "#FF7A59",
    tags: ["CRM", "Data & Enrichment"],
    categories: ["CRM"],
    connected: false,
  },
  {
    name: "Notion",
    slug: "notion",
    desc: "Pull playbooks, meeting notes and internal wikis into Syra's answers.",
    brand: "#111111",
    tags: ["Documents", "Knowledge"],
    categories: ["Documents"],
    connected: false,
  },
  {
    name: "QuickBooks",
    slug: "quickbooks",
    desc: "Mirror invoices and expenses so revenue reporting stays accurate every month.",
    brand: "#2CA01C",
    tags: ["Analytics", "Accounting"],
    categories: ["Analytics", "Payments"],
    connected: false,
  },
  {
    name: "Calendly",
    slug: "calendly",
    desc: "Share booking links and let prospects self-schedule into open advisor time.",
    brand: "#006BFF",
    tags: ["Scheduling"],
    categories: ["Scheduling"],
    connected: false,
  },
  {
    name: "Salesforce",
    slug: "salesforce",
    desc: "Sync accounts, opportunities and activity history with enterprise CRM records.",
    brand: "#00A1E0",
    tags: ["CRM", "Pipeline"],
    categories: ["CRM"],
    connected: false,
  },
  {
    name: "Google Analytics",
    slug: "googleanalytics",
    desc: "Track campaign performance and site engagement next to your pipeline metrics.",
    brand: "#E37400",
    tags: ["Analytics", "Marketing"],
    categories: ["Analytics", "Marketing"],
    connected: false,
  },
];

function AppIcon({
  slug,
  brand,
  name,
  darkIcon = false,
}: {
  slug: string;
  brand: string;
  name: string;
  darkIcon?: boolean;
}) {
  return (
    <div
      className="grid h-[58px] w-[58px] place-items-center rounded-[18px] shadow-[0_1px_2px_rgba(0,0,0,0.18)] ring-1 ring-black/5 dark:ring-white/10"
      style={{ backgroundColor: brand }}
    >
      <img
        src={`https://cdn.simpleicons.org/${slug}/${darkIcon ? "black" : "white"}`}
        alt={`${name} logo`}
        loading="lazy"
        className="h-7 w-7 object-contain"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          if (!el.dataset["fallback"]) {
            el.dataset["fallback"] = "1";
            el.src = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
            el.style.filter = darkIcon ? "none" : "brightness(0) invert(1)";
          } else {
            el.style.display = "none";
          }
        }}
      />
    </div>
  );
}

function ConnectorsPage() {
  const [active, setActive] = useState<string | null>(null);
  const [items, setItems] = useState(CONNECTORS);

  const visible = useMemo(
    () => (active ? items.filter((c) => c.categories.includes(active)) : items),
    [active, items],
  );

  const toggle = (name: string) =>
    setItems((prev) =>
      prev.map((c) => (c.name === name ? { ...c, connected: !c.connected } : c)),
    );

  return (
    <PageShell>
      {/* Header row: title + category pills */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif-display text-[30px] leading-none tracking-[-0.02em] text-foreground">
          Apps integration
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          {CATEGORIES.map((cat) => {
            const on = active === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(on ? null : cat)}
                className={cn(
                  "h-9 rounded-xl border px-4 text-[13px] font-medium transition-colors",
                  on
                    ? "border-transparent bg-foreground text-background"
                    : "border-border/70 bg-card text-foreground/80 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:text-foreground dark:bg-white/[0.04] dark:hover:bg-white/[0.07]",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((c) => (
          <article
            key={c.name}
            className="group flex flex-col rounded-[20px] border border-border/70 bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.35)] dark:border-white/[0.07] dark:bg-white/[0.035] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] dark:hover:bg-white/[0.055]"
          >
            <div className="flex items-start justify-between">
              <AppIcon slug={c.slug} brand={c.brand} name={c.name} />
              <button
                type="button"
                onClick={() => toggle(c.name)}
                aria-label={c.connected ? `Manage ${c.name}` : `Connect ${c.name}`}
                title={c.connected ? "Connected" : "Connect"}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-xl transition-transform active:scale-95",
                  c.connected
                    ? "bg-[#E9FF5A] text-black shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                    : "bg-foreground text-background",
                )}
              >
                {c.connected ? (
                  <Link2 className="h-4 w-4" strokeWidth={2.2} />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                )}
              </button>
            </div>

            <h2 className="mt-5 text-[15px] font-medium tracking-tight text-foreground">
              {c.name}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {c.desc}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-muted px-2.5 py-1.5 text-[11.5px] font-medium text-foreground/75 dark:bg-white/[0.06] dark:text-foreground/70"
                >
                  {t}
                </span>
              ))}
              {c.connected && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/12 px-2.5 py-1.5 text-[11.5px] font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" /> Connected
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
