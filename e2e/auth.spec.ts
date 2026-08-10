import { expect, test } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should render the login page correctly", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveTitle(/Expense Tracker/i);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();

    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByText("Don't have an account?")).toBeVisible();
  });

  test("should display validation errors on empty submit", async ({ page }) => {
    await page.goto("/login");

    const submitBtn = page.getByRole("button", { name: "Sign in" });
    await submitBtn.click();

    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/.*\/register/);
    await expect(
      page.getByRole("heading", { name: "Create an account" }),
    ).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/.*\/forgot-password/);
    await expect(
      page.getByRole("heading", { name: "Reset Password" }),
    ).toBeVisible();
  });
});
