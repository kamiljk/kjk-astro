const neonColors = [
  { primary: '#FF1493', hover: '#FF69B4', active: '#C71585' }, // DeepPink
  { primary: '#00FFFF', hover: '#7FFFD4', active: '#00CED1' }, // Aqua/Cyan
  { primary: '#39FF14', hover: '#ADFF2F', active: '#008000' }, // Neon Green
  { primary: '#FFFF00', hover: '#FFFACD', active: '#FFD700' }, // Yellow (using Gold for active)
  { primary: '#FF00FF', hover: '#EE82EE', active: '#DA70D6' }, // Magenta/Fuchsia
  { primary: '#FFA500', hover: '#FFDAB9', active: '#FF8C00' }, // Orange
];

// Export the function to be used by the theme toggle script
export function setRandomNeonAccent() {
  // Only apply in light mode
  if (document.body.getAttribute('data-theme') === 'light') {
    const randomIndex = Math.floor(Math.random() * neonColors.length);
    const selectedColor = neonColors[randomIndex];

    // Use requestAnimationFrame to ensure styles apply smoothly after theme change
    requestAnimationFrame(() => {
      document.body.style.setProperty('--primary-color', selectedColor.primary);
      document.body.style.setProperty('--link-hover-color', selectedColor.hover);
      document.body.style.setProperty('--link-active-color', selectedColor.active);
    });
  } else {
    // Optional: Reset to CSS defaults if switching away from light mode
    // requestAnimationFrame(() => {
    //   document.body.style.removeProperty('--primary-color');
    //   document.body.style.removeProperty('--link-hover-color');
    //   document.body.style.removeProperty('--link-active-color');
    // });
  }
}
