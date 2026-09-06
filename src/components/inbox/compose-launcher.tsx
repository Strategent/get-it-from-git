import { useRef, useState } from "react";
import { Feather, Mic, Square, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Mode = "manual" | "auto" | null;

/** Quill compose button: choose a blank email or an AI-assisted draft. */
export function ComposeLauncher({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<Mode>(null);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [brief, setBrief] = useState("");
  const [listening, setListening] = useState(false);
  const recognition = useRef<any>(null);

  const reset = () => {
    setTo("");
    setSubject("");
    setBody("");
    setBrief("");
    stopDictation();
  };

  const close = () => {
    setMode(null);
    reset();
  };

  const stopDictation = () => {
    try {
      recognition.current?.stop();
    } catch {
      /* no-op */
    }
    recognition.current = null;
    setListening(false);
  };

  const toggleDictation = () => {
    if (listening) {
      stopDictation();
      return;
    }
    const SR =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
    if (!SR) {
      toast.message("Dictation isn't supported in this browser");
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        text += e.results[i][0].transcript;
      }
      setBrief((prev) => (prev ? `${prev.trim()} ${text.trim()}` : text.trim()));
    };
    rec.onerror = () => stopDictation();
    rec.onend = () => setListening(false);
    recognition.current = rec;
    setListening(true);
    rec.start();
  };

  const generate = () => {
    if (!to.trim() || !brief.trim()) return;
    const name = to.split("@")[0].replace(/[._]/g, " ");
    const greeting = name.charAt(0).toUpperCase() + name.slice(1);
    setSubject(brief.trim().split(/[.!?]/)[0].slice(0, 60));
    setBody(
      `Hi ${greeting},\n\n${brief.trim()}\n\nHappy to walk through any of this whenever suits you.\n\nBest,\nJohn`,
    );
    stopDictation();
    setMode("manual");
    toast.message("Draft ready — review before sending");
  };

  const send = () => {
    if (!to.trim()) return;
    toast.success("Email sent");
    close();
  };

  const field =
    "w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Compose"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-card text-foreground/85 transition-colors hover:bg-foreground/[0.06] hover:text-foreground ${className}`}
          >
            <Feather className="h-[17px] w-[17px]" strokeWidth={1.75} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
          <DropdownMenuItem
            onClick={() => {
              reset();
              setMode("manual");
            }}
            className="rounded-xl px-3 py-2.5 text-[14px]"
          >
            Manual
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              reset();
              setMode("auto");
            }}
            className="rounded-xl px-3 py-2.5 text-[14px]"
          >
            <span className="flex-1">Auto-draft</span>
            <span className="rounded-full border border-border/60 px-1.5 py-px text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Beta
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Manual — blank email */}
      <Dialog open={mode === "manual"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-[34rem] gap-0 overflow-hidden rounded-[20px] border-border/60 p-0">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
            <span className="text-[13px] font-medium text-muted-foreground">New message</span>
            <button
              aria-label="Close"
              onClick={close}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-border/40">
            <div className="flex items-center gap-3 px-5 py-3">
              <span className="w-16 shrink-0 text-[12.5px] text-muted-foreground">To</span>
              <input
                autoFocus
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="name@company.com"
                className={field}
              />
            </div>
            <div className="flex items-center gap-3 px-5 py-3">
              <span className="w-16 shrink-0 text-[12.5px] text-muted-foreground">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className={field}
              />
            </div>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message…"
            className="min-h-[220px] w-full resize-none bg-transparent px-5 py-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 border-t border-border/50 px-5 py-3.5">
            <button
              onClick={close}
              className="rounded-[10px] px-3 py-2 text-[14px] text-muted-foreground hover:text-foreground"
            >
              Discard
            </button>
            <button
              onClick={send}
              disabled={!to.trim()}
              className="rounded-[10px] bg-foreground px-4 py-2 text-[14px] font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-draft — intent capture */}
      <Dialog open={mode === "auto"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-[30rem] gap-0 overflow-hidden rounded-[20px] border-border/60 p-0">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
            <span className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Auto-draft
            </span>
            <button
              aria-label="Close"
              onClick={close}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4 px-5 py-4">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Who is it to?
              </label>
              <input
                autoFocus
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Name or email"
                className="mt-1.5 w-full rounded-[12px] border border-border/60 bg-background px-3 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                What should it say?
              </label>
              <div className="relative mt-1.5">
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Confirm the quarterly review and share the updated allocation…"
                  className="min-h-[120px] w-full resize-none rounded-[12px] border border-border/60 bg-background px-3 py-2.5 pr-12 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none"
                />
                <button
                  onClick={toggleDictation}
                  aria-label={listening ? "Stop dictation" : "Dictate"}
                  className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full border transition-colors ${
                    listening
                      ? "border-transparent bg-foreground text-background"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {listening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {listening ? "Listening… tap to stop." : "Type or tap the mic to dictate."}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border/50 px-5 py-3.5">
            <button
              onClick={close}
              className="rounded-[10px] px-3 py-2 text-[14px] text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={generate}
              disabled={!to.trim() || !brief.trim()}
              className="rounded-[10px] bg-foreground px-4 py-2 text-[14px] font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Draft it
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
