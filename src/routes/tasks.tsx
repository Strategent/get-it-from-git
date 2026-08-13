import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { TEAMS as ORG_TEAMS, seedTeam, type TeamId } from "@/routes/team";
import { avatarUrl } from "@/lib/avatar";
import { SmartAvatar } from "@/components/smart-avatar";
import { Plus, Check, Users, ChevronDown, ChevronRight, Circle, CircleDot, CheckCircle2, GitBranch } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
  head: () => ({ meta: [{ title: "Tasks — strategent" }] }),
});

type Priority = "High" | "Med" | "Low";
type TaskStatus = "open" | "pending" | "done";
type Assignee = { initials: string; name: string };
type Task = {
  id: number;
  code: string;
  title: string;
  assignees: Assignee[];
  priority: Priority;
  status: TaskStatus;
  company: string;
  due: string;
  subtasks: number;
};
type Group = { name: string; accent: string; items: Task[] };

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
const A = (name: string): Assignee => ({ initials: initialsOf(name), name });

const PEOPLE: { initials: string; name: string; role: string }[] = [
  ...seedTeam.map((m) => ({ initials: initialsOf(m.name), name: m.name, role: m.role })),
  { initials: "SY", name: "Syra", role: "AI agent" },
];

const TEAMS: { name: string; members: string[] }[] = ORG_TEAMS.map((t) => ({
  name: t.name,
  members: seedTeam.filter((m) => m.team === (t.id as TeamId)).map((m) => m.name),
}));

const assigneeFor = (name: string): Assignee => {
  const p = PEOPLE.find((pp) => pp.name === name);
  return p ? { initials: p.initials, name: p.name } : A(name);
};

const seedGroups: Group[] = [
  {
    name: "Today",
    accent: "bg-muted-foreground/70",
    items: [
      { id: 1, code: "HS-01", title: "Review Q2 onboarding playbook", assignees: [A("Avery")], priority: "High", status: "open", company: "Harwick & Sterne, LLC.", due: "Jul 10, 2026", subtasks: 3 },
      { id: 2, code: "HS-02", title: "Finalize Acme proposal v2", assignees: [assigneeFor("Syra")], priority: "High", status: "open", company: "Acme Holdings, Inc.", due: "Jul 10, 2026", subtasks: 4 },
      { id: 3, code: "HS-03", title: "Approve Stripe payout", assignees: [A("Avery")], priority: "Med", status: "done", company: "Stripe, Inc.", due: "Jul 9, 2026", subtasks: 1 },
    ],
  },
  {
    name: "This week",
    accent: "bg-foreground/60",
    items: [
      { id: 4, code: "HS-04", title: "Migrate CRM custom fields", assignees: [assigneeFor("Marcus Lee")], priority: "Med", status: "open", company: "Northwind Capital, LLC.", due: "Jul 13, 2026", subtasks: 5 },
      { id: 5, code: "HS-05", title: "Record agent training data", assignees: [assigneeFor("Syra")], priority: "Low", status: "open", company: "Harwick & Sterne, LLC.", due: "Jul 14, 2026", subtasks: 2 },
      { id: 6, code: "HS-06", title: "QA new voice prompt set", assignees: [A("Jenna")], priority: "Med", status: "open", company: "Harwick & Sterne, LLC.", due: "Jul 15, 2026", subtasks: 3 },
    ],
  },
  {
    name: "This month",
    accent: "bg-foreground/40",
    items: [
      { id: 7, code: "HS-07", title: "Plan Q3 advisor offsite", assignees: [assigneeFor("David Mensah")], priority: "Low", status: "open", company: "Harwick & Sterne, LLC.", due: "Jul 24, 2026", subtasks: 4 },
      { id: 8, code: "HS-08", title: "Annual KYC refresh — top accounts", assignees: [assigneeFor("Rina Cho")], priority: "Med", status: "open", company: "Meridian Trust Co.", due: "Jul 28, 2026", subtasks: 6 },
    ],
  },
];

