"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { palette } from "@/lib/tokens";

type Props = {
  value: number | string;
  label: string;
  decimals?: number;
};

export function Stat({ value, label, decimals = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);

  const isStringValue = typeof value === "string";

  useEffect(() => {
    if (!inView || isStringValue) return;
    if (reduce) {
      setV(value as number);
      return;
    }
    let raf = 0;
    let t0: number | null = null;
    const ms = 1500;
    const tick = (t: number) => {
      if (t0 === null) t0 = t;
      const k = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setV((value as number) * eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce, isStringValue]);

  const formatted = isStringValue
    ? inView
      ? (value as string)
      : " "
    : v.toLocaleString(undefined, { maximumFractionDigits: decimals });

  return (
    <div ref={ref} className="krain-stat" style={{ padding: "0 32px", borderRight: `1px solid ${palette.rule}` }}>
      <div
        style={{
          fontFamily: "var(--font-geist), sans-serif",
          fontWeight: 200,
          fontSize: "clamp(40px, 5vw, 64px)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {formatted}
      </div>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          opacity: 0.55,
          marginTop: 10,
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
      >
        {label}
      </div>
    </div>
  );
}
