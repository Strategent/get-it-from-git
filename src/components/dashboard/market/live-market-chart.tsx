import { useEffect, useMemo, useRef, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

/**
 * LiveMarketChart — real-time crypto price chart driven by Binance's public
 * WebSocket. No API key, no auth, no rate limits for public trade streams.
 *
 * Data flow:
 *   1. On mount, seed the history buffer from Binance REST klines (1m, 60 bars).
 *   2. Open ws://stream.binance.com:9443/ws/{symbol}@trade for tick updates.
 *   3. Roll the buffer forward on each tick; re-render an SVG polyline.
 *
 * The chart is intentionally lightweight (SVG, no chart lib) so it fits the
 * card aesthetic and stays performant inside the bento grid.
 */

type Point = { t: number; p: number };

const SYMBOLS = [
  { id: "BTCUSDT", label: "BTC" },
  { id: "ETHUSDT", label: "ETH" },
  { id: "SOLUSDT", label: "SOL" },
] as const;

type SymbolId = (typeof SYMBOLS)[number]["id"];

const MAX_POINTS = 120;

function fmtPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return p.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function LiveMarketChart({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const [symbol, setSymbol] = useState<SymbolId>("BTCUSDT");
  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  // Seed history + open WS on symbol change.
  useEffect(() => {
    let cancelled = false;
    setStatus("connecting");
    setPoints([]);

    // 1) Seed with the last 60 closed 1-minute candles so the chart is never empty.
    (async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=60`,
        );
        if (!res.ok) throw new Error("seed failed");
        const rows: unknown[] = await res.json();
        if (cancelled) return;
        const seeded: Point[] = rows.map((r) => {
          const row = r as [number, string, string, string, string];
          return { t: row[0], p: parseFloat(row[4]) };
        });
        setPoints(seeded);
      } catch {
        // If REST fails we just start empty and let WS fill it in.
      }
    })();

    // 2) Live ticks via public WebSocket.
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`,
    );
    wsRef.current = ws;

    ws.onopen = () => !cancelled && setStatus("live");
    ws.onerror = () => !cancelled && setStatus("offline");
    ws.onclose = () => !cancelled && setStatus((s) => (s === "live" ? "offline" : s));
    ws.onmessage = (evt) => {
      if (cancelled) return;
      try {
        const data = JSON.parse(evt.data as string) as { p: string; T: number };
        const price = parseFloat(data.p);
        if (!Number.isFinite(price)) return;
        setPoints((prev) => {
          const next = prev.length >= MAX_POINTS ? prev.slice(1) : prev.slice();
          next.push({ t: data.T, p: price });
          return next;
        });
      } catch {
        /* ignore malformed frames */
      }
    };

    return () => {
      cancelled = true;
      try {
        ws.close();
      } catch {
        /* noop */
      }
      wsRef.current = null;
    };
  }, [symbol]);

  const { path, area, min, max, first, last, changePct } = useMemo(() => {
    if (points.length < 2) {
      return {
        path: "",
        area: "",
        min: 0,
        max: 0,
        first: 0,
        last: 0,
        changePct: 0,
      };
    }
    const prices = points.map((p) => p.p);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const w = 100;
    const h = 100;
    const step = w / (points.length - 1);
    const coords = points.map((p, i) => {
      const x = i * step;
      const y = h - ((p.p - min) / range) * h;
      return [x, y] as const;
    });
    const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;
    const first = prices[0];
    const last = prices[prices.length - 1];
    const changePct = ((last - first) / first) * 100;
    return { path, area, min, max, first, last, changePct };
  }, [points]);

  const up = changePct >= 0;
  const strokeClass = up
    ? "stroke-emerald-500 dark:stroke-emerald-400"
    : "stroke-red-500 dark:stroke-red-400";
  const fillClass = up
    ? "fill-emerald-500/10 dark:fill-emerald-400/10"
    : "fill-red-500/10 dark:fill-red-400/10";

  return (
    <div className={`flex min-h-0 w-full flex-1 flex-col ${className}`}>
      {/* Header — symbol switcher + live price */}
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
              {symbol.replace("USDT", "/USDT")}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] ${
                status === "live"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : status === "connecting"
                    ? "text-muted-foreground"
                    : "text-red-500"
              }`}
            >
              <span className="relative grid h-1.5 w-1.5 place-items-center">
                {status === "live" && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
                )}
                <span
                  className={`relative h-1.5 w-1.5 rounded-full ${
                    status === "live"
                      ? "bg-emerald-500"
                      : status === "connecting"
                        ? "bg-muted-foreground/60"
                        : "bg-red-500"
                  }`}
                />
              </span>
              {status}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`font-semibold tabular-nums tracking-tight text-foreground ${
                compact ? "text-[18px]" : "text-[22px]"
              }`}
            >
              {last ? `$${fmtPrice(last)}` : "—"}
            </span>
            {points.length >= 2 && (
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${
                  up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                }`}
              >
                {up ? (
                  <TrendingUp className="h-3 w-3" strokeWidth={2.25} />
                ) : (
                  <TrendingDown className="h-3 w-3" strokeWidth={2.25} />
                )}
                {up ? "+" : ""}
                {changePct.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-foreground/[0.04] p-0.5">
          {SYMBOLS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSymbol(s.id)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide transition-colors ${
                symbol === s.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative mt-2 min-h-0 flex-1">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {points.length >= 2 && (
            <>
              <path d={area} className={fillClass} />
              <path
                d={path}
                fill="none"
                strokeWidth={1.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className={strokeClass}
              />
            </>
          )}
        </svg>
        {points.length < 2 && (
          <div className="absolute inset-0 grid place-items-center text-[10.5px] text-muted-foreground">
            {status === "offline" ? "Feed unavailable" : "Loading market feed…"}
          </div>
        )}
      </div>

      {/* Footer scale */}
      {points.length >= 2 && !compact && (
        <div className="mt-1.5 flex shrink-0 items-center justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>L ${fmtPrice(min)}</span>
          <span className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">
            Binance · live
          </span>
          <span>H ${fmtPrice(max)}</span>
        </div>
      )}
    </div>
  );
}
