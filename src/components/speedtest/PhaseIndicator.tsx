"use client";

import { TestPhase } from "../../types";

const phaseLabels: Record<TestPhase, string> = {
  idle: "Ready",
  selectingServer: "Finding Optimal Server...",
  testingPing: "Measuring Ping & Jitter...",
  testingDownload: "Testing Download Speed...",
  testingUpload: "Testing Upload Speed...",
  complete: "Test Complete",
  error: "Test Failed",
};

export function PhaseIndicator({ phase }: { phase: TestPhase }) {
  const isTesting = phase.includes("testing") || phase === "selectingServer";
  
  return (
    <div className="flex items-center justify-center space-x-2 my-4">
      {isTesting && (
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      )}
      <span className={`text-sm font-medium transition-colors ${phase === 'error' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
        {phaseLabels[phase]}
      </span>
    </div>
  );
}
