"use client";

import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import type { MouseEvent } from "react";
import { TestPhase } from "../../types";
import { AnimatedNumber } from "./AnimatedNumber";

interface SpeedometerDialProps {
  currentValue: number;
  phase: TestPhase;
  progress: number;
}

const TICKS = [0, 20, 40, 60, 80, 100];

// Rising speed particles shown while a test is actively running.
function SpeedParticles({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15] overflow-hidden rounded-full">
      {Array.from({ length: 14 }).map((_, i) => {
        const left = 12 + ((i * 6.1) % 76);
        const delay = (i % 7) * 0.28;
        const dur = 2.3 + (i % 5) * 0.4;
        const size = 3 + (i % 3);
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ left: `${left}%`, bottom: "16%", width: size, height: size, background: color, boxShadow: `0 0 8px ${color}` }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.9, 0], y: [-8, -130], x: [0, i % 2 ? 14 : -14] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

// One-shot radial burst when the test finishes.
function CompletionBurst() {
  const N = 18;
  return (
    <div className="pointer-events-none absolute inset-0 z-[16] flex items-center justify-center">
      {Array.from({ length: N }).map((_, i) => {
        const ang = (i / N) * Math.PI * 2;
        const dist = 90 + (i % 3) * 22;
        const c = ["hsl(265 90% 62%)", "hsl(322 90% 60%)", "hsl(190 95% 52%)"][i % 3];
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ width: 6, height: 6, background: c, boxShadow: `0 0 10px ${c}` }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, scale: 0.3 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

export function SpeedometerDial({ currentValue, phase, progress }: SpeedometerDialProps) {
  const reduced = useReducedMotion();
  const maxScale = phase === "testingPing" ? 200 : 1000;
  const angleRange = 240;
  const startAngle = -120;
  const clampedValue = Math.min(Math.max(currentValue, 0), maxScale);
  const normalizedValue = maxScale > 0 ? Math.pow(clampedValue / maxScale, 0.7) : 0;

  const isLive = phase === "testingPing" || phase === "testingDownload" || phase === "testingUpload";
  const showArc = isLive || phase === "complete";
  const unit = phase === "testingPing" ? "ms" : "Mbps";

  const centerLabel =
    phase === "idle"
      ? "ready"
      : phase === "selectingServer"
      ? "scanning"
      : phase === "complete"
      ? "Mbps · download"
      : unit;

  const glow =
    phase === "testingUpload"
      ? "hsl(322 90% 60%)"
      : phase === "testingPing"
      ? "hsl(190 95% 52%)"
      : phase === "error"
      ? "hsl(0 84% 60%)"
      : "hsl(265 90% 62%)";

  // 3D mouse tilt
  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 16 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 16 });
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 18);
    rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 18);
  };
  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-96 sm:w-96"
      >
        {/* Breathing glow halo */}
        <motion.div
          className="absolute inset-6 rounded-full blur-3xl"
          animate={
            showArc && !reduced
              ? { backgroundColor: glow, opacity: [0.3, 0.5, 0.3], scale: [1, 1.06, 1] }
              : { backgroundColor: glow, opacity: showArc ? 0.4 : 0.22, scale: 1 }
          }
          transition={showArc && !reduced ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.8 }}
        />

        {/* Counter-rotating conic rings while running */}
        {isLive && !reduced && (
          <>
            <motion.div
              className="absolute inset-3 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, transparent, hsla(322,90%,60%,0.35) 18%, transparent 38%)",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px))",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px))",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-3 rounded-full"
              style={{
                background: "conic-gradient(from 180deg, transparent, hsla(190,95%,55%,0.25) 14%, transparent 34%)",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px))",
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 16px), #000 calc(100% - 15px))",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}

        {isLive && !reduced && <SpeedParticles color={glow} />}
        <AnimatePresence>{phase === "complete" && !reduced && <CompletionBurst key="burst" />}</AnimatePresence>

        {/* SVG Dial */}
        <svg viewBox="0 0 200 200" className="relative z-10 h-full w-full drop-shadow-2xl">
          <defs>
            <linearGradient id="meshArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(265 90% 62%)" />
              <stop offset="50%" stopColor="hsl(322 90% 60%)" />
              <stop offset="100%" stopColor="hsl(190 95% 52%)" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d="M 40 160 A 85 85 0 1 1 160 160"
            fill="none"
            stroke="currentColor"
            className="text-black/5 dark:text-white/10"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Progress / result Arc */}
          {showArc && (
            <motion.path
              className="arc-hue"
              d="M 40 160 A 85 85 0 1 1 160 160"
              fill="none"
              stroke="url(#meshArc)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="400"
              initial={{ strokeDashoffset: 400 }}
              animate={{ strokeDashoffset: 400 - normalizedValue * 365 }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            />
          )}

          {/* Flowing energy dashes on top of the arc while running */}
          {isLive && (
            <path
              className="arc-flow"
              d="M 40 160 A 85 85 0 1 1 160 160"
              fill="none"
              stroke="white"
              strokeOpacity="0.55"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="3 13"
            />
          )}

          {/* Ticks (base + light-up overlay) */}
          {TICKS.map((tick) => {
            const f = tick / 100;
            const tickAngle = startAngle + f * angleRange;
            const rad = (tickAngle - 90) * (Math.PI / 180);
            const x1 = +(100 + Math.cos(rad) * 70).toFixed(4);
            const y1 = +(100 + Math.sin(rad) * 70).toFixed(4);
            const x2 = +(100 + Math.cos(rad) * 78).toFixed(4);
            const y2 = +(100 + Math.sin(rad) * 78).toFixed(4);
            const passed = showArc && normalizedValue >= f - 0.0001;
            return (
              <g key={tick}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" className="text-black/15 dark:text-white/20" strokeWidth="2.5" />
                {passed && (
                  <motion.line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={glow}
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ filter: `drop-shadow(0 0 4px ${glow})`, transformOrigin: `${x1}px ${y1}px` }}
                  />
                )}
              </g>
            );
          })}

        </svg>

        {/* Center Values */}
        <div className="absolute inset-0 z-20 mt-8 flex flex-col items-center justify-center">
          <span className="font-display text-6xl font-bold tabular-nums text-foreground sm:text-7xl">
            {phase === "idle" ? (
              <motion.span
                className="text-mesh"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                —
              </motion.span>
            ) : (
              <AnimatedNumber value={currentValue} decimals={currentValue > 10 ? 0 : 1} />
            )}
          </span>
          <motion.span
            key={centerLabel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground"
          >
            {centerLabel}
          </motion.span>
        </div>

        {/* Phase progress ring (bottom) */}
        <div className="absolute bottom-2 left-1/2 z-20 h-1.5 w-36 -translate-x-1/2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(265 90% 62%), hsl(322 90% 60%), hsl(190 95% 52%))" }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.2 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
