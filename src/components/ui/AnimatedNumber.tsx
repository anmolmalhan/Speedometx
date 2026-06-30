"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Smoothly springs from the previous value to the new one and renders the
// interpolated, formatted number. Used for the gauge readout + metric cards.
export function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 130, damping: 18, mass: 0.6 });
  const text = useTransform(spring, (v) => v.toFixed(decimals));

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <motion.span>{text}</motion.span>;
}
