import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const reader = request.body?.getReader();
    let bytesReceived = 0;
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesReceived += value.length;
      }
    }
    
    return NextResponse.json({ ok: true, bytesReceived }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
