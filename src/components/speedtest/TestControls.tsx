"use client";

import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import { TestPhase } from "../../types";
import { Play, Square, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface TestControlsProps {
  phase: TestPhase;
  onStart: () => void;
  onCancel: () => void;
}

const baseBtn =
  "mesh-btn group inline-flex items-center justify-center rounded-full px-10 py-4 text-sm sm:text-base font-bold uppercase tracking-[0.15em] text-white focus:outline-none focus:ring-4 focus:ring-fuchsia-400/40";

type Ripple = { id: number; x: number; y: number };

export function TestControls({ phase, onStart, onCancel }: TestControlsProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const reduced = useReducedMotion();

  const burst = (e: MouseEvent<HTMLButtonElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const id = nextId.current++;
    setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((rp) => rp.id !== id)), 700);
  };

  const rippleNodes = (
    <AnimatePresence>
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute h-12 w-12 rounded-full bg-white/40"
          style={{ left: r.x, top: r.y, translateX: "-50%", translateY: "-50%" }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );

  if (phase === "idle" || phase === "error" || phase === "complete") {
    const again = phase === "complete";
    return (
      <motion.button
        onClick={(e) => {
          burst(e);
          onStart();
        }}
        className={baseBtn}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        animate={again || reduced ? undefined : { y: [0, -4, 0] }}
        initial={again ? { scale: 0.85, opacity: 0 } : undefined}
        transition={again ? { type: "spring", bounce: 0.5 } : { y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
      >
        {rippleNodes}
        <span className="relative z-10 flex items-center">
          {again ? <RotateCcw className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" fill="currentColor" />}
          {again ? "TEST AGAIN" : "START TEST"}
        </span>
      </motion.button>
    );
  }

  // Testing phases — cancel
  return (
    <motion.button
      onClick={onCancel}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="group inline-flex items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] text-red-500 backdrop-blur-md transition-colors hover:border-red-500/60 hover:bg-red-500/20 focus:outline-none sm:text-base"
    >
      <Square className="mr-2 h-4 w-4" fill="currentColor" />
      CANCEL
    </motion.button>
  );
}
