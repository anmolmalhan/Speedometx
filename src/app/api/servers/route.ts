import { NextResponse } from "next/server";

export async function GET() {
  const servers = [
    { id: "srv-1", name: "US West (Oregon)", region: "US-West" },
    { id: "srv-2", name: "US East (N. Virginia)", region: "US-East" },
    { id: "srv-3", name: "Europe (Frankfurt)", region: "EU-Central" },
    { id: "srv-4", name: "Asia Pacific (Tokyo)", region: "AP-Northeast" },
    { id: "srv-5", name: "Local Area Network", region: "Local" },
  ];
  
  return NextResponse.json({ servers }, {
    headers: {
      "Cache-Control": "public, max-age=3600"
    }
  });
}
