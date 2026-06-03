"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { palette } from "@/lib/tokens";

type Props = {
  children: ReactNode;
  href?: string;
  primary?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  /** off-site link — opens in a new tab with rel="noopener noreferrer" */
  external?: boolean;
};

const SPRING = { stiffness: 220, damping: 18, mass: 0.6 };

export function MagneticBtn({
  children,
  href = "#",
  primary = false,
  className,
  style,
  ariaLabel,
  external = false,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: primary ? "18px 30px" : "14px 22px",
        background: primary ? palette.accent : "transparent",
        color: primary ? palette.bg : "inherit",
        border: primary ? "none" : "1px solid currentColor",
        borderRadius: 999,
        fontSize: 14,
        letterSpacing: "0.02em",
        fontWeight: 500,
        textDecoration: "none",
        whiteSpace: "nowrap",
        x: sx,
        y: sy,
        boxShadow: primary
          ? `0 14px 40px ${palette.accent}66, 0 0 0 6px ${palette.accent}22`
          : "none",
        ...style,
      }}
    >
      {children}
    </motion.a>
  );
}
