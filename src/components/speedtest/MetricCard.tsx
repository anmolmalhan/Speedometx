"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import type { MouseEvent } from "react";
import { AnimatedNumber } from "../ui/AnimatedNumber";

interface MetricCardProps {
  label: string;
  value: number | null | undefined;
  unit: string;
  isActive?: boolean;
  accent?: string; // hsl string for the active glow/border
}

export function MetricCard({ label, value, unit, isActive, accent = "265 90% 62%" }: MetricCardProps) {
  const reduced = useReducedMotion();
  const hasValue = value !== null && value !== undefined && value !== 0;
  const decimals = (value ?? 0) > 10 ? 1 : 2;

  // 3D tilt toward cursor
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 16);
  };
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      animate={{ scale: isActive ? 1.05 : 1, y: isActive ? -4 : 0 }}
      transition={{ type: "spring", bounce: 0.45 }}
      className="relative"
      style={{ perspective: 600 }}
    >
      {/* Rotating conic-gradient glow border while active */}
      {isActive && !reduced && (
        <motion.div
          aria-hidden="true"
          className="absolute -inset-1 rounded-[1.4rem] blur-md"
          style={{ zIndex: -1, background: `conic-gradient(from 0deg, transparent, hsl(${accent}), transparent 55%)` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", ...(isActive ? { borderColor: `hsl(${accent})` } : {}) }}
        className="glass-card relative flex flex-col overflow-hidden rounded-2xl p-4"
      >
        {/* sweeping shine while active */}
        {isActive && !reduced && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(110deg, transparent 30%, hsla(${accent}, 0.18) 50%, transparent 70%)`,
              backgroundSize: "250% 100%",
            }}
            animate={{ backgroundPosition: ["180% 0", "-120% 0"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <span
          className="relative z-10 mb-1 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em]"
          style={{ color: isActive ? `hsl(${accent})` : undefined }}
        >
          {isActive && (
            <motion.span
              animate={reduced ? undefined : { scale: [1, 1.5, 1] }}
              transition={reduced ? undefined : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: `hsl(${accent})` }}
            />
          )}
          {label}
        </span>
        <div className="relative z-10 flex items-baseline gap-1">
          <span className="font-display text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
            {hasValue ? <AnimatedNumber value={value as number} decimals={decimals} /> : "--"}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
