# Using Live Preview with Astro Development Server

## Using VS Code Live Preview with Astro

When you need to inspect elements and add them to chat context while developing:

1. Install the "Live Preview" extension for VS Code
   - Search for "Live Preview" in the Extensions marketplace
   - Install the one published by Microsoft

2. Run your Astro dev server:
```bash
npm run dev
```

3. Open Live Preview alongside your dev server:
   - Click the "Show Preview" button in the editor toolbar (or Ctrl+Alt+P)
   - In the command palette, select "Live Preview: Show Preview"
   - Alternatively, right-click on an HTML/Astro file and select "Show Preview"

4. Use Live Preview's developer tools:
   - Right-click in the preview and select "Inspect Element"
   - Use the Element Inspector to find selectors, classes, or HTML structure
   - Copy elements or selectors directly from the inspector

5. Link Live Preview to your running Astro server:
   - In Live Preview settings, set "Custom Server" to your Astro URL (typically http://localhost:3000)
   - This ensures you're inspecting the fully rendered Astro output

## Alternative: Using Playwright UI Mode

For your Playwright tests, you can use UI mode which provides a live interface:

```bash
npx playwright test --ui
```

This opens a visual interface where you can see your tests run and inspect results in real-time.
