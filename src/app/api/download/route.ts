import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Default to 1MB if not specified
  const sizeStr = searchParams.get("size") || "1048576";
  let size = parseInt(sizeStr, 10);
  
  if (isNaN(size) || size <= 0) size = 1024 * 1024;
  if (size > 100 * 1024 * 1024) size = 100 * 1024 * 1024; // Cap at 100MB
  
  const stream = new ReadableStream({
    start(controller) {
      const chunkSize = 1024 * 64; // 64 KB chunks
      let sent = 0;
      const buffer = new Uint8Array(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      
      const push = () => {
        if (sent < size) {
          const toSend = Math.min(chunkSize, size - sent);
          controller.enqueue(buffer.slice(0, toSend));
          sent += toSend;
          
          // Use setTimeout occasionally to avoid blocking the event loop entirely
          // For speed testing, we want max throughput, but we need to let I/O happen.
          // Immediate push is often fast enough, but can block.
          // In Node.js, recursive synchronous call can overflow stack limit if size is 100MB.
          // So we should just use a loop to enqueue, or setImmediate.
          if (sent % (chunkSize * 10) === 0) {
             setTimeout(push, 0);
          } else {
             push();
          }
        } else {
          controller.close();
        }
      };
      
      push();
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Length": size.toString(),
      "Access-Control-Expose-Headers": "Content-Length",
    },
  });
}
