import { useEffect, useRef } from "react";

export type SyraMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: { source: string; title: string }[];
};

/** Grounded chat transcript shown above the Syra composer. */
export function SyraChatThread({
  messages,
  thinking,
}: {
  messages: SyraMessage[];
  thinking: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, thinking]);

  return (
    <div className="w-full max-w-3xl max-h-[42vh] overflow-y-auto no-scrollbar rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-sm">
      <div className="space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            {m.role === "user" ? (
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-[13.5px] leading-[1.55] text-foreground">
                {m.content}
              </div>
            ) : (
              <div className="max-w-[92%]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Syra
                </div>
                <p className="mt-1 whitespace-pre-line text-[14px] leading-[1.6] tracking-[-0.011em] text-foreground/95">
                  {m.content}
                </p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
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
          <div className="flex items-center gap-1.5 text-muted-foreground">
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
