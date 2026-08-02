import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PageShell, PageHeader } from "@/components/page-shell";
import { seedClients } from "@/routes/crm";
import { team } from "@/components/dashboard/data";
import { senderEmailAddress } from "@/lib/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  Bot,
  MessageSquare,
  MessageCircle,
  Mail,
  Info,
  Voicemail,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/calls")({
  component: CallsPage,
  head: () => ({ meta: [{ title: "Calls — strategent" }] }),
});

type CallItem = {
  dir: "in" | "out";
  contact: string;
  company: string;
  duration: string;
  time: string;
  outcome: string;
  ai: boolean;
  summary: string;
  missed?: boolean;
};

const calls: CallItem[] = [
  { dir: "in", contact: "Sarah Lin", company: "Acme Corp", duration: "4m 12s", time: "10:42", outcome: "Booked demo", ai: true, summary: "Sarah confirmed the pilot scope for Q4 and asked Syra to schedule a working session with her ops lead. Follow-up email queued." },
  { dir: "out", contact: "Marcus Reed", company: "Northwind", duration: "8m 03s", time: "10:18", outcome: "Follow-up sent", ai: false, summary: "Reviewed the redlined MSA. Marcus wants a shorter termination clause and a call with legal before Thursday." },
  { dir: "in", contact: "Jenna Park", company: "Helios", duration: "2m 41s", time: "09:55", outcome: "AI handled · Resolved", ai: true, summary: "Billing clarification on the September invoice. Syra pulled the line item and emailed the receipt." },
  { dir: "in", contact: "Diego Alvarez", company: "Vertex", duration: "12m 09s", time: "09:21", outcome: "Escalated to Avery", ai: false, summary: "Security review escalation — Diego flagged SOC2 gap on data residency. Handed to Avery with notes." },
  { dir: "out", contact: "Priya Shah", company: "Lumen", duration: "5m 47s", time: "08:50", outcome: "Quote requested", ai: false, summary: "Discussed enterprise tier pricing. Priya requested a formal quote with 3-year projections by Friday." },
];


