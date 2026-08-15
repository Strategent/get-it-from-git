import { useEffect, useRef } from "react";

export type SyraMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: { source: string; title: string }[];
};

/**
 * Grounded chat transcript. Scrolls independently and sticks to the newest
 * message unless the user has scrolled up to read history.
 */
export function SyraChatThread({
  messages,
  thinking,
}: {
  messages: SyraMessage[];
  thinking: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    if (!stick.current) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, thinking, messages[messages.length - 1]?.content]);

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="h-full w-full overflow-y-auto overscroll-contain no-scrollbar"
      role="log"
      aria-live="polite"
      aria-label="Conversation with Syra"
    >
      <div className="mx-auto w-full max-w-3xl space-y-5 px-4 pb-6 pt-6">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`animate-fade-in ${m.role === "user" ? "flex justify-end" : ""}`}
          >
            {m.role === "user" ? (
              <div className="max-w-[82%] rounded-2xl rounded-br-md bg-card px-4 py-2.5 text-[14.5px] leading-[1.55] text-foreground shadow-lg">
                {m.content}
              </div>
            ) : (
              <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-card px-4 py-3 shadow-lg">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Syra
                </div>
                <p className="mt-1.5 whitespace-pre-line text-[14.5px] leading-[1.65] tracking-[-0.011em] text-foreground/95">
                  {m.content}
                </p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {m.sources.map((s) => (
                      <span
                        key={`${s.source}-${s.title}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2 py-[3px] text-[10.5px] text-muted-foreground"
                        title={s.title}
                      >
                        <span className="text-foreground/70">{s.source}</span>
                        <span className="opacity-40">·</span>
                        <span className="max-w-[160px] truncate">{s.title}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-card px-4 py-3 text-muted-foreground shadow-lg">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
