"use client";

import { motion } from "framer-motion";
import { TestPhase } from "../../types";

interface SpeedometerDialProps {
  currentValue: number;
  phase: TestPhase;
  progress: number;
}

export function SpeedometerDial({ currentValue, phase, progress }: SpeedometerDialProps) {
  // Speed ranges for the gauge max value
  const maxScale = phase === "testingPing" ? 200 : 1000;
  
  // Calculate the rotation angle for the needle (from -120 to 120 degrees)
  const angleRange = 240;
  const startAngle = -120;
  const clampedValue = Math.min(Math.max(currentValue, 0), maxScale);
  // Logarithmic scale for better visual representation of speed (so small speeds still move the needle noticeably)
  // Let's use a simple linear to power scale
  const normalizedValue = maxScale > 0 ? Math.pow(clampedValue / maxScale, 0.7) : 0;
  let targetAngle = startAngle + normalizedValue * angleRange;
  
  if (phase === "idle" || phase === "complete") {
    targetAngle = startAngle;
  }

  // Active color based on phase
  let activeColor = "#3b82f6"; // blue-500
  if (phase === "testingUpload") activeColor = "#8b5cf6"; // violet-500
  if (phase === "testingPing") activeColor = "#10b981"; // emerald-500
  if (phase === "error") activeColor = "#ef4444"; // red-500

  // The unit displayed
  const unit = phase === "testingPing" ? "ms" : "Mbps";

  return (
    <div className="relative flex flex-col items-center justify-center w-64 h-64 sm:w-80 sm:h-80 mx-auto">
      {/* Outer Glow */}
      <motion.div 
        className="absolute inset-0 rounded-full blur-3xl opacity-20"
        animate={{ backgroundColor: activeColor }}
        transition={{ duration: 1 }}
      />
      
      {/* SVG Dial */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl z-10">
        <defs>
          <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={activeColor} />
            <stop offset="100%" stopColor={activeColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <path
          d="M 40 160 A 85 85 0 1 1 160 160"
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-slate-800"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Progress Arc */}
        {phase !== "idle" && phase !== "complete" && phase !== "selectingServer" && (
          <motion.path
            d="M 40 160 A 85 85 0 1 1 160 160"
            fill="none"
            stroke="url(#dialGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="400"
            // We approximate the dash offset based on the angle
            initial={{ strokeDashoffset: 400 }}
            animate={{ strokeDashoffset: 400 - (normalizedValue * 365) }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          />
        )}

        {/* Ticks */}
        {[0, 20, 40, 60, 80, 100].map((tick) => {
          const tickAngle = startAngle + (tick / 100) * angleRange;
          const rad = (tickAngle - 90) * (Math.PI / 180);
          const x1 = +(100 + Math.cos(rad) * 70).toFixed(4);
          const y1 = +(100 + Math.sin(rad) * 70).toFixed(4);
          const x2 = +(100 + Math.cos(rad) * 78).toFixed(4);
          const y2 = +(100 + Math.sin(rad) * 78).toFixed(4);
          return (
            <line
              key={tick}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-600"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* Center Values */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 mt-8">
        <motion.span 
          className="text-5xl sm:text-6xl font-black tabular-nums text-slate-800 dark:text-white mb-[-8px]"
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {phase === "idle" ? "0" : currentValue.toFixed(currentValue > 10 ? 0 : 1)}
        </motion.span>
        <span className="text-lg font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">
          {phase === "idle" || phase === "complete" || phase === "selectingServer" ? "--" : unit}
        </span>
      </div>

      {/* Ring indicator for test progress (bottom) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
         <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.2 }}
         />
      </div>
    </div>
  );
}
