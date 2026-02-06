import { NextResponse } from "next/server";
import { plans } from "../../../lib/plans";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ plans });
}
