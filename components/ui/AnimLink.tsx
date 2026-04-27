"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { palette } from "@/lib/tokens";

type Props = {
  children: ReactNode;
  href?: string;
  className?: string;
  style?: CSSProperties;
  color?: string;
};

export function AnimLink({ children, href = "#", className, style, color }: Props) {
  const [hover, setHover] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        position: "relative",
        textDecoration: "none",
        color: color ?? "inherit",
        ...style,
      }}
    >
      {children}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          bottom: -3,
          height: 1,
          width: hover ? "100%" : "0%",
          background: palette.accent,
          boxShadow: hover ? `0 0 8px ${palette.accent}` : "none",
          transition: "width .42s cubic-bezier(.2,.7,.2,1)",
        }}
      />
    </a>
  );
}
