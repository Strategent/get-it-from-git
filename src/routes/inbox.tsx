import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Inbox as InboxIcon,
  Star,
  Flag,
  FileEdit,
  Send,
  Archive,
  Trash2,
  Reply,
  ReplyAll,
  Forward,
  Search,
  Filter,
  MoreHorizontal,
  Printer,
  CornerUpLeft,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Type,
  ChevronDown,
  Minus,
  X,
  Check,
  Clock,
  Loader2,
  Sparkles,
  RefreshCw,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SyraChatWidget } from "@/components/syra-chat-widget";
import { SyraMark } from "@/components/syra-mark";
import { avatarUrl } from "@/lib/avatar";


export const Route = createFileRoute("/inbox")({
  component: InboxPage,
  head: () => ({ meta: [{ title: "Inbox - Harwick & Sterne" }] }),
});

type FolderName = "Inbox" | "VIPs" | "Flagged" | "Drafts" | "Sent" | "Archive" | "Trash";
type FilterName = "Unread" | "Flagged" | "Attachments" | "Hot leads" | "Needs reply";
type ComposerMode = "reply" | "replyAll" | "forward";
type ComposerStatus = "open" | "minimized" | "closed";
type Formatting = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  list: "none" | "bullet" | "numbered";
  align: "left" | "center";
};
type TextSelection = {
  start: number;
  end: number;
};
type Draft = {
  to: string[];
  cc: string[];
  bcc: string[];
  showCc: boolean;
  showBcc: boolean;
  subject: string;
  body: string;
  attachments: string[];
  links: string[];
  images: string[];
  emoji: string[];
  formatting: Formatting;
  status: ComposerStatus;
  mode: ComposerMode;
};
type Thread = {
  id: number;
  from: string;
  company: string;
  email: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  tag: string;
  folder: Exclude<FolderName, "VIPs" | "Flagged" | "Drafts">;
  unread: boolean;
  starred: boolean;
  flagged: boolean;
  vip: boolean;
  hasAttachment: boolean;
  needsReply: boolean;
  sentAt?: string;
};

const baseThreads: Thread[] = [
  {
    id: 1,
    from: "Sarah Lin",
    company: "Acme Corp",
    email: "sarah@acme.com",
    subject: "Re: Proposal v2 - minor tweaks",
    preview: "Looks great overall. Two small notes on pricing tier 2 and timing for kickoff...",
    body: "Hi team,\n\nLooks great overall. Two small notes on pricing tier 2 and timing for kickoff. If we can lock tier 2 at the proposed annual rate and start the week of June 10, I can get finance aligned today.\n\nLooking forward to your thoughts. Let me know if a 30-minute sync this week works.\n\nBest,\nSarah",
    time: "2m",
    tag: "Hot lead",
    folder: "Inbox",
    unread: true,
    starred: false,
    flagged: true,
    vip: true,
    hasAttachment: false,
    needsReply: true,
  },
  {
    id: 2,
    from: "Marcus Reed",
    company: "Northwind",
    email: "marcus@northwind.example",
    subject: "Onboarding questions",
    preview: "Hey team, before we sign, can you confirm SOC2 status and data residency...",
    body: "Hey team,\n\nBefore we sign, can you confirm SOC2 status, data residency, and who owns the implementation checklist? Our legal team is ready once we have those answers.\n\nMarcus",
    time: "23m",
    tag: "Sales",
    folder: "Inbox",
    unread: true,
    starred: true,
    flagged: false,
    vip: false,
    hasAttachment: true,
    needsReply: true,
  },
  {
    id: 3,
    from: "Stripe",
    company: "Payouts",
    email: "payouts@stripe.com",
    subject: "Payout $12,840 scheduled",
    preview: "Your payout of $12,840.00 will arrive on May 30...",
    body: "Your payout of $12,840.00 will arrive on May 30. The attached reconciliation report includes the daily deposit detail and processing fees.",
    time: "1h",
    tag: "Billing",
    folder: "Inbox",
    unread: false,
    starred: false,
    flagged: false,
    vip: false,
    hasAttachment: true,
    needsReply: false,
  },
  {
    id: 4,
    from: "Jenna Park",
    company: "Helios",
    email: "jenna@helios.example",
    subject: "Renewal in 14 days",
    preview: "Quick heads up - annual renewal coming up. Happy with the value so far...",
    body: "Quick heads up - annual renewal is coming up in 14 days. We're happy with the value so far, but procurement asked whether we can review the seat count before the renewal invoice is issued.",
    time: "3h",
    tag: "Renewal",
    folder: "Inbox",
    unread: false,
    starred: true,
    flagged: false,
    vip: true,
    hasAttachment: false,
    needsReply: true,
  },
  {
    id: 5,
    from: "Linear",
    company: "Notifications",
    email: "notifications@linear.app",
    subject: "3 issues assigned to Syra",
    preview: "OPS-128, OPS-129, OPS-131 are now in Syra's queue...",
    body: "OPS-128, OPS-129, and OPS-131 are now in Syra's queue. Priority was set to high because the items block the client onboarding timeline.",
    time: "6h",
    tag: "System",
    folder: "Inbox",
    unread: false,
    starred: false,
    flagged: false,
    vip: false,
    hasAttachment: false,
    needsReply: false,
  },
  {
    id: 6,
    from: "Olivia Chen",
    company: "Bridgewater",
    email: "olivia@bridgewater.example",
    subject: "Quick intro to our ops lead",
    preview: "Wanted to connect you with Priya who runs revenue ops at Bridgewater...",
    body: "Wanted to connect you with Priya, who runs revenue ops at Bridgewater. Priya is copied here and can share the implementation notes from our side.\n\nOlivia",
    time: "Yesterday",
    tag: "Intro",
    folder: "Inbox",
    unread: false,
    starred: false,
    flagged: false,
    vip: false,
    hasAttachment: false,
    needsReply: true,
  },
  {
    id: 7,
    from: "DocuSign",
    company: "Agreements",
    email: "completed@docusign.net",
    subject: "Signed: MSA - Northwind",
    preview: "All parties have completed the document. View completed envelope...",
    body: "All parties have completed the document. The completed Northwind MSA is attached and available in your DocuSign account.",
    time: "Yesterday",
    tag: "Legal",
    folder: "Inbox",
    unread: false,
    starred: false,
    flagged: false,
    vip: false,
    hasAttachment: true,
    needsReply: false,
  },
];