// Linear-style monotone priority indicator: 3 stacked bars with variable fill
function PriorityGlyph({ priority }: { priority: Priority }) {
  const filled = priority === "High" ? 3 : priority === "Med" ? 2 : 1;
  return (
    <span
      className="inline-flex items-end gap-[2px]"
      title={`${priority} priority`}
      aria-label={`${priority} priority`}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-[1px] ${
            i < filled ? "bg-foreground/80" : "bg-foreground/20"
          }`}
          style={{ height: `${5 + i * 3}px` }}
        />
      ))}
    </span>
  );
}

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "done")
    return <CheckCircle2 className="h-[15px] w-[15px] text-emerald-500/90" strokeWidth={2} />;
  if (status === "pending")
    return <CircleDot className="h-[15px] w-[15px] text-amber-500/90" strokeWidth={2} />;
  return <Circle className="h-[15px] w-[15px] text-muted-foreground/70" strokeWidth={2} />;
}

function AssigneeStack({ assignees, size = 20 }: { assignees: Assignee[]; size?: number }) {
  if (assignees.length === 0) {
    return <div className="text-[11px] text-muted-foreground">Unassigned</div>;
  }
  const shown = assignees.slice(0, 3);
  const extra = assignees.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5" title={assignees.map((a) => a.name).join(", ")}>
      {shown.map((a) => (
        <SmartAvatar name={a.name} className="rounded-full object-cover ring-2 ring-background" alt={a.name}} />
      ))}
      {extra > 0 && (
        <span
          className="grid place-items-center rounded-full border border-border bg-foreground/[0.08] text-[9.5px] font-semibold text-muted-foreground ring-2 ring-background"
          style={{ height: size, width: size }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

function TaskRow({
  task,
  confirming,
  onRequestComplete,
  onConfirm,
  onCancel,
  onReopen,
}: {
  task: Task;
  confirming: boolean;
  onRequestComplete: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onReopen: () => void;
}) {
  const done = task.status === "done";
  const pending = task.status === "pending";

  return (
    <div className="group relative">
      <div className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-foreground/[0.025]">
        <button
          type="button"
          onClick={() => (task.status === "open" ? onRequestComplete() : onReopen())}
          className="grid h-5 w-5 shrink-0 place-items-center rounded-sm transition-colors hover:bg-foreground/[0.06]"
          aria-label={task.status === "open" ? "Complete task" : "Reopen task"}
        >
          <StatusIcon status={task.status} />
        </button>

        <PriorityGlyph priority={task.priority} />

        <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground/80 shrink-0 w-[46px]">
          {task.code}
        </span>

        <span
          className={`min-w-0 flex-1 truncate text-[13px] leading-snug ${
            done
              ? "line-through text-muted-foreground"
              : pending
                ? "text-muted-foreground"
                : "text-foreground"
          }`}
        >
          {task.title}
        </span>

        <span className="hidden lg:flex items-center gap-1.5 text-[11.5px] text-muted-foreground shrink-0">
          <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span className="max-w-[180px] truncate">{task.company}</span>
        </span>

        {task.subtasks > 0 && (
          <span className="hidden md:inline-flex items-center gap-1 rounded-sm border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground shrink-0">
            <GitBranch className="h-2.5 w-2.5" />
            {task.subtasks}
          </span>
        )}

        <span className="hidden sm:inline-block text-[11.5px] text-muted-foreground tabular-nums shrink-0 w-[72px] text-right">
          {task.due.replace(/,\s*\d{4}$/, "")}
        </span>

        <div className="shrink-0">
          <AssigneeStack assignees={task.assignees} size={20} />
        </div>
      </div>

      {confirming && (
        <div className="flex items-center justify-end gap-2 border-t border-border/50 bg-amber-500/[0.05] px-4 py-1.5">
          <span className="mr-auto text-[11.5px] text-foreground/85">Mark complete?</span>
          <Button variant="ghost" className="h-6 px-2 text-[11px]" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="h-6 px-2.5 text-[11px]" onClick={onConfirm}>
            <Check className="h-3 w-3 mr-1" /> Confirm
          </Button>
        </div>
      )}
    </div>
  );
}

function TasksPage() {
  const [groups, setGroups] = useState<Group[]>(seedGroups);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const addTask = (groupName: string, task: Task) => {
    setGroups((prev) =>
      prev.map((g) => (g.name === groupName ? { ...g, items: [task, ...g.items] } : g)),
    );
  };

  const setStatus = (id: number, status: TaskStatus) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((t) => (t.id === id ? { ...t, status } : t)),
      })),
    );
  };

  const toggleGroup = (name: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const totals = useMemo(() => {
    const all = groups.flatMap((g) => g.items);
    return {
      total: all.length,
      open: all.filter((t) => t.status === "open").length,
      pending: all.filter((t) => t.status === "pending").length,
      done: all.filter((t) => t.status === "done").length,
    };
  }, [groups]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Workflows"
        title="Tasks"
        description="Human + agent work, tracked together."
        actions={<NewTaskDialog groups={groups.map((g) => g.name)} onAdd={addTask} />}
      />

      {/* Linear-style stat strip */}
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border/60 py-2.5 text-[11.5px]">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="font-mono uppercase tracking-wider">Total</span>
          <span className="tabular-nums text-foreground font-medium">{totals.total}</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Circle className="h-3 w-3 text-muted-foreground/70" />
          Open <span className="tabular-nums text-foreground font-medium">{totals.open}</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CircleDot className="h-3 w-3 text-amber-500/90" />
          In progress <span className="tabular-nums text-foreground font-medium">{totals.pending}</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle2 className="h-3 w-3 text-emerald-500/90" />
          Done <span className="tabular-nums text-foreground font-medium">{totals.done}</span>
        </span>
      </div>

      {/* Linear-style single-column grouped list */}
      <div className="rounded-md border border-border/60 bg-card/30 overflow-hidden">
        {groups.map((g, gi) => {
          const isCollapsed = collapsed.has(g.name);
          return (
            <div key={g.name} className={gi > 0 ? "border-t border-border/60" : ""}>
              <button
                type="button"
                onClick={() => toggleGroup(g.name)}
                className="flex w-full items-center gap-2 bg-muted/30 px-4 py-2 text-left transition-colors hover:bg-muted/50"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="text-[12px] font-semibold text-foreground">{g.name}</span>
                <span className="rounded-sm bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {g.items.length}
                </span>
                <span className="ml-auto opacity-0 group-hover:opacity-100" />
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-border/50">
                  {g.items.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      confirming={confirmingId === t.id}
                      onRequestComplete={() => setConfirmingId(t.id)}
                      onCancel={() => setConfirmingId(null)}
                      onConfirm={() => {
                        setStatus(t.id, "pending");
                        setConfirmingId(null);
                      }}
                      onReopen={() => {
                        setStatus(t.id, "open");
                        setConfirmingId(null);
                      }}
                    />
                  ))}
                  <AddTaskInline groupName={g.name} onAdd={addTask} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}


function AddTaskInline({
  groupName,
  onAdd,
}: {
  groupName: string;
  onAdd: (groupName: string, task: Task) => void;
}) {
  return (
    <NewTaskDialog
      groups={[groupName]}
      onAdd={onAdd}
      defaultGroup={groupName}
      trigger={
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-[12px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.03] hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add task
        </button>
      }
    />
  );
}

const PRIORITIES: Priority[] = ["High", "Med", "Low"];

function NewTaskDialog({
  groups,
  onAdd,
  defaultGroup,
  trigger,
}: {
  groups: string[];
  onAdd: (groupName: string, task: Task) => void;
  defaultGroup?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState(defaultGroup ?? groups[0] ?? "Today");
  const [priority, setPriority] = useState<Priority>("Med");
  const [mode, setMode] = useState<"people" | "teams">("people");
  const [people, setPeople] = useState<Set<string>>(new Set());
  const [teams, setTeams] = useState<Set<string>>(new Set());

  const reset = () => {
    setTitle("");
    setGroup(defaultGroup ?? groups[0] ?? "Today");
    setPriority("Med");
    setMode("people");
    setPeople(new Set());
    setTeams(new Set());
  };

  const togglePerson = (name: string) =>
    setPeople((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  const toggleTeam = (name: string) =>
    setTeams((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const assignees = useMemo<Assignee[]>(() => {
    const byName = new Map<string, Assignee>();
    PEOPLE.filter((p) => people.has(p.name)).forEach((p) =>
      byName.set(p.name, { initials: p.initials, name: p.name }),
    );
    TEAMS.filter((t) => teams.has(t.name))
      .flatMap((t) => t.members)
      .forEach((name) => byName.set(name, assigneeFor(name)));
    return [...byName.values()];
  }, [people, teams]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd(group, {
      id: Date.now(),
      code: `HS-${String(Math.floor(Math.random() * 900) + 100)}`,
      title: title.trim(),
      assignees,
      priority,
      status: "open",
      company: "Harwick & Sterne, LLC.",
      due: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      subtasks: 0,
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
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>Create a task and assign people or whole teams.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="nt-title">
              Task <span className="text-muted-foreground">*</span>
            </Label>
            <Input
              id="nt-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Draft Q3 onboarding playbook"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label>List</Label>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
              {groups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroup(g)}
                  className={`h-7 flex-1 rounded-full px-2 text-[11px] font-medium transition-colors ${
                    group === g ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Priority</Label>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`h-7 flex-1 rounded-full px-2 text-[11px] font-medium transition-colors ${
                    priority === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Assign to</Label>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-0.5">
                {(["people", "teams"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`h-6 rounded-full px-2.5 text-[11px] font-medium capitalize transition-colors ${
                      mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {mode === "people" ? (
              <div className="flex flex-wrap gap-1.5">
                {PEOPLE.map((p) => {
                  const on = people.has(p.name);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => togglePerson(p.name)}
                      aria-pressed={on}
                      className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 transition-colors ${
                        on ? "border-foreground/40 bg-foreground/[0.06]" : "border-border hover:bg-foreground/[0.03]"
                      }`}
                    >
                      <SmartAvatar name={p.name} className="h-6 w-6 rounded-full object-cover" alt={p.name}} />
                      <span className="text-[12px] font-medium leading-none">{p.name}</span>
                      {on && <Check className="h-3.5 w-3.5 text-foreground/70" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5">
                {TEAMS.map((t) => {
                  const on = teams.has(t.name);
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => toggleTeam(t.name)}
                      aria-pressed={on}
                      className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                        on ? "border-foreground/40 bg-foreground/[0.06]" : "border-border hover:bg-foreground/[0.03]"
                      }`}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground/[0.08] text-foreground/70">
                        <Users className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-medium leading-tight">{t.name}</span>
                        <span className="block text-[10.5px] text-muted-foreground">
                          {t.members.join(", ")}
                        </span>
                      </span>
                      {on && <Check className="h-4 w-4 shrink-0 text-foreground/70" />}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex min-h-6 items-center gap-2 pt-0.5">
              <span className="text-[11px] text-muted-foreground">Assignees</span>
              <AssigneeStack assignees={assignees} />
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
          <Button onClick={submit} disabled={!title.trim()}>
            <Plus className="h-4 w-4 mr-2" /> Add task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
