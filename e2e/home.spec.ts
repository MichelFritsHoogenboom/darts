import { test, expect } from "@playwright/test";

test("home loads and shows the Quick Friendly action", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: "Quick Friendly" }),
  ).toBeVisible();
});
