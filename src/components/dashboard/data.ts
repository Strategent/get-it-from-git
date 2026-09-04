// Dashboard mock data — moved verbatim out of the original routes/index.tsx.
// Behavior and content are unchanged; this is the data layer for the modules.

export const planner = [
  { label: "Review Hartley Trust quarterly statements", date: "16 Jan", done: false },
  { label: "Call with Denis Marlow — portfolio rebalance", date: "16 Jan", done: true },
  { label: "Prepare IPS for Office B123 onboarding", date: "15 Jan", done: false },
  { label: "Coordinate estate planning paperwork", date: "15 Jan", done: false },
  { label: "Meeting with the CIO of the Valdai Fund…", date: "15 Jan", done: false },
];

export const todaysMeetings = [
  {
    client: "Hartley Family Trust",
    time: "09:00 – 10:00",
    status: "Confirmed",
    zoom: "https://zoom.us/j/0000000001",
  },
  {
    client: "Denis Marlow — Rebalance",
    time: "11:30 – 12:15",
    status: "Confirmed",
    zoom: "https://zoom.us/j/0000000002",
  },
  {
    client: "Sterling Holdings Review",
    time: "14:00 – 15:00",
    status: "Pending",
    zoom: "https://zoom.us/j/0000000003",
  },
  {
    client: "Caldwell Estate Planning",
    time: "16:30 – 17:15",
    status: "Confirmed",
    zoom: "https://zoom.us/j/0000000004",
  },
];

export const callQueue = [
  {
    name: "Marcus Vahlen",
    org: "Inbound · website form",
    status: "live",
    dur: "01:42",
    intent: "New lead · booking intro call",
    recording: true,
  },
  {
    name: "Priya Shah",
    org: "Referral · Google Ads",
    status: "queued",
    dur: "00:18",
    intent: "Qualifying — $2.4M rollover",
    recording: false,
  },
  {
    name: "Theo Laurent",
    org: "Inbound · LinkedIn",
    status: "queued",
    dur: "00:09",
    intent: "Scheduling discovery call",
    recording: false,
  },
];

export const emails = [
  {
    sender: "Elena Smith",
    title: "Associate, Harwick & Sterne",
    subject: "IPS draft ready for review",
    time: "11:02",
    chips: ["Draft ready"],
    tasks: 1,
    preview:
      "John — quick check on the revised allocation. Could we firm up the IPS this week and lock a 15-minute call before Friday's committee?",
  },
  {
    sender: "Emma Reeves",
    title: "Trustee, Hartley Family Trust",
    subject: "Q4 statements attached",
    time: "10:14",
    chips: [],
    tasks: 2,
    preview:
      "Attaching the Q4 statements for the trust accounts. Would appreciate your view on the muni ladder before our review next week.",
  },
  {
    sender: "Adrian Engman",
    title: "CFO, Sterling Holdings LLC",
    subject: "Rebalance confirmation",
    time: "09:48",
    chips: ["Draft ready"],
    tasks: 0,
    preview:
      "Confirming we're good to proceed with the proposed rebalance. Please send the final trade ticket for signature today.",
  },
  {
    sender: "Claire Bennett",
    title: "Principal, Caldwell Estate",
    subject: "Signed engagement letter",
    time: "Yest",
    chips: [],
    tasks: 0,
    preview:
      "Engagement letter is countersigned and uploaded to the vault. Let me know the next steps for KYC and onboarding.",
  },
  {
    sender: "Daniel Brooks",
    title: "Managing Partner, Marlow Capital",
    subject: "Portfolio rebalance — agenda",
    time: "Yest",
    chips: ["Draft ready"],
    tasks: 1,
    preview:
      "Sharing the agenda for tomorrow's rebalance call. Want to spend most of the time on the alts sleeve and 2026 tax positioning.",
  },
  {
    sender: "Lena Foster",
    title: "Family Office Director, Beaumont Group",
    subject: "Proposal — private credit allocation",
    time: "Mon",
    chips: [],
    tasks: 0,
    preview:
      "Following up on our proposal for the private credit sleeve. Happy to revise terms once you've had a chance to review with the committee.",
  },
  {
    sender: "Maya Lopez",
    title: "GC, Castellanos Holdings",
    subject: "Estate planning — SLAT structure",
    time: "Mon",
    chips: [],
    tasks: 1,
    preview:
      "Counsel suggested we revisit the SLAT structure ahead of the 2026 sunset. Could we schedule 30 minutes to align on a timeline?",
  },
  {
    sender: "Tom Whitaker",
    title: "CFO, Meridian Group",
    subject: "Invoice 4471 — payment terms",
    time: "Mon",
    chips: [],
    tasks: 0,
    preview:
      "Accounting asked whether we can move to net-45 for the remainder of the term. Invoice 4471 is queued either way — just want to confirm.",
  },
];

