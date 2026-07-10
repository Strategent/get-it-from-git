import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Bot,
  MessageSquare,
  MessageCircle,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/calls")({
  component: CallsPage,
  head: () => ({ meta: [{ title: "Calls — Harwick & Sterne" }] }),
});

const calls = [
  { dir: "in", contact: "Sarah Lin", company: "Acme Corp", duration: "4m 12s", time: "10:42", outcome: "Booked demo", ai: true },
  { dir: "out", contact: "Marcus Reed", company: "Northwind", duration: "8m 03s", time: "10:18", outcome: "Follow-up sent", ai: false },
  { dir: "in", contact: "Jenna Park", company: "Helios", duration: "2m 41s", time: "09:55", outcome: "AI handled · Resolved", ai: true },
  { dir: "in", contact: "Diego Alvarez", company: "Vertex", duration: "12m 09s", time: "09:21", outcome: "Escalated to Avery", ai: false },
  { dir: "out", contact: "Priya Shah", company: "Lumen", duration: "5m 47s", time: "08:50", outcome: "Quote requested", ai: false },
];

function CallsPage() {
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
          <ContactAction href={`tel:${c.phone.trim()}`} label={`Call ${c.name}`} icon={PhoneCall} tone="call" />
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
    // iOS Phone-app call affordance: filled handset in a green circular button.
    return (
      <a
        href={href}
        aria-label={label}
        title={label}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="grid h-7 w-7 place-items-center rounded-full text-white bg-[linear-gradient(180deg,#3ad165,#22b34d)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 active:scale-95"
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