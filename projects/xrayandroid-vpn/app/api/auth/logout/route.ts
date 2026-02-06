import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearAuthCookies, revokeSession } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Revoke the current session token if present
  const cookieToken = request.cookies.get("fg_token")?.value;
  if (cookieToken) {
    revokeSession(cookieToken);
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
  clearAuthCookies(response);
  return response;
}
