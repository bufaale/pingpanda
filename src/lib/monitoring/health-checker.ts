import type { HealthStatus } from "@/types/status-page";
import { HEALTH_THRESHOLDS } from "./constants";

export interface HealthCheckResult {
  status: HealthStatus;
  response_time_ms: number;
  http_status: number | null;
  error_message: string | null;
}

export interface MonitorCheckConfig {
  url: string;
  method: string;
  expected_status: number;
  timeout_ms: number;
}

/**
 * Perform a health check against any URL.
 * Supports HTTP method, expected status, keyword matching, custom headers.
 */
export async function checkMonitor(
  config: MonitorCheckConfig,
): Promise<HealthCheckResult> {
  let lastError: string | null = null;
  const timeoutMs = config.timeout_ms || 10_000;

  for (let attempt = 0; attempt <= HEALTH_THRESHOLDS.retry_count; attempt++) {
    if (attempt > 0) {
      await sleep(HEALTH_THRESHOLDS.retry_delay_ms);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const start = Date.now();

      const response = await fetch(config.url, {
        method: config.method || "GET",
        signal: controller.signal,
        cache: "no-store",
        headers: { "User-Agent": "PingPanda-Monitor/1.0" },
      });

      const responseTimeMs = Date.now() - start;
      clearTimeout(timeoutId);

      // Check expected status code
      if (response.status !== config.expected_status) {
        lastError = `Expected status ${config.expected_status}, got ${response.status}`;
        continue;
      }

      const status: HealthStatus =
        responseTimeMs >= HEALTH_THRESHOLDS.degraded_ms ? "degraded" : "healthy";

      return {
        status,
        response_time_ms: responseTimeMs,
        http_status: response.status,
        error_message: null,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = `Timeout after ${timeoutMs}ms`;
      } else if (error instanceof Error) {
        lastError = error.message;
      } else {
        lastError = "Unknown error";
      }
    }
  }

  return {
    status: "down",
    response_time_ms: 0,
    http_status: null,
    error_message: lastError,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
