import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/YelpCamp/)
  })

  test('should navigate to campgrounds list', async ({ page }) => {
    await page.goto('/')
    await page.click('text=View All Campgrounds')
    await expect(page).toHaveURL('/campgrounds')
    await expect(page.locator('h1')).toContainText('Welcome to YelpCamp')
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Login')
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Login')
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Sign Up')
    await expect(page).toHaveURL('/register')
    await expect(page.locator('h1')).toContainText('Sign Up')
  })
})
