/**
 * HDR Detection Script
 * Detects if the display supports HDR and adds the appropriate data attribute to the body
 */

import { setRandomNeonAccent } from './random-theme-color.js';

function detectHDRSupport() {
  // First check for dynamic-range media query (Safari and latest browsers)
  const hasHDRSupport = window.matchMedia("(dynamic-range: high)").matches;
  
  // Fallback to color-gamut media query (wider support, but not exactly the same as HDR)
  const hasP3Support = window.matchMedia("(color-gamut: p3)").matches;
  
  // Save current colors before changing HDR status (to preserve any random colors)
  const currentPrimary = document.body.style.getPropertyValue('--primary-color');
  const currentHover = document.body.style.getPropertyValue('--link-hover-color');
  const currentActive = document.body.style.getPropertyValue('--link-active-color');
  const currentHighlight = document.body.style.getPropertyValue('--highlight-color');
  
  // Mark the body with the data-hdr attribute for styling
  if (hasHDRSupport || hasP3Support) {
    document.body.setAttribute('data-hdr', 'true');
    console.log(hasHDRSupport ? 'HDR display detected and enabled' : 'P3 color gamut support detected');
  } else {
    document.body.setAttribute('data-hdr', 'false');
    console.log('Standard display detected');
  }
  
  // Mark that we've checked HDR status
  document.documentElement.setAttribute('data-hdr-checked', 'true');
  
  // Restore any dynamic colors after HDR status change
  if (currentPrimary) {
    requestAnimationFrame(() => {
      document.body.style.setProperty('--primary-color', currentPrimary);
      document.body.style.setProperty('--link-hover-color', currentHover);
      document.body.style.setProperty('--link-active-color', currentActive);
      document.body.style.setProperty('--highlight-color', currentHighlight || currentPrimary);
    });
  } else if (document.body.getAttribute('data-theme') === 'light') {
    // If no colors were set yet and we're in light mode, set random ones
    setRandomNeonAccent();
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', detectHDRSupport);

// Also check when theme changes (in case theme impacts HDR detection)
document.addEventListener('themeChanged', detectHDRSupport);