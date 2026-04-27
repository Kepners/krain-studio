"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { palette } from "@/lib/tokens";

export function AmbientGlow() {
  const reduce = useReducedMotion();
  const [m, setM] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      setM({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background: `radial-gradient(600px at ${m.x * 100}% ${m.y * 100}%, ${palette.accent}1f, transparent 60%)`,
        transition: "background .2s linear",
      }}
    />
  );
}
