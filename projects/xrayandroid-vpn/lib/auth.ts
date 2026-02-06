import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { addDays, formatDate } from "./utils";
import { getDb } from "./db";

export function createToken(userId: string) {
  return `fg:${userId}:${randomUUID()}`;
}

export function parseToken(token: string) {
  if (token.startsWith("fg:")) {
    const parts = token.split(":");
    if (parts.length >= 3) {
      return parts[1];
    }
  }
  return token;
}

/**
 * Validates a token against server-side session storage.
 * Returns the user ID if valid and not expired, null otherwise.
 */
export function validateTokenAgainstSession(
  token: string
): { userId: string; isValid: true } | { userId: null; isValid: false } {
  const db = getDb();
  const now = new Date().toISOString();

  const session = db
    .prepare(
      "SELECT user_id FROM sessions WHERE token = ? AND expires_at > ? LIMIT 1"
    )
    .get(token, now) as { user_id: string } | undefined;

  if (!session) {
    return { userId: null, isValid: false };
  }

  // Update last_used_at to track session activity
  db.prepare("UPDATE sessions SET last_used_at = ? WHERE token = ?").run(
    now,
    token
  );

  return { userId: session.user_id, isValid: true };
}

export function getUserIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  // Prefer Bearer token validation if present (most secure)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    const validation = validateTokenAgainstSession(token);
    if (validation.isValid) {
      return validation.userId;
    }
  }

  // Fall back to cookie + token validation (requires both to be present and valid)
  const cookieId = request.cookies.get("fg_user_id")?.value;
  const cookieToken = request.cookies.get("fg_token")?.value;
  
  if (cookieId && cookieToken) {
    // Validate that the token is valid and belongs to the claimed user ID
    const validation = validateTokenAgainstSession(cookieToken);
    if (validation.isValid && validation.userId === cookieId) {
      return cookieId;
    }
  }

  return null;
}

export function getUserFromRequest(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return null;
  }
  const db = getDb();
  return db
    .prepare("SELECT * FROM users WHERE id = ? AND deleted_at IS NULL")
    .get(userId) as Record<string, unknown> | undefined;
}

export function requireUser(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "UNAUTHORIZED", message: "Please log in." },
        { status: 401 }
      ),
    };
  }
  return { user, error: null };
}

export function requireAdmin(request: NextRequest) {
  const { user, error } = requireUser(request);
  if (error) {
    return { user: null, error };
  }
  if (!user || Number(user.is_admin) !== 1) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "FORBIDDEN", message: "Admin access required." },
        { status: 403 }
      ),
    };
  }
  return { user, error: null };
}

/**
 * Creates a new session in the database for the given user and token.
 * Called after successful login.
 */
export function createSession(
  userId: string,
  token: string,
  expiresAt: Date
) {
  const db = getDb();
  const sessionId = `sess_${randomUUID()}`;
  
  db.prepare(
    "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
  ).run(
    sessionId,
    userId,
    token,
    expiresAt.toISOString()
  );
}

/**
 * Revokes a session by deleting it from the database.
 * Called on logout.
 */
export function revokeSession(token: string) {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function setAuthCookies(
  response: NextResponse,
  userId: string,
  token: string,
  rememberMe = false
) {
  const expires = rememberMe ? addDays(new Date(), 7) : addDays(new Date(), 1);
  response.cookies.set("fg_user_id", userId, {
    path: "/",
    sameSite: "lax",
    expires,
  });
  response.cookies.set("fg_token", token, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    expires,
  });
  response.headers.set("x-session-expires", formatDate(expires));
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set("fg_user_id", "", {
    path: "/",
    expires: new Date(0),
  });
  response.cookies.set("fg_token", "", {
    path: "/",
    expires: new Date(0),
  });
}
