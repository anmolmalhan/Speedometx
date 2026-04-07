import { useState, useCallback, useRef } from 'react';
import { SpeedTestState, Server, TestPhase } from '../types';

const INITIAL_STATE: SpeedTestState = {
  phase: 'idle',
  ping: 0,
  jitter: 0,
  download: 0,
  upload: 0,
  progress: 0,
  currentValue: 0,
  server: null,
  error: null,
};

export function useSpeedTest() {
  const [state, setState] = useState<SpeedTestState>(INITIAL_STATE);
  const cancelRef = useRef<boolean>(false);

  const updateState = (updates: Partial<SpeedTestState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const startTest = useCallback(async () => {
    cancelRef.current = false;
    updateState({ ...INITIAL_STATE, phase: 'selectingServer' });

    try {
      // 1. Selecting Server
      if (cancelRef.current) return;
      
      let serverName = "Cloudflare Edge";
      let regionStr = "Global";
      
      try {
        const metaRes = await fetch('https://speed.cloudflare.com/__down?bytes=1', { cache: 'no-store' });
        const city = metaRes.headers.get('cf-meta-city');
        const country = metaRes.headers.get('cf-meta-country');
        const colo = metaRes.headers.get('cf-meta-colo');
        
        if (city && country) regionStr = `${city}, ${country}`;
        if (colo) serverName = `Cloudflare (${colo})`;
      } catch (e) {
        // Fallback defaults
      }
      
      const server = { id: "cf-edge", name: serverName, region: regionStr } as Server;
      updateState({ server, phase: 'testingPing' });

      // 2. Testing Ping & Jitter
      if (cancelRef.current) return;
      
      const pings: number[] = [];
      const pingCount = 10;
      
      for (let i = 0; i < pingCount; i++) {
        if (cancelRef.current) return;
        const start = performance.now();
        await fetch('https://speed.cloudflare.com/__down?bytes=1', { cache: 'no-store' });
        const end = performance.now();
        pings.push(end - start);
        
        const currentPing = pings.reduce((a, b) => a + b, 0) / pings.length;
        // Simple jitter: avg difference between consecutive pings
        let jitter = 0;
        if (pings.length > 1) {
           let sumDiff = 0;
           for(let j=1; j<pings.length; j++) {
              sumDiff += Math.abs(pings[j] - pings[j-1]);
           }
           jitter = sumDiff / (pings.length - 1);
        }

        updateState({ 
          ping: currentPing, 
          jitter, 
          currentValue: currentPing,
          progress: ((i + 1) / pingCount) * 100 
        });
      }

      // 3. Testing Download
      if (cancelRef.current) return;
      updateState({ phase: 'testingDownload', progress: 0, currentValue: 0 });

      // Run download test for 8 seconds
      const downloadDuration = 8000;
      const downloadStart = performance.now();
      let totalBytesDown = 0;
      let lastReportTime = downloadStart;
      
      let isDownloadComplete = false;
      
      while (!isDownloadComplete && !cancelRef.current) {
        const now = performance.now();
        if (now - downloadStart >= downloadDuration) {
           isDownloadComplete = true;
           break;
        }

        // Request 25MB chunk from Cloudflare public speed test endpoint
        const res = await fetch('https://speed.cloudflare.com/__down?bytes=26214400', { cache: 'no-store' });
        const reader = res.body?.getReader();
        if (!reader) break;

        while (true) {
          if (cancelRef.current) break;
          const { done, value } = await reader.read();
          if (done) break;
          totalBytesDown += value.length;
          
          const timeNow = performance.now();
          if (timeNow - lastReportTime > 100) { // report every 100ms
            const durationSec = (timeNow - downloadStart) / 1000;
            const mbps = (totalBytesDown * 8) / (1000 * 1000) / durationSec;
            updateState({ 
              download: mbps, 
              currentValue: mbps,
              progress: Math.min(((timeNow - downloadStart) / downloadDuration) * 100, 100)
            });
            lastReportTime = timeNow;
          }
        }
      }

      // 4. Testing Upload
      if (cancelRef.current) return;
      updateState({ phase: 'testingUpload', progress: 0, currentValue: 0 });

      const uploadDuration = 8000;
      const uploadStart = performance.now();
      let totalBytesUp = 0;
      let lastUpReportTime = uploadStart;
      
      let isUploadComplete = false;
      const uploadChunkSize = 1048576; // 1MB chunk
      const dummyData = new Uint8Array(uploadChunkSize);
      for(let i=0; i<uploadChunkSize; i++) dummyData[i] = Math.floor(Math.random() * 256);

      while (!isUploadComplete && !cancelRef.current) {
        const now = performance.now();
        if (now - uploadStart >= uploadDuration) {
           isUploadComplete = true;
           break;
        }
        
        await fetch('https://speed.cloudflare.com/__up', {
          method: 'POST',
          body: dummyData,
        });
        
        totalBytesUp += uploadChunkSize;
        const timeNow = performance.now();
        if (timeNow - lastUpReportTime > 100) {
          const durationSec = (timeNow - uploadStart) / 1000;
          const mbps = (totalBytesUp * 8) / (1000 * 1000) / durationSec;
          updateState({ 
            upload: mbps, 
            currentValue: mbps,
            progress: Math.min(((timeNow - uploadStart) / uploadDuration) * 100, 100)
          });
          lastUpReportTime = timeNow;
        }
      }

      if (cancelRef.current) return;
      updateState({ phase: 'complete', progress: 100 });

    } catch (err: any) {
      if (!cancelRef.current) {
        updateState({ phase: 'error', error: err.message || 'An error occurred' });
      }
    }
  }, []);

  const cancelTest = useCallback(() => {
    cancelRef.current = true;
    updateState({ phase: 'idle', progress: 0 });
  }, []);

  return {
    state,
    startTest,
    cancelTest
  };
}
