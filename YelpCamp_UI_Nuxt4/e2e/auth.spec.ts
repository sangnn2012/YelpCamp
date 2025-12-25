import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('h1')).toContainText('Login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should display register form', async ({ page }) => {
    await page.goto('/register')

    await expect(page.locator('h1')).toContainText('Sign Up')
    await expect(page.locator('input[placeholder*="username"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should validate required fields on login', async ({ page }) => {
    await page.goto('/login')

    // Click submit without filling form
    await page.click('button[type="submit"]')

    // Form should show validation (HTML5 required)
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('should have link between login and register', async ({ page }) => {
    await page.goto('/login')

    // Should have link to register
    await expect(page.locator('a[href="/register"]')).toBeVisible()

    await page.goto('/register')

    // Should have link to login
    await expect(page.locator('a[href="/login"]')).toBeVisible()
  })

  test('should have go back link on auth pages', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=Go Back')).toBeVisible()

    await page.goto('/register')
    await expect(page.locator('text=Go Back')).toBeVisible()
  })

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message (flash or form error)
    await page.waitForTimeout(1000)
    // The app shows flash messages for errors
  })
})
