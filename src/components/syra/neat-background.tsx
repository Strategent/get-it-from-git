import { useEffect, useRef } from "react";

const config = {
  colors: [
    // On-brand neutrals: lavender, moss, maroon, oceanic blue, and two deep anchors.
    { color: "#8E86C4", enabled: true },
    { color: "#5B6B45", enabled: true },
    { color: "#6E2F38", enabled: true },
    { color: "#2C4A5C", enabled: true },
    { color: "#23262B", enabled: true },
    { color: "#B9AFC6", enabled: true },
  ],
  speed: 2.5,
  horizontalPressure: 3,
  verticalPressure: 4,
  waveFrequencyX: 2,
  waveFrequencyY: 3,
  waveAmplitude: 5,
  shadows: 2,
  highlights: 3,
  colorBrightness: 0.95,
  colorSaturation: 2,
  wireframe: false,
  antialias: false,
  colorBlending: 8,
  backgroundColor: "#1B1E24",
  backgroundAlpha: 1,
  grainScale: 0,
  grainSparsity: 0,
  grainIntensity: 0,
  grainSpeed: 1,
  resolution: 1,
  yOffset: 1274,
};

export function NeatBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let destroy: (() => void) | undefined;
    let cancelled = false;

    import("@firecms/neat").then(({ NeatGradient }) => {
      if (cancelled || !ref.current) return;
      const gradient = new NeatGradient({ ref: ref.current, ...(config as any) });
      destroy = () => gradient.destroy();
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute pointer-events-none"
      style={{
        left: "-6%",
        top: "-4%",
        width: "112%",
        height: "calc(100% + 120px)",
        filter: "saturate(0.85) contrast(0.98)",
      }}
    />
  );
}