import { useEffect, useRef } from "react";

const config = {
  colors: [
    { color: "#FF5772", enabled: true },
    { color: "#4CB4BB", enabled: true },
    { color: "#FFC600", enabled: true },
    { color: "#8B6AE6", enabled: true },
    { color: "#2E0EC7", enabled: true },
    { color: "#FF9A9E", enabled: true },
  ],
  speed: 2.5,
  horizontalPressure: 3,
  verticalPressure: 4,
  waveFrequencyX: 2,
  waveFrequencyY: 3,
  waveAmplitude: 5,
  shadows: 1,
  highlights: 5,
  colorBrightness: 1,
  colorSaturation: 7,
  wireframe: false,
  antialias: false,
  colorBlending: 8,
  backgroundColor: "#003FFF",
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
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}