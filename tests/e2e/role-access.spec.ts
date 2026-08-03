import { expect, test, type Page } from "@playwright/test";

const configured = Boolean(process.env.E2E_BASE_URL && process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD && process.env.E2E_TEACHER_EMAIL && process.env.E2E_TEACHER_PASSWORD && process.env.E2E_STUDENT_EMAIL && process.env.E2E_STUDENT_PASSWORD && process.env.E2E_PARENT_EMAIL && process.env.E2E_PARENT_PASSWORD);

async function signIn(page: Page, email: string, password: string, expectedPath: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(new RegExp(`${expectedPath.replace("/", "\\/")}(?:$|\\?)`));
}

test.describe("role access", () => {
  test.skip(!configured, "Set E2E_BASE_URL and the four fictional test-role credentials to run browser coverage.");

  test("admin authentication reaches operational routes", async ({ page }) => {
    await signIn(page, process.env.E2E_ADMIN_EMAIL!, process.env.E2E_ADMIN_PASSWORD!, "/admin");
    await expect(page.getByRole("heading", { name: "Admin dashboard" })).toBeVisible();
    await page.goto("/admin/fees");
    await expect(page.getByRole("heading", { name: "Manual fee records" })).toBeVisible();
  });

  test("teacher scope excludes administration and permits attendance and grades", async ({ page }) => {
    await signIn(page, process.env.E2E_TEACHER_EMAIL!, process.env.E2E_TEACHER_PASSWORD!, "/teacher");
    await page.goto("/admin");
    await expect(page).toHaveURL(/unauthorized/);
    await page.goto("/teacher/attendance");
    await expect(page.getByRole("heading", { name: "Mark attendance" })).toBeVisible();
    await page.goto("/teacher/grades");
    await expect(page.getByRole("heading", { name: "My gradebooks" })).toBeVisible();
  });

  test("student and parent isolation keeps operational routes read-only", async ({ page }) => {
    await signIn(page, process.env.E2E_STUDENT_EMAIL!, process.env.E2E_STUDENT_PASSWORD!, "/student");
    await page.goto("/admin/fees");
    await expect(page).toHaveURL(/unauthorized/);
    await page.goto("/student/results");
    await expect(page.getByRole("heading", { name: "My published results" })).toBeVisible();
    await signIn(page, process.env.E2E_PARENT_EMAIL!, process.env.E2E_PARENT_PASSWORD!, "/parent");
    await page.goto("/parent/attendance");
    await expect(page.getByRole("heading", { name: "Attendance" })).toBeVisible();
    await page.goto("/teacher/grades");
    await expect(page).toHaveURL(/unauthorized/);
  });
});
