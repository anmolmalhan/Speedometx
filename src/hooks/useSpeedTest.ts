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
      let totalBytesDown = 0;
      let actualDownloadStart = 0;
      let lastReportTime = 0;
      const initialFetchStart = performance.now();
      
      try {
        // Request massive 250MB chunk from actual internet to test WAN speed
        const res = await fetch('https://speed.cloudflare.com/__down?bytes=262144000', { cache: 'no-store' });
        const reader = res.body?.getReader();
        
        if (reader) {
          while (!cancelRef.current) {
            const timeNow = performance.now();
            if (actualDownloadStart > 0 && timeNow - actualDownloadStart >= downloadDuration) {
               reader.cancel();
               break;
            }
            if (actualDownloadStart === 0 && timeNow - initialFetchStart >= downloadDuration) {
               reader.cancel();
               break;
            }

            const { done, value } = await reader.read();
            if (done) break;
            
            if (totalBytesDown === 0) {
               actualDownloadStart = performance.now();
               lastReportTime = actualDownloadStart;
            }
            
            totalBytesDown += value.length;
            
            const timeSinceReport = performance.now() - lastReportTime;
            if (actualDownloadStart > 0 && timeSinceReport > 100) { 
              const durationSec = (performance.now() - actualDownloadStart) / 1000;
              if (durationSec > 0) {
                 const mbps = (totalBytesDown * 8) / 1000000 / durationSec;
                 updateState({ 
                   download: mbps, 
                   currentValue: mbps,
                   progress: Math.min(((performance.now() - actualDownloadStart) / downloadDuration) * 100, 100)
                 });
                 lastReportTime = performance.now();
              }
            }
          }
        }
      } catch (err) {}

      // 4. Testing Upload
      if (cancelRef.current) return;
      updateState({ phase: 'testingUpload', progress: 0, currentValue: 0 });

      const uploadDuration = 8000;
      let totalBytesUp = 0;
      const uploadStart = performance.now();
      let lastUpReportTime = uploadStart;
      
      const uploadChunkSize = 2 * 1024 * 1024; // 2MB chunks for parallel streams
      const dummyData = new Uint8Array(uploadChunkSize);
      for(let i=0; i<uploadChunkSize; i++) dummyData[i] = Math.floor(Math.random() * 256);
      const dummyBlob = new Blob([dummyData], { type: 'text/plain' });
      
      const concurrency = 6;
      let isUploading = true;
      const abortController = new AbortController();

      const uploadWorker = async () => {
         while (isUploading && !cancelRef.current) {
            try {
               await fetch('https://speed.cloudflare.com/__up', {
                  method: 'POST',
                  body: dummyBlob,
                  cache: 'no-store',
                  signal: abortController.signal
               });
               if (isUploading && !cancelRef.current) {
                  totalBytesUp += uploadChunkSize;
               }
            } catch(e) {
               // Ignore aborts
            }
         }
      };

      for(let i=0; i<concurrency; i++) {
         uploadWorker();
      }
      
      while (!cancelRef.current) {
         const timeNow = performance.now();
         const durationSec = (timeNow - uploadStart) / 1000;
         
         if (durationSec >= (uploadDuration / 1000)) {
            isUploading = false;
            abortController.abort();
            break;
         }
         
         if (timeNow - lastUpReportTime > 100) {
            if (durationSec > 0.5) { // Warm-up phase
                const mbps = (totalBytesUp * 8) / 1000000 / durationSec;
                updateState({ 
                  upload: mbps, 
                  currentValue: mbps,
                  progress: Math.min((durationSec / (uploadDuration / 1000)) * 100, 100)
                });
            }
            lastUpReportTime = timeNow;
         }
         
         await new Promise(res => setTimeout(res, 50));
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
