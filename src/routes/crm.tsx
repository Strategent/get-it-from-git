import { createFileRoute } from "@tanstack/react-router";
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
import { SyraChatWidget } from "@/components/syra-chat-widget";
import {
  Plus,
  Filter,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/crm")({
  component: CrmPage,
  head: () => ({ meta: [{ title: "CRM — Harwick & Sterne" }] }),
});

type Stage = "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Closed";

const stageStyle: Record<Stage, { dot: string; chip: string }> = {
  Lead:        { dot: "bg-foreground/25", chip: "bg-foreground/[0.06] text-foreground/80 border-foreground/10" },
  Qualified:   { dot: "bg-foreground/35", chip: "bg-foreground/[0.08] text-foreground/85 border-foreground/12" },
  Proposal:    { dot: "bg-foreground/45", chip: "bg-foreground/[0.10] text-foreground/90 border-foreground/14" },
  Negotiation: { dot: "bg-foreground/55", chip: "bg-foreground/[0.12] text-foreground/95 border-foreground/16" },
  Closed:      { dot: "bg-foreground/70", chip: "bg-foreground/[0.16] text-foreground border-foreground/18" },
};

type Client = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: Stage;
  aum: number; // dollars
  owner: { initials: string; name: string };
  lastContact: string;
  nextAction: string;
  starred?: boolean;
};

export const seedClients: Client[] = [
  { id: 1, name: "Eleanor Hartley",   company: "Hartley Family Trust",     email: "eleanor@hartleytrust.com",  phone: "+1 (212) 555-0148", stage: "Negotiation", aum: 12_400_000, owner: { initials: "JH", name: "John Harwick" },  lastContact: "2h ago",   nextAction: "Send revised IPS",        starred: true },
  { id: 2, name: "Denis Marlow",      company: "Marlow Holdings LLC",      email: "denis@marlowhold.com",      phone: "+1 (415) 555-0192", stage: "Proposal",    aum: 8_750_000,  owner: { initials: "OP", name: "Olivia Park" },   lastContact: "Today",    nextAction: "Schedule rebalance call" },
  { id: 3, name: "Sarah Beaumont",    company: "Beaumont Capital",         email: "sarah@beaumontcap.com",     phone: "+1 (646) 555-0173", stage: "Qualified",   aum: 5_200_000,  owner: { initials: "ML", name: "Marcus Lee" },    lastContact: "Yesterday", nextAction: "KYC follow-up" },
  { id: 4, name: "Raphael Castellanos", company: "Castellanos Ventures",   email: "raph@castellanos.vc",       phone: "+1 (305) 555-0119", stage: "Proposal",    aum: 7_900_000,  owner: { initials: "JH", name: "John Harwick" },  lastContact: "3d ago",   nextAction: "Review allocation memo" },
  { id: 5, name: "Aurelia Whitfield", company: "Whitfield Estate",         email: "a.whitfield@wfield.com",    phone: "+1 (212) 555-0211", stage: "Lead",        aum: 3_100_000,  owner: { initials: "RC", name: "Rina Cho" },      lastContact: "5d ago",   nextAction: "Send discovery deck",      starred: true },
  { id: 6, name: "Marcus Caldwell",   company: "Caldwell Estate",          email: "marcus@caldwell.co",        phone: "+1 (617) 555-0162", stage: "Closed",      aum: 4_650_000,  owner: { initials: "OP", name: "Olivia Park" },   lastContact: "1w ago",   nextAction: "Annual review prep" },
  { id: 7, name: "Priya Iyer",        company: "Sterling Holdings",        email: "priya@sterlingco.com",      phone: "+1 (212) 555-0144", stage: "Negotiation", aum: 9_300_000,  owner: { initials: "DM", name: "David Mensah" },  lastContact: "4h ago",   nextAction: "Lock advisory terms" },
  { id: 8, name: "Theodore Beck",     company: "Beck & Sons",              email: "ted@becksons.com",          phone: "+1 (713) 555-0188", stage: "Lead",        aum: 1_800_000,  owner: { initials: "ML", name: "Marcus Lee" },    lastContact: "2w ago",   nextAction: "Re-engage via email" },
  { id: 9, name: "Isabelle Renault",  company: "Renault Trust",            email: "isabelle@renaulttrust.fr",  phone: "+33 1 55 55 0177",  stage: "Qualified",   aum: 6_400_000,  owner: { initials: "RC", name: "Rina Cho" },      lastContact: "Today",    nextAction: "Send proposal draft" },
  { id: 10, name: "Owen Fitzgerald",  company: "Fitzgerald Capital",       email: "owen@fitzcap.com",          phone: "+1 (415) 555-0136", stage: "Proposal",    aum: 11_200_000, owner: { initials: "JH", name: "John Harwick" },  lastContact: "1h ago",   nextAction: "Approve IPS revisions" },
];

const STAGES: ("All" | Stage)[] = ["All", "Lead", "Qualified", "Proposal", "Negotiation", "Closed"];

