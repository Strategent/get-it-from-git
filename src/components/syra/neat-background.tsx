import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";

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

/** Light mode: same motion, but a soft daylight wash so the canvas doesn't
 *  slam a dark block against the light app chrome. */
const lightConfig = {
  ...config,
  colors: [
    { color: "#C9C2E4", enabled: true },
    { color: "#B7C4A3", enabled: true },
    { color: "#D9B9BC", enabled: true },
    { color: "#AFC6D4", enabled: true },
    { color: "#EFEBE4", enabled: true },
    { color: "#E4DEEA", enabled: true },
  ],
  colorBrightness: 1.15,
  colorSaturation: 1,
  shadows: 1,
  highlights: 4,
  backgroundColor: "#F2EFEA",
};

export function NeatBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroy: (() => void) | undefined;
    let cancelled = false;

    import("@firecms/neat").then(({ NeatGradient }) => {
      if (cancelled || !ref.current) return;
      const gradient = new NeatGradient({ ref: ref.current, ...((isDark ? config : lightConfig) as any) });
      destroy = () => gradient.destroy();
      // Wait one frame so the first WebGL paint has landed before revealing
      // the canvas — otherwise a blank/transparent frame flashes on entry.
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && setReady(true)));
    });

    return () => {
      cancelled = true;
      setReady(false);
      destroy?.();
    };
  }, [isDark]);

  return (
    <>
      {/* Solid base in the gradient's own backdrop colour: present on the very
          first paint, so entering the route never flashes the app background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: isDark ? config.backgroundColor : lightConfig.backgroundColor }}
      />
      <canvas
        ref={ref}
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          left: "-6%",
          top: "-4%",
          width: "112%",
          height: "calc(100% + 120px)",
          opacity: ready ? 1 : 0,
          transition: "opacity 260ms ease-out",
          filter: isDark ? "saturate(0.85) contrast(0.98)" : "saturate(0.7) contrast(0.96) brightness(1.03)",
        }}
      />
    </>
  );
}