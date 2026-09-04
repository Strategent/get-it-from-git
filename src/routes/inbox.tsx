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
import { SyraMark } from "@/components/syra-mark";
import { ThreadSkeleton } from "@/components/inbox/thread-skeleton";
import { SmartAvatar } from "@/components/smart-avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";


export const Route = createFileRoute("/inbox")({
  component: InboxPage,
  head: () => ({ meta: [{ title: "Inbox — strategent" }] }),
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
];

const extraThreads: Thread[] = [
  {
    id: 8,
    from: "Priya Shah",
    company: "Lumen Capital",
    email: "priya@lumencap.example",
    subject: "Enterprise quote — 3 year projection",
    preview: "Following up on our call. Can you send the formal quote with the 3-year view...",
    body: "Hi John,\n\nFollowing up on our call — can you send the formal quote with the 3-year projection by Friday? Our board reviews vendor spend next Tuesday and I'd like this in the packet.\n\nThanks,\nPriya",
    time: "12m",
    tag: "Sales",
    folder: "Inbox",
    unread: true,
    starred: false,
    flagged: false,
    vip: true,
    hasAttachment: false,
    needsReply: true,
  },
  {
    id: 9,
    from: "Diego Alvarez",
    company: "Vertex Health",
    email: "diego@vertexhealth.example",
    subject: "Security review — data residency gap",
    preview: "Our infosec team flagged EU residency in the questionnaire. Need a written response...",
    body: "John,\n\nOur infosec team flagged EU data residency in section 4 of the questionnaire. We need a written response before we can move to contracting. Happy to jump on a call with your security lead.\n\nDiego",
    time: "47m",
    tag: "Legal",
    folder: "Inbox",
    unread: true,
    starred: false,
    flagged: true,
    vip: false,
    hasAttachment: true,
    needsReply: true,
  },
  {
    id: 10,
    from: "Amara Osei",
    company: "Kestrel Partners",
    email: "amara@kestrel.example",
    subject: "Deck feedback before Thursday",
    preview: "Slide 6 needs the updated retention curve. Everything else reads well...",
    body: "Slide 6 needs the updated retention curve — the one from the April cohort analysis. Everything else reads well. Can you send a revised version before Thursday's committee?\n\nAmara",
    time: "2h",
    tag: "Hot lead",
    folder: "Inbox",
    unread: false,
    starred: false,
    flagged: false,
    vip: false,
    hasAttachment: false,
    needsReply: true,
  },
  {
    id: 12,
    from: "Tom Whitaker",
    company: "Meridian Group",
    email: "tom@meridiangroup.example",
    subject: "Invoice 4471 — payment terms",
    preview: "Accounting asked if we can move to net-45 for the remainder of the term...",
    body: "Hi,\n\nAccounting asked whether we can move to net-45 for the remainder of the term. Invoice 4471 is queued either way — just want to confirm before it's scheduled.\n\nTom",
    time: "5h",
    tag: "Billing",
    folder: "Inbox",
    unread: false,
    starred: false,
    flagged: false,
    vip: false,
    hasAttachment: true,
    needsReply: true,
  },
  {
    id: 13,
    from: "Hannah Blake",
    company: "Cobalt Advisory",
    email: "hannah@cobalt.example",
    subject: "Reschedule Thursday's working session",
    preview: "Something came up on our side — could we push to Friday morning...",
    body: "Something came up on our side — could we push Thursday's working session to Friday morning? 9:30 or 11:00 both work for our team.\n\nHannah",
    time: "8h",
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
    id: 14,
    from: "Ravi Menon",
    company: "Atlas Freight",
    email: "ravi@atlasfreight.example",
    subject: "Pilot results — 3 week readout",
    preview: "We cut manual triage time by 38% in the pilot. Full readout attached...",
    body: "We cut manual triage time by 38% over the three week pilot. Full readout is attached. Our exec team wants to discuss expanding to the claims desk next quarter.\n\nRavi",
    time: "Yesterday",
    tag: "Hot lead",
    folder: "Inbox",
    unread: false,
    starred: true,
    flagged: false,
    vip: true,
    hasAttachment: true,
    needsReply: true,
  },
  {
    id: 15,
    from: "Elena Sokolova",
    company: "Harborline",
    email: "elena@harborline.example",
    subject: "Renewal terms — seat true-up",
    preview: "We added 22 seats since January. Can you reflect that in the renewal quote...",
    body: "We added 22 seats since January. Can you reflect that in the renewal quote and let me know if the volume tier changes? Procurement wants numbers by the 20th.\n\nElena",
    time: "Yesterday",
    tag: "Renewal",
    folder: "Inbox",
    unread: false,
    starred: false,
    flagged: false,
    vip: false,
    hasAttachment: false,
    needsReply: true,
  },
  {
    id: 16,
    from: "Calendly",
    company: "Scheduling",
    email: "no-reply@calendly.com",
    subject: "New event: Intro call with Vertex",
    preview: "Diego Alvarez booked 30 minutes on Thursday at 2:00 PM...",
    body: "Diego Alvarez booked 30 minutes on Thursday at 2:00 PM. A calendar invite with the conferencing link has been added to your calendar.",
    time: "2d",
    tag: "System",
    folder: "Inbox",
    unread: false,
    starred: false,
    flagged: false,
    vip: false,
    hasAttachment: false,
    needsReply: false,
  },
];

baseThreads.push(...extraThreads);

interface ThreadInsights {
  bullets: string[];
  actions: string[];
  todos: string[];
}

function threadInsights(t: Thread): ThreadInsights {
  const first = t.from.split(" ")[0];
  switch (t.tag) {
    case "Hot lead":
      return {
        bullets: [
          `${first} approved the proposal with two edits — pricing and kickoff timing`,
          "Tier 2 should stay at the proposed annual rate",
          "Kickoff targeted for the week of June 10",
        ],
        actions: ["Send updated SOW", "Lock June 10 kickoff", "Book 30-min walkthrough"],
        todos: ["Revise SOW with tier 2 pricing", "Send calendar hold for kickoff week", "Schedule walkthrough invite"],
      };
    case "Sales":
      return {
        bullets: [
          `${first} is blocked on three items before legal can countersign`,
          "Needs SOC2 status, data residency, and implementation owner",
          "Nothing requires approval — just a reply with details",
        ],
        actions: ["Send SOC2 pack", "Name implementation owner"],
        todos: ["Attach SOC2 report", "Confirm data residency answer", "Assign implementation owner"],
      };
    case "Renewal":
      return {
        bullets: [
          "Renewal lands in 14 days with commercial exposure",
          "Procurement is driving the timeline — numbers over narrative",
          "Seat-count review requested before the invoice cuts",
        ],
        actions: ["Propose seat-count review call", "Share updated pricing"],
        todos: ["Pull current seat usage", "Draft renewal pricing", "Book procurement call"],
      };
    case "Billing":
      return {
        bullets: [
          `${t.company} asked to move invoice 4471 to net-45 terms`,
          "Finance-side only — no decision beyond confirming terms",
        ],
        actions: ["Confirm terms with finance"],
        todos: ["Verify net-45 against policy", "Update invoice schedule"],
      };
    case "Legal":
      return {
        bullets: [
          "Contract and compliance thread — written answer beats a call",
          "A documented, on-the-record reply moves this to signature",
        ],
        actions: ["Send written response to review"],
        todos: ["Draft on-record response", "Route to counsel for sign-off"],
      };
    case "Intro":
      return {
        bullets: [
          `Warm intro — ${first} is on this thread and engaged`,
          "Low effort, high signal: a quick reply keeps momentum",
        ],
        actions: ["Acknowledge and propose a time"],
        todos: ["Reply-all to loop everyone in", "Offer two meeting windows"],
      };
    default:
      return {
        bullets: [
          "Automated notification — no reply expected",
          `Filed under ${t.company} for awareness`,
        ],
        actions: ["Archive thread"],
        todos: [],
      };
  }
}

function threadNextAction(t: Thread) {
  switch (t.tag) {
    case "Hot lead":
      return `Reply to ${t.from.split(" ")[0]} with the requested update`;
    case "Sales":
      return "Send the details and confirm next step";
    case "Renewal":
      return "Share updated seat count and pricing";
    case "Billing":
      return "Confirm terms with finance";
    case "Legal":
      return "Send written response to review";
    case "Intro":
      return "Acknowledge and propose a time";
    default:
      return "No action needed — archive";
  }
}

const folderMeta = [
  { name: "Inbox" as const, icon: InboxIcon },
  { name: "VIPs" as const, icon: Star },
  { name: "Flagged" as const, icon: Flag },
  { name: "Drafts" as const, icon: FileEdit },
  { name: "Sent" as const, icon: Send },
  { name: "Archive" as const, icon: Archive },
  { name: "Trash" as const, icon: Trash2 },
];

const mailLabels = [
  { name: "Hot leads", dot: "border-emerald-400", query: "proposal" },
  { name: "Needs review", dot: "border-violet-400", query: "review" },
  { name: "Renewals", dot: "border-rose-400", query: "renewal" },
  { name: "Billing", dot: "border-sky-400", query: "invoice" },
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
    .replace(/<\/(div|p|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
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

/** Sign-off lives inside the signature block, not the typed body. */
const SIGN_OFF = "Best,";

/**
 * Fixed sender signature, rendered as its own block under the composer body so it
 * reads as a real email signature instead of another paragraph of body text.
 */
function SignatureBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`border-t border-border/60 ${compact ? "mx-4 mt-1 pt-3 pb-3" : "mx-4 mt-2 pt-4 pb-4"}`}
    >
      <div className="mb-3 text-[13px] leading-tight text-foreground/85">{SIGN_OFF}</div>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-[3px] h-9 w-[2px] shrink-0 rounded-full bg-foreground/25"
        />
        <div className="min-w-0">
          <div className="text-[13px] font-semibold leading-tight tracking-tight text-foreground">
            John Harwick
          </div>
          <div className="mt-[2px] text-[11.5px] leading-tight text-muted-foreground">
            Managing Partner · Harwick &amp; Sterne
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] leading-tight text-muted-foreground">
            <span className="truncate text-foreground/75">john.harwick@harwicksterne.com</span>
            <span className="text-border">|</span>
            <span className="text-foreground/75">+1 (212) 555-0136</span>
            <span className="text-border">|</span>
            <span className="text-foreground/75">harwicksterne.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const ME_NAME = "John Harwick";
const ME_EMAIL = "john.harwick@harwicksterne.com";

/** Real email header skeleton: labelled From / To / Cc / Subject rows. */
function HeaderRow({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 sm:px-5 ${
        last ? "" : "border-b border-border/45"
      }`}
    >
      <span className="w-[54px] shrink-0 text-[13px] text-muted-foreground sm:w-[64px]">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-[13.5px] text-foreground/90">{children}</div>
    </div>
  );
}

function MessageHeaderBlock({ thread }: { thread: Thread }) {
  const when = thread.sentAt ?? `${thread.time} ago`;
  const cc = threadCc(thread);
  return (
    <div className="-mx-4 border-b border-border/45 sm:-mx-5">
      <div className="flex items-center gap-3 border-b border-border/45 px-4 py-2.5 sm:px-5">
        <span className="w-[54px] shrink-0 text-[13px] text-muted-foreground sm:w-[64px]">
          From
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <LemniAvatar name={thread.from} size={26} />
          <span className="shrink-0 text-[13.5px] font-semibold tracking-tight text-foreground">
            {thread.from}
          </span>
          <span className="min-w-0 truncate text-[13px] text-muted-foreground">
            &lt;{thread.email}&gt;
          </span>
        </div>
        <span className="shrink-0 text-[12.5px] tabular-nums text-muted-foreground">{when}</span>
      </div>
      <HeaderRow label="To">
        <span className="block truncate">
          {ME_NAME} &lt;{ME_EMAIL}&gt;
        </span>
      </HeaderRow>
      {cc.length > 0 && (
        <HeaderRow label="Cc">
          <span className="block truncate">{cc.join(", ")}</span>
        </HeaderRow>
      )}
      <HeaderRow label="Subject" last>
        <span className="block truncate font-medium text-foreground">{thread.subject}</span>
      </HeaderRow>
    </div>
  );
}

/** Deterministic demo Cc list so every message reads like a real email. */
function threadCc(thread: Thread): string[] {
  const domain = thread.email.split("@")[1] ?? "example.com";
  const pool = [
    [`assistant@${domain}`],
    [`ops@harwicksterne.com`],
    [`assistant@${domain}`, `paralegal@harwicksterne.com`],
    [],
  ];
  return pool[thread.id % pool.length];
}

function createDraft(thread: Thread, mode: ComposerMode = "reply"): Draft {
  return buildDraft(thread, mode);
}

const DRAFTS_STORAGE_KEY = "syra.inbox.drafts.v1";

function buildDraft(thread: Thread, mode: ComposerMode = "reply"): Draft {
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
        : `Hi ${firstName},\n\n${regenerateOptions[0]}`,
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

const AVATAR_TINTS = [
  "#7C5CFF",
  "#E05CA8",
  "#E0703C",
  "#3C9BE0",
  "#C9A227",
  "#4FA87A",
];

function tintFor(name: string) {
  return AVATAR_TINTS[Math.abs(hashString(name)) % AVATAR_TINTS.length];
}

function LemniAvatar({ name, size = 30 }: { name: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: tintFor(name),
        boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset",
      }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

function InboxPage() {
  const [threads, setThreads] = useState(baseThreads);
  const [selectedId, setSelectedId] = useState(baseThreads[0].id);
  const [mobileReading, setMobileReading] = useState(false);
  // Threads are local data — they render instantly, so no artificial skeleton.
  const [threadLoading] = useState(false);
  const beginThreadLoad = (_ms: number) => {
    /* intentionally a no-op: content is already in memory */
  };

  const [mobileClosing, setMobileClosing] = useState(false);
  const isMobile = useIsMobile();
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

  // ---- Draft autosave (survives navigation away + full refresh) ----
  const draftsHydrated = useRef(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Draft>;
        const restored: Record<number, Draft> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (value && typeof value === "object") restored[Number(key)] = value;
        }
        if (Object.keys(restored).length) {
          setDrafts((current) => ({ ...current, ...restored }));
        }
      }
    } catch {
      /* corrupt or unavailable storage — start fresh */
    }
    draftsHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!draftsHydrated.current) return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
      } catch {
        /* quota or private mode — ignore */
      }
    }, 350);
    return () => window.clearTimeout(id);
  }, [drafts]);

  // Flush immediately if the tab is hidden or closed mid-edit.
  useEffect(() => {
    const flush = () => {
      if (!draftsHydrated.current) return;
      try {
        window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
      } catch {
        /* ignore */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, [drafts]);

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
    if (thread.id !== selectedId || !mobileReading) beginThreadLoad(420);
    setSelectedId(thread.id);
    setMobileReading(true);
    setMobileClosing(false);
    if (thread.unread) updateThread(thread.id, { unread: false });
  };

  const closeMobileReading = () => {
    // Content collapses to a skeleton as the pane slides away, so a re-open
    // never flashes stale content.
    beginThreadLoad(300);
    setMobileClosing(true);
    window.setTimeout(() => {
      setMobileReading(false);
      setMobileClosing(false);
    }, 240);
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
        body: textToHtml(`Hi ${selected.from.split(" ")[0]},\n\n${next}`),
        status: "open",
      });
      setRegeneratingId(null);
      toast.success("Syra regenerated the draft");
    }, 650);
  };

  if (isMobile) {
    const unreadCount = visibleThreads.filter((t) => t.unread).length;
    const needsReplyCount = threads.filter((t) => t.needsReply && t.folder === "Inbox").length;

    // Thread reading view
    if (mobileReading) {
      const s = selected;
      const nextAction =
        s.tag === "Hot lead"
          ? "Send updated SOW with June 10 kickoff"
          : s.tag === "Sales"
            ? "Reply with SOC2 pack + owner"
            : s.tag === "Renewal"
              ? "Propose seat-count review call"
              : s.tag === "Intro"
                ? "Reply-all to loop Priya in"
                : s.tag === "Billing"
                  ? "File reconciliation, no reply"
                  : "No action needed";
      const canAction = s.needsReply;

      return (
        <>
          <div
            className={`fixed inset-x-0 bottom-0 z-40 flex flex-col bg-background ${
              mobileClosing ? "ios-push-out" : "ios-push-in"
            }`}
            style={{
              top: 0,
              paddingTop: "calc(env(safe-area-inset-top, 0px))",
            }}
          >
            {/* Top bar */}
            <div className="flex h-11 items-center gap-1 px-2 border-b border-border/50 bg-background/95 backdrop-blur-xl">
              <button
                onClick={closeMobileReading}
                className="inline-flex items-center gap-0.5 h-8 pl-1 pr-2 rounded-md text-foreground/85 hover:bg-foreground/[0.06] active:bg-foreground/[0.09] transition-colors"
              >
                <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2} />
                <span className="text-[13.5px] font-medium">{activeFolder}</span>
              </button>
              <div className="flex-1" />
              <button
                onClick={() => updateThread(s.id, { flagged: !s.flagged })}
                aria-label="Flag"
                className={`grid h-8 w-8 place-items-center rounded-md hover:bg-foreground/[0.06] transition-colors ${
                  s.flagged ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Flag className="h-4 w-4" strokeWidth={1.75} fill={s.flagged ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => {
                  moveSelected("Archive", "Archived message");
                  closeMobileReading();
                }}
                aria-label="Archive"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
              >
                <Archive className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="More"
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => updateThread(s.id, { unread: !s.unread })}
                    className="text-xs"
                  >
                    Mark as {s.unread ? "read" : "unread"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      moveSelected("Trash", "Moved to trash");
                      closeMobileReading();
                    }}
                    className="text-xs"
                  >
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateThread(s.id, { starred: !s.starred })}
                    className="text-xs"
                  >
                    {s.starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Scroll body */}
            <div
              className="flex-1 overflow-y-auto no-scrollbar"
              style={{
                paddingBottom: selectedDraft.status === "open"
                  ? "calc(env(safe-area-inset-bottom, 0px) + 12px)"
                  : "calc(env(safe-area-inset-bottom, 0px) + 84px)",
              }}
            >
              {threadLoading ? (
                <ThreadSkeleton variant="mobile" />
              ) : (
              <div className="ios-skeleton-fade">
              {/* Editorial subject */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
                  <span className="rounded-sm border border-border/60 bg-muted/50 px-1.5 py-[2px] text-[9.5px] tracking-[0.14em]">
                    {s.tag}
                  </span>
                  <span className="tabular-nums">{s.sentAt ?? s.time}</span>
                </div>
                <h1 className="font-serif-display mt-2.5 text-[26px] leading-[1.15] tracking-[-0.015em] text-foreground">
                  {s.subject}
                </h1>
                <div className="mt-3 flex items-center gap-2.5">
                  <SmartAvatar name={s.from} className="h-7 w-7 rounded-full object-cover grayscale-[0.15]" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium text-foreground/95 truncate">
                      {s.from} <span className="text-muted-foreground font-normal">· {s.company}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {s.email} → me
                    </div>
                  </div>
                </div>
              </div>

              {/* Syra Smart Summary — Linear-style agent strip */}
              <div className="px-4 py-1">
                <div className="flex items-center gap-2">
                  <SyraMark className="h-3.5 w-3.5 text-foreground/50" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                    Smart summary
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {threadInsights(s).bullets.map((point) => (
                    <li key={point} className="flex gap-2 text-[13px] leading-[1.45] text-foreground/85">
                      <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-foreground/30" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {threadInsights(s).actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => canAction && openComposer("reply")}
                      disabled={!canAction}
                      className={`inline-flex items-center rounded-full border border-border/70 bg-foreground/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-foreground/[0.08] active:scale-[0.98] ${canAction ? "" : "opacity-50"}`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
                {threadInsights(s).todos.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/55">
                      To-dos
                    </span>
                    {threadInsights(s).todos.map((todo) => (
                      <span key={todo} className="inline-flex items-center gap-1.5 text-[11px] text-foreground/65">
                        <span aria-hidden className="box-border h-3 w-3 rounded-[3px] border border-border/60 bg-foreground/[0.04]" />
                        {todo}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => canAction && openComposer("reply")}
                  disabled={!canAction}
                  className={`mt-3 flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-left transition-colors ${
                    canAction
                      ? "hover:bg-foreground/[0.04] active:bg-foreground/[0.06]"
                      : "opacity-70"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                      Next action
                    </div>
                    <div className="text-[12.5px] font-medium text-foreground truncate">
                      {nextAction}
                    </div>
                  </div>
                  {canAction && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                  )}
                </button>
              </div>

              {/* Inline mobile compose — sits above the message it replies to */}
              {selectedDraft.status === "open" && (
                <div className="px-4 pt-4">
                  <div
                    className="rounded-xl border border-border/70 bg-card overflow-hidden"
                    style={{
                      boxShadow:
                        "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 28px -14px rgba(0,0,0,0.45)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 px-4 h-10 border-b border-border/60 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <SyraMark className="h-3.5 w-3.5" />
                        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                          Drafted by Syra
                        </span>
                      </div>
                      <button
                        onClick={regenerateDraft}
                        disabled={regeneratingId === s.id}
                        className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
                      >
                        {regeneratingId === s.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        Regenerate
                      </button>
                    </div>
                    <div className="space-y-2 border-b border-border/50 px-4 py-2.5 text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 shrink-0 text-muted-foreground">To</span>
                        <input
                          value={selectedDraft.to.join(", ")}
                          onChange={(e) =>
                            updateDraft({
                              to: e.target.value
                                .split(",")
                                .map((v) => v.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Add recipient"
                          className="min-w-0 flex-1 bg-transparent text-foreground/90 outline-none placeholder:text-muted-foreground"
                        />
                        <button
                          onClick={() => updateDraft({ showCc: !selectedDraft.showCc })}
                          className={`shrink-0 rounded-md px-1.5 py-0.5 ${selectedDraft.showCc ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          Cc
                        </button>
                        <button
                          onClick={() => updateDraft({ showBcc: !selectedDraft.showBcc })}
                          className={`shrink-0 rounded-md px-1.5 py-0.5 ${selectedDraft.showBcc ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          Bcc
                        </button>
                      </div>
                      {selectedDraft.showCc && (
                        <div className="flex items-center gap-2">
                          <span className="w-7 shrink-0 text-muted-foreground">Cc</span>
                          <input
                            value={selectedDraft.cc.join(", ")}
                            onChange={(e) =>
                              updateDraft({
                                cc: e.target.value
                                  .split(",")
                                  .map((v) => v.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Cc recipients"
                            className="min-w-0 flex-1 bg-transparent text-foreground/90 outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                      )}
                      {selectedDraft.showBcc && (
                        <div className="flex items-center gap-2">
                          <span className="w-7 shrink-0 text-muted-foreground">Bcc</span>
                          <input
                            value={selectedDraft.bcc.join(", ")}
                            onChange={(e) =>
                              updateDraft({
                                bcc: e.target.value
                                  .split(",")
                                  .map((v) => v.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Bcc recipients"
                            className="min-w-0 flex-1 bg-transparent text-foreground/90 outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                      )}
                    </div>
                    <textarea
                      value={htmlToText(selectedDraft.body)}
                      onChange={(e) => updateDraft({ body: textToHtml(e.target.value) })}
                      rows={9}
                      className="w-full whitespace-pre-wrap px-4 py-3 text-[14px] leading-[1.6] bg-transparent text-foreground/95 placeholder:text-muted-foreground focus:outline-none resize-none"
                    />
                    <SignatureBlock compact />
                    <div className="flex items-center justify-between gap-2 px-3 h-12 border-t border-border/60 bg-muted/20">
                      <button
                        onClick={() => {
                          setDrafts((current) => ({
                            ...current,
                            [s.id]: { ...selectedDraft, status: "closed" },
                          }));
                        }}
                        className="inline-flex items-center h-8 px-3 rounded-md text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
                      >
                        Discard
                      </button>
                      <button
                        onClick={sendDraft}
                        disabled={sendingId === s.id}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-foreground text-background text-[13px] font-medium active:opacity-90 disabled:opacity-70 transition-opacity"
                      >
                        {sendingId === s.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Message card — the email being replied to */}
              <div className="px-4 pt-4">
                <div
                  className="rounded-xl border border-border/60 bg-card px-4 pb-4 pt-3.5"
                  style={{
                    boxShadow:
                      "0 1px 0 rgba(255,255,255,0.03) inset, 0 4px 14px -8px rgba(0,0,0,0.25)",
                  }}
                >
                  <MessageHeaderBlock thread={s} />
                  <div className="pt-3.5 text-[14.5px] leading-[1.6] text-foreground/95 whitespace-pre-line">
                    {s.body}
                  </div>
                  {s.hasAttachment && (
                    <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-[12px] text-foreground/85">
                      <Paperclip className="h-3.5 w-3.5" />
                      {s.tag === "Legal"
                        ? "Completed_MSA.pdf"
                        : s.tag === "Billing"
                          ? "Invoice_4471.pdf"
                          : "Security_questionnaire.pdf"}
                    </button>
                  )}
                </div>
              </div>
              </div>
              )}
            </div>

            {/* Floating reply bar */}
            {selectedDraft.status !== "open" && (
              <div
                className="absolute inset-x-0 bottom-0 px-4 pt-3 border-t border-border/50 bg-background/95 backdrop-blur-xl"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openComposer("reply")}
                    className="ios-tap flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-foreground text-background text-[13.5px] font-medium active:opacity-90"
                  >
                    <Reply className="h-4 w-4" strokeWidth={2} />
                    Reply with Syra
                  </button>
                  <button
                    onClick={() => openComposer("forward")}
                    aria-label="Forward"
                    className="ios-tap grid h-11 w-11 place-items-center rounded-full border border-border/70 bg-card text-foreground/80 active:bg-foreground/[0.06]"
                  >
                    <Forward className="h-4 w-4" strokeWidth={1.85} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    // List view
    return (
      <>
        <div className="flex min-h-[calc(100dvh-80px)] w-full flex-col bg-background pb-32">
          {/* Editorial header */}
          <div className="px-5 pb-3 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
            <div className="flex items-baseline justify-between gap-2">
              <h1 className="font-serif-display text-[30px] leading-none tracking-[-0.02em] text-foreground">
                {activeFolder}
              </h1>
              <span className="text-[11.5px] font-medium tabular-nums text-muted-foreground">
                {visibleThreads.length} · {unreadCount} unread
              </span>
            </div>
            <div className="mt-1.5 text-[11.5px] text-muted-foreground">
              {needsReplyCount} threads need a reply · Syra drafted {Object.values(drafts).filter((d) => d.status === "open").length}
            </div>
          </div>

          {/* Search + folder pill */}
          <div className="px-4 pb-2.5 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 h-10 px-3 rounded-full bg-muted/60 border border-border/50">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search mail"
                className="flex-1 min-w-0 bg-transparent text-[13.5px] placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setFoldersOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full border border-border/50 bg-card text-foreground/85 text-[12.5px] font-medium"
              >
                <ActiveIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{activeFolder}</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {folderCounts[activeFolder]}
                </span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>
              {foldersOpen && (
                <div
                  className="absolute right-0 top-12 z-30 w-[270px] rounded-2xl border border-border/60 bg-popover/95 backdrop-blur-xl p-2"
                  style={{
                    boxShadow:
                      "0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px -20px rgba(0,0,0,0.65), 0 8px 24px -12px rgba(0,0,0,0.4)",
                  }}
                >
                  {/* workspace header */}
                  <div className="flex items-center gap-3 px-2.5 pt-2 pb-3">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground/[0.08] text-[13px] font-bold text-foreground"
                      style={{ boxShadow: "0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent)" }}
                    >
                      H
                    </span>
                    <span className="text-[15px] font-semibold tracking-tight text-foreground">
                      Harwick &amp; Sterne
                    </span>
                  </div>

                  <div className="mx-2 mb-1.5 h-px bg-border/60" />

                  {/* folders */}
                  <div className="space-y-0.5">
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
                          className={`ios-tap w-full flex items-center gap-3 px-3 h-11 rounded-xl text-[14px] ${
                            active
                              ? "bg-foreground/[0.09] text-foreground font-medium"
                              : "text-foreground/85 active:bg-foreground/[0.06]"
                          }`}
                        >
                          <Icon className="h-[17px] w-[17px] opacity-80" strokeWidth={1.75} />
                          <span className="flex-1 text-left">{f.name}</span>
                          {folderCounts[f.name] > 0 && (
                            <span className="text-[12px] text-muted-foreground tabular-nums">
                              {folderCounts[f.name]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mx-2 mt-1.5 mb-2 h-px bg-border/60" />

                  {/* labels */}
                  <div className="px-3 pb-1.5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
                    Labels
                  </div>
                  <div className="space-y-0.5">
                    {mailLabels.map((l) => (
                      <button
                        key={l.name}
                        onClick={() => {
                          setQuery(l.query);
                          setFoldersOpen(false);
                        }}
                        className="ios-tap w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] text-foreground/85 active:bg-foreground/[0.06]"
                      >
                        <span className={`h-2.5 w-2.5 rounded-full border-2 ${l.dot}`} />
                        <span className="flex-1 text-left">{l.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Segmented filter */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 p-1">
              {(["All", "Unread", "Flagged"] as const).map((t) => {
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
                    className={`flex-1 h-8 rounded-full text-[12.5px] font-medium transition-all ${
                      active
                        ? "bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                        : "text-muted-foreground active:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thread list */}
          <div className="px-3">
            {visibleThreads.length === 0 ? (
              <div className="px-4 py-16 text-center text-[13px] text-muted-foreground">
                No messages match this view.
              </div>
            ) : (
              <ul
                className="rounded-2xl border border-border/50 bg-card overflow-hidden"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.03) inset, 0 6px 20px -14px rgba(0,0,0,0.35)",
                }}
              >
                {visibleThreads.map((thread, idx) => {
                  const draft = drafts[thread.id];
                  return (
                    <li key={thread.id}>
                      <button
                        onClick={() => selectThread(thread)}
                        className={`ios-tap w-full text-left px-3.5 py-3 flex items-start gap-3 active:bg-foreground/[0.05] ${
                          idx > 0 ? "border-t border-border/40" : ""
                        }`}
                      >
                        <div className="relative shrink-0">
                          <SmartAvatar name={thread.from} className="h-10 w-10 rounded-full object-cover grayscale-[0.2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {thread.unread && (
                              <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                            )}
                            <div
                              className={`text-[14px] truncate ${
                                thread.unread ? "font-semibold text-foreground" : "font-medium text-foreground/90"
                              }`}
                            >
                              {thread.from}
                            </div>
                            <div className="ml-auto text-[11px] text-muted-foreground shrink-0 tabular-nums">
                              {thread.sentAt ?? thread.time}
                            </div>
                          </div>
                          <div
                            className={`text-[13px] truncate mt-0.5 ${
                              thread.unread ? "text-foreground" : "text-foreground/80"
                            }`}
                          >
                            {draft && draft.status !== "closed" && (
                              <span className="text-muted-foreground">Draft · </span>
                            )}
                            {thread.subject}
                          </div>
                          <div className="text-[12px] text-muted-foreground line-clamp-1 mt-0.5 leading-snug">
                            {thread.preview}
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="inline-flex items-center h-[18px] px-1.5 rounded-sm border border-border/60 bg-muted/40 text-[9.5px] font-medium uppercase tracking-[0.12em] text-foreground/70">
                              {thread.tag}
                            </span>
                            {thread.needsReply && (
                              <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-sm text-[9.5px] font-medium uppercase tracking-[0.12em] text-foreground/70">
                                <SyraMark className="h-2.5 w-2.5" />
                                Draft ready
                              </span>
                            )}
                            {thread.hasAttachment && (
                              <Paperclip className="h-3 w-3 text-muted-foreground" />
                            )}
                            {thread.flagged && (
                              <Flag className="h-3 w-3 text-foreground/70" fill="currentColor" />
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-1" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>

      <div
        className="relative flex w-full overflow-hidden bg-background"
        style={{ height: "calc(100dvh - 53px)" }}
      >
        {/* ambient depth — soft top glow + vignette so nothing reads flat */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(120% 70% at 50% -10%, color-mix(in oklab, var(--foreground) 7%, transparent), transparent 60%), radial-gradient(90% 60% at 100% 110%, color-mix(in oklab, var(--foreground) 4%, transparent), transparent 65%)",
          }}
        />


        {/* ── Thread list ─────────────────────────────────────────── */}
        <section
          className={`${mobileReading ? "hidden md:flex" : "flex"} relative z-10 w-full md:w-[300px] lg:w-[340px] shrink-0 flex-col border-r border-border/50 bg-background min-w-0`}
        >
          {/* list header — "6 Todo" + Filter / Sort */}
          <div className="flex h-[46px] shrink-0 items-center gap-2 px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1.5 text-[14px] font-semibold tracking-tight text-foreground">
                  <span className="tabular-nums">{visibleThreads.length}</span>
                  <span>{activeFolder}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[270px] rounded-2xl p-2">
                <div className="flex items-center gap-3 px-2.5 pt-2 pb-3">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground/[0.08] text-[13px] font-bold text-foreground"
                    style={{ boxShadow: "0 0 0 1px color-mix(in oklab, var(--foreground) 10%, transparent)" }}
                  >
                    H
                  </span>
                  <span className="text-[15px] font-semibold tracking-tight text-foreground">
                    Harwick &amp; Sterne
                  </span>
                </div>
                <DropdownMenuSeparator />
                {folderMeta.map((f) => {
                  const Icon = f.icon;
                  const active = f.name === activeFolder;
                  return (
                    <DropdownMenuItem
                      key={f.name}
                      onClick={() => setActiveFolder(f.name)}
                      className={`flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] ${
                        active ? "bg-foreground/[0.09] font-medium text-foreground" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 opacity-80" strokeWidth={1.75} />
                      <span className="flex-1">{f.name}</span>
                      {folderCounts[f.name] > 0 && (
                        <span className="text-[12px] text-muted-foreground tabular-nums">
                          {folderCounts[f.name]}
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="px-3 pb-1.5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
                  Labels
                </DropdownMenuLabel>
                {mailLabels.map((l) => (
                  <DropdownMenuItem
                    key={l.name}
                    onClick={() => setQuery(l.query)}
                    className="flex items-center gap-3 px-3 h-9 rounded-xl text-[13px]"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full border-2 ${l.dot}`} />
                    <span className="flex-1">{l.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`inline-flex items-center gap-1.5 h-7 rounded-md px-2 text-[12.5px] transition-colors hover:bg-foreground/[0.05] ${
                    filters.length ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filter
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Filter mail</DropdownMenuLabel>
                {(["Unread", "Flagged", "Attachments", "Hot leads", "Needs reply"] as FilterName[]).map(
                  (filter) => (
                    <DropdownMenuCheckboxItem
                      key={filter}
                      checked={filters.includes(filter)}
                      onCheckedChange={() => toggleFilter(filter)}
                      className="text-xs"
                    >
                      {filter}
                    </DropdownMenuCheckboxItem>
                  ),
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters([])} className="text-xs">
                  Reset filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => toast.message("Sorted by newest")}
              className="inline-flex items-center gap-1.5 h-7 rounded-md px-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </button>
          </div>

          {/* search */}
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 h-8 px-2.5 rounded-lg bg-foreground/[0.04]">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent text-[12.5px] placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-6">
            {visibleThreads.length === 0 ? (
              <div className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                No messages match this view.
              </div>
            ) : (
              visibleThreads.map((thread, i) => {
                const active = selected.id === thread.id;
                const draft = drafts[thread.id];
                const prevActive =
                  i > 0 && selected.id === visibleThreads[i - 1].id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => selectThread(thread)}
                    className={`ios-tap group relative block w-full rounded-xl px-3 py-3 text-left ${
                      active
                        ? "bg-selected text-selected-foreground"
                        : "hover:bg-foreground/[0.035]"
                    } ${
                      !active && !prevActive && i > 0
                        ? "border-t border-border/50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <LemniAvatar name={thread.from} size={22} />
                      <span
                        className={`truncate text-[13.5px] font-semibold leading-none ${
                          active ? "text-selected-foreground" : "text-foreground"
                        }`}
                      >
                        {thread.from}
                      </span>
                      {thread.hasAttachment && (
                        <Paperclip
                          className={`h-3 w-3 shrink-0 ${active ? "text-selected-foreground/70" : "text-muted-foreground/70"}`}
                        />
                      )}
                      {thread.needsReply && (
                        <SyraMark className="h-3 w-3 shrink-0 opacity-70" />
                      )}
                      <span
                        className={`ml-auto shrink-0 text-[11.5px] tabular-nums ${
                          active ? "text-selected-foreground/75" : "text-muted-foreground/80"
                        }`}
                      >
                        {thread.sentAt ?? thread.time}
                      </span>
                    </div>
                    <div
                      className={`mt-2 truncate text-[15px] leading-snug tracking-[-0.01em] ${
                        active
                          ? "text-selected-foreground"
                          : thread.unread
                            ? "font-medium text-foreground"
                            : "text-foreground/90"
                      }`}
                    >
                      {thread.subject}
                    </div>
                    <p
                      className={`mt-1.5 line-clamp-2 text-[12.5px] leading-[1.5] ${
                        active ? "text-selected-foreground/75" : "text-muted-foreground/75"
                      }`}
                    >
                      {draft && draft.status !== "closed" ? (
                        <>
                          <span className={active ? "" : "text-foreground/70"}>Draft · </span>
                          {htmlToText(draft.body)}
                        </>
                      ) : (
                        thread.preview
                      )}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* ── Reading pane ────────────────────────────────────────── */}
        <main
          className={`${mobileReading ? "flex" : "hidden md:flex"} relative z-10 flex-1 flex-col min-w-0 bg-background`}
        >
          {/* header block — Gmail-style: toolbar row, then subject */}
          <div className="relative bg-background px-6 pb-3 pt-2.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={closeMobileReading}
                aria-label="Back to inbox"
                className="md:hidden grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-foreground/[0.05]"
              >
                <CornerUpLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <div className="flex items-center gap-0.5">
                  <ToolbarBtn
                    icon={Sparkles}
                    label="Summarize"
                    active={selected.vip}
                    onClick={() => toast.success("Syra summarized this thread")}
                  />
                  <span className="mx-1 h-5 w-px bg-border/70" />
                  <ToolbarBtn icon={Reply} label="Reply" onClick={() => openComposer("reply")} />
                  <ToolbarBtn
                    icon={ReplyAll}
                    label="Reply All"
                    onClick={() => openComposer("replyAll")}
                  />
                  <ToolbarBtn icon={Forward} label="Forward" onClick={() => openComposer("forward")} />
                  <span className="mx-1 h-5 w-px bg-border/70" />
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="More"
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
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
                        onClick={() => updateThread(selected.id, { flagged: !selected.flagged })}
                        className="text-xs"
                      >
                        {selected.flagged ? "Remove flag" : "Flag message"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toast.success("Print preview opened")}
                        className="text-xs"
                      >
                        Print
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
              <span className="ml-auto shrink-0 text-[11.5px] tabular-nums text-muted-foreground">
                {selected.sentAt ?? `${selected.time} ago`}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {threadLoading ? (
                <>
                  <div className="ios-skeleton h-6 w-[46%]" />
                  <div className="ios-skeleton h-5 w-16" />
                </>
              ) : (
              <>
              <h2 className="ios-skeleton-fade text-[26px] font-normal leading-[1.25] tracking-[-0.01em] text-foreground">
                {selected.subject}
              </h2>
              {selected.tag && (
                <span className="inline-flex items-center rounded-[4px] bg-foreground/[0.07] px-2 py-0.5 text-[12px] font-medium text-muted-foreground">
                  {selected.tag}
                </span>
              )}
              </>
              )}
            </div>
          </div>

          {/* body — Gmail flat message stack */}
          <div className="relative flex-1 overflow-y-auto no-scrollbar px-8 pb-12">
            {threadLoading && <ThreadSkeleton />}
            <div className={`mx-auto max-w-[820px] ${threadLoading ? "hidden" : "ios-skeleton-fade"}`}>
              {/* Agent briefing above the thread */}
              <div className="mb-5 px-4 sm:px-5">
                <ThreadBrief
                  key={selected.id}
                  data={threadBrief(selected)}
                  onAction={() => selected.needsReply && openComposer("reply")}
                />
              </div>


              {selectedDraft.status !== "closed" && (
                <div className="pb-6">
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

              <article
                className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card px-4 pb-5 sm:px-5"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.03) inset, 0 6px 20px -12px rgba(0,0,0,0.35)",
                }}
              >
                {/* sender / header row */}
                <MessageHeaderBlock thread={selected} />

                <div className="whitespace-pre-line pt-4 text-[14px] leading-[1.65] text-foreground/90">
                  {selected.body}
                </div>

                {selected.hasAttachment && (
                  <div className="pt-5">
                    <button className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-3.5 py-2.5 text-[13px] text-foreground/85 hover:bg-foreground/[0.05] transition-colors">
                      <Paperclip className="h-4 w-4" />
                      {selected.tag === "Legal"
                        ? "Completed_MSA.pdf"
                        : selected.tag === "Billing"
                          ? "Invoice_4471.pdf"
                          : "Security_questionnaire.pdf"}
                    </button>
                  </div>
                )}
              </article>


              {selectedDraft.status === "closed" && (
                <div className="flex items-center gap-2 pl-0 pt-7 sm:pl-[46px]">
                  <button
                    onClick={() => openComposer("reply")}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2.5 text-[14px] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => openComposer("forward")}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2.5 text-[14px] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                  >
                    <Forward className="h-4 w-4" />
                    Forward
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
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
      className={`grid h-8 w-8 place-items-center rounded-full hover:text-foreground hover:bg-foreground/[0.07] transition-colors ${
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
    <div className="bg-card border border-border/70 dark:border-white/[0.08] rounded-sm overflow-hidden shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_16px_40px_-16px_rgba(0,0,0,0.5),0_4px_12px_-4px_rgba(0,0,0,0.25)]">
      {draft.mode !== "forward" && (
        <div className="flex items-center gap-2.5 border-b border-border/60 px-3.5 py-2">
          <span
            aria-hidden
            className="h-4 w-[2px] shrink-0 rounded-full"
            style={{ background: "var(--sparkle, #7c6cff)" }}
          />
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Drafted by Syra
          </span>
          <span aria-hidden className="h-3 w-px shrink-0 bg-border/60 hidden sm:block" />
          <span className="hidden sm:inline truncate text-[11.5px] text-muted-foreground/70">
            Review and send as John
          </span>
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-60"
          >
            {regenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Regenerate
          </button>
          <span className="mx-1 h-3.5 w-px bg-border/60" />
          <button
            onClick={onMinimize}
            className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
            aria-label="Minimize"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDiscard}
            className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {(draft.mode === "forward" || justSent) && (
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
      )}


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
                  <SmartAvatar name={local} size={40} className="h-5 w-5 rounded-full object-cover ring-1 ring-border/60" />
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
      <SignatureBlock />
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
