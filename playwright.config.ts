// Vendor
import { defineConfig, devices } from "@playwright/test";

// Own port so a running `pnpm dev` on :3000 never collides with (or stands in
// for) the preview build under test.
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm build && pnpm preview",
    url: BASE_URL,
    // Always build and preview: never adopt a dev server or a stale preview.
    reuseExistingServer: false,
    // Pin the deploy-shaped env vars, otherwise a shell that exports
    // NUXT_APP_BASE_URL=/darts/ (or NUXT_SPA=true) bakes that into the build
    // and the suite silently tests a different target than the app's default.
    env: {
      PORT: String(PORT),
      NUXT_APP_BASE_URL: "/",
      NUXT_SPA: "false",
    },
    timeout: 120_000,
  },
});
