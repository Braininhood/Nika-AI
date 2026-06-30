import { test, expect } from "@playwright/test";

async function waitForServiceWorker(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return;
    await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
  });
  // Second load lets the controller serve precached shell
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
}

test.describe("Phase 0 PWA smoke", () => {
  test("production shell and PWA assets are served", async ({ page }) => {
    for (const path of ["/", "/login", "/dashboard", "/manifest.json", "/sw.js", "/nika/avatar/nika-companion.png"]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
    }

    const manifest = await page.evaluate(async () => {
      const res = await fetch("/manifest.json");
      return res.json();
    });
    expect(manifest.name).toBe("OET Coach");
    expect(manifest.icons?.length).toBeGreaterThan(0);

    const swText = await page.evaluate(async () => {
      const res = await fetch("/sw.js");
      return res.text();
    });
    expect(swText.length).toBeGreaterThan(100);
  });

  test("app shell loads while offline", async ({ page, context }) => {
    await waitForServiceWorker(page);
    await expect(page.getByText("Welcome to OET Coach")).toBeVisible();

    await context.setOffline(true);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Welcome to OET Coach")).toBeVisible({ timeout: 15000 });
  });
});
