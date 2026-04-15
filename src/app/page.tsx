"use client";

import { useState, useEffect } from "react";

import { useSpeedTest } from "@/hooks/useSpeedTest";
import { SpeedometerDial } from "@/components/ui/SpeedometerDial";
import { TestControls } from "@/components/speedtest/TestControls";
import { MetricCard } from "@/components/speedtest/MetricCard";
import { PhaseIndicator } from "@/components/speedtest/PhaseIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { state, startTest, cancelTest } = useSpeedTest();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-12 h-12 text-blue-500" />
                <h1 className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
                  SPEEDOMETX
                </h1>
              </div>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-lg font-medium text-slate-500 dark:text-slate-400"
              >
                Precision Engineered for Speed.
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            SPEEDOMETX
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center">
        
        {/* Speedometer Area */}
        <div className="mb-8 w-full">
          <SpeedometerDial 
            currentValue={state.currentValue} 
            phase={state.phase} 
            progress={state.progress}
          />
        </div>

        {/* Phase Timeline / Info */}
        <div className="min-h-16 mb-6 w-full flex flex-col items-center justify-center">
          <PhaseIndicator phase={state.phase} />
          {state.error && (
             <div className="text-red-500 text-sm mt-2">{state.error}</div>
          )}
          {state.server && (state.phase !== 'idle' && state.phase !== 'selectingServer') && (
            <div className="text-xs text-slate-400 mt-2">
              Server: {state.server.name} ({state.server.region})
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mb-12">
          <TestControls 
            phase={state.phase} 
            onStart={startTest} 
            onCancel={cancelTest} 
          />
        </div>

        {/* Metrics Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            label="Ping" 
            value={state.ping} 
            unit="ms" 
            isActive={state.phase === "testingPing"}
          />
          <MetricCard 
            label="Jitter" 
            value={state.jitter} 
            unit="ms" 
            isActive={state.phase === "testingPing"}
          />
          <MetricCard 
            label="Download" 
            value={state.download} 
            unit="Mbps" 
            isActive={state.phase === "testingDownload"}
          />
          <MetricCard 
            label="Upload" 
            value={state.upload} 
            unit="Mbps" 
            isActive={state.phase === "testingUpload"}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 flex flex-col items-center justify-center space-y-2 text-center text-sm text-slate-500 dark:text-slate-400 pb-8">
        <p>Results may vary based on connection type.</p>
        <p className="font-medium mt-1 flex items-center justify-center gap-1">
          Crafted with <span className="text-blue-500 dark:text-blue-400">⚡</span> and precision by
          <a 
            href="https://www.instagram.com/anmolmalhan" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 ml-1"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold tracking-wide">
              anmolmalhan
            </span>
          </a>
        </p>
      </footer>
    </div>
    </>
  );
}
