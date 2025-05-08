import { test, expect, Page } from '@playwright/test';

test.describe('Minecraft Face Generator', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/games/flow-face-2/');
    // Make sure the face is fully loaded
    await page.waitForSelector('#face-container .pixel');
  });

  test('should generate a random face on load', async () => {
    // Check if the face container has pixels
    const pixelCount = await page.locator('#face-container .pixel').count();
    expect(pixelCount).toBe(16 * 16); // 16x16 grid
    
    // Check if some pixels have colors (not all are empty)
    const coloredPixels = await page.$$eval('#face-container .pixel', 
      pixels => pixels.filter(p => (p as HTMLElement).style.backgroundColor !== '').length);
    expect(coloredPixels).toBeGreaterThan(0);
  });

  test('should generate a new face when space key is pressed', async () => {
    // Get initial face pattern by sampling a few pixels
    const initialColors = await getSamplePixelColors(page);
    
    // Press space key to generate a new face
    await page.keyboard.press('Space');
    await page.waitForTimeout(500); // Wait for the new face to render
    
    // Get new face pattern
    const newColors = await getSamplePixelColors(page);
    
    // Expect at least some pixels to have changed color
    expectSomePixelsChanged(initialColors, newColors);
  });

  test('should load preset faces when buttons are clicked', async () => {
    // Open the dropdown menu
    await page.click('#dropdown-toggle');
    
    // Test each preset
    const presets = ['ghost', 'pig', 'zombie', 'cyclops', 'orc', 'predator'];
    
    for (const preset of presets) {
      await page.click(`.preset-button[data-preset="${preset}"]`);
      await page.waitForTimeout(300); // Allow time for face to render
      
      // Verify the face container has content (this is a basic check)
      const coloredPixels = await page.$$eval('#face-container .pixel', 
        pixels => pixels.filter(p => (p as HTMLElement).style.backgroundColor !== '').length);
      expect(coloredPixels).toBeGreaterThan(0);
      
      // Reopen dropdown for next preset
      await page.click('#dropdown-toggle');
    }
  });

  test('should track mouse movement with eye pupils', async () => {
    // First, select the pig preset which has consistent eyes
    await page.click('#dropdown-toggle');
    await page.click('.preset-button[data-preset="pig"]');
    
    // Get the face container's bounding box
    const boundingBox = await page.locator('#face-container').boundingBox();
    if (!boundingBox) throw new Error("Couldn't get face container bounding box");
    
    // Record initial pupil positions
    const initialPupilPositions = await getEyePositions(page);
    
    // Move mouse to the left side of the face
    await page.mouse.move(boundingBox.x + 10, boundingBox.y + boundingBox.height / 2);
    await page.waitForTimeout(100);
    
    const leftPupilPositions = await getEyePositions(page);
    
    // Move mouse to the right side of the face
    await page.mouse.move(boundingBox.x + boundingBox.width - 10, boundingBox.y + boundingBox.height / 2);
    await page.waitForTimeout(100);
    
    const rightPupilPositions = await getEyePositions(page);
    
    // Expect pupils to have moved from their initial positions
    expect(leftPupilPositions).not.toEqual(initialPupilPositions);
    expect(rightPupilPositions).not.toEqual(leftPupilPositions);
  });

  test('should export SVG when export button is clicked', async () => {
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Open dropdown and click export
    await page.click('#dropdown-toggle');
    await page.click('#export-svg');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Check filename
    expect(download.suggestedFilename()).toBe('minecraft-face.svg');
  });

  test('should display a procedurally generated name above the face', async () => {
    const nameElement = await page.locator('#face-name');
    const nameText = await nameElement.textContent();
    expect(nameText).toMatch(/^[A-Z][a-z]+/); // Check if the name starts with a capital letter and follows the pattern
  });

  test('should update the name when reroll button is clicked', async () => {
    const initialName = await page.locator('#face-name').textContent();
    await page.click('#reroll-button');
    const newName = await page.locator('#face-name').textContent();
    expect(newName).not.toBe(initialName); // Ensure the name changes
  });

  test('should include the name and date in exported SVG file name', async () => {
    const name = await page.locator('#face-name').textContent();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-svg-button');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(new RegExp(`${name}-\\d{4}-\\d{2}-\\d{2}\\.svg`));
  });

  test('should include the name and date in exported PNG file name', async () => {
    const name = await page.locator('#face-name').textContent();
    const downloadPromise = page.waitForEvent('download');
    await page.click('#export-png-button');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(new RegExp(`${name}-\\d{4}-\\d{2}-\\d{2}\\.png`));
  });
});

// Helper functions
async function getSamplePixelColors(page: Page): Promise<string[]> {
  // Sample colors from specific pixels (e.g., eyes, mouth area)
  const samplePoints = [[5, 5], [10, 5], [7, 11]]; // Typical locations for eyes and mouth
  
  const colors = await Promise.all(samplePoints.map(async ([x, y]) => {
    return page.$eval(`.pixel[data-x="${x}"][data-y="${y}"]`, 
      elem => (elem as HTMLElement).style.backgroundColor);
  }));
  
  return colors;
}

function expectSomePixelsChanged(oldColors: string[], newColors: string[]): void {
  let changesFound = false;
  for (let i = 0; i < oldColors.length; i++) {
    if (oldColors[i] !== newColors[i]) {
      changesFound = true;
      break;
    }
  }
  expect(changesFound).toBeTruthy();
}

async function getEyePositions(page: Page): Promise<{x: number, y: number}[]> {
  // This gets the positions of eye pupils by finding black pixels in the eye regions
  return page.evaluate(() => {
    // This function runs in the browser context
    const faceContainer = document.getElementById('face-container');
    const eyeInfo = (window as any).eyeInfo;
    if (!eyeInfo || !eyeInfo.length) {
      // Fall back to finding dark-colored pixels in typical eye regions
      const positions = [];
      const pixels = faceContainer!.querySelectorAll('.pixel');
      
      // Typical eye regions for most presets
      const leftEyeRegion = {x: 4, y: 5, width: 2, height: 2};
      const rightEyeRegion = {x: 10, y: 5, width: 2, height: 2};
      
      for (const pixel of pixels) {
        const x = parseInt(pixel.getAttribute('data-x') || '0');
        const y = parseInt(pixel.getAttribute('data-y') || '0');
        const style = (pixel as HTMLElement).style;
        
        // Check if this is a dark pixel in eye regions - likely a pupil
        if ((style.backgroundColor === 'rgb(0, 0, 0)' || style.backgroundColor.includes('0, 0, 0')) && 
            (isInRegion(x, y, leftEyeRegion) || isInRegion(x, y, rightEyeRegion))) {
          positions.push({x, y});
        }
      }
      return positions;
    }
    
    // Use eyeInfo if available (more reliable)
    return eyeInfo.map((eye: any) => ({
      x: eye.currentPupilPos.x,
      y: eye.currentPupilPos.y
    }));
    
    function isInRegion(x: number, y: number, region: {x: number, y: number, width: number, height: number}) {
      return x >= region.x && x < region.x + region.width && 
             y >= region.y && y < region.y + region.height;
    }
  });
}
