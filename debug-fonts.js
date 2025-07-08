// Debug script to check font rendering
console.log('=== FONT DEBUG ===');

// Wait for page to load
setTimeout(() => {
  const arrowSpans = document.querySelectorAll('sub');
  console.log('Found arrow spans:', arrowSpans.length);
  
  arrowSpans.forEach((span, i) => {
    const computed = getComputedStyle(span);
    console.log(`Arrow span ${i}:`);
    console.log('  content:', span.textContent);
    console.log('  font-family:', computed.fontFamily);
    console.log('  font-weight:', computed.fontWeight);
    console.log('  font-size:', computed.fontSize);
  });

  // Check if Inter font is loaded
  if (document.fonts) {
    console.log('Font loading API available');
    document.fonts.forEach(font => {
      console.log('Loaded font:', font.family, font.weight, font.style);
    });
  }
}, 2000);
