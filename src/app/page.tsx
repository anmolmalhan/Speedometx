"use client";

import { useSpeedTest } from "@/hooks/useSpeedTest";
import { SpeedometerDial } from "@/components/ui/SpeedometerDial";
import { TestControls } from "@/components/speedtest/TestControls";
import { MetricCard } from "@/components/speedtest/MetricCard";
import { PhaseIndicator } from "@/components/speedtest/PhaseIndicator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Globe } from "lucide-react";

export default function Home() {
  const { state, startTest, cancelTest } = useSpeedTest();

  return (
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
      <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
        Results may vary based on connection type. Created with Next.js & Framer Motion.
      </footer>
    </div>
  );
}