function CallsPage() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileCallsPage />;
  return (
    <PageShell>
      <PageHeader
        eyebrow="Voice Operations"
        title="Calls"
        description="Inbound and outbound calls handled by your team and the Syra voice agent."
        actions={<PlaceCallDialog />}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-border/50 divide-x divide-border/50 -mx-4 sm:-mx-6 md:-mx-8">
        {[
          { label: "Handled today", value: "42" },
          { label: "AI deflected", value: "68%" },
          { label: "Avg duration", value: "3m 12s" },
          { label: "Escalations", value: "5" },
        ].map((s) => (
          <div key={s.label} className="px-6 py-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div>
            <div className="mt-1.5 text-[22px] font-semibold tracking-tight tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>
      <Card className="bento p-2">
        {calls.map((c, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-foreground/[0.03]">
            <div className="h-9 w-9 rounded-full grid place-items-center border border-border/60 bg-foreground/[0.03] text-foreground/70">
              {c.dir === "in" ? (
                <PhoneIncoming className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <PhoneOutgoing className="h-4 w-4" strokeWidth={1.75} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium">{c.contact} <span className="text-muted-foreground font-normal">· {c.company}</span></div>
              <div className="text-xs text-muted-foreground">{c.outcome}</div>
            </div>
            {c.ai && (
              <Badge variant="outline" className="border-border/60 text-muted-foreground gap-1">
                <Bot className="h-3 w-3" /> Syra
              </Badge>
            )}
            <div className="text-xs text-muted-foreground w-16 text-right tabular-nums">{c.duration}</div>
            <div className="text-xs text-muted-foreground w-14 text-right tabular-nums">{c.time}</div>
            <Button variant="ghost" size="icon"><Play className="h-4 w-4" /></Button>
          </div>
        ))}
      </Card>

      {/* Contacts — every client and team member, ready to reach. */}
      <Card className="bento p-0">
        <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
          <div className="text-sm font-semibold">Contacts</div>
          <div className="text-[11px] text-muted-foreground">
            {seedClients.length + team.length} total
          </div>
        </div>
        <ContactGroup label="Clients" contacts={clientContacts} />
        <div className="border-t border-border/60" />
        <ContactGroup label="Team" contacts={teamContacts} />
      </Card>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile — Quo-style recent calls with summary & recording playback  */
/* ------------------------------------------------------------------ */

type Tab = "all" | "missed" | "ai";

function MobileCallsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [expanded, setExpanded] = useState<number | null>(0);

  const filtered = useMemo(() => {
    if (tab === "missed") return calls.filter((c) => c.dir === "in" && c.outcome.toLowerCase().includes("escalat"));
    if (tab === "ai") return calls.filter((c) => c.ai);
    return calls;
  }, [tab]);

  return (
    <div
      className="min-h-screen bg-background pb-28"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)" }}
    >
      {/* Editorial header */}
      <div className="px-5 pt-2 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
              Recents
            </div>
            <h1 className="font-serif-display mt-1 text-[34px] leading-none tracking-[-0.02em] text-foreground">
              Calls
            </h1>
          </div>
          <PlaceCallDialog />
        </div>
      </div>

      {/* Segmented control */}
      <div className="px-5">
        <div className="grid grid-cols-3 rounded-lg bg-foreground/[0.05] p-0.5 text-[12.5px] font-medium">
          {(["all", "missed", "ai"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md py-1.5 capitalize transition-colors",
                tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {t === "ai" ? "Syra" : t}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-4 divide-y divide-border/50 border-y border-border/50 bg-card/40">
        {filtered.map((c, i) => (
          <MobileCallRow
            key={`${c.contact}-${i}`}
            call={c}
            open={expanded === i}
            onToggle={() => setExpanded(expanded === i ? null : i)}
          />
        ))}
      </div>

      {/* Voicemail hint */}
      <div className="mx-5 mt-6 flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-foreground/70">
          <Voicemail className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium">Syra is screening</div>
          <div className="text-[11.5px] text-muted-foreground">
            AI handled {calls.filter((c) => c.ai).length} calls today · summaries auto-saved
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MobileCallRow({
  call: c,
  open,
  onToggle,
}: {
  call: CallItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-3 text-left active:bg-foreground/[0.04]"
      >
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[12px] font-medium text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,0,0,0.35)]"
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 50% 0%, color-mix(in oklab, var(--gradient-primary) 100%, white 22%), var(--gradient-primary))",
          }}
        >
          {initials(c.contact)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-medium">{c.contact}</span>
            {c.ai && <Bot className="h-3 w-3 shrink-0 text-muted-foreground" />}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            {c.dir === "in" ? (
              <PhoneIncoming className="h-3 w-3 shrink-0" strokeWidth={2} />
            ) : (
              <PhoneOutgoing className="h-3 w-3 shrink-0" strokeWidth={2} />
            )}
            <span className="truncate">{c.company}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-[12px] tabular-nums text-muted-foreground">{c.time}</span>
          <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4 -mt-1">
          <div className="rounded-xl border border-border/60 bg-background/60 p-3.5">
            <div className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span>Summary</span>
              <span className="h-px flex-1 bg-border/60" />
              <span className="tabular-nums normal-case tracking-normal">{c.duration}</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">
              {c.summary}
            </p>
            <div className="mt-2 text-[11.5px] text-muted-foreground">
              Outcome · {c.outcome}
            </div>
            <RecordingPlayer />
          </div>
        </div>
      )}
    </div>
  );
}

function RecordingPlayer() {
  const [playing, setPlaying] = useState(false);
  // Static waveform bars — visually mirror Quo's recording player.
  const bars = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => {
        const x = i / 41;
        const env = Math.sin(x * Math.PI);
        const h = 0.25 + env * 0.75 * (0.5 + 0.5 * Math.sin(i * 1.7));
        return Math.max(0.15, Math.min(1, h));
      }),
    [],
  );
  const progress = playing ? 0.4 : 0;
  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg bg-foreground/[0.04] px-3 py-2.5">
      <button
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause recording" : "Play recording"}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-background active:scale-95 transition-transform"
      >
        {playing ? (
          <Pause className="h-4 w-4" fill="currentColor" />
        ) : (
          <Play className="h-4 w-4 translate-x-[1px]" fill="currentColor" />
        )}
      </button>
      <div className="flex h-8 flex-1 items-center gap-[2px]">
        {bars.map((h, i) => {
          const played = i / bars.length < progress;
          return (
            <span
              key={i}
              className={cn(
                "w-[2px] rounded-full",
                played ? "bg-foreground" : "bg-foreground/25",
              )}
              style={{ height: `${h * 100}%` }}
            />
          );
        })}
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
        {playing ? "0:14" : "0:00"}
      </span>
    </div>
  );
}


