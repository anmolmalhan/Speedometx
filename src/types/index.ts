export type TestPhase = "idle" | "selectingServer" | "testingPing" | "testingDownload" | "testingUpload" | "complete" | "error";

export interface Server {
  id: string;
  name: string;
  region: string;
}

export interface SpeedTestResult {
  timestamp: string;
  pingMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
  serverName: string;
  serverRegion: string;
  isp?: string;
}

export interface SpeedTestState {
  phase: TestPhase;
  ping: number;
  jitter: number;
  download: number;
  upload: number;
  progress: number; // 0 to 100 for current phase
  currentValue: number; // Active value to display on mostly speedometer
  server: Server | null;
  error: string | null;
}
