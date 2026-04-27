"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span";
};

export function FadeIn({ children, delay = 0, className, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const Tag = as === "span" ? motion.span : motion.div;

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: 0.9,
        delay: delay / 1000,
        ease: [0.2, 0.7, 0.2, 1],
      }}
      style={as === "span" ? { display: "inline-block" } : undefined}
    >
      {children}
    </Tag>
  );
}
