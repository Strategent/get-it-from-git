import { useEffect, useMemo, useState } from "react";
import { Panel } from "@/components/ui/panel";

/**
 * MarketsCard — sleek monochrome market widget: one S&P 500 sparkline up top,
 * three commodity tickers (Crude, Gold, Silver) underneath. Direction color is
 * tasteful and minimal so the card stays light. Exported as BulletinCard to
 * preserve the existing import path.
 */

type Ticker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  decimals?: number;
  unit?: string;
};

const SEED_TICKERS: Ticker[] = [
  { symbol: "CL", name: "Crude Oil", price: 78.42, change: 0.31, decimals: 2, unit: "/bbl" },
  { symbol: "GC", name: "Gold", price: 2418.6, change: -4.2, decimals: 1, unit: "/oz" },
  { symbol: "SI", name: "Silver", price: 30.84, change: 0.12, decimals: 2, unit: "/oz" },
];

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Deterministic seeded series so SSR and client match. */
function buildSeries(base: number, points = 48, seed = 7) {
  const out: number[] = [];
  let v = base * 0.992;
  let s = seed;
  for (let i = 0; i < points; i++) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280 - 0.5;
    v += rnd * base * 0.0018 + (base - v) * 0.02;
    out.push(v);
  }
  out[out.length - 1] = base;
  return out;
}

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const { path, area, w, h } = useMemo(() => {
    const w = 280;
    const h = 64;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);
    const pts = data.map((d, i) => {
      const x = i * step;
      const y = h - ((d - min) / range) * (h - 6) - 3;
      return [x, y] as const;
    });
    const path = pts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;
    return { path, area, w, h };
  }, [data]);
  const stroke = up ? "var(--trend-up)" : "var(--trend-down)";
  const fillTop = up ? "var(--trend-up-soft)" : "var(--trend-down-soft)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fillTop} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BulletinCard() {
  const spxBase = 5482.13;
  const spxChange = 18.42;
  const spxPct = (spxChange / (spxBase - spxChange)) * 100;
  const spxUp = spxChange >= 0;
  const series = useMemo(() => buildSeries(spxBase), [spxBase]);

  const [tickers, setTickers] = useState<Ticker[]>(SEED_TICKERS);
  const [clock, setClock] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => {
          const decimals = t.decimals ?? 2;
          const drift = (Math.random() - 0.5) * 0.0006 * t.price;
          const price = +(t.price + drift).toFixed(decimals);
          const change = +(t.change + drift).toFixed(decimals);
          return { ...t, price, change };
        }),
      );
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <Panel
      label="Markets"
      bodyClassName="gap-4"
      action={
        <span className="inline-flex items-center gap-1.5 text-[10.5px] tabular-nums text-muted-foreground/80">
          <span className="relative grid h-1.5 w-1.5 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-foreground/30" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-foreground/70" />
          </span>
          <span suppressHydrationWarning>{clock || "—"} ET</span>
        </span>
      }
    >
      {/* S&P 500 — headline + sparkline */}
      <div className="shrink-0">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[9.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              S&amp;P 500
            </div>
            <div className="mt-1 text-[22px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
              {fmt(spxBase)}
            </div>
          </div>
          <div
            className="text-right text-[11px] font-medium leading-tight tabular-nums"
            style={{ color: spxUp ? "var(--trend-up)" : "var(--trend-down)" }}
          >

            <div>
              {spxUp ? "+" : ""}
              {fmt(spxChange)}
            </div>
            <div className="text-muted-foreground/80">
              {spxUp ? "+" : ""}
              {fmt(spxPct, 2)}%
            </div>
          </div>
        </div>
        <div className="mt-2 h-14 w-full">
          <Sparkline data={series} up={spxUp} />
        </div>
      </div>

      <div className="h-px shrink-0 bg-border/50" />

      {/* Commodities — three rows, hairline dividers */}
      <div className="flex min-h-0 flex-1 flex-col">
        {tickers.map((t, i) => {
          const up = t.change >= 0;
          const pct = (t.change / Math.max(t.price - t.change, 0.0001)) * 100;
          return (
            <div
              key={t.symbol}
              className={`flex items-center gap-3 py-2.5 ${
                i === 0 ? "" : "border-t border-border/40"
              }`}
            >
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[12.5px] font-semibold tracking-tight text-foreground/95">
                  {t.name}
                </div>
                <div className="truncate text-[10px] text-muted-foreground/70">
                  {t.symbol}
                  {t.unit ? ` · USD${t.unit}` : ""}
                </div>
              </div>
              <div className="text-right leading-tight">
                <div className="text-[12.5px] font-semibold tabular-nums text-foreground/95">
                  {fmt(t.price, t.decimals ?? 2)}
                </div>
                <div
                  className="text-[10.5px] font-medium tabular-nums"
                  style={{ color: up ? "var(--trend-up)" : "var(--trend-down)" }}
                >

                  {up ? "+" : ""}
                  {fmt(pct, 2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
