import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type CSSProperties } from "react";
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
import { PageShell, PageHeader } from "@/components/page-shell";
import { toast } from "sonner";
import { UserPlus, Mail, MessageSquare, MessageCircle, Copy, Send, Users } from "lucide-react";
import { avatarUrl } from "@/lib/avatar";

export const Route = createFileRoute("/team")({
  component: TeamPage,
  head: () => ({ meta: [{ title: "Team — Harwick & Sterne" }] }),
});

export type TeamId = "advisory" | "research" | "operations" | "client-services" | "invited";

export type Member = {
  name: string;
  role: string;
  status: string;
  tasks: number;
  score: number;
  team: TeamId;
  pending?: boolean;
  inviteRole?: Role;
};

export type TeamDef = {
  id: TeamId;
  name: string;
  tagline: string;
  accent: string;
};

// Per-team accents — small, intentional pops of color layered on top of the
// app's neutral bento palette. Each is used for the team chip + avatar ring.
export const TEAMS: TeamDef[] = [
  { id: "advisory", name: "Advisory", tagline: "Client strategy & relationships", accent: "#6366F1" },
  { id: "research", name: "Research", tagline: "Markets, diligence & analysis", accent: "#0EA5E9" },
  { id: "operations", name: "Operations", tagline: "Workflow, compliance & ops", accent: "#10B981" },
  { id: "client-services", name: "Client Services", tagline: "Onboarding & account care", accent: "#F59E0B" },
];

// Pseudo-team for freshly invited members who haven't been assigned yet.
const INVITED_TEAM: TeamDef = {
  id: "invited",
  name: "Invited",
  tagline: "Awaiting sign-up",
  accent: "#9CA3AF",
};

function teamById(id: TeamId): TeamDef {
  return TEAMS.find((t) => t.id === id) ?? INVITED_TEAM;
}

export const seedTeam: Member[] = [
  { name: "Elena Smith", role: "Associate, Harwick & Sterne", status: "Online", tasks: 12, score: 96, team: "advisory" },
  { name: "Daniel Brooks", role: "Managing Partner, Marlow Capital", status: "Offline", tasks: 3, score: 90, team: "advisory" },
  { name: "Adrian Engman", role: "CFO, Sterling Holdings LLC", status: "Away", tasks: 7, score: 88, team: "research" },
  { name: "Claire Bennett", role: "Principal, Caldwell Estate", status: "Online", tasks: 5, score: 94, team: "operations" },
  { name: "Emma Reeves", role: "Trustee, Hartley Family Trust", status: "Online", tasks: 9, score: 91, team: "client-services" },
  { name: "Lena Foster", role: "Family Office Director, Beaumont Group", status: "Online", tasks: 4, score: 92, team: "client-services" },
];

function statusDotColor(status: string) {
  switch (status) {
    case "Online":
      return "#2BAC76";
    case "Away":
      return "#EBB02C";
    case "Offline":
      return "#CB2431";
    case "Pending":
      return "#9CA3AF";
    default:
      return "#888";
  }
}

