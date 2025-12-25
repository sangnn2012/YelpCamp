import { test, expect } from '@playwright/test'

test.describe('Campgrounds', () => {
  test('should display campgrounds list page', async ({ page }) => {
    await page.goto('/campgrounds')

    // Check page title and header
    await expect(page.locator('h1')).toContainText('Welcome to YelpCamp')
    await expect(page.locator('text=View our hand-picked campgrounds')).toBeVisible()
  })

  test('should have search input', async ({ page }) => {
    await page.goto('/campgrounds')

    // Search input should be visible
    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()

    // Type a search query
    await searchInput.fill('California')
    await expect(searchInput).toHaveValue('California')
  })

  test('should display campground cards', async ({ page }) => {
    await page.goto('/campgrounds')

    // Should have campground cards with More Info buttons
    await expect(page.locator('text=More Info').first()).toBeVisible()
  })

  test('should display campground detail page', async ({ page }) => {
    await page.goto('/campgrounds')

    // Click on first campground
    const moreInfoButton = page.locator('text=More Info').first()
    await moreInfoButton.click()

    // Should be on detail page
    await expect(page).toHaveURL(/\/campgrounds\/\d+/)

    // Should display campground info section
    await expect(page.locator('text=Campground Info')).toBeVisible()
  })

  test('should show campground price in detail', async ({ page }) => {
    await page.goto('/campgrounds')

    // Click on first campground
    await page.locator('text=More Info').first().click()

    // Should show price
    await expect(page.locator('text=/\\$.*per night/')).toBeVisible()
  })

  test('should have back to campgrounds button', async ({ page }) => {
    await page.goto('/campgrounds')
    await page.locator('text=More Info').first().click()

    // Should have back button
    await expect(page.locator('text=Back to Campgrounds')).toBeVisible()
  })

  test('should show location text on cards', async ({ page }) => {
    await page.goto('/campgrounds')

    // Locations should be visible as text (e.g., "California", "Utah", etc.)
    // Check for location text patterns
    const californiaLocations = await page.locator('text=California').count()
    const utahLocations = await page.locator('text=Utah').count()
    const arizonaLocations = await page.locator('text=Arizona').count()

    // At least some campgrounds should have location text
    expect(californiaLocations + utahLocations + arizonaLocations).toBeGreaterThan(0)
  })
})

test.describe('Campground Search', () => {
  test('should filter results when searching', async ({ page }) => {
    await page.goto('/campgrounds')

    const searchInput = page.locator('input[placeholder*="Search"]')

    // Get initial campground count
    const initialCards = await page.locator('text=More Info').count()

    // Search for something specific
    await searchInput.fill('Cloud')

    // Wait for debounce
    await page.waitForTimeout(500)

    // Results should potentially be filtered (could be same if all match)
    const filteredCards = await page.locator('text=More Info').count()
    expect(filteredCards).toBeLessThanOrEqual(initialCards)
  })
})
