/**
 * Random HDR Neon Color Generator
 * Generates vibrant HDR-ready neon colors and applies them to the site
 * These colors are randomly generated on each page load
 */

// Check if the display supports HDR P3 color space
const supportsP3 = window.matchMedia('(color-gamut: p3)').matches;

// Generate a random neon color (keeping in the lime-cyan-magenta vibrant space)
function generateHDRNeonColor() {
  // Create random value but constrain to vibrant neon color space
  
  // Random selector to choose color family (0 = lime/green, 1 = cyan/blue, 2 = magenta/pink)
  const colorFamily = Math.floor(Math.random() * 3);
  
  let r, g, b;
  
  switch(colorFamily) {
    case 0: // Neon greens/lime
      r = Math.floor(Math.random() * 100); // Low red
      g = 255; // Max green
      b = Math.floor(Math.random() * 120); // Low-medium blue
      break;
    case 1: // Neon cyan/blue
      r = Math.floor(Math.random() * 80); // Low red
      g = 150 + Math.floor(Math.random() * 105); // High green
      b = 255; // Max blue
      break;
    case 2: // Neon pink/magenta
      r = 255; // Max red
      g = Math.floor(Math.random() * 80); // Low green
      b = 150 + Math.floor(Math.random() * 105); // High blue
      break;
  }
  
  // Return both standard RGB and P3 color formats
  return {
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgbValues: [r, g, b],
    p3: `color(display-p3 ${(r/255).toFixed(3)} ${(g/255).toFixed(3)} ${(b/255).toFixed(3)})`
  };
}

// Generate hover and active colors based on the primary
function generateColorVariants(color) {
  const [r, g, b] = color.rgbValues;
  
  // For hover - make it slightly more vibrant or saturated
  const hoverR = Math.min(255, r * 1.1);
  const hoverG = Math.min(255, g * 1.1);
  const hoverB = Math.min(255, b * 1.1);
  
  // For active - make it slightly darker
  const activeR = r * 0.9;
  const activeG = g * 0.9;
  const activeB = b * 0.9;
  
  return {
    hover: {
      rgb: `rgb(${Math.floor(hoverR)}, ${Math.floor(hoverG)}, ${Math.floor(hoverB)})`,
      p3: `color(display-p3 ${(hoverR/255).toFixed(3)} ${(hoverG/255).toFixed(3)} ${(hoverB/255).toFixed(3)})`
    },
    active: {
      rgb: `rgb(${Math.floor(activeR)}, ${Math.floor(activeG)}, ${Math.floor(activeB)})`,
      p3: `color(display-p3 ${(activeR/255).toFixed(3)} ${(activeG/255).toFixed(3)} ${(activeB/255).toFixed(3)})`
    }
  };
}

// Save current color to localStorage
function saveAccentColor(color) {
  if (!color) {
    const root = document.documentElement;
    const primaryColor = root.style.getPropertyValue('--primary-color');
    const primaryRgb = root.style.getPropertyValue('--primary-color-rgb');
    
    if (primaryColor && primaryRgb) {
      localStorage.setItem('accent-color', primaryColor);
      localStorage.setItem('accent-color-rgb', primaryRgb);
      return true;
    }
    return false;
  }
  
  localStorage.setItem('accent-color', color.supportsP3 ? color.p3 : color.rgb);
  localStorage.setItem('accent-color-rgb', color.rgbValues.join(', '));
  return true;
}

// Restore saved color from localStorage
export function restoreAccentColor() {
  const root = document.documentElement;
  const savedColor = localStorage.getItem('accent-color');
  const savedRgb = localStorage.getItem('accent-color-rgb');
  
  if (savedColor && savedRgb) {
    root.style.setProperty('--primary-color', savedColor);
    root.style.setProperty('--highlight-color', savedColor);
    root.style.setProperty('--primary-color-rgb', savedRgb);
    
    // We need to recalculate hover and active states
    const rgbValues = savedRgb.split(',').map(val => parseInt(val.trim()));
    if (rgbValues.length === 3) {
      const variants = generateColorVariants({ rgbValues });
      
      if (supportsP3) {
        root.style.setProperty('--highlight-hover', variants.hover.p3);
        root.style.setProperty('--highlight-active', variants.active.p3);
      } else {
        root.style.setProperty('--highlight-hover', variants.hover.rgb);
        root.style.setProperty('--highlight-active', variants.active.rgb);
      }
    }
    
    return true;
  }
  
  return false;
}

// Apply random color to the site
export function setRandomNeonAccent() {
  const root = document.documentElement;
  const primaryColor = generateHDRNeonColor();
  const variants = generateColorVariants(primaryColor);
  
  // Set both standard and P3 CSS variables
  if (supportsP3) {
    root.style.setProperty('--primary-color', primaryColor.p3);
    root.style.setProperty('--highlight-color', primaryColor.p3);
    root.style.setProperty('--highlight-hover', variants.hover.p3);
    root.style.setProperty('--highlight-active', variants.active.p3);
    
    // Mark the document as HDR-capable
    document.body.setAttribute('data-hdr', 'true');
  } else {
    root.style.setProperty('--primary-color', primaryColor.rgb);
    root.style.setProperty('--highlight-color', primaryColor.rgb);
    root.style.setProperty('--highlight-hover', variants.hover.rgb);
    root.style.setProperty('--highlight-active', variants.active.rgb);
  }
  
  // Set RGB values for effects like shadows, overlays, etc.
  root.style.setProperty('--primary-color-rgb', primaryColor.rgbValues.join(', '));
  
  // Save the color
  saveAccentColor(primaryColor);
  
  console.log(`Applied random neon color: ${supportsP3 ? primaryColor.p3 : primaryColor.rgb}`);
  return primaryColor;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  // Apply random color if no saved color exists
  if (!restoreAccentColor()) {
    setRandomNeonAccent();
  }
});
