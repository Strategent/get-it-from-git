import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Hash, Lock, Send, Search, ArrowLeft, X, Bookmark } from "lucide-react";
import { SmartAvatar } from "@/components/smart-avatar";
import { SyraMark } from "@/components/syra-mark";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/channels")({
  component: ChannelsPage,
  head: () => ({ meta: [
    { title: "Channels — strategent" },
    { name: "description", content: "Team channels and direct messages for the Harwick & Sterne workspace." },
    { property: "og:title", content: "Channels — strategent" },
    { property: "og:description", content: "Team channels and direct messages for the Harwick & Sterne workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
});

type Msg = {
  user: string;
  text: string;
  time: string;
  ai?: boolean;
  mentionsSyra?: boolean;
};

const channels = [
  { name: "general", private: false, unread: 0 },
  { name: "ops-alerts", private: false, unread: 3 },
  { name: "sales-pipeline", private: false, unread: 12 },
  { name: "syra-handoff", private: true, unread: 1 },
  { name: "exec", private: true, unread: 0 },
  { name: "client-hartley", private: false, unread: 0 },
  { name: "research", private: false, unread: 2 },
];

const dms = [
  { name: "Elena Smith", status: "active" },
  { name: "Adrian Engman", status: "away" },
  { name: "Claire Bennett", status: "active" },
  { name: "Syra", status: "ai" },
];

// Hardcoded distinct threads for a richer demo experience.
const threads: Record<string, Msg[]> = {
  general: [
    { user: "Claire Bennett", text: "Morning team — reminder the ops all-hands is at 3pm ET today.", time: "8:14 AM" },
    { user: "Daniel Brooks", text: "I'll bring the Q3 pipeline snapshot. Anything else on the agenda?", time: "8:22 AM" },
    { user: "Elena Smith", text: "Would love a quick recap of the Hartley Trust engagement.", time: "8:31 AM" },
    { user: "Syra", ai: true, text: "I can drop a one-pager on Hartley in the doc channel before 2pm. Want the working version or a client-safe cut?", time: "8:33 AM" },
  ],
  "ops-alerts": [
    { user: "Syra", ai: true, text: "🚨 Custodian reconciliation drift detected on 3 accounts (~$14.2K). Details posted in canvas.", time: "9:02 AM" },
    { user: "Adrian Engman", text: "Taking a look — likely the Fidelity feed timing again.", time: "9:04 AM" },
    { user: "Syra", ai: true, text: "Confirmed: Fidelity feed ran at 04:41 UTC. Retriggering the reconciliation now.", time: "9:06 AM" },
    { user: "Adrian Engman", text: "Nice. Ping me if it doesn't clear on the next pass.", time: "9:07 AM" },
  ],
  "sales-pipeline": [
    { user: "Elena Smith", text: "Heads up — Hartley Trust just replied to the IPS draft. Want me to forward?", time: "10:42 AM" },
    { user: "Adrian Engman", mentionsSyra: true, text: "Looping in @Syra to pull the latest rebalance numbers before Thursday's call.", time: "10:44 AM" },
    { user: "Syra", ai: true, text: "On it. Pulled YTD allocation drift (+2.4% equities, -1.8% fixed income) and drafted a one-page summary. Shared in #sales-pipeline canvas.", time: "10:44 AM" },
    { user: "Claire Bennett", text: "Perfect. Let's review on the 2pm sync. I'll add it to the agenda.", time: "10:46 AM" },
    { user: "Daniel Brooks", text: "Quick note — Marlow Capital wants the alts sleeve memo by Friday EOD.", time: "10:51 AM" },
  ],
  "syra-handoff": [
    { user: "Syra", ai: true, text: "Handoff for tonight: 4 draft replies awaiting review, 2 calendar holds pending confirmation, 1 client memo queued for tomorrow.", time: "7:58 PM" },
    { user: "Claire Bennett", text: "Approve the drafts — hold the memo until I've seen the numbers.", time: "8:01 PM" },
    { user: "Syra", ai: true, text: "Done. Drafts sent, memo held. I'll re-queue the memo tomorrow at 7am with fresh figures.", time: "8:02 PM" },
  ],
  exec: [
    { user: "Claire Bennett", text: "Board pre-read is locked. Let's keep comments in the doc, not the deck.", time: "11:15 AM" },
    { user: "Daniel Brooks", text: "Agreed. I'll add the compensation slide by tonight.", time: "11:20 AM" },
    { user: "Elena Smith", text: "Do we want to include the Syra pilot metrics in the appendix?", time: "11:24 AM" },
  ],
  "client-hartley": [
    { user: "Elena Smith", text: "Hartley wants an update on the Q3 rebalance. Suggested Thursday 2pm.", time: "9:41 AM" },
    { user: "Syra", ai: true, text: "Calendar hold sent to Ms. Hartley and Mr. Harwick. I'll prep talking points 24h before.", time: "9:42 AM" },
    { user: "Elena Smith", text: "Great — please include the tax-loss harvesting recap in the deck.", time: "9:44 AM" },
  ],
  research: [
    { user: "Adrian Engman", text: "Reading the new Vanguard mid-year outlook. Worth a discussion?", time: "1:12 PM" },
    { user: "Syra", ai: true, text: "Summarized the 46-page outlook into 8 bullets. Sharing in the canvas now.", time: "1:13 PM" },
    { user: "Daniel Brooks", text: "Perfect turnaround. Adding this to Friday's research readout.", time: "1:20 PM" },
  ],
  "Elena Smith": [
    { user: "Elena Smith", text: "Quick one — do you want me to loop you into the Marlow intro?", time: "10:02 AM" },
    { user: "John Harwick", text: "Yes please. Copy me and Claire.", time: "10:05 AM" },
    { user: "Elena Smith", text: "Done. Intro going out this afternoon.", time: "10:06 AM" },
  ],
  "Adrian Engman": [
    { user: "Adrian Engman", text: "Reconciliation cleared. All accounts back in tolerance.", time: "9:22 AM" },
    { user: "John Harwick", text: "Thanks Adrian.", time: "9:23 AM" },
  ],
  "Claire Bennett": [
    { user: "Claire Bennett", text: "Can you review the board pre-read tonight?", time: "6:44 PM" },
    { user: "John Harwick", text: "Will do — sending notes before 10.", time: "6:47 PM" },
  ],
  Syra: [
    { user: "Syra", ai: true, text: "Morning brief ready: 3 urgent replies, 2 approvals, 1 client call at 2pm. Want the audio summary?", time: "7:30 AM" },
    { user: "John Harwick", text: "Text summary is fine. Draft replies where you can.", time: "7:32 AM" },
    { user: "Syra", ai: true, text: "Drafted. Approvals queued in the inbox — tap to send.", time: "7:33 AM" },
  ],
};

function ChannelsPage() {
  const [active, setActive] = useState("sales-pipeline");
  const [activeKind, setActiveKind] = useState<"channel" | "dm">("channel");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<Record<string, Msg[]>>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [listMode, setListMode] = useState<"all" | "saved">("all");
  const isPrivate = activeKind === "channel" && channels.find((c) => c.name === active)?.private;
  const key = `${activeKind}:${active}`;
  const messages = [...(threads[active] ?? []), ...(sent[key] ?? [])];
  const visibleMessages = messages.filter((m) => `${m.user} ${m.text}`.toLowerCase().includes(messageSearch.toLowerCase()));
  const channelList = channels.filter((c) => c.name.includes(query.toLowerCase()) && (listMode === "all" || saved.includes(`channel:${c.name}`)));
  const dmList = dms.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()) && (listMode === "all" || saved.includes(`dm:${d.name}`)));
  const openThread = (name: string, kind: "channel" | "dm") => {
    setActive(name);
    setActiveKind(kind);
    setMobileView("chat");
    setMessageSearch("");
    setSearchOpen(false);
  };
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setSent((current) => ({ ...current, [key]: [...(current[key] ?? []), { user: "John Harwick", text, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) }] }));
    setDraft("");
  };
  const toggleSaved = () => setSaved((current) => current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]);

  return (
    <div className="flex min-h-0 h-[calc(100dvh-53px)] bg-background text-foreground md:p-4 md:pt-4 md:gap-0">
      <aside className={`${mobileView === "list" ? "flex" : "hidden"} md:flex w-full md:w-[290px] lg:w-[320px] shrink-0 flex-col border-r border-border/70 bg-sidebar md:rounded-l-lg md:border md:border-r-0 overflow-hidden`}>
        <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 md:pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground">Harwick &amp; Sterne</p>
              <h1 className="mt-1 font-dm-sans text-[22px] font-semibold leading-tight">Channels</h1>
            </div>
            <span className="rounded-md border border-border bg-card px-2 py-1 text-[11px] tabular-nums text-muted-foreground">{channels.reduce((total, channel) => total + channel.unread, 0)} unread</span>
          </div>
          <div className="relative mt-5">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input aria-label="Find a conversation" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a conversation" className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40" />
          </div>
          <div className="mt-4 flex gap-1 rounded-md bg-muted p-1" role="group" aria-label="Conversation filter">
            <Button size="sm" variant={listMode === "all" ? "secondary" : "ghost"} onClick={() => setListMode("all")} className="h-8 flex-1 rounded-sm text-xs">All</Button>
            <Button size="sm" variant={listMode === "saved" ? "secondary" : "ghost"} onClick={() => setListMode("saved")} className="h-8 flex-1 rounded-sm text-xs">Saved</Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-6">
          <div className="px-3 pb-2 pt-2 text-[11px] font-medium text-muted-foreground">Channels</div>
          {channelList.map((channel) => (
            <Button key={channel.name} variant="ghost" onClick={() => openThread(channel.name, "channel")} className={`mb-0.5 flex h-11 w-full items-center justify-start gap-3 rounded-md px-3 font-normal ${activeKind === "channel" && active === channel.name ? "bg-selected text-selected-foreground hover:bg-selected" : "text-muted-foreground hover:text-foreground"}`}>
              {channel.private ? <Lock className="h-4 w-4 shrink-0" strokeWidth={1.7} /> : <Hash className="h-4 w-4 shrink-0" strokeWidth={1.7} />}
              <span className="min-w-0 flex-1 truncate text-left text-[13px]">{channel.name}</span>
              {channel.unread > 0 && <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[11px] tabular-nums text-foreground">{channel.unread}</span>}
            </Button>
          ))}
          <div className="px-3 pb-2 pt-6 text-[11px] font-medium text-muted-foreground">Direct messages</div>
          {dmList.map((person) => (
            <Button key={person.name} variant="ghost" onClick={() => openThread(person.name, "dm")} className={`mb-0.5 flex h-12 w-full items-center justify-start gap-3 rounded-md px-3 font-normal ${activeKind === "dm" && active === person.name ? "bg-selected text-selected-foreground hover:bg-selected" : "text-muted-foreground hover:text-foreground"}`}>
              {person.name === "Syra" ? <SyraMark size={27} flat /> : <SmartAvatar name={person.name} size={48} className="h-7 w-7 rounded-full object-cover" alt={person.name} />}
              <span className="min-w-0 flex-1 truncate text-left text-[13px]">{person.name}</span>
              {person.status === "active" && <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--trend-up)]" aria-label="Online" />}
            </Button>
          ))}
          {channelList.length === 0 && dmList.length === 0 && <p className="px-3 py-6 text-[13px] text-muted-foreground">No conversations found.</p>}
        </div>
      </aside>

      <main className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex min-w-0 flex-1 flex-col bg-card md:rounded-r-lg md:border border-border/70`}>
        <header className="flex min-h-[68px] items-center gap-3 border-b border-border/70 px-4 pt-[env(safe-area-inset-top)] md:px-6 md:pt-0">
          <Button variant="ghost" size="icon" onClick={() => setMobileView("list")} aria-label="Back to channels" className="md:hidden h-9 w-9 shrink-0"><ArrowLeft className="h-5 w-5" /></Button>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
            {activeKind === "dm" ? active === "Syra" ? <SyraMark size={24} flat /> : <SmartAvatar name={active} size={48} className="h-9 w-9 rounded-md object-cover" alt={active} /> : isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-dm-sans text-[15px] font-semibold">{active}</h2>
            <p className="text-[11px] text-muted-foreground">{activeKind === "dm" ? "Direct message" : isPrivate ? "Private channel" : "Team channel"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSaved} aria-label={saved.includes(key) ? "Remove from saved" : "Save conversation"} title={saved.includes(key) ? "Remove from saved" : "Save conversation"} className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"><Bookmark className={`h-[17px] w-[17px] ${saved.includes(key) ? "fill-current text-foreground" : ""}`} /></Button>
          <Button variant="ghost" size="icon" onClick={() => { setSearchOpen((v) => !v); setMessageSearch(""); }} aria-label="Search messages" title="Search messages" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"><Search className="h-[17px] w-[17px]" /></Button>
        </header>
        {searchOpen && <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2 md:px-6"><Search className="h-4 w-4 text-muted-foreground" /><input autoFocus aria-label="Search this conversation" value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)} placeholder={`Search ${active}`} className="h-8 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" /><Button variant="ghost" size="icon" onClick={() => { setSearchOpen(false); setMessageSearch(""); }} aria-label="Close search" className="h-8 w-8"><X className="h-4 w-4" /></Button></div>}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-[790px]">
            <div className="mb-8 border-b border-border/70 pb-5">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-md bg-muted text-muted-foreground">{activeKind === "channel" ? isPrivate ? <Lock className="h-5 w-5" /> : <Hash className="h-5 w-5" /> : <SmartAvatar name={active} size={48} className="h-11 w-11 rounded-md object-cover" alt={active} />}</div>
              <h3 className="font-dm-sans text-[21px] font-semibold">{activeKind === "channel" ? `# ${active}` : active}</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">{activeKind === "channel" ? "A place to keep the conversation moving." : "Your conversation with this teammate."}</p>
            </div>
            {visibleMessages.length === 0 && <p className="py-8 text-center text-[13px] text-muted-foreground">No messages found.</p>}
            <div className="space-y-7">
              {visibleMessages.map((message, i) => (
                <article key={`${message.user}-${i}-${message.time}`} className="group flex items-start gap-3.5">
                  <div className="shrink-0">{message.ai ? <SyraMark size={36} flat /> : <SmartAvatar name={message.user} size={72} className="h-9 w-9 rounded-md object-cover" alt={message.user} />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"><span className="font-dm-sans text-[13px] font-semibold">{message.user}</span>{message.ai && <span className="rounded-sm bg-selected px-1.5 py-0.5 text-[10px] font-medium text-selected-foreground">AI</span>}<time className="text-[11px] text-muted-foreground">{message.time}</time></div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-[13.5px] leading-[1.65] text-foreground/85">{message.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-8 md:pb-6">
          <div className="mx-auto max-w-[790px] rounded-md border border-border bg-background transition-colors focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-ring/10">
            <textarea aria-label={`Message ${active}`} rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={activeKind === "channel" ? `Message #${active}` : `Message ${active}`} className="min-h-[70px] w-full resize-none bg-transparent px-4 pt-3 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground" />
            <div className="flex items-center justify-between border-t border-border/60 px-2 py-1.5">
              <span className="px-2 text-[11px] text-muted-foreground">Shift + Enter for a new line</span>
              <Button size="sm" onClick={send} disabled={!draft.trim()} aria-label="Send message" className="h-8 gap-2 rounded-md px-3 text-[12px]"><Send className="h-3.5 w-3.5" /> Send</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
