import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export const runtime = "nodejs";

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pingForCountry(code: string) {
  const ranges: Record<string, [number, number]> = {
    NL: [40, 60],
    DE: [45, 65],
    US: [150, 220],
    JP: [80, 120],
    SG: [100, 150],
  };
  const [min, max] = ranges[code] ?? [60, 140];
  return randomInRange(min, max);
}

export async function POST(request: Request) {
  const body = await request.json();
  const serverIds = Array.isArray(body.serverIds) ? body.serverIds : [];

  const db = getDb();
  const pings: Record<string, number> = {};

  serverIds.forEach((id: string) => {
    const server = db
      .prepare("SELECT country_code FROM servers WHERE id = ?")
      .get(id) as { country_code: string } | undefined;
    if (server) {
      pings[id] = pingForCountry(server.country_code);
    }
  });

  return NextResponse.json({ pings });
}
