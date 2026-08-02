import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Palette,
  KeyRound,
  Bell,
  Mail,
  MessageSquare,
  MessageCircle,
  Copy,
  Send,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — strategent" }] }),
});

type UserRow = { name: string; role: string; pending?: boolean };

const seedUsers: UserRow[] = [
  { name: "Avery Cole", role: "Owner" },
  { name: "Marcus Reed", role: "Admin" },
  { name: "Jenna Park", role: "Member" },
  { name: "Diego Alvarez", role: "Member" },
  { name: "Priya Shah", role: "Member" },
];

function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState<UserRow[]>(seedUsers);

  const addInvite = (name: string, role: Role) => {
    setUsers((prev) => [{ name, role, pending: true }, ...prev]);
  };

  const memberCount = users.length;
  const adminCount = users.filter((u) => u.role === "Admin" || u.role === "Owner").length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Authentication, users, appearance and notifications."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bento p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/15 text-primary"><Shield className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Authentication</div>
              <div className="text-xs text-muted-foreground">Powered by Clerk</div>
            </div>
            <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">Connected</Badge>
          </div>
          <div className="mt-5 space-y-3 text-[13px]">
            <Row label="Email + password" enabled />
            <Row label="Google SSO" enabled />
            <Row label="Apple SSO" />
            <Row label="Two-factor (TOTP)" enabled />
            <Row label="Magic links" />
          </div>
          <Button variant="outline" className="mt-5 border-border/60"><KeyRound className="h-4 w-4 mr-2" /> Manage in Clerk</Button>
        </Card>

        <Card className="bento p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg grid place-items-center bg-accent/15 text-accent"><Users className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Users & Roles</div>
              <div className="text-xs text-muted-foreground">
                {memberCount} members · {adminCount} admins
              </div>
            </div>
            <InviteDialog onInvite={addInvite} />
          </div>
          <div className="mt-5 space-y-2">
            {users.map((u) => (
              <div key={u.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
                <div
                  className={`h-8 w-8 rounded-full grid place-items-center text-[11px] font-semibold ${u.pending ? "grayscale opacity-80" : ""}`}
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {u.name.split(" ").map((p) => p[0]).join("")}
                </div>
                <div className="text-[13px] flex-1 truncate">{u.name}</div>
                {u.pending && (
                  <Badge className="bg-transparent text-muted-foreground border border-dashed border-border/70 hover:bg-transparent">
                    Pending
                  </Badge>
                )}
                <Badge className="bg-black/5 dark:bg-white/5 text-muted-foreground border border-border/60">{u.role}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bento p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/15 text-primary"><Palette className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Appearance</div>
              <div className="text-xs text-muted-foreground">Theme & density</div>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <span>Dark mode</span>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
            <Row label="Compact density" />
            <Row label="Reduce motion" />
            <Row label="Show grid background" enabled />
          </div>
        </Card>

        <Card className="bento p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg grid place-items-center bg-accent/15 text-accent"><Bell className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Notifications</div>
              <div className="text-xs text-muted-foreground">When Syra and the team should ping you</div>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-[13px]">
            <Row label="Inbox — new lead replies" enabled />
            <Row label="Calls — escalations" enabled />
            <Row label="Tasks — overdue" />
            <Row label="Billing — failed payments" enabled />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

function Row({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <Switch defaultChecked={enabled} />
    </div>
  );
}

type Channel = "email" | "imessage" | "whatsapp";

const CHANNELS: { id: Channel; label: string; Icon: typeof Mail; dot: string }[] = [
  { id: "email", label: "Email", Icon: Mail, dot: "bg-blue-500" },
  { id: "imessage", label: "iMessage", Icon: MessageSquare, dot: "bg-sky-500" },
  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle, dot: "bg-emerald-500" },
];

type Role = "Admin" | "Co-owner" | "Member";

const ROLES: Role[] = ["Admin", "Co-owner", "Member"];

const INVITE_LINK = "https://app.harwicksterne.com/join";

/**
 * InviteDialog — mirrors the Team page invite method (Email / iMessage /
 * WhatsApp passthrough with a prefilled join link) and adds a role selector so
 * the inviter can assign Admin / Co-owner / Member up front. Each channel hands
 * a prefilled invite + join link to the native app so the recipient can create
 * their account.
 */
function InviteDialog({ onInvite }: { onInvite: (name: string, role: Role) => void }) {
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
    `${name.trim() ? `Hi ${name.trim()}, ` : ""}you're invited to join the Harwick & Sterne dashboard on Syra as ${role}. Create your account here: ${INVITE_LINK}`;

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
    onInvite(name.trim() || (isEmail ? email.trim() : phone.trim()), role);
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
        <Button size="sm" variant="outline" className="border-border/60">
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
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
