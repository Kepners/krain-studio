"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

type Props = {
  children: ReactNode;
  max?: number;
  className?: string;
  style?: CSSProperties;
};

const SPRING = { stiffness: 180, damping: 22, mass: 0.5 };

export function TiltPlate({ children, max = 6, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const scale = useMotionValue(1);

  const rx = useSpring(useTransform(my, (v) => -v * max), SPRING);
  const ry = useSpring(useTransform(mx, (v) => v * max), SPRING);
  const ss = useSpring(scale, SPRING);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    scale.set(1.015);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        perspective: 1200,
        rotateX: rx,
        rotateY: ry,
        scale: ss,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
