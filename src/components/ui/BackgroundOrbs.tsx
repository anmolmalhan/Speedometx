"use client";

import { motion, useReducedMotion } from "framer-motion";

// Big, soft, slowly-drifting colour orbs that give the mesh background life.
const orbs = [
  { color: "265 92% 60%", size: 540, left: "2%", top: "0%", x: [0, 60, -20, 0], y: [0, -40, 30, 0], dur: 19 },
  { color: "190 95% 52%", size: 460, left: "70%", top: "2%", x: [0, -50, 30, 0], y: [0, 30, -25, 0], dur: 23 },
  { color: "322 90% 58%", size: 580, left: "60%", top: "55%", x: [0, 40, -40, 0], y: [0, -30, 20, 0], dur: 21 },
];

export function BackgroundOrbs() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div className="pointer-events-none fixed inset-0 -z-[9] overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[90px]"
          style={{
            width: o.size,
            height: o.size,
            left: o.left,
            top: o.top,
            background: `radial-gradient(circle, hsla(${o.color}, 0.45), transparent 68%)`,
          }}
          animate={{ x: o.x, y: o.y, scale: [1, 1.12, 0.95, 1] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
