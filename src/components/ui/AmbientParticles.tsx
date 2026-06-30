"use client";

import { motion, useReducedMotion } from "framer-motion";

// Slow, faint particles drifting up the whole page for ambient depth.
const COLORS = ["265 90% 62%", "322 90% 60%", "190 95% 52%"];

export function AmbientParticles() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div className="pointer-events-none fixed inset-0 -z-[7] overflow-hidden" aria-hidden="true">
      {Array.from({ length: 22 }).map((_, i) => {
        const left = (i * 4.5 + (i % 5) * 3) % 100;
        const size = 2 + (i % 3);
        const dur = 14 + (i % 7) * 2.5;
        const delay = (i % 11) * 1.3;
        const color = COLORS[i % COLORS.length];
        const drift = i % 2 ? 40 : -40;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              bottom: "-5%",
              width: size,
              height: size,
              background: `hsl(${color})`,
              boxShadow: `0 0 6px hsl(${color})`,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.6, 0], y: ["0vh", "-108vh"], x: [0, drift, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}