function TeamPage() {
  const [team, setTeam] = useState<Member[]>(seedTeam);
  // null === "All" — show every member regardless of team.
  const [activeTeam, setActiveTeam] = useState<TeamId | null>(null);

  const addInvite = (name: string, via: string, inviteRole: Role) => {
    setTeam((prev) => [
      {
        name,
        role: `Invited via ${via}`,
        status: "Pending",
        tasks: 0,
        score: 0,
        team: "invited",
        pending: true,
        inviteRole,
      },
      ...prev,
    ]);
    // Surface the new invite immediately by clearing any active filter.
    setActiveTeam(null);
  };

  const counts = useMemo(() => {
    const map = new Map<TeamId, Member[]>();
    for (const m of team) {
      const list = map.get(m.team) ?? [];
      list.push(m);
      map.set(m.team, list);
    }
    return map;
  }, [team]);

  // Only render the "Invited" tile when there's actually someone in it.
  const visibleTeams = useMemo(
    () => [...TEAMS, ...(counts.get("invited")?.length ? [INVITED_TEAM] : [])],
    [counts],
  );

  const filtered = useMemo(
    () => (activeTeam === null ? team : team.filter((m) => m.team === activeTeam)),
    [team, activeTeam],
  );

  const activeLabel = activeTeam === null ? "All members" : teamById(activeTeam).name;

  return (
    <PageShell>
      <PageHeader
        eyebrow="People"
        title="Team"
        description="Employees, workload and accountability at a glance."
        actions={<InviteDialog onInvite={addInvite} />}
      />

      {/* Teams — horizontal command surface for filtering the roster. */}
      <section aria-label="Teams" className="pb-1">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Teams <span className="text-muted-foreground/70 font-normal normal-case">· {visibleTeams.length}</span>
            </h2>
          </div>
          {activeTeam !== null && (
            <Button
              variant="ghost"
              onClick={() => setActiveTeam(null)}
              className="h-7 px-2.5 -mr-2 text-[12px] text-muted-foreground hover:text-foreground"
            >
              Clear filter
            </Button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <TeamSelector
            id={null}
            label="All teams"
            description="Everyone across the firm"
            members={team}
            active={activeTeam === null}
            onClick={() => setActiveTeam(null)}
            metrics={[
              {
                label: "Open tasks",
                value: team.filter((m) => !m.pending).reduce((s, m) => s + m.tasks, 0),
              },
              { label: "Teams", value: TEAMS.length },
            ]}
          />
          {visibleTeams.map((t) => {
            const members = counts.get(t.id) ?? [];
            const active = activeTeam === t.id;
            const realMembers = members.filter((m) => !m.pending);
            const openTasks = realMembers.reduce((s, m) => s + m.tasks, 0);
            const avgScore = realMembers.length
              ? Math.round(realMembers.reduce((s, m) => s + m.score, 0) / realMembers.length)
              : 0;
            return (
              <TeamSelector
                key={t.id}
                id={t.id}
                label={t.name}
                description={t.tagline}
                members={members}
                active={active}
                onClick={() => setActiveTeam(active ? null : t.id)}
                metrics={
                  t.id === "invited"
                    ? undefined
                    : [
                        { label: "Open tasks", value: openTasks },
                        { label: "Avg", value: `${avgScore}%` },
                      ]
                }
              />
            );
          })}
        </div>
      </section>

      <div className="h-px w-full bg-border/60" aria-hidden />

      {/* Members — reflects the current team filter. */}
      <section aria-label="Members" className="pt-2">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Members <span className="text-muted-foreground/70 font-normal normal-case">· {filtered.length}</span>
          </h2>
          {activeTeam !== null && (
            <Badge variant="outline" className="border-foreground/20 text-foreground text-[11px]">
              {activeLabel}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const t = teamById(m.team);
            return (
              <Card key={m.name} className="bento p-5">
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl(m.name, 128)}
                    alt={m.name}
                    loading="lazy"
                    className={`h-11 w-11 rounded-full object-cover border border-border/60 ${m.pending ? "grayscale opacity-80" : ""}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{m.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{m.role}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 border-border/60 text-muted-foreground"
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: statusDotColor(m.status) }}
                    />
                    {m.status}
                  </Badge>
                </div>

                {/* Team chip — ties the member back to their team. */}
                <button
                  type="button"
                  onClick={() => setActiveTeam(m.team)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-border/70 bg-transparent px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/60" />
                  {t.name}
                </button>

                {m.pending ? (
                  <div className="mt-3 rounded-lg border border-dashed border-border/70 bg-foreground/[0.02] px-3 py-3 text-[12px] text-muted-foreground">
                    {m.inviteRole
                      ? `Invited as ${m.inviteRole} — awaiting sign-up to the dashboard.`
                      : "Invitation sent — awaiting sign-up to the dashboard."}
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Open tasks</div>
                        <div className="mt-1 text-xl font-semibold">{m.tasks}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Accountability</div>
                        <div className="mt-1 text-xl font-semibold">{m.score}%</div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${m.score}%`, opacity: 0.85 }}
                      />
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

/**
 * Overlapping avatar stack for a team card — shows up to 4 faces ringed in the
 * team accent, plus a "+N" chip when the team is larger.
 */
function AvatarStack({ members, accent }: { members: Member[]; accent: string }) {
  const shown = members.slice(0, 4);
  const extra = members.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((m) => (
          <img
            key={m.name}
            src={avatarUrl(m.name, 96)}
            alt={m.name}
            title={m.name}
            loading="lazy"
            className={`h-7 w-7 rounded-full object-cover ring-2 ring-card bg-card ${m.pending ? "grayscale opacity-80" : ""}`}
            style={{ boxShadow: `0 0 0 1px color-mix(in oklab, ${accent} 50%, transparent)` }}
          />
        ))}
        {extra > 0 && (
          <span
            className="grid h-7 w-7 place-items-center rounded-full ring-2 ring-card bg-foreground/[0.06] text-[10px] font-semibold text-muted-foreground tabular-nums"
            title={`+${extra} more`}
          >
            +{extra}
          </span>
        )}
        {members.length === 0 && (
          <span className="text-[12px] text-muted-foreground">No members yet</span>
        )}
      </div>
    </div>
  );
}

/**
 * Sleek horizontal team selector card used in the Teams command surface.
 * Differentiated from the Members grid by its wide, low-profile shape and
 * neutral monochrome treatment.
 */
function TeamSelector({
  id,
  label,
  description,
  members,
  active,
  onClick,
  metrics,
}: {
  id: TeamId | null;
  label: string;
  description: string;
  members: Member[];
  active: boolean;
  onClick: () => void;
  metrics?: { label: string; value: string | number }[];
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group relative flex min-w-[260px] max-w-[320px] flex-1 shrink-0 flex-col rounded-sm border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 ${
        active
          ? "bg-card border-foreground/20 shadow-md"
          : "bg-card/40 border-border/60 hover:bg-card/75 hover:border-foreground/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{label}</span>
            <Badge
              variant="outline"
              className="shrink-0 border-border/60 text-muted-foreground tabular-nums text-[10px]"
            >
              {members.length}
            </Badge>
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground truncate">{description}</div>
        </div>
        <AvatarStack members={members} accent={active ? "#666" : "#999"} />
      </div>

      {metrics && metrics.length > 0 && (
        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          {metrics.map((m) => (
            <span key={m.label} className="flex items-center gap-1">
              <span className="font-semibold text-foreground tabular-nums">{m.value}</span>
              <span>{m.label}</span>
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

type Channel = "email" | "imessage" | "whatsapp";

const CHANNELS: { id: Channel; label: string; Icon: typeof Mail; dot: string }[] = [
  { id: "email", label: "Email", Icon: Mail, dot: "bg-blue-500" },
  { id: "imessage", label: "iMessage", Icon: MessageSquare, dot: "bg-sky-500" },
  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle, dot: "bg-emerald-500" },
];

export type Role = "Admin" | "Co-owner" | "Member";

const ROLES: Role[] = ["Admin", "Co-owner", "Member"];

const INVITE_LINK = "https://app.harwicksterne.com/join";

/**
 * InviteDialog — invite a teammate to the dashboard via Email, iMessage, or
 * WhatsApp. Each channel passes a prefilled invite + join link through to the
 * native app so the recipient can create their account.
 */
function InviteDialog({ onInvite }: { onInvite: (name: string, via: string, role: Role) => void }) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<Channel>("email");
  const [role, setRole] = useState<Role>("Member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const digits = phone.replace(/\D/g, "");
  const isEmail = channel === "email";
  const valid = isEmail ? /\S+@\S+\.\S+/.test(email.trim()) : digits.length >= 7;
  const channelLabel = CHANNELS.find((c) => c.id === channel)!.label;

  const reset = () => {
    setChannel("email");
    setRole("Member");
    setName("");
    setEmail("");
    setPhone("");
  };

  const message = () =>
    `${name.trim() ? `Hi ${name.trim()}, ` : ""}you're invited to join the Harwick & Sterne dashboard on Syra as ${/^[aeiou]/i.test(role) ? "an" : "a"} ${role}. Create your account here: ${INVITE_LINK}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK);
      toast.success("Invite link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const send = () => {
    if (!valid) {
      toast.error(isEmail ? "Enter a valid email" : "Enter a valid phone number");
      return;
    }
    const text = message();
    if (channel === "email") {
      window.location.href = `mailto:${email.trim()}?subject=${encodeURIComponent(
        "You're invited to Harwick & Sterne",
      )}&body=${encodeURIComponent(text)}`;
    } else if (channel === "whatsapp") {
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `sms:${phone.trim()}?&body=${encodeURIComponent(text)}`;
    }
    onInvite(name.trim() || (isEmail ? email.trim() : phone.trim()), channelLabel, role);
    toast.success("Invitation sent", {
      description: `${name.trim() || "New member"} · ${role} · via ${channelLabel}`,
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
        <Button className="h-9 px-4 text-[13px] gap-2">
          <UserPlus className="h-3.5 w-3.5" /> Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to the team</DialogTitle>
          <DialogDescription>
            Send an invite to join the dashboard and create an account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Channel */}
          <div className="grid grid-cols-3 gap-2">
            {CHANNELS.map((c) => {
              const active = channel === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChannel(c.id)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                    active ? "border-foreground/40 bg-foreground/[0.06]" : "border-border hover:bg-foreground/[0.03]"
                  }`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${c.dot}`}>
                    <c.Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] font-medium">{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
              {ROLES.map((r) => {
                const active = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={active}
                    className={`h-7 flex-1 rounded-full px-2 text-[11px] font-medium transition-colors ${
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-name">
              Name <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="inv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Avery"
              autoComplete="off"
            />
          </div>

          {/* Contact — email or phone by channel */}
          {isEmail ? (
            <div className="space-y-1.5">
              <Label htmlFor="inv-email">
                Email <span className="text-muted-foreground">*</span>
              </Label>
              <Input
                id="inv-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="jordan@firm.com"
                autoComplete="off"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="inv-phone">
                Phone number <span className="text-muted-foreground">*</span>
              </Label>
              <Input
                id="inv-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="+1 (415) 555-0148"
                autoComplete="off"
              />
            </div>
          )}

          {/* Shareable invite link */}
          <div className="space-y-1.5">
            <Label>Invite link</Label>
            <div className="flex items-center gap-2">
              <Input value={INVITE_LINK} readOnly className="text-muted-foreground" />
              <Button variant="outline" onClick={copyLink} className="shrink-0">
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </div>
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
            onClick={send}
            disabled={!valid}
            className="text-white border-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Send className="h-4 w-4 mr-2" /> Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
