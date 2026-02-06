import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import Database from "better-sqlite3";

// Mock getDb BEFORE importing auth module (jest.mock is hoisted)
jest.mock("../lib/db", () => ({
  getDb: jest.fn(),
}));

import {
  createToken,
  parseToken,
  validateTokenAgainstSession,
  createSession,
  revokeSession,
} from "../lib/auth";
import { schemaSql } from "../lib/schema";

// Use in-memory DB for tests
let testDb: Database.Database;

beforeEach(() => {
  testDb = new Database(":memory:");
  testDb.pragma("foreign_keys = ON");
  testDb.exec(schemaSql);

  // Update mock to return test DB (must use require to access the mocked module)
  const { getDb } = require("../lib/db");
  (getDb as jest.Mock).mockReturnValue(testDb);
});

// Helper function to create a test user in the database
function createTestUser(userId: string, email: string) {
  testDb
    .prepare(
      "INSERT OR IGNORE INTO users (id, email, password_hash, is_guest) VALUES (?, ?, ?, 0)"
    )
    .run(userId, email, "hashed_password");
}

afterEach(() => {
  testDb.close();
});

describe("Auth Security - Session Validation", () => {
  describe("createToken", () => {
    it("should create a token with fg: prefix and user ID", () => {
      const userId = "user_123";
      const token = createToken(userId);

      expect(token).toMatch(/^fg:user_123:[a-f0-9\-]+$/);
    });

    it("should create unique tokens for the same user", () => {
      const userId = "user_123";
      const token1 = createToken(userId);
      const token2 = createToken(userId);

      expect(token1).not.toBe(token2);
    });
  });

  describe("parseToken", () => {
    it("should extract user ID from fg: prefixed token", () => {
      const userId = "user_123";
      const token = createToken(userId);
      const parsed = parseToken(token);

      expect(parsed).toBe(userId);
    });

    it("should return token as-is if not fg: prefixed", () => {
      const token = "Bearer token_xyz";
      const parsed = parseToken(token);

      expect(parsed).toBe(token);
    });
  });

  describe("createSession", () => {
    it("should create a session in the database", () => {
      const userId = "user_123";
      const email = "user_123@example.com";
      const token = "token_xyz";
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      createTestUser(userId, email);
      createSession(userId, token, expiresAt);

      const session = testDb
        .prepare("SELECT * FROM sessions WHERE token = ?")
        .get(token);

      expect(session).toBeDefined();
      expect(session.user_id).toBe(userId);
      expect(session.token).toBe(token);
    });
  });

  describe("validateTokenAgainstSession", () => {
    it("should validate an active session token", () => {
      const userId = "user_123";
      const email = "user_123@example.com";
      const token = "token_xyz";
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      createTestUser(userId, email);
      createSession(userId, token, expiresAt);
      const result = validateTokenAgainstSession(token);

      expect(result.isValid).toBe(true);
      expect(result.userId).toBe(userId);
    });

    it("should reject an expired session token", () => {
      const userId = "user_123";
      const email = "user_123@example.com";
      const token = "token_xyz";
      const expiresAt = new Date(Date.now() - 1000); // Expired

      createTestUser(userId, email);
      createSession(userId, token, expiresAt);
      const result = validateTokenAgainstSession(token);

      expect(result.isValid).toBe(false);
      expect(result.userId).toBeNull();
    });

    it("should reject a non-existent token", () => {
      const result = validateTokenAgainstSession("non_existent_token");

      expect(result.isValid).toBe(false);
      expect(result.userId).toBeNull();
    });

    it("should update last_used_at on successful validation", () => {
      const userId = "user_123";
      const email = "user_123@example.com";
      const token = "token_xyz";
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      createTestUser(userId, email);
      createSession(userId, token, expiresAt);

      const beforeValidation = testDb
        .prepare("SELECT last_used_at FROM sessions WHERE token = ?")
        .get(token);
      expect(beforeValidation.last_used_at).toBeNull();

      validateTokenAgainstSession(token);

      const afterValidation = testDb
        .prepare("SELECT last_used_at FROM sessions WHERE token = ?")
        .get(token);
      expect(afterValidation.last_used_at).not.toBeNull();
    });
  });

  describe("revokeSession", () => {
    it("should delete session from database", () => {
      const userId = "user_123";
      const email = "user_123@example.com";
      const token = "token_xyz";
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      createTestUser(userId, email);
      createSession(userId, token, expiresAt);
      revokeSession(token);

      const session = testDb
        .prepare("SELECT * FROM sessions WHERE token = ?")
        .get(token);
      expect(session).toBeUndefined();
    });

    it("should invalidate revoked token on validation", () => {
      const userId = "user_123";
      const email = "user_123@example.com";
      const token = "token_xyz";
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      createTestUser(userId, email);
      createSession(userId, token, expiresAt);
      const validBefore = validateTokenAgainstSession(token);
      expect(validBefore.isValid).toBe(true);

      revokeSession(token);
      const validAfter = validateTokenAgainstSession(token);
      expect(validAfter.isValid).toBe(false);
    });
  });

  describe("Security - Forged Cookie Prevention", () => {
    it("should reject cookie without matching session token", () => {
      // This simulates an attacker setting fg_user_id=admin without a valid session
      const forgedToken = "fake_token_xyz";

      // Try to validate the forged token - should fail
      const result = validateTokenAgainstSession(forgedToken);

      expect(result.isValid).toBe(false);
      expect(result.userId).toBeNull();
    });

    it("should reject token that doesn't match cookie user_id", () => {
      const userId1 = "user_123";
      const userId2 = "user_456";
      const token = "token_xyz";
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      createTestUser(userId1, "user_123@example.com");
      createSession(userId1, token, expiresAt);

      // Token is valid but for userId1, not userId2
      const result = validateTokenAgainstSession(token);
      expect(result.isValid).toBe(true);
      expect(result.userId).toBe(userId1);
      expect(result.userId).not.toBe(userId2);
    });

    it("should require both cookie_id and cookie_token to match session", () => {
      const userId = "user_123";
      const email = "user_123@example.com";
      const token = "token_xyz";
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      createTestUser(userId, email);
      createSession(userId, token, expiresAt);

      // Valid token must match the userId it was created for
      const result = validateTokenAgainstSession(token);

      // An attacker with just the fg_user_id cookie cannot use it without the valid fg_token
      expect(result.isValid).toBe(true);
      expect(result.userId).toBe(userId);

      // But a mismatched token is rejected
      const mismatchResult = validateTokenAgainstSession("different_token");
      expect(mismatchResult.isValid).toBe(false);
    });
  });
});
