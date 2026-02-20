import { z } from "zod";
import dns from "dns/promises";
import { isIP } from "net";

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\./,
  /^198\.1[89]\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^fd/i,
];

function isPrivateIP(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((range) => range.test(ip));
}

const BLOCKED_HOSTNAMES = [
  "localhost",
  "metadata.google.internal",
  "metadata.google.com",
  "169.254.169.254",
  "metadata",
  "[::1]",
];

/** Zod schema for URL input with SSRF protection (hostname check). */
export const urlInputSchema = z
  .string()
  .min(1, "URL is required")
  .max(2048, "URL is too long")
  .transform((url) => {
    let u = url.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      u = `https://${u}`;
    }
    return u;
  })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "Only HTTP/HTTPS URLs are allowed" },
  )
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        if (BLOCKED_HOSTNAMES.includes(hostname)) return false;
        if (isIP(hostname)) return !isPrivateIP(hostname);
        if (/[^\w.\-]/.test(hostname)) return false;
        return true;
      } catch {
        return false;
      }
    },
    { message: "This URL is not allowed" },
  );

/**
 * DNS resolution check. Call AFTER URL validation, BEFORE fetching.
 * Prevents DNS rebinding where a domain resolves to private IPs.
 */
export async function validateResolvedIP(hostname: string): Promise<boolean> {
  try {
    const addresses = await dns.resolve4(hostname);
    for (const ip of addresses) {
      if (isPrivateIP(ip)) return false;
    }
    try {
      const ipv6Addresses = await dns.resolve6(hostname);
      for (const ip of ipv6Addresses) {
        if (isPrivateIP(ip)) return false;
      }
    } catch {
      // No AAAA record is fine
    }
    return true;
  } catch {
    return false;
  }
}
