import { test, expect } from '@playwright/test';

test.describe('Dropdown Visibility Validation', () => {
  test('dropdown should use correct visibility class and liquid glass effect', async ({ page }) => {
    await page.goto('/');
    
    // Find the dropdown button
    const dropdownButton = page.locator('[data-dropdown-trigger]');
    await expect(dropdownButton).toBeVisible();
    
    // Initially, dropdown should be hidden
    const dropdown = page.locator('#filter-sort-menu');
    await expect(dropdown).toHaveAttribute('hidden');
    await expect(dropdown).not.toHaveClass(/dropdown-visible/);
    
    // Click to open dropdown
    await dropdownButton.click();
    
    // Dropdown should now be visible with correct classes
    await expect(dropdown).not.toHaveAttribute('hidden');
    await expect(dropdown).toHaveClass(/liquid-glass-base/);
    await expect(dropdown).toHaveClass(/liquid-glass-dropdown/);
    await expect(dropdown).toHaveClass(/dropdown-visible/);
    
    // Verify the dropdown has liquid glass styling applied
    const computedStyle = await dropdown.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backdropFilter: style.backdropFilter,
        background: style.background,
        borderRadius: style.borderRadius,
        opacity: style.opacity,
        transform: style.transform
      };
    });
    
    // Should have backdrop filter (liquid glass effect)
    expect(computedStyle.backdropFilter).toContain('blur');
    
    // Should be fully visible and positioned correctly
    expect(computedStyle.opacity).toBe('1');
    expect(computedStyle.transform).toBe('matrix(1, 0, 0, 1, 0, 0)'); // translateY(0)
    
    // Click outside to close
    await page.click('body');
    
    // Dropdown should be hidden again
    await expect(dropdown).toHaveAttribute('hidden');
    await expect(dropdown).not.toHaveClass(/dropdown-visible/);
  });
  
  test('dropdown should not have module CSS visibility conflicts', async ({ page }) => {
    await page.goto('/');
    
    const dropdownButton = page.locator('[data-dropdown-trigger]');
    const dropdown = page.locator('#filter-sort-menu');
    
    // Open dropdown
    await dropdownButton.click();
    await expect(dropdown).toHaveClass(/dropdown-visible/);
    
    // Check that only global CSS classes control visibility
    const allClasses = await dropdown.getAttribute('class');
    console.log('Dropdown classes:', allClasses);
    
    // Should not have any module-based visibility classes
    expect(allClasses).not.toMatch(/NavbarMenu_.*visible/);
    expect(allClasses).not.toMatch(/module_.*visible/);
    
    // Should only use semantic global classes
    expect(allClasses).toContain('liquid-glass-base');
    expect(allClasses).toContain('liquid-glass-dropdown');
    expect(allClasses).toContain('dropdown-visible');
  });
});
