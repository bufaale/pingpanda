import crypto from "crypto";

/**
 * Generate a cryptographically secure portal token.
 * 32 bytes = 256 bits of entropy. Encoded as URL-safe base64 (43 chars).
 */
export function generatePortalToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Generate a short-lived token for one-time actions.
 */
export function generateTimedToken(expiresInMinutes: number = 60): {
  token: string;
  expiresAt: Date;
} {
  return {
    token: crypto.randomBytes(32).toString("base64url"),
    expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
  };
}