function fmtAum(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function CrmPage() {
  const [clients, setClients] = useState<Client[]>(seedClients);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<(typeof STAGES)[number]>("All");

  // Prepend the new client and clear filters so it's immediately visible.
  const addClient = (c: Client) => {
    setClients((prev) => [c, ...prev]);
    setStage("All");
    setQuery("");
  };

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesStage = stage === "All" || c.stage === stage;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      return matchesStage && matchesQuery;
    });
  }, [clients, query, stage]);

  const totals = useMemo(() => {
    const aum = filtered.reduce((s, c) => s + c.aum, 0);
    const open = filtered.filter((c) => c.stage !== "Closed").length;
    return { aum, open, count: filtered.length };
  }, [filtered]);

  return (
    <>
    <div className="w-full bg-background flex flex-col" style={{ minHeight: "calc(100dvh - 53px)" }}>
      {/* Header */}
      <div className="px-8 pt-10 pb-8 border-b border-border/50 flex items-end justify-between flex-wrap gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
            <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-foreground/40" />
            Clients
          </div>
          <h1 className="font-serif-display mt-3 text-4xl md:text-[44px] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">CRM</h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground max-w-xl">
            Every relationship in one place — accounts, owners, AUM and the next move.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border bg-transparent rounded-sm hover:bg-foreground/[0.04]">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <NewClientDialog onAdd={addClient} />
        </div>
      </div>

      {/* Stat strip — divided columns, no cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border/60 divide-x divide-border/60">
        {[
          { label: "Total clients", value: clients.length.toString() },
          { label: "Showing", value: totals.count.toString() },
          { label: "Open relationships", value: totals.open.toString() },
          { label: "AUM (filtered)", value: fmtAum(totals.aum) },
        ].map((s) => (
          <div key={s.label} className="px-8 py-5">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</div>
            <div className="mt-1.5 text-[22px] font-semibold tracking-tight tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="px-8 py-3 border-b border-border/60 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, companies, email…"
            className="w-full h-9 pl-9 pr-3 rounded-sm bg-muted/50 border border-border text-[13px] placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
          />
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-sm bg-muted/50 border border-border">
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`h-7 px-3 rounded-sm text-[11px] font-medium transition-colors ${
                stage === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table — full width, no card */}
      <div className="flex-1 overflow-x-auto px-2 pb-2">
        <table className="w-full text-left border-separate border-spacing-y-1">
          <thead className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="py-2 pl-4 pr-2 w-8"></th>
                <th className="py-2 px-2">
                  <span className="inline-flex items-center gap-1">Client <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                </th>
                <th className="py-2 px-2">Stage</th>
                <th className="py-2 px-2 text-right">
                  <span className="inline-flex items-center gap-1">AUM <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                </th>
                <th className="py-2 px-2">Owner</th>
                <th className="py-2 px-2">Last contact</th>
                <th className="py-2 px-2">Next action</th>
                <th className="py-2 px-2 w-24 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              {filtered.map((c) => {
                const sty = stageStyle[c.stage];
                return (
                  <tr
                    key={c.id}
                    className="group bg-card/40 hover:bg-card/70 border border-border/40 rounded-sm transition-colors"
                  >
                    <td className="py-3 pl-4 pr-2 rounded-l-sm">
                      <Star
                        className={`h-3.5 w-3.5 ${c.starred ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"}`}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 shrink-0 rounded-full grid place-items-center text-[11px] font-semibold text-foreground/80 bg-muted border border-border">
                          {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground/95 truncate">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{c.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-sm text-[10px] font-medium border ${sty.chip}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sty.dot}`} />
                        {c.stage}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-semibold tabular-nums">{fmtAum(c.aum)}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full grid place-items-center text-[10px] font-semibold bg-muted text-foreground/80 border border-border">
                          {c.owner.initials}
                        </div>
                        <div className="text-[12px] text-foreground/80 truncate">{c.owner.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-[12px] text-muted-foreground whitespace-nowrap">{c.lastContact}</td>
                    <td className="py-3 px-2 text-[12px] text-foreground/80 truncate max-w-[220px]">{c.nextAction}</td>
                    <td className="py-3 px-2 pr-4 rounded-r-sm">
                      <div className="flex items-center justify-end gap-1">
                        <button className="h-7 w-7 grid place-items-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]" aria-label="Call">
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                        <button className="h-7 w-7 grid place-items-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]" aria-label="Email">
                          <Mail className="h-3.5 w-3.5" />
                        </button>
                        <button className="h-7 w-7 grid place-items-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]" aria-label="More">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[13px] text-muted-foreground">
                    No clients match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
    <SyraChatWidget />
    </>
  );
}

type Source = "email" | "whatsapp" | "contacts" | "direct";

const SOURCES: { id: Source; label: string; sub: string; Icon: typeof Mail; dot: string }[] = [
  { id: "email", label: "Email", sub: "Add by email", Icon: Mail, dot: "bg-blue-500" },
  { id: "whatsapp", label: "WhatsApp", sub: "Add by WhatsApp", Icon: MessageCircle, dot: "bg-emerald-500" },
  { id: "contacts", label: "iPhone Contacts", sub: "Import from device", Icon: Smartphone, dot: "bg-foreground/70" },
  { id: "direct", label: "Direct number", sub: "Add by phone", Icon: Phone, dot: "bg-violet-500" },
];

const NEW_STAGES: Stage[] = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"];

/**
 * NewClientDialog — the "New client" action. Capture a client from one of four
 * sources (email, WhatsApp, iPhone contacts, or a direct number) with name,
 * organization, stage and an optional next action, then add them to the table.
 */
function NewClientDialog({ onAdd }: { onAdd: (c: Client) => void }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<Source>("email");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<Stage>("Lead");
  const [nextAction, setNextAction] = useState("");

  const reset = () => {
    setSource("email");
    setName("");
    setOrg("");
    setEmail("");
    setPhone("");
    setStage("Lead");
    setNextAction("");
  };

  const needsEmail = source === "email";
  const needsPhone = source === "whatsapp" || source === "direct";
  const isContacts = source === "contacts";

  const importFromContacts = async () => {
    const picker = (
      navigator as unknown as {
        contacts?: {
          select: (
            props: string[],
            opts: { multiple: boolean },
          ) => Promise<Array<{ name?: string[]; email?: string[]; tel?: string[] }>>;
        };
      }
    ).contacts;
    if (!picker?.select) {
      toast.error("Contact picker isn't available here", {
        description: "Enter the details manually below.",
      });
      return;
    }
    try {
      const [picked] = await picker.select(["name", "email", "tel"], { multiple: false });
      if (!picked) return;
      if (picked.name?.[0]) setName(picked.name[0]);
      if (picked.email?.[0]) setEmail(picked.email[0]);
      if (picked.tel?.[0]) setPhone(picked.tel[0]);
      toast.success("Imported from Contacts");
    } catch {
      /* user dismissed the picker */
    }
  };

  const canSubmit =
    name.trim().length > 0 &&
    (needsEmail
      ? email.trim().length > 0
      : needsPhone
        ? phone.trim().length > 0
        : email.trim().length > 0 || phone.trim().length > 0);

  const submit = () => {
    if (!canSubmit) {
      toast.error("Add a name and a way to reach them");
      return;
    }
    onAdd({
      id: Date.now(),
      name: name.trim(),
      company: org.trim() || "—",
      email: email.trim(),
      phone: phone.trim(),
      stage,
      aum: 0,
      owner: { initials: "JH", name: "John Harwick" },
      lastContact: "Just now",
      nextAction: nextAction.trim() || "—",
    });
    toast.success(`Added ${name.trim()}`, {
      description: org.trim() || `New ${stage.toLowerCase()}`,
    });
    reset();
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
        <Button className="text-white border-0" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-4 w-4 mr-2" /> New client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New client</DialogTitle>
          <DialogDescription>
            Add from email, WhatsApp, iPhone contacts, or a direct number.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Source */}
          <div className="grid grid-cols-2 gap-2">
            {SOURCES.map((s) => {
              const active = source === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSource(s.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                    active
                      ? "border-foreground/40 bg-foreground/[0.06]"
                      : "border-border hover:bg-foreground/[0.03]"
                  }`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${s.dot}`}>
                    <s.Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-medium leading-tight">{s.label}</span>
                    <span className="block text-[10.5px] text-muted-foreground">{s.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {isContacts && (
            <Button type="button" variant="outline" className="w-full" onClick={importFromContacts}>
              <Smartphone className="h-4 w-4 mr-2" /> Import from iPhone Contacts
            </Button>
          )}

          {/* Identity */}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nc-name">
                Name <span className="text-muted-foreground">*</span>
              </Label>
              <Input
                id="nc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eleanor Hartley"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nc-org">
                Organization <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="nc-org"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="Hartley Family Trust"
                autoComplete="off"
              />
            </div>

            {(needsEmail || isContacts) && (
              <div className="space-y-1.5">
                <Label htmlFor="nc-email">Email{needsEmail ? "" : " (optional)"}</Label>
                <Input
                  id="nc-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eleanor@hartleytrust.com"
                  autoComplete="off"
                />
              </div>
            )}
            {(needsPhone || isContacts) && (
              <div className="space-y-1.5">
                <Label htmlFor="nc-phone">Phone{needsPhone ? "" : " (optional)"}</Label>
                <Input
                  id="nc-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (212) 555-0148"
                  autoComplete="off"
                />
                {source === "whatsapp" && (
                  <p className="text-[11px] text-muted-foreground">
                    Include the country code for WhatsApp.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stage */}
          <div className="space-y-1.5">
            <Label>Stage</Label>
            <div className="flex w-fit flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
              {NEW_STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`h-7 rounded-full px-3 text-[11px] font-medium transition-colors ${
                    stage === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Next action */}
          <div className="space-y-1.5">
            <Label htmlFor="nc-next">
              Next action <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="nc-next"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Send discovery deck"
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit}
            className="text-white border-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}