"use client";

import { useState, useEffect } from "react";

import { useSpeedTest } from "@/hooks/useSpeedTest";
import { SpeedometerDial } from "@/components/ui/SpeedometerDial";
import { TestControls } from "@/components/speedtest/TestControls";
import { MetricCard } from "@/components/speedtest/MetricCard";
import { PhaseIndicator } from "@/components/speedtest/PhaseIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedWordmark } from "@/components/ui/AnimatedWordmark";
import { Magnetic } from "@/components/ui/Magnetic";
import { Zap } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 1.9 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.35, duration: 0.8 } },
};

export default function Home() {
  const { state, startTest, cancelTest } = useSpeedTest();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.7 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-5 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -14, 14, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.3 }}
                >
                  <Zap className="h-12 w-12 fill-fuchsia-500 text-fuchsia-500" />
                </motion.div>
                <AnimatedWordmark animateIn className="text-5xl sm:text-7xl" />
              </div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base font-semibold uppercase tracking-[0.3em] text-muted-foreground"
              >
                Precision engineered for speed
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex min-h-screen flex-col items-center justify-between p-6 sm:p-10"
      >
        {/* Header */}
        <motion.header variants={item} className="flex w-full max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 fill-fuchsia-500 text-fuchsia-500" />
            <AnimatedWordmark className="text-xl" />
          </div>
          <ThemeToggle />
        </motion.header>

        {/* Main */}
        <main className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-8">
          <motion.div variants={item}>
            <SpeedometerDial
              currentValue={state.phase === "complete" ? state.download : state.currentValue}
              phase={state.phase}
              progress={state.phase === "complete" ? 100 : state.progress}
            />
          </motion.div>

          {/* Phase + server */}
          <motion.div variants={item} className="my-6 flex min-h-14 flex-col items-center justify-center gap-1.5">
            <PhaseIndicator phase={state.phase} />
            {state.error && <p className="text-sm font-medium text-red-500">{state.error}</p>}
            {state.server && state.phase !== "idle" && state.phase !== "selectingServer" && (
              <p className="text-xs font-medium text-muted-foreground">
                {state.server.name} · {state.server.region}
              </p>
            )}
          </motion.div>

          {/* Controls */}
          <motion.div variants={item} className="mb-10">
            <Magnetic>
              <TestControls phase={state.phase} onStart={startTest} onCancel={cancelTest} />
            </Magnetic>
          </motion.div>

          {/* Metrics */}
          <motion.div variants={item} className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <MetricCard label="Ping" value={state.ping} unit="ms" accent="190 95% 52%" isActive={state.phase === "testingPing"} />
            <MetricCard label="Jitter" value={state.jitter} unit="ms" accent="190 95% 52%" isActive={state.phase === "testingPing"} />
            <MetricCard label="Download" value={state.download} unit="Mbps" accent="265 90% 62%" isActive={state.phase === "testingDownload"} />
            <MetricCard label="Upload" value={state.upload} unit="Mbps" accent="322 90% 60%" isActive={state.phase === "testingUpload"} />
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer variants={item} className="flex flex-col items-center gap-1 pt-8 text-center text-sm text-muted-foreground">
          <p>Results may vary based on connection type.</p>
          <p className="flex items-center justify-center gap-1 font-medium">
            Crafted with <span className="text-fuchsia-500">⚡</span> by
            <a
              href="https://www.instagram.com/anmolmalhan"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline ml-1 inline-block transition-transform hover:-translate-y-0.5 hover:scale-105"
            >
              <span className="text-mesh font-display font-bold tracking-wide">anmolmalhan</span>
            </a>
          </p>
        </motion.footer>
      </motion.div>
    </>
  );
}
