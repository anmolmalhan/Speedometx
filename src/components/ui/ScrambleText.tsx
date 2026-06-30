"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*<>/";

// Decodes from random characters into the target text whenever `text` changes.
export function ScrambleText({ text, className = "" }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const raf = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    // Keyed by phase upstream, so `display` already initialises to `text` —
    // under reduced motion we simply skip the scramble animation.
    if (reduced) return;
    let revealed = 0;
    const tick = () => {
      const out = text
        .split("")
        .map((ch, i) => {
          if (!/[a-zA-Z0-9]/.test(ch)) return ch;
          return i < revealed ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");
      setDisplay(out);
      revealed += 0.6;
      if (revealed < text.length) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, reduced]);

  return <span className={className}>{display}</span>;
}