type Contact = {
  name: string;
  sub: string;
  initials: string;
  email?: string;
  phone?: string;
  variant: "client" | "team";
  status?: string;
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const clientContacts: Contact[] = seedClients.map((c) => ({
  name: c.name,
  sub: c.company,
  initials: initialsOf(c.name),
  email: c.email,
  phone: c.phone,
  variant: "client",
}));

const teamContacts: Contact[] = team.map((m) => ({
  name: m.name,
  sub: m.role,
  initials: m.initials,
  email: senderEmailAddress(m.name),
  variant: "team",
  status: m.status,
}));

function ContactGroup({ label, contacts }: { label: string; contacts: Contact[] }) {
  return (
    <div>
      <div className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label} · {contacts.length}
      </div>
      <div>
        {contacts.map((c) => (
          <ContactRow key={`${c.variant}-${c.name}`} contact={c} />
        ))}
      </div>
    </div>
  );
}

function ContactRow({ contact: c }: { contact: Contact }) {
  const digits = c.phone?.replace(/\D/g, "") ?? "";
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.03]">
      <div className="relative shrink-0">
        <div
          className={`h-9 w-9 rounded-full grid place-items-center text-[11px] font-medium tracking-[0.04em] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,0,0,0.35)] ${
            c.variant === "client"
              ? "text-white"
              : "text-foreground/85"
          }`}
          style={
            c.variant === "client"
              ? {
                  backgroundImage:
                    "radial-gradient(120% 120% at 50% 0%, color-mix(in oklab, var(--gradient-primary) 100%, white 18%), var(--gradient-primary))",
                }
              : {
                  backgroundImage:
                    "linear-gradient(180deg, color-mix(in oklab, var(--muted) 70%, white 14%), color-mix(in oklab, var(--muted) 88%, black 8%))",
                }
          }
        >
          {c.initials}
        </div>
        {c.status && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
              c.status === "online" ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate">{c.name}</div>
        <div className="text-[11px] text-muted-foreground truncate">{c.sub}</div>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        {c.phone && (
          <ContactAction href={`tel:${c.phone.trim()}`} label={`Call ${c.name}`} icon={Phone} tone="call" />
        )}
        {c.phone && (
          <ContactAction
            href={`https://wa.me/${digits}`}
            label={`WhatsApp ${c.name}`}
            icon={MessageCircle}
            external
          />
        )}
        {c.email && (
          <ContactAction href={`mailto:${c.email}`} label={`Email ${c.name}`} icon={Mail} />
        )}
      </div>
    </div>
  );
}

function ContactAction({
  href,
  label,
  icon: Icon,
  external,
  tone,
}: {
  href: string;
  label: string;
  icon: typeof Phone;
  external?: boolean;
  tone?: "call";
}) {
  if (tone === "call") {
    // Apple Phone-app style: white handset icon on a subtle neutral circular surface.
    return (
      <a
        href={href}
        aria-label={label}
        title={label}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="grid h-7 w-7 place-items-center rounded-full bg-foreground/[0.06] text-foreground/90 transition-colors hover:bg-foreground/[0.12] hover:text-foreground active:scale-95"
      >
        <Icon className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1.75} />
      </a>
    );
  }
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
    </a>
  );
}

/**
 * PlaceCallDialog — the "Place Call" action. Enter an optional name and a
 * required phone number, then Call (`tel:`). iMessage (`sms:`) and WhatsApp
 * (`wa.me`) are kept only as passthroughs.
 */
function PlaceCallDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");

  const digits = number.replace(/\D/g, "");
  const hasNumber = digits.length >= 7;

  const reset = () => {
    setName("");
    setNumber("");
  };

  const call = () => {
    if (!hasNumber) {
      toast.error("Enter a valid phone number");
      return;
    }
    window.location.href = `tel:${number.trim()}`;
    toast.success(`Calling${name.trim() ? ` ${name.trim()}` : ""}…`);
    reset();
    setOpen(false);
  };

  const passthrough = (kind: "imessage" | "whatsapp") => {
    if (!hasNumber) {
      toast.error("Enter a valid phone number");
      return;
    }
    if (kind === "whatsapp") {
      window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `sms:${number.trim()}`;
    }
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Phone className="h-4 w-4 mr-2" /> Place Call
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place a call</DialogTitle>
          <DialogDescription>Enter a number to call.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="pc-name">
              Name <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="pc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Avery"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pc-number">
              Phone number <span className="text-muted-foreground">*</span>
            </Label>
            <Input
              id="pc-number"
              type="tel"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && call()}
              placeholder="+1 (415) 555-0148"
              autoComplete="off"
            />
          </div>

          {/* iMessage / WhatsApp passthroughs */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => passthrough("imessage")}
              disabled={!hasNumber}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> iMessage
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => passthrough("whatsapp")}
              disabled={!hasNumber}
            >
              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>
            Cancel
          </Button>
          <Button onClick={call} disabled={!hasNumber}>
            <Phone className="h-4 w-4 mr-2" /> Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}