"use client";

import { TestPhase } from "../../types";
import { ScrambleText } from "../ui/ScrambleText";

const phaseLabels: Record<TestPhase, string> = {
  idle: "Ready when you are",
  selectingServer: "Finding optimal server…",
  testingPing: "Measuring ping & jitter…",
  testingDownload: "Testing download speed…",
  testingUpload: "Testing upload speed…",
  complete: "Test complete",
  error: "Test failed",
};

export function PhaseIndicator({ phase }: { phase: TestPhase }) {
  const isTesting = phase.includes("testing") || phase === "selectingServer";

  return (
    <div className="flex items-center justify-center gap-2">
      {isTesting && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
        </span>
      )}
      <ScrambleText
        key={phase}
        text={phaseLabels[phase]}
        className={`text-sm font-semibold tracking-wide transition-colors ${
          phase === "error" ? "text-red-500" : "text-muted-foreground"
        }`}
      />
    </div>
  );
}
