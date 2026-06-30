"use client";

import { motion, type Variants } from "framer-motion";

const LETTERS = "SPEEDOMETX".split("");

const containerIn: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const letterIn: Variants = {
  hidden: { opacity: 0, y: 26, rotateX: -90 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", bounce: 0.45 } },
};

// Per-letter wordmark: optionally cascades in, and waves up on hover.
export function AnimatedWordmark({ className = "", animateIn = false }: { className?: string; animateIn?: boolean }) {
  return (
    <motion.span
      className={`font-display inline-flex font-bold tracking-tight ${className}`}
      style={{ perspective: 600 }}
      variants={animateIn ? containerIn : undefined}
      initial={animateIn ? "hidden" : undefined}
      animate={animateIn ? "show" : undefined}
    >
      {LETTERS.map((ch, i) => (
        <motion.span
          key={i}
          className={i < 6 ? "text-mesh" : "text-foreground"}
          variants={animateIn ? letterIn : undefined}
          whileHover={{ y: -8, scale: 1.25, transition: { type: "spring", stiffness: 400, damping: 10 } }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.span>
  );
}