export const team = [
  {
    initials: "OP",
    name: "Olivia Park",
    role: "Associate",
    task: "Drafting IPS — Office B123",
    status: "online",
  },
  {
    initials: "ML",
    name: "Marcus Lee",
    role: "Analyst",
    task: "Reviewing Hartley statements",
    status: "online",
  },
  {
    initials: "RC",
    name: "Rina Cho",
    role: "Ops",
    task: "KYC follow-up — Caldwell",
    status: "away",
  },
  {
    initials: "DM",
    name: "David Mensah",
    role: "Advisor",
    task: "Prep for Marlow rebalance",
    status: "online",
  },
];

export const channels = [
  { name: "general", preview: "Olivia: morning standup at 9", unread: 3 },
  { name: "deals-pipeline", preview: "Marcus: Caldwell signed!", unread: 1 },
  { name: "research", preview: "David: new note on 10Y", unread: 0 },
  { name: "ops", preview: "Rina: KYC batch cleared", unread: 5 },
  { name: "random", preview: "Lunch order at 12:30", unread: 0 },
];

export const docTemplates = [
  { name: "Engagement Letter", uses: 142 },
  { name: "IPS Template", uses: 87 },
  { name: "KYC Packet", uses: 213 },
  { name: "Quarterly Review", uses: 64 },
];

export type Story = { source: string; ago: string; headline: string; img: string; tint: string };

export const bulletin: Record<string, Story[]> = {
  Trending: [
    {
      source: "Bloomberg",
      ago: "12m",
      headline: "Treasuries rally as inflation prints cool below forecast",
      img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=70",
      tint: "from-amber-500/40 to-rose-600/30",
    },
    {
      source: "WSJ",
      ago: "38m",
      headline: "Family offices push deeper into private credit",
      img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=70",
      tint: "from-indigo-500/40 to-blue-600/30",
    },
    {
      source: "Reuters",
      ago: "1h",
      headline: "Megacap earnings lift broader market breadth",
      img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=70",
      tint: "from-emerald-500/40 to-teal-600/30",
    },
  ],
  Fed: [
    {
      source: "FedWire",
      ago: "22m",
      headline: "Powell signals patience as committee weighs next move",
      img: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=70",
      tint: "from-slate-500/40 to-zinc-700/30",
    },
    {
      source: "Bloomberg",
      ago: "1h",
      headline: "Dot plot revisions hint at one more cut in 2026",
      img: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?auto=format&fit=crop&w=600&q=70",
      tint: "from-indigo-500/40 to-violet-600/30",
    },
    {
      source: "Reuters",
      ago: "3h",
      headline: "Balance sheet runoff to slow next quarter",
      img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=70",
      tint: "from-cyan-500/40 to-sky-600/30",
    },
  ],
  Markets: [
    {
      source: "S&P",
      ago: "8m",
      headline: "S&P 500 closes +0.42% as breadth meaningfully improves",
      img: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=800&q=70",
      tint: "from-emerald-500/40 to-green-600/30",
    },
    {
      source: "Markets",
      ago: "1h",
      headline: "Energy leads sectors as utilities lag the tape",
      img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=70",
      tint: "from-amber-500/40 to-orange-600/30",
    },
    {
      source: "Bloomberg",
      ago: "5h",
      headline: "Corporate buybacks on pace for record quarter",
      img: "https://images.unsplash.com/photo-1611324586057-fcec1f95dc35?auto=format&fit=crop&w=600&q=70",
      tint: "from-blue-500/40 to-indigo-600/30",
    },
  ],
  Estate: [
    {
      source: "Trusts & Estates",
      ago: "1h",
      headline: "Sunset of estate exemption looms as 2026 advances",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=70",
      tint: "from-rose-500/40 to-pink-600/30",
    },
    {
      source: "Kitces",
      ago: "3h",
      headline: "Grantor trust strategies pulled back under review",
      img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=70",
      tint: "from-violet-500/40 to-purple-600/30",
    },
    {
      source: "FA Mag",
      ago: "8h",
      headline: "SLATs regain favor amid sunset planning push",
      img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=70",
      tint: "from-teal-500/40 to-cyan-600/30",
    },
  ],
};
