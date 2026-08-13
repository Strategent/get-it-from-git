import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import {
  Hash,
  Lock,
  Send,
  Plus,
  ChevronDown,
  Smile,
  Paperclip,
  AtSign,
  Bookmark,
  Bell,
  Search,
  ArrowLeft,
  X,
} from "lucide-react";
import { avatarUrl } from "@/lib/avatar";
import { SmartAvatar } from "@/components/smart-avatar";
import { SyraMark } from "@/components/syra-mark";

export const Route = createFileRoute("/channels")({
  component: ChannelsPage,
  head: () => ({ meta: [{ title: "Channels — strategent" }] }),
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
  const { theme } = useTheme();
  const [showSyraTip, setShowSyraTip] = useState(true);
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("chat");

  const dark = theme === "dark";
  const isPrivate = activeKind === "channel" && channels.find((c) => c.name === active)?.private;

  const palette = dark
    ? {
        sidebar: "#1E1525",
        sidebarHover: "rgba(255,255,255,0.08)",
        sidebarText: "rgba(255,255,255,0.72)",
        chatBg: "#1A1D21",
        chatBorder: "rgba(255,255,255,0.08)",
        textPrimary: "#E8E8E8",
        textMuted: "rgba(232,232,232,0.55)",
        inputBg: "#222529",
      }
    : {
        sidebar: "#3F0E40",
        sidebarHover: "rgba(255,255,255,0.12)",
        sidebarText: "rgba(255,255,255,0.85)",
        chatBg: "#FFFFFF",
        chatBorder: "rgba(0,0,0,0.08)",
        textPrimary: "#1D1C1D",
        textMuted: "rgba(29,28,29,0.6)",
        inputBg: "#FFFFFF",
      };

  const openThread = (name: string, kind: "channel" | "dm") => {
    setActive(name);
    setActiveKind(kind);
    setMobileView("chat");
  };

  const currentMessages = threads[active] ?? [];

  return (
    <div
      className="w-full overflow-hidden"
      style={{ height: "calc(100dvh - 53px)", background: palette.chatBg }}
    >
      <div className="md:grid md:grid-cols-12 h-full w-full relative">
        {/* Workspace sidebar */}
        <aside
          className={`${mobileView === "sidebar" ? "flex" : "hidden"} md:flex md:col-span-3 lg:col-span-3 flex-col h-full absolute inset-0 md:relative z-20`}
          style={{ background: palette.sidebar, color: palette.sidebarText }}
        >
          {/* Workspace header */}
          <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <button className="flex items-center gap-1 text-white font-semibold text-[13.5px] md:text-[12.5px] whitespace-nowrap truncate min-w-0">
              <span className="truncate">Harwick &amp; Sterne</span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-6">
            {/* Quick links */}
            <div className="px-2 pt-1 pb-1 text-[14px] md:text-[13px] space-y-0.5">
              {[
                { icon: AtSign, label: "Mentions" },
                { icon: Bookmark, label: "Saved" },
                { icon: Bell, label: "Activity" },
              ].map((l) => (
                <button
                  key={l.label}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 md:py-1.5 rounded-md transition-colors"
                  style={{ color: palette.sidebarText }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = palette.sidebarHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <l.icon className="h-3.5 w-3.5 opacity-80" />
                  {l.label}
                </button>
              ))}
            </div>

            {/* Channels */}
            <div className="px-2 mt-3">
              <div className="flex items-center justify-between px-2 py-1 text-[12px] uppercase tracking-wider text-white/45">
                <span>Channels</span>
                <button className="opacity-70 hover:opacity-100"><Plus className="h-3 w-3" /></button>
              </div>
              <div className="space-y-0.5 mt-1">
                {channels.map((c) => {
                  const isActive = active === c.name && activeKind === "channel";
                  return (
                    <button
                      key={c.name}
                      onClick={() => openThread(c.name, "channel")}
                      className="w-full flex items-center gap-2 px-2.5 py-2 md:py-1 rounded-md text-[14.5px] md:text-[13.5px] transition-colors"
                      style={{
                        background: isActive ? "#1164A3" : "transparent",
                        color: isActive ? "#FFFFFF" : c.unread ? "#FFFFFF" : palette.sidebarText,
                        fontWeight: c.unread && !isActive ? 700 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = palette.sidebarHover;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {c.private ? <Lock className="h-3 w-3" /> : <Hash className="h-3.5 w-3.5 opacity-80" />}
                      <span className="flex-1 text-left truncate">{c.name}</span>
                      {c.unread > 0 && (
                        <span className="text-[11px] font-semibold rounded-full bg-[#CB2431] text-white px-1.5 min-w-[18px] text-center">
                          {c.unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DMs */}
            <div className="px-2 mt-4">
              <div className="flex items-center justify-between px-2 py-1 text-[12px] uppercase tracking-wider text-white/45">
                <span>Direct messages</span>
                <button className="opacity-70 hover:opacity-100"><Plus className="h-3 w-3" /></button>
              </div>
              <div className="space-y-0.5 mt-1">
                {dms.map((d) => {
                  const isActive = active === d.name && activeKind === "dm";
                  return (
                    <button
                      key={d.name}
                      onClick={() => openThread(d.name, "dm")}
                      className="w-full flex items-center gap-2 px-2.5 py-2 md:py-1 rounded-md text-[14.5px] md:text-[13.5px] transition-colors"
                      style={{
                        background: isActive ? "#1164A3" : "transparent",
                        color: isActive ? "#FFFFFF" : palette.sidebarText,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = palette.sidebarHover;
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span className="relative">
                        {d.status === "ai" ? (
                          <SyraMark size={14} flat />
                        ) : (
                          <span
                            className="h-2 w-2 rounded-full inline-block"
                            style={{
                              background: d.status === "active" ? "#2BAC76" : "transparent",
                              border: d.status === "active" ? "none" : "1.5px solid rgba(255,255,255,0.5)",
                            }}
                          />
                        )}
                      </span>
                      <span className="flex-1 text-left truncate">{d.name}</span>
                      {d.name === "Syra" && (
                        <span className="text-[9.5px] px-1.5 py-px rounded bg-white/10 text-white/80">AI</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main pane */}
        <main
          className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex md:col-span-9 lg:col-span-9 flex-col min-w-0 h-full`}
          style={{ background: palette.chatBg, color: palette.textPrimary }}
        >
          {/* Channel header */}
          <div
            className="flex items-center justify-between gap-2 px-3 md:px-5 py-2.5 md:py-3 border-b pt-[max(0.625rem,env(safe-area-inset-top))] md:pt-3"
            style={{ borderColor: palette.chatBorder }}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <button
                onClick={() => setMobileView("sidebar")}
                className="md:hidden grid h-8 w-8 -ml-1 place-items-center rounded-md shrink-0"
                style={{ color: palette.textPrimary }}
                aria-label="Channels"
              >
                <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2} />
              </button>
              {activeKind === "channel" ? (
                isPrivate ? (
                  <Lock className="h-3.5 w-3.5 shrink-0" style={{ color: palette.textMuted }} />
                ) : (
                  <Hash className="h-4 w-4 shrink-0" style={{ color: palette.textMuted }} />
                )
              ) : (
                <span className="shrink-0">
                  {active === "Syra" ? (
                    <SyraMark size={16} flat />
                  ) : (
                    <SmartAvatar name={active} size={48} className="h-4 w-4 rounded object-cover" />
                  )}
                </span>
              )}
              <div className="font-bold text-[15px] truncate">{active}</div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: palette.textMuted }} />
            </div>
            <div
              className="hidden md:flex items-center gap-2 rounded-md border px-2 py-1 text-[12px]"
              style={{ borderColor: palette.chatBorder, color: palette.textMuted }}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search {active}</span>
            </div>
            <button
              className="md:hidden grid h-8 w-8 place-items-center rounded-md"
              style={{ color: palette.textMuted }}
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Syra mention tip card */}
          {showSyraTip && (
            <div
              className="mx-3 md:mx-4 mt-3 rounded-lg border p-3 md:p-3.5 flex items-start gap-3"
              style={{
                borderColor: palette.chatBorder,
                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              }}
            >
              <SyraMark size={32} className="shrink-0 rounded-md md:!h-9 md:!w-9" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] md:text-[13.5px] font-semibold">Talk to Syra in any channel</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", color: palette.textMuted }}
                  >
                    AI
                  </span>
                </div>
                <p className="text-[12px] md:text-[12.5px] mt-0.5" style={{ color: palette.textMuted }}>
                  Mention{" "}
                  <span
                    className="inline-flex items-center rounded px-1 font-medium"
                    style={{
                      background: dark ? "rgba(29,155,209,0.18)" : "rgba(29,155,209,0.12)",
                      color: dark ? "#79C0FF" : "#1264A3",
                    }}
                  >
                    @Syra
                  </span>{" "}
                  in a message to delegate tasks — draft replies, pull data, or summarize threads.
                </p>
              </div>
              <button
                onClick={() => setShowSyraTip(false)}
                className="shrink-0 grid h-6 w-6 place-items-center rounded-md hover:bg-black/5"
                style={{ color: palette.textMuted }}
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-auto px-3 md:px-4 py-4 space-y-4">
            {currentMessages.map((m, i) => {
              const isAi = m.ai;
              return (
                <div key={i} className="flex gap-2.5 md:gap-3 group">
                  {isAi ? (
                    <SyraMark size={36} className="shrink-0 rounded-md" />
                  ) : (
                    <SmartAvatar name={m.user} size={72} className="h-9 w-9 rounded-md object-cover shrink-0" alt={m.user}} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <div className="font-bold text-[14px]" style={{ color: palette.textPrimary }}>
                        {m.user}
                      </div>
                      {isAi && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                            color: palette.textMuted,
                          }}
                        >
                          APP
                        </span>
                      )}
                      <div className="text-[11.5px]" style={{ color: palette.textMuted }}>
                        {m.time}
                      </div>
                    </div>
                    <div
                      className="text-[14px] mt-0.5 leading-relaxed break-words"
                      style={{ color: palette.textPrimary }}
                    >
                      {m.mentionsSyra ? (
                        <>
                          {m.text.split("@Syra")[0]}
                          <span
                            className="inline-flex items-center rounded px-1 font-medium"
                            style={{
                              background: dark ? "rgba(29,155,209,0.18)" : "rgba(29,155,209,0.12)",
                              color: dark ? "#79C0FF" : "#1264A3",
                            }}
                          >
                            @Syra
                          </span>
                          {m.text.split("@Syra")[1]}
                        </>
                      ) : (
                        m.text
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="px-3 md:px-4 pb-3 md:pb-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div
              className="rounded-lg border"
              style={{ borderColor: palette.chatBorder, background: palette.inputBg }}
            >
              <input
                placeholder={activeKind === "channel" ? `Message #${active}` : `Message ${active}`}
                className="w-full bg-transparent px-3.5 pt-3 pb-2 text-[14px] focus:outline-none"
                style={{ color: palette.textPrimary }}
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-0.5" style={{ color: palette.textMuted }}>
                  {[Plus, Paperclip, AtSign, Smile].map((Ic, idx) => (
                    <button
                      key={idx}
                      className="grid h-7 w-7 place-items-center rounded-md hover:bg-black/10 transition-colors"
                    >
                      <Ic className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
                <button
                  className="grid h-7 w-7 place-items-center rounded-md text-white"
                  style={{ background: "#007A5A" }}
                  aria-label="Send"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-1.5 text-[11px]" style={{ color: palette.textMuted }}>
              Tip: type <span className="font-semibold">@Syra</span> to delegate a task.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
