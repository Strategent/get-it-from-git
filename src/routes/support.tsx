import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHeader } from "@/components/page-shell";
import { LifeBuoy, Send, MessageSquare, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({ meta: [{ title: "Support — strategent" }] }),
});

const threads = [
  { id: 1, subject: "Calendar sync delay on Outlook", status: "open", updated: "12m ago", icon: AlertCircle },
  { id: 2, subject: "Request: bulk export for CRM contacts", status: "in review", updated: "2h ago", icon: Clock },
  { id: 3, subject: "Syra draft tone calibration", status: "resolved", updated: "Yesterday", icon: CheckCircle2 },
];

function SupportPage() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  return (
    <PageShell>
      <PageHeader
        eyebrow={<><LifeBuoy className="h-3.5 w-3.5" /> Support</>}
        title="Strategent Support"
        description="Message our team for fixes, updates, or new requests. We typically reply within a few hours."
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <div className="bento p-6 md:p-7 space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg grid place-items-center bg-white/[0.05] border border-white/10">
                <MessageSquare className="h-4 w-4 text-foreground/80" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[15px] font-medium tracking-tight">Open a new conversation</div>
                <div className="text-[12px] text-muted-foreground">Fixes, feature requests, or anything else.</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Subject</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Short summary of the issue or request"
                  className="mt-1.5 w-full h-10 px-3 rounded-lg bg-white/[0.03] border border-white/10 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  placeholder="Tell us what's happening, what you expected, and any context that helps."
                  className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-muted-foreground">Replies arrive to your inbox.</div>
                <Button className="h-9 px-4 text-[13px] gap-2">
                  <Send className="h-3.5 w-3.5" /> Send to Strategent
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="bento p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[13px] font-medium tracking-tight">Your conversations</div>
              <Badge className="bg-white/[0.06] text-foreground/80 border border-white/10 hover:bg-white/[0.06]">
                {threads.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {threads.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.05] transition-colors cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-md grid place-items-center bg-white/[0.05] border border-white/10 shrink-0">
                      <Icon className="h-3.5 w-3.5 text-foreground/80" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium truncate">{t.subject}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                        {t.status} · {t.updated}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bento p-5">
            <div className="text-[13px] font-medium tracking-tight mb-1">Need it urgently?</div>
            <div className="text-[12px] text-muted-foreground">
              Email <span className="text-foreground/80">team@strategent.app</span> and we'll prioritize it.
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}