"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

// A large soft glow that trails the cursor across the whole page.
export function CursorSpotlight() {
  const reduced = useReducedMotion();
  const x = useMotionValue(-2000);
  const y = useMotionValue(-2000);
  const sx = useSpring(x, { stiffness: 250, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 250, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (reduced) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [x, y, reduced]);

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed -z-[8] h-[36rem] w-[36rem] rounded-full blur-[90px]"
      style={{
        left: sx,
        top: sy,
        translateX: "-50%",
        translateY: "-50%",
        background: "radial-gradient(circle, hsla(282, 90%, 60%, 0.16), transparent 60%)",
      }}
    />
  );
}
