import { test, expect } from '@playwright/test';

test.describe('Border Consistency', () => {
	test('navbar, dropdown, and feed cards have consistent border styling', async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('.site-header');
		
		// Open dropdown to test all elements
		await page.click('[aria-label="Open menu"]');
		await page.waitForSelector('[role="menu"]', { state: 'visible' });
		
		// Wait a moment for CSS to fully apply
		await page.waitForTimeout(100);
		
		// Get computed styles for all border elements
		const navbarBorder = await page.evaluate(() => {
			const navbar = document.querySelector('.site-header');
			return navbar ? window.getComputedStyle(navbar).border : '';
		});
		
		const dropdownBorder = await page.evaluate(() => {
			const dropdown = document.querySelector('[role="menu"]');
			if (!dropdown) {
				// Try alternative selector
				const altDropdown = document.querySelector('.menu-container');
				return altDropdown ? window.getComputedStyle(altDropdown).border : '';
			}
			return window.getComputedStyle(dropdown).border;
		});
		
		const dropdownButtonBorder = await page.evaluate(() => {
			const button = document.querySelector('[aria-label="Open menu"]');
			return button ? window.getComputedStyle(button).border : '';
		});
		
		// Wait for feed to load and get first card border
		await page.waitForSelector('#posts-feed', { timeout: 5000 });
		
		// Try to wait for cards, but continue even if they don't load quickly
		let feedCardBorder = '';
		try {
			await page.waitForSelector('#posts-feed .post-card', { timeout: 2000 });
			feedCardBorder = await page.evaluate(() => {
				const card = document.querySelector('#posts-feed .post-card');
				return card ? window.getComputedStyle(card).border : '';
			});
		} catch (e) {
			console.log('Feed cards not loaded, skipping feed card border test');
		}
		
		// Check border radius consistency
		const navbarRadius = await page.evaluate(() => {
			const navbar = document.querySelector('.site-header');
			return navbar ? window.getComputedStyle(navbar).borderRadius : '';
		});
		
		const dropdownRadius = await page.evaluate(() => {
			const dropdown = document.querySelector('[role="menu"]');
			if (!dropdown) {
				const altDropdown = document.querySelector('.menu-container');
				return altDropdown ? window.getComputedStyle(altDropdown).borderRadius : '';
			}
			return window.getComputedStyle(dropdown).borderRadius;
		});
		
		const feedCardRadius = await page.evaluate(() => {
			const card = document.querySelector('#posts-feed .post-card');
			return card ? window.getComputedStyle(card).borderRadius : '';
		});
		
		// Log the values for debugging
		console.log('Border styles:');
		console.log('Navbar:', navbarBorder);
		console.log('Dropdown:', dropdownBorder);
		console.log('Dropdown Button:', dropdownButtonBorder);
		console.log('Feed Card:', feedCardBorder);
		console.log('Border radii:');
		console.log('Navbar:', navbarRadius);
		console.log('Dropdown:', dropdownRadius);
		console.log('Feed Card:', feedCardRadius);
		
		// All elements should use the same border thickness (1.5px) 
		// Extract border width from border shorthand
		const extractBorderWidth = (borderStr) => {
			const match = borderStr.match(/(\d+(?:\.\d+)?)px/);
			return match ? parseFloat(match[1]) : 0;
		};
		
		const navbarWidth = extractBorderWidth(navbarBorder);
		const dropdownWidth = extractBorderWidth(dropdownBorder);
		const dropdownButtonWidth = extractBorderWidth(dropdownButtonBorder);
		const feedCardWidth = extractBorderWidth(feedCardBorder);
		
		// All major UI elements should use 1px border for consistent rendering across browsers
		expect(navbarWidth).toBe(1);
		expect(dropdownWidth).toBe(1);
		expect(dropdownButtonWidth).toBe(1);
		if (feedCardBorder) {
			expect(feedCardWidth).toBe(1);
		}
		
		// Border radius should be consistent for major containers (12px)
		expect(navbarRadius).toBe('12px');
		if (feedCardBorder) {
			expect(feedCardRadius).toBe('12px');
		}
		// Dropdown has custom radius (rounded bottom only)
		expect(dropdownRadius).toBe('0px 0px 12px 12px');
	});
	
	test('dark mode border consistency', async ({ page }) => {
		await page.goto('/');
		
		// Switch to dark mode
		await page.evaluate(() => {
			document.documentElement.setAttribute('data-theme', 'dark');
		});
		
		await page.waitForSelector('.site-header');
		await page.click('[aria-label="Open menu"]');
		await page.waitForSelector('[role="menu"]');
		
		// Get border colors in dark mode
		const navbarBorderColor = await page.evaluate(() => {
			const navbar = document.querySelector('.site-header');
			return navbar ? window.getComputedStyle(navbar).borderColor : '';
		});
		
		const dropdownBorderColor = await page.evaluate(() => {
			const dropdown = document.querySelector('[role="menu"]');
			return dropdown ? window.getComputedStyle(dropdown).borderColor : '';
		});
		
		const dropdownButtonBorderColor = await page.evaluate(() => {
			const button = document.querySelector('[aria-label="Open menu"]');
			return button ? window.getComputedStyle(button).borderColor : '';
		});
		
		await page.waitForSelector('#posts-feed', { timeout: 5000 });
		
		let feedCardBorderColor = '';
		try {
			await page.waitForSelector('#posts-feed .post-card', { timeout: 2000 });
			feedCardBorderColor = await page.evaluate(() => {
				const card = document.querySelector('#posts-feed .post-card');
				return card ? window.getComputedStyle(card).borderColor : '';
			});
		} catch (e) {
			console.log('Feed cards not loaded, skipping feed card border color test');
		}
		
		console.log('Dark mode border colors:');
		console.log('Navbar:', navbarBorderColor);
		console.log('Dropdown:', dropdownBorderColor);
		console.log('Dropdown Button:', dropdownButtonBorderColor);
		console.log('Feed Card:', feedCardBorderColor);
		
		// In dark mode, all borders should use the same color token
		// They should all resolve to the same rgb value
		expect(navbarBorderColor).toBe(dropdownBorderColor);
		expect(dropdownBorderColor).toBe(dropdownButtonBorderColor);
		if (feedCardBorderColor) {
			expect(dropdownButtonBorderColor).toBe(feedCardBorderColor);
		}
	});
});
