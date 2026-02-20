import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("GET /api/health returns 200 with status", async ({ request }) => {
    const response = await request.get("/api/health");
    // Health check may return 200 (healthy) or 503 (degraded if DB is unavailable)
    expect([200, 503]).toContain(response.status());

    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("checks");
    expect(body).toHaveProperty("latency");
    expect(body).toHaveProperty("timestamp");
    expect(body.checks).toHaveProperty("app", true);
  });

  test("POST /api/subscribe without body returns 400", async ({
    request,
  }) => {
    const response = await request.post("/api/subscribe", {
      headers: { "Content-Type": "application/json" },
      data: {},
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  test("GET /api/cron/check without auth returns 401", async ({
    request,
  }) => {
    const response = await request.get("/api/cron/check");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });

  test("GET /api/cron/cleanup without auth returns 401", async ({
    request,
  }) => {
    const response = await request.get("/api/cron/cleanup");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });

  test("POST /api/status-pages without auth returns 401", async ({
    request,
  }) => {
    const response = await request.post("/api/status-pages", {
      headers: { "Content-Type": "application/json" },
      data: { name: "Test", slug: "test" },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });

  test("POST /api/monitors without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/monitors", {
      headers: { "Content-Type": "application/json" },
      data: { name: "Test", url: "https://example.com" },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });
});