const folderMeta = [
  { name: "Inbox" as const, icon: InboxIcon },
  { name: "VIPs" as const, icon: Star },
  { name: "Flagged" as const, icon: Flag },
  { name: "Drafts" as const, icon: FileEdit },
  { name: "Sent" as const, icon: Send },
  { name: "Archive" as const, icon: Archive },
  { name: "Trash" as const, icon: Trash2 },
];

const regenerateOptions = [
  "Thanks for the notes. I can confirm tier 2 pricing as proposed and hold kickoff for the week of June 10. I'll send the updated SOW and a 30-minute walkthrough invite shortly.",
  "Appreciate the quick review. We'll keep tier 2 at the annual rate discussed and target a June 10 kickoff. I'll follow up with the revised SOW and calendar hold today.",
  "That works on our side. I'll adjust tier 2 pricing, lock the June 10 kickoff window, and send the updated SOW with a short walkthrough invite.",
];

const emojiChoices = ["🙂", "👍", "🎯", "📎", "✅", "🙏", "💬", "🚀", "📅", "✨", "🤝", "💼"];

function textToHtml(value: string) {
  return value
    .split("\n")
    .map((line) =>
      line ? line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "<br>",
    )
    .map((line) => `<div>${line}</div>`)
    .join("");
}

function htmlToText(value: string) {
  // Normalize identically on server & client to avoid hydration mismatches.
  return value
    .replace(/<\/(div|p|li)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const SIGNATURE_BLOCK = `Best,

John Harwick
Managing Partner  ·  Harwick & Sterne
john.harwick@harwicksterne.com  ·  +1 (212) 555-0136
harwicksterne.com`;

function createDraft(thread: Thread, mode: ComposerMode = "reply"): Draft {
  const firstName = thread.from.split(" ")[0];
  const subjectPrefix = mode === "forward" ? "Fwd:" : "Re:";
  return {
    to: mode === "forward" ? [] : [thread.email],
    cc: mode === "replyAll" ? ["team@harwicksterne.example"] : [],
    bcc: [],
    showCc: mode === "replyAll",
    showBcc: false,
    subject: `${subjectPrefix} ${thread.subject.replace(/^(Re:|Fwd:)\s*/i, "")}`,
    body: textToHtml(
      mode === "forward"
        ? `\n\n---------- Forwarded message ---------\nFrom: ${thread.from} <${thread.email}>\nSubject: ${thread.subject}\n\n${thread.body}`
        : `Hi ${firstName},\n\n${regenerateOptions[0]}\n\n${SIGNATURE_BLOCK}`,
    ),
    attachments: [],
    links: [],
    images: [],
    emoji: [],
    formatting: { bold: false, italic: false, underline: false, list: "none", align: "left" },
    status: "open",
    mode,
  };
}

function InboxPage() {
  const [threads, setThreads] = useState(baseThreads);
  const [selectedId, setSelectedId] = useState(baseThreads[0].id);
  const [mobileReading, setMobileReading] = useState(false);
  const [activeFolder, setActiveFolder] = useState<FolderName>("Inbox");
  const [foldersOpen, setFoldersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterName[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>(() => ({
    1: createDraft(baseThreads[0]),
  }));
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [lastSentId, setLastSentId] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!foldersOpen) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setFoldersOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFoldersOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [foldersOpen]);

  const folderCounts = useMemo(() => {
    const counts: Record<FolderName, number> = {
      Inbox: threads.filter((t) => t.folder === "Inbox").length,
      VIPs: threads.filter((t) => t.vip && t.folder !== "Trash").length,
      Flagged: threads.filter((t) => (t.flagged || t.starred) && t.folder !== "Trash").length,
      Drafts: Object.values(drafts).filter((d) => d.status !== "closed").length,
      Sent: threads.filter((t) => t.folder === "Sent").length,
      Archive: threads.filter((t) => t.folder === "Archive").length,
      Trash: threads.filter((t) => t.folder === "Trash").length,
    };
    return counts;
  }, [drafts, threads]);

  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter((thread) => {
      const inFolder =
        activeFolder === "VIPs"
          ? thread.vip && thread.folder !== "Trash"
          : activeFolder === "Flagged"
            ? (thread.flagged || thread.starred) && thread.folder !== "Trash"
            : activeFolder === "Drafts"
              ? drafts[thread.id]?.status !== "closed"
              : thread.folder === activeFolder;
      if (!inFolder) return false;
      const text = [
        thread.from,
        thread.company,
        thread.email,
        thread.subject,
        thread.preview,
        thread.body,
        thread.tag,
      ]
        .join(" ")
        .toLowerCase();
      if (q && !text.includes(q)) return false;
      if (filters.includes("Unread") && !thread.unread) return false;
      if (filters.includes("Flagged") && !thread.flagged && !thread.starred) return false;
      if (
        filters.includes("Attachments") &&
        !thread.hasAttachment &&
        !drafts[thread.id]?.attachments.length
      )
        return false;
      if (filters.includes("Hot leads") && thread.tag !== "Hot lead" && !thread.vip) return false;
      if (filters.includes("Needs reply") && !thread.needsReply) return false;
      return true;
    });
  }, [activeFolder, drafts, filters, query, threads]);

  const selected = threads.find((t) => t.id === selectedId) ?? visibleThreads[0] ?? threads[0];
  const selectedDraft = drafts[selected.id] ?? createDraft(selected);
  const ActiveIcon = folderMeta.find((f) => f.name === activeFolder)?.icon ?? InboxIcon;

  useEffect(() => {
    if (visibleThreads.length && !visibleThreads.some((t) => t.id === selectedId)) {
      setSelectedId(visibleThreads[0].id);
    }
  }, [selectedId, visibleThreads]);

  const updateThread = (id: number, patch: Partial<Thread>) => {
    setThreads((current) =>
      current.map((thread) => (thread.id === id ? { ...thread, ...patch } : thread)),
    );
  };

  const selectThread = (thread: Thread) => {
    setSelectedId(thread.id);
    setMobileReading(true);
    if (thread.unread) updateThread(thread.id, { unread: false });
  };

  const openComposer = (mode: ComposerMode) => {
    setDrafts((current) => ({
      ...current,
      [selected.id]: {
        ...(current[selected.id] ?? createDraft(selected, mode)),
        mode,
        status: "open",
      },
    }));
    toast.message(
      mode === "forward"
        ? "Forward draft ready"
        : mode === "replyAll"
          ? "Reply-all draft ready"
          : "Reply draft ready",
    );
  };

  const moveSelected = (folder: Thread["folder"], label: string) => {
    const previous = selected.folder;
    updateThread(selected.id, { folder, unread: false });
    toast.success(label, {
      action: {
        label: "Undo",
        onClick: () => updateThread(selected.id, { folder: previous }),
      },
    });
  };

  const toggleFilter = (filter: FilterName) => {
    setFilters((current) =>
      current.includes(filter) ? current.filter((f) => f !== filter) : [...current, filter],
    );
  };

  const updateDraft = (patch: Partial<Draft>) => {
    setDrafts((current) => ({
      ...current,
      [selected.id]: { ...(current[selected.id] ?? createDraft(selected)), ...patch },
    }));
  };

  const sendDraft = () => {
    const draft = selectedDraft;
    if (!draft.to.length || !draft.body.trim()) {
      toast.error("Add a recipient and message before sending");
      return;
    }
    setSendingId(selected.id);
    window.setTimeout(() => {
      updateThread(selected.id, {
        folder: "Sent",
        unread: false,
        needsReply: false,
        preview: htmlToText(draft.body).replace(/\s+/g, " ").slice(0, 96),
        body: htmlToText(draft.body),
        subject: draft.subject,
        sentAt: "just now",
      });
      setDrafts((current) => {
        const next = { ...current };
        delete next[selected.id];
        return next;
      });
      setSendingId(null);
      setLastSentId(selected.id);
      setActiveFolder("Sent");
      toast.success(`Sent to ${draft.to.join(", ")}`, {
        action: {
          label: "Undo",
          onClick: () => {
            updateThread(selected.id, { folder: "Inbox", needsReply: true, sentAt: undefined });
            setDrafts((current) => ({ ...current, [selected.id]: draft }));
          },
        },
      });
    }, 700);
  };

  const regenerateDraft = () => {
    setRegeneratingId(selected.id);
    window.setTimeout(() => {
      const next = regenerateOptions[Math.floor(Math.random() * regenerateOptions.length)];
      updateDraft({
        body: textToHtml(`Hi ${selected.from.split(" ")[0]},\n\n${next}\n\n${SIGNATURE_BLOCK}`),
        status: "open",
      });
      setRegeneratingId(null);
      toast.success("Syra regenerated the draft");
    }, 650);
  };

  return (
    <>
      <div
        className="flex w-full bg-muted/20 overflow-hidden"
        style={{ height: "calc(100dvh - 53px)" }}
      >
        <section className="w-[400px] shrink-0 flex flex-col border-r border-border/60 min-w-0 bg-muted/30">
          {/* Compose + folder */}
          <div className="px-4 pt-4 pb-3 flex items-center gap-2">
            <button
              onClick={() => openComposer("reply")}
              aria-label="Compose"
              title="Compose"
              className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-sm border border-border bg-background text-foreground text-[12.5px] font-medium hover:bg-foreground/[0.05] transition-colors"
            >
              <FileEdit className="h-3.5 w-3.5" strokeWidth={1.85} />
              Compose
            </button>
            <div className="relative ml-auto" ref={popoverRef}>
              <button
                onClick={() => setFoldersOpen((v) => !v)}
                aria-label="Mailboxes"
                aria-expanded={foldersOpen}
                className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-sm border border-border bg-background text-foreground/80 text-[12px] hover:bg-foreground/[0.05] transition-colors"
              >
                <ActiveIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{activeFolder}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {foldersOpen && (
                <div className="absolute right-0 top-11 z-30 w-56 p-1.5 rounded-sm border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
                  {folderMeta.map((f) => {
                    const Icon = f.icon;
                    const active = f.name === activeFolder;
                    return (
                      <button
                        key={f.name}
                        onClick={() => {
                          setActiveFolder(f.name);
                          setFoldersOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-sm text-[13px] transition-colors ${
                          active
                            ? "bg-foreground/[0.08] text-foreground font-medium"
                            : "text-foreground/80 hover:bg-foreground/[0.05]"
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                        <span className="flex-1 text-left">{f.name}</span>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {folderCounts[f.name]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>


          {/* Search */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 h-9 px-3 rounded-sm bg-muted/60 border border-border/60">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent text-[12.5px] placeholder:text-muted-foreground focus:outline-none"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Filter"
                    className={`grid h-6 w-6 place-items-center rounded-md hover:text-foreground hover:bg-foreground/[0.06] ${
                      filters.length ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-xs">Filter mail</DropdownMenuLabel>
                  {(
                    ["Unread", "Flagged", "Attachments", "Hot leads", "Needs reply"] as FilterName[]
                  ).map((filter) => (
                    <DropdownMenuCheckboxItem
                      key={filter}
                      checked={filters.includes(filter)}
                      onCheckedChange={() => toggleFilter(filter)}
                      className="text-xs"
                    >
                      {filter}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilters([])} className="text-xs">
                    Reset filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Segmented tabs */}
          <div className="px-4 pb-3">
            <div className="flex items-center rounded-sm border border-border/60 bg-muted/40 overflow-hidden">
              {(["All", "Unread", "Flagged"] as const).map((t, i) => {
                const active =
                  (t === "All" && !filters.includes("Unread") && !filters.includes("Flagged")) ||
                  (t === "Unread" && filters.includes("Unread")) ||
                  (t === "Flagged" && filters.includes("Flagged"));
                return (
                  <button
                    key={t}
                    onClick={() => {
                      if (t === "All") setFilters([]);
                      else setFilters([t as FilterName]);
                    }}
                    className={`flex-1 h-8 text-[12px] font-medium transition-colors ${
                      i > 0 ? "border-l border-border/60" : ""
                    } ${
                      active
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar border-t border-border/60">
            {visibleThreads.length === 0 ? (
              <div className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                No messages match this view.
              </div>
            ) : (
              visibleThreads.map((thread) => {
                const active = selected.id === thread.id;
                const draft = drafts[thread.id];
                return (
                  <button
                    key={thread.id}
                    onClick={() => selectThread(thread)}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors relative ${
                      active
                        ? "bg-foreground/[0.06]"
                        : "hover:bg-foreground/[0.03]"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-foreground" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <div className="h-9 w-9 rounded-full bg-muted text-muted-foreground grid place-items-center text-[11px] font-semibold">
                          {initials(thread.from)}
                        </div>
                        {thread.unread && (
                          <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`text-[13px] truncate ${thread.unread ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}
                          >
                            {thread.from}
                          </div>
                          <div className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                            {thread.sentAt ?? thread.time}
                          </div>
                        </div>
                        <div
                          className={`text-[12.5px] truncate mt-0.5 ${thread.unread ? "text-foreground" : "text-foreground/85"}`}
                        >
                          {draft && draft.status !== "closed" && (
                            <span className="text-muted-foreground">Draft · </span>
                          )}
                          {thread.subject}
                        </div>
                        <div className="text-[11.5px] text-muted-foreground line-clamp-1 mt-0.5 leading-snug">
                          {draft && draft.status !== "closed"
                            ? htmlToText(draft.body)
                            : thread.preview}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </section>


        <main className="flex-1 flex flex-col min-w-0 bg-muted/20">
          <div className="h-12 px-4 flex items-center justify-between border-b border-border/60 bg-background">
            <div className="flex items-center gap-1">
              <ToolbarBtn
                icon={Archive}
                label="Archive"
                onClick={() => moveSelected("Archive", "Archived message")}
              />
              <ToolbarBtn
                icon={Trash2}
                label="Delete"
                onClick={() => moveSelected("Trash", "Moved to trash")}
              />
              <ToolbarBtn
                icon={Flag}
                label="Flag"
                active={selected.flagged}
                onClick={() => {
                  updateThread(selected.id, { flagged: !selected.flagged });
                  toast.success(selected.flagged ? "Flag removed" : "Message flagged");
                }}
              />
              <span className="mx-1 h-5 w-px bg-border/60" />
              <ToolbarBtn icon={Reply} label="Reply" onClick={() => openComposer("reply")} />
              <ToolbarBtn
                icon={ReplyAll}
                label="Reply All"
                onClick={() => openComposer("replyAll")}
              />
              <ToolbarBtn icon={Forward} label="Forward" onClick={() => openComposer("forward")} />
            </div>
            <div className="flex items-center gap-1">
              <ToolbarBtn
                icon={Printer}
                label="Print"
                onClick={() => toast.success("Print preview opened")}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="More"
                    title="More"
                    className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => updateThread(selected.id, { unread: !selected.unread })}
                    className="text-xs"
                  >
                    Mark as {selected.unread ? "read" : "unread"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => moveSelected("Archive", "Muted thread")}
                    className="text-xs"
                  >
                    Mute conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.success("Client card opened")}
                    className="text-xs"
                  >
                    View client card
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6">
            <div className="max-w-2xl mx-auto">
              <div className="rounded-sm border border-border/70 bg-card shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_8px_24px_-16px_rgba(0,0,0,0.35),0_2px_6px_-3px_rgba(0,0,0,0.15)]">
                <div className="px-6 pt-5 pb-4 border-b border-border/60">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground grid place-items-center text-[12px] font-semibold shrink-0">
                      {initials(selected.from)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold tracking-tight truncate">
                            {selected.from}{" "}
                            <span className="text-muted-foreground font-normal">
                              &lt;{selected.email}&gt; - {selected.company}
                            </span>
                          </div>
                          <div className="text-[12px] text-muted-foreground mt-0.5">
                            To: me - {selected.sentAt ?? `${selected.time} ago`}
                          </div>
                        </div>
                        <button
                          aria-label={selected.starred ? "Unstar" : "Star"}
                          onClick={() => updateThread(selected.id, { starred: !selected.starred })}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Star className="h-4 w-4" fill={selected.starred ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <h2 className="mt-3 text-[22px] font-semibold tracking-tight leading-tight">
                        {selected.subject}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="text-[14px] leading-relaxed text-foreground/90 whitespace-pre-line">
                    {selected.body}
                  </div>
                  {selected.hasAttachment && (
                    <button className="mt-5 inline-flex items-center gap-2 rounded-sm border border-border/70 bg-muted/40 px-3 py-2 text-[12px] text-foreground/85 hover:bg-muted">
                      <Paperclip className="h-3.5 w-3.5" />
                      {selected.tag === "Legal"
                        ? "Completed_MSA.pdf"
                        : selected.tag === "Billing"
                          ? "Stripe_reconciliation.csv"
                          : "Security_questionnaire.pdf"}
                    </button>
                  )}
                </div>
              </div>

              {selectedDraft.status === "closed" ? (
                <button
                  onClick={() => openComposer("reply")}
                  className="mt-6 inline-flex items-center gap-2 rounded-sm border border-border/70 px-3 py-2 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Reply
                </button>
              ) : (
                <div className="mt-6">
                  <ComposeWindow
                    draft={selectedDraft}
                    from={selected.from}
                    sending={sendingId === selected.id}
                    regenerating={regeneratingId === selected.id}
                    justSent={lastSentId === selected.id && selected.folder === "Sent"}
                    onUpdate={updateDraft}
                    onSend={sendDraft}
                    onRegenerate={regenerateDraft}
                    onDiscard={() => {
                      setDrafts((current) => ({
                        ...current,
                        [selected.id]: { ...selectedDraft, status: "closed" },
                      }));
                      toast.success("Draft discarded");
                    }}
                    onMinimize={() => updateDraft({ status: "minimized" })}
                    onRestore={() => updateDraft({ status: "open" })}
                  />
                </div>
              )}
            </div>
          </div>
        </main>

      </div>
      <SyraChatWidget
        inboxSummary={`${folderCounts.Inbox} inbox, ${folderCounts.Drafts} drafts, ${threads.filter((t) => t.needsReply).length} need reply`}
      />
    </>
  );
}

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-full border border-border/50 bg-background hover:text-foreground hover:bg-foreground/[0.05] transition-colors ${
        active ? "text-foreground bg-foreground/[0.06]" : "text-muted-foreground"
      }`}

    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

function FmtBtn({
  icon: Icon,
  label,
  onClick,
  active = false,
  withCaret = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  withCaret?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex items-center gap-0.5 h-7 px-1.5 rounded hover:text-foreground hover:bg-foreground/[0.06] transition-colors ${
        active ? "text-foreground bg-foreground/[0.06]" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.85} />
      {withCaret && <ChevronDown className="h-3 w-3 opacity-60" />}
    </button>
  );
}

function FmtDivider() {
  return <span className="mx-0.5 h-4 w-px bg-border/70" />;
}

function ComposeWindow({
  draft,
  from,
  sending,
  regenerating,
  justSent,
  onUpdate,
  onSend,
  onRegenerate,
  onDiscard,
  onMinimize,
  onRestore,
}: {
  draft: Draft;
  from: string;
  sending: boolean;
  regenerating: boolean;
  justSent: boolean;
  onUpdate: (patch: Partial<Draft>) => void;
  onSend: () => void;
  onRegenerate: () => void;
  onDiscard: () => void;
  onMinimize: () => void;
  onRestore: () => void;
}) {
  const firstName = from.split(" ")[0];
  const editorRef = useRef<HTMLDivElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const savedHighlightRangeRef = useRef<Range | null>(null);
  const savedFontSelectionRef = useRef<TextSelection | null>(null);
  const markedFontSelectionRef = useRef<HTMLSpanElement | null>(null);
  const [fontSelectionRects, setFontSelectionRects] = useState<
    { left: number; top: number; width: number; height: number }[]
  >([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const [selRect, setSelRect] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    const updateFloatingToolbar = () => {
      const sel = window.getSelection();
      const editor = editorRef.current;
      if (!sel || !editor || sel.rangeCount === 0 || sel.isCollapsed) {
        setSelRect(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!editor.contains(range.commonAncestorContainer)) {
        setSelRect(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      const parent = editor.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setSelRect(null);
        return;
      }
      setSelRect({
        left: rect.left - parent.left + rect.width / 2,
        top: rect.top - parent.top,
      });
    };
    document.addEventListener("selectionchange", updateFloatingToolbar);
    return () => document.removeEventListener("selectionchange", updateFloatingToolbar);
  }, []);

  useEffect(() => {
    if (document.activeElement === editorRef.current) return;
    if (editorRef.current && editorRef.current.innerHTML !== draft.body) {
      editorRef.current.innerHTML = draft.body;
    }
  }, [draft.body]);

  const syncEditor = () => {
    if (editorRef.current) onUpdate({ body: editorRef.current.innerHTML });
  };

  const saveSelection = (allowCollapsed = true) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return false;
    const range = selection.getRangeAt(0);
    if (!allowCollapsed && selection.isCollapsed) return false;
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
      if (!selection.isCollapsed) {
        savedHighlightRangeRef.current = range.cloneRange();
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    const captureEditorHighlight = () => {
      const selection = window.getSelection();
      if (!selection?.rangeCount || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
        savedHighlightRangeRef.current = range.cloneRange();
      }
    };

    document.addEventListener("selectionchange", captureEditorHighlight);
    return () => document.removeEventListener("selectionchange", captureEditorHighlight);
  }, []);

  const restoreSelection = () => {
    if (!savedRangeRef.current) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedRangeRef.current);
  };

  const runEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    syncEditor();
  };

  const insertTextAtSelection = (value: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("insertText", false, value);
    syncEditor();
  };

  const addFiles = (files: FileList | null, type: "attachment" | "image") => {
    const names = Array.from(files ?? []).map((file) => file.name);
    if (!names.length) return;
    if (type === "attachment") {
      onUpdate({ attachments: [...draft.attachments, ...names] });
    } else {
      onUpdate({ images: [...draft.images, ...names] });
    }
    toast.success(
      `${names.length} ${type === "attachment" ? "file" : "image"}${names.length === 1 ? "" : "s"} added`,
    );
  };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    editorRef.current?.focus();
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${href}" target="_blank" rel="noreferrer">${href}</a>`,
      );
      syncEditor();
    } else {
      runEditorCommand("createLink", href);
    }
    onUpdate({ links: [...draft.links, href] });
    setLinkUrl("");
    toast.success("Link inserted");
  };

  const paintFontSelection = (range: Range) => {
    if (!editorRef.current) return false;
    const editorBox = editorRef.current.getBoundingClientRect();
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
    const rects: { left: number; top: number; width: number; height: number }[] = [];

    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      if (!textNode.textContent?.trim()) continue;

      const textRange = document.createRange();
      textRange.selectNodeContents(textNode);

      if (!range.intersectsNode(textNode)) continue;

      if (textNode === range.startContainer) {
        textRange.setStart(textNode, range.startOffset);
      }
      if (textNode === range.endContainer) {
        textRange.setEnd(textNode, range.endOffset);
      }

      Array.from(textRange.getClientRects()).forEach((rect) => {
        if (rect.width <= 0 || rect.height <= 0) return;
        rects.push({
          left: rect.left - editorBox.left,
          top: rect.top - editorBox.top,
          width: rect.width,
          height: rect.height,
        });
      });
      textRange.detach();
    }

    setFontSelectionRects(rects);
    return rects.length > 0;
  };

  const rangeToTextSelection = (range: Range): TextSelection | null => {
    if (!editorRef.current) return null;
    const startRange = document.createRange();
    const endRange = document.createRange();
    startRange.selectNodeContents(editorRef.current);
    endRange.selectNodeContents(editorRef.current);
    startRange.setEnd(range.startContainer, range.startOffset);
    endRange.setEnd(range.endContainer, range.endOffset);

    const start = startRange.toString().length;
    const end = endRange.toString().length;
    startRange.detach();
    endRange.detach();
    return end > start ? { start, end } : null;
  };

  const textSelectionToRange = (selection: TextSelection): Range | null => {
    if (!editorRef.current) return null;
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
    let consumed = 0;
    let startNode: Node | null = null;
    let endNode: Node | null = null;
    let startOffset = 0;
    let endOffset = 0;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const length = node.textContent?.length ?? 0;
      const next = consumed + length;

      if (!startNode && selection.start <= next) {
        startNode = node;
        startOffset = Math.max(0, Math.min(length, selection.start - consumed));
      }
      if (!endNode && selection.end <= next) {
        endNode = node;
        endOffset = Math.max(0, Math.min(length, selection.end - consumed));
        break;
      }
      consumed = next;
    }

    if (!startNode || !endNode) return null;
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range.collapsed ? null : range;
  };

  const clearFontPreview = (sync = true) => {
    setFontSelectionRects([]);
    savedFontSelectionRef.current = null;
    const marked = editorRef.current?.querySelectorAll<HTMLSpanElement>(
      'span[data-font-selection="true"]',
    );
    if (!marked?.length) return;
    marked?.forEach((span) => {
      if (span.style.fontFamily) {
        span.style.removeProperty("background");
        span.style.removeProperty("box-shadow");
        span.style.removeProperty("border-radius");
        span.removeAttribute("data-font-selection");
      } else {
        span.replaceWith(...Array.from(span.childNodes));
      }
    });
    markedFontSelectionRef.current = null;
    if (sync) syncEditor();
  };

  const markFontSelection = () => {
    clearFontPreview(false);
    saveSelection(false);
    const highlightedRange = savedHighlightRangeRef.current;
    if (
      !highlightedRange ||
      !editorRef.current?.contains(highlightedRange.commonAncestorContainer)
    ) {
      toast.message("Highlight text before choosing a font");
      return false;
    }

    editorRef.current.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(highlightedRange);

    savedFontSelectionRef.current = rangeToTextSelection(highlightedRange);
    return Boolean(savedFontSelectionRef.current) && paintFontSelection(highlightedRange);
  };

  const applyFont = (fontName: string) => {
    const liveMarkedSelection = editorRef.current?.querySelector<HTMLSpanElement>(
      'span[data-font-selection="true"]',
    );
    const refMarkedSelection =
      markedFontSelectionRef.current && editorRef.current?.contains(markedFontSelectionRef.current)
        ? markedFontSelectionRef.current
        : null;
    const markedSelection = liveMarkedSelection ?? refMarkedSelection;
    if (markedSelection) {
      markedSelection.style.setProperty("font-family", fontName, "important");
      markedSelection
        .querySelectorAll<HTMLElement>("*")
        .forEach((child) => child.style.setProperty("font-family", fontName, "important"));
      markedFontSelectionRef.current = markedSelection;
      syncEditor();
      setFontOpen(false);
      return;
    }

    const highlightedRange =
      (savedFontSelectionRef.current && textSelectionToRange(savedFontSelectionRef.current)) ??
      savedHighlightRangeRef.current;
    if (
      !highlightedRange ||
      !editorRef.current?.contains(highlightedRange.commonAncestorContainer)
    ) {
      toast.message("Highlight text before choosing a font");
      return;
    }

    editorRef.current?.focus();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(highlightedRange);
    if (!selection?.rangeCount || selection.isCollapsed) {
      toast.message("Highlight text before choosing a font");
      return;
    }
    document.execCommand("fontName", false, fontName);
    const appliedRange = selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    if (appliedRange) {
      savedRangeRef.current = appliedRange;
      savedHighlightRangeRef.current = appliedRange;
      savedFontSelectionRef.current = rangeToTextSelection(appliedRange);
    }
    setFontSelectionRects([]);
    savedFontSelectionRef.current = null;
    syncEditor();
    setFontOpen(false);
  };

  if (draft.status === "minimized") {
    return (
      <button
        onClick={onRestore}
        className="mt-8 flex w-full max-w-2xl items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-3 text-left text-[12.5px] hover:bg-foreground/[0.03]"
      >
        <span className="font-medium">Draft to {draft.to[0] ?? firstName}</span>
        <span className="text-muted-foreground">Click to restore</span>
      </button>
    );
  }

  return (
    <div className="relative mt-8 max-w-2xl">
      {draft.mode !== "forward" && (
        <div className="pointer-events-none absolute -top-3 left-6 right-6 z-10 flex justify-start">
          <div className="pointer-events-auto group relative flex items-center gap-2.5 rounded-full border border-border/70 bg-card/95 px-3 py-1.5 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35),0_2px_6px_-2px_rgba(0,0,0,0.2)] backdrop-blur-md dark:bg-neutral-900/90 dark:border-white/10">
            <SyraMark size={18} />
            <div className="flex flex-col leading-tight">
              <span className="text-[11.5px] font-semibold tracking-tight">Suggested reply from Syra</span>
              <span className="text-[10.5px] text-muted-foreground">Review, edit, and send as John — signature attached</span>
            </div>
            <span className="mx-1 h-4 w-px bg-border/70" />
            <button
              onClick={onRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] disabled:opacity-70"
            >
              {regenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Regenerate
            </button>
            {/* pointer tail into compose window */}
            <span
              aria-hidden
              className="absolute -bottom-[5px] left-8 h-2.5 w-2.5 rotate-45 border-b border-r border-border/70 bg-card/95 dark:bg-neutral-900/90 dark:border-white/10"
            />
          </div>
        </div>
      )}

    <div className="bg-card border border-border/70 dark:border-white/[0.08] rounded-sm overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_16px_40px_-16px_rgba(0,0,0,0.5),0_4px_12px_-4px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between px-3.5 h-9 bg-foreground/[0.04] dark:bg-white/[0.04] border-b border-border/60">
        <div className="flex items-center gap-2 text-[12px] font-medium text-foreground/85">
          <CornerUpLeft className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.85} />
          {draft.mode === "forward"
            ? "Forward message"
            : draft.mode === "replyAll"
              ? "Reply all"
              : "New message"}
          {justSent && (
            <span className="ml-1 inline-flex items-center gap-1 text-emerald-400">
              <Check className="h-3 w-3" /> Sent
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 text-muted-foreground">
          <button
            onClick={onMinimize}
            className="grid h-6 w-6 place-items-center rounded hover:text-foreground hover:bg-foreground/[0.06]"
            aria-label="Minimize"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDiscard}
            className="grid h-6 w-6 place-items-center rounded hover:text-foreground hover:bg-foreground/[0.06]"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>


      <div className="text-[13px]">

        <div className="flex items-center gap-3 px-4 min-h-9 border-b border-border/50 py-1.5">
          <span className="text-muted-foreground w-12 shrink-0">To</span>
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {draft.to.map((email) => {
              const local = email.split("@")[0] ?? email;
              return (
                <button
                  key={email}
                  onClick={() => onUpdate({ to: draft.to.filter((item) => item !== email) })}
                  className="group inline-flex items-center gap-1.5 h-7 pl-0.5 pr-2.5 rounded-full bg-background border border-border/70 text-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-foreground/[0.04] dark:bg-white/[0.04] dark:border-white/10"
                >
                  <img
                    src={avatarUrl(local, 40)}
                    alt=""
                    className="h-5 w-5 rounded-full object-cover ring-1 ring-border/60"
                  />
                  <span className="text-foreground/85">{email}</span>
                  <X className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
            <input
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  onUpdate({ to: [...draft.to, e.currentTarget.value.trim()] });
                  e.currentTarget.value = "";
                }
              }}
              placeholder={draft.to.length ? "" : "Add recipient"}
              className="min-w-28 flex-1 bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="ml-auto flex items-center gap-3 text-[12px] text-muted-foreground">
            <button
              onClick={() => onUpdate({ showCc: !draft.showCc })}
              className="hover:text-foreground"
            >
              Cc
            </button>
            <button
              onClick={() => onUpdate({ showBcc: !draft.showBcc })}
              className="hover:text-foreground"
            >
              Bcc
            </button>
          </div>
        </div>
        {draft.showCc && (
          <AddressLine
            label="Cc"
            value={draft.cc.join(", ")}
            onChange={(value) =>
              onUpdate({
                cc: value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
              })
            }
          />
        )}
        {draft.showBcc && (
          <AddressLine
            label="Bcc"
            value={draft.bcc.join(", ")}
            onChange={(value) =>
              onUpdate({
                bcc: value
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean),
              })
            }
          />
        )}
        <div className="flex items-center gap-3 px-4 h-9 border-b border-border/50">
          <span className="text-muted-foreground w-12 shrink-0">Subject</span>
          <input
            value={draft.subject}
            onChange={(e) => onUpdate({ subject: e.target.value })}
            className="flex-1 bg-transparent text-[13px] outline-none"
          />
        </div>
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {
            setFontSelectionRects([]);
            syncEditor();
          }}
          onKeyUp={() => saveSelection()}
          onMouseUp={() => saveSelection()}
          onBlur={() => saveSelection()}
          dangerouslySetInnerHTML={{ __html: draft.body }}
          className="block w-full min-h-[180px] bg-transparent px-4 py-4 text-[13.5px] leading-relaxed text-foreground/90 outline-none empty:before:content-['Write_a_reply...'] empty:before:text-muted-foreground/60 [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
        />
        {fontSelectionRects.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-10">
            {fontSelectionRects.map((rect, index) => (
              <span
                key={`${rect.left}-${rect.top}-${index}`}
                className="absolute rounded-[3px] bg-[#5778ff]/35 ring-1 ring-[#7c6cff]/45"
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                }}
              />
            ))}
          </div>
        )}
        {selRect && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            style={{
              left: selRect.left,
              top: Math.max(selRect.top - 44, 4),
              transform: "translateX(-50%)",
            }}
            className="pointer-events-auto absolute z-20 flex items-center gap-0.5 rounded-lg bg-neutral-900 px-1 py-1 text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.55),0_2px_6px_-2px_rgba(0,0,0,0.35)]"
          >
            <FloatBtn icon={Bold} label="Bold" onClick={() => runEditorCommand("bold")} />
            <FloatBtn icon={Italic} label="Italic" onClick={() => runEditorCommand("italic")} />
            <FloatBtn
              icon={Underline}
              label="Underline"
              onClick={() => runEditorCommand("underline")}
            />
            <FloatBtn
              icon={Strikethrough}
              label="Strikethrough"
              onClick={() => runEditorCommand("strikeThrough")}
            />
            <span className="mx-0.5 h-4 w-px bg-white/20" />
            <FloatBtn
              icon={AlignLeft}
              label="Align left"
              onClick={() => runEditorCommand("justifyLeft")}
            />
            <FloatBtn
              icon={AlignCenter}
              label="Align center"
              onClick={() => runEditorCommand("justifyCenter")}
            />
            <FloatBtn
              icon={AlignRight}
              label="Align right"
              onClick={() => runEditorCommand("justifyRight")}
            />
            <span className="mx-0.5 h-4 w-px bg-white/20" />
            <FloatBtn
              icon={Link2}
              label="Insert link"
              onClick={() => {
                const url = window.prompt("Link URL");
                if (!url) return;
                const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                runEditorCommand("createLink", href);
              }}
            />
          </div>
        )}
      </div>
      {(draft.attachments.length > 0 || draft.links.length > 0 || draft.images.length > 0) && (
        <div className="border-t border-border/50 px-4 pt-3 pb-3">
          {(draft.attachments.length > 0 || draft.images.length > 0) && (
            <div className="text-[11px] text-muted-foreground mb-2">
              {draft.attachments.length + draft.images.length} attachment
              {draft.attachments.length + draft.images.length === 1 ? "" : "s"}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {draft.attachments.map((item) => (
              <AttachmentTile
                key={item}
                name={item}
                onRemove={() =>
                  onUpdate({ attachments: draft.attachments.filter((n) => n !== item) })
                }
              />
            ))}
            {draft.images.map((item) => (
              <AttachmentTile
                key={item}
                name={item}
                onRemove={() =>
                  onUpdate({ images: draft.images.filter((n) => n !== item) })
                }
              />
            ))}
            {draft.links.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background px-2 py-1 text-[11px] text-foreground/80"
              >
                <Link2 className="h-3 w-3" /> {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        onPointerDownCapture={() => saveSelection(false)}
        className="px-3 py-2 border-t border-border/60 bg-card flex items-center justify-between gap-2"
      >
        <input
          ref={attachmentInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.currentTarget.files, "attachment");
            e.currentTarget.value = "";
          }}
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            addFiles(e.currentTarget.files, "image");
            e.currentTarget.value = "";
          }}
        />
        <div className="flex items-center gap-0.5">
          <IconOnlyBtn
            icon={Paperclip}
            label="Attach files"
            onClick={() => attachmentInputRef.current?.click()}
          />
          <IconOnlyBtn
            icon={ImageIcon}
            label="Insert image"
            onClick={() => imageInputRef.current?.click()}
          />
          <IconOnlyBtn
            icon={FileText}
            label="Use template"
            onClick={() => toast.success("Template inserted")}
          />
          <div className="relative">
            <button
              type="button"
              aria-label="Font"
              title="Font"
              onPointerDown={(e) => {
                e.preventDefault();
                if (fontOpen) {
                  clearFontPreview();
                  setFontOpen(false);
                  return;
                }
                if (markFontSelection()) setFontOpen(true);
              }}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <Type className="h-4 w-4" strokeWidth={1.85} />
            </button>
            {fontOpen && (
              <div className="absolute bottom-10 left-0 z-50 w-48 rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-md">
                {[
                  ["Sans serif", "Arial"],
                  ["Serif", "Georgia"],
                  ["Mono", "Courier New"],
                  ["Trebuchet", "Trebuchet MS"],
                  ["Newsreader", "Newsreader"],
                ].map(([label, font]) => (
                  <button
                    key={font}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      applyFont(font);
                    }}
                    className="flex h-8 w-full items-center rounded-md px-2.5 text-left text-[12px] hover:bg-foreground/[0.06]"
                    style={{ fontFamily: font }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Emoji"
                title="Emoji"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => saveSelection()}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              >
                <Smile className="h-4 w-4" strokeWidth={1.85} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-52 p-2">
              <div className="grid grid-cols-6 gap-1">
                {emojiChoices.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      insertTextAtSelection(emoji);
                      onUpdate({ emoji: [...draft.emoji, emoji] });
                      setEmojiOpen(false);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-md text-lg hover:bg-foreground/[0.06]"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <IconOnlyBtn
            icon={UserIcon}
            label="Contacts"
            onClick={() => toast.message("Contacts")}
          />
          <span className="mx-1 h-5 w-px bg-border/70" />
          <IconOnlyBtn
            icon={Clock}
            label="Schedule send"
            onClick={() => toast.success("Scheduled for tomorrow at 8:00 AM")}
          />
          <IconOnlyBtn icon={Trash2} label="Discard" onClick={onDiscard} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-border/70 bg-background text-[12px] font-medium text-foreground/85 hover:bg-foreground/[0.04] disabled:opacity-70"
          >
            {regenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <SyraMark size={14} />
            )}
            Ask AI
          </button>
          <button
            onClick={onSend}
            disabled={sending}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-foreground text-background text-[12.5px] font-medium hover:bg-foreground/90 disabled:opacity-70"
          >
            {sending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...
              </>
            ) : (
              <>
                Send
                <Send className="h-3.5 w-3.5" strokeWidth={2} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}


function AddressLine({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 h-9 border-b border-border/50">
      <span className="text-muted-foreground w-12 shrink-0">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`${label} recipients`}
        className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function IconOnlyBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
    >
      <Icon className="h-4 w-4" strokeWidth={1.85} />
    </button>
  );
}

function FloatBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}

function AttachmentTile({ name, onRemove }: { name: string; onRemove: () => void }) {
  const ext = (name.split(".").pop() || "file").toUpperCase().slice(0, 4);
  const size = `${(Math.abs(hashString(name)) % 900 + 80).toFixed(0)} KB`;
  return (
    <div className="group inline-flex items-center gap-2.5 rounded-md border border-border/70 bg-background pl-1.5 pr-2.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-foreground/[0.06] text-[9px] font-semibold tracking-wide text-foreground/70">
        {ext}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-[12px] text-foreground/90 max-w-[160px] truncate">{name}</span>
        <span className="text-[10.5px] text-muted-foreground">{size}</span>
      </div>
      <button
        onClick={onRemove}
        aria-label="Remove attachment"
        className="ml-1 grid h-5 w-5 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
