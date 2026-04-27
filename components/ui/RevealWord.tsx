"use client";

import { useState, type ReactNode } from "react";
import { palette } from "@/lib/tokens";

export function RevealWord({ children }: { children: ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        color: palette.accent,
        position: "relative",
        cursor: "default",
        textShadow: hover ? `0 0 30px ${palette.accent}` : `0 0 0px ${palette.accent}`,
        transition: "text-shadow .4s",
      }}
    >
      {children}
    </span>
  );
}
