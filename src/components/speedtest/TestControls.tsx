"use client";

import { TestPhase } from "../../types";
import { Play, Square, RotateCcw } from "lucide-react";

interface TestControlsProps {
  phase: TestPhase;
  onStart: () => void;
  onCancel: () => void;
}

export function TestControls({ phase, onStart, onCancel }: TestControlsProps) {
  if (phase === "idle" || phase === "error") {
    return (
      <button
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm sm:text-base font-bold text-white uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 dark:shadow-blue-900/20 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        <Play className="w-4 h-4 mr-2" fill="currentColor" />
        START TEST
      </button>
    );
  }

  if (phase === "complete") {
    return (
      <button
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm sm:text-base font-bold text-white uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 dark:shadow-blue-900/20 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 focus:outline-none"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        TEST AGAIN
      </button>
    );
  }

  // Testing phases
  return (
    <button
      onClick={onCancel}
      className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm sm:text-base font-bold text-red-500 uppercase tracking-wider transition-all duration-300 bg-red-500/5 dark:bg-red-500/10 backdrop-blur-md rounded-full border border-red-500/20 shadow-sm hover:border-red-500/50 hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 focus:outline-none"
    >
      <Square className="w-4 h-4 mr-2" fill="currentColor" />
      CANCEL
    </button>
  );
}
