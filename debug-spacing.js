// Debug script to check spacing
const script = document.createElement('script');
script.textContent = `
console.log('=== SPACING DEBUG ===');
const body = document.body;
const main = document.querySelector('main');
const navbar = document.querySelector('header, nav, [class*="navbar"], [class*="nav"]');
const firstPost = document.querySelector('li:first-child, [class*="post"]:first-child');

console.log('Body computed styles:');
const bodyStyles = getComputedStyle(body);
console.log('  padding-top:', bodyStyles.paddingTop);
console.log('  margin-top:', bodyStyles.marginTop);

console.log('Main computed styles:');
const mainStyles = getComputedStyle(main);
console.log('  padding-top:', mainStyles.paddingTop);
console.log('  margin-top:', mainStyles.marginTop);

if (navbar) {
  console.log('Navbar element found:', navbar.tagName, navbar.className);
  const navbarStyles = getComputedStyle(navbar);
  console.log('  height:', navbarStyles.height);
  console.log('  position:', navbarStyles.position);
  console.log('  top:', navbarStyles.top);
}

if (firstPost) {
  console.log('First post element found:', firstPost.tagName, firstPost.className);
  const rect = firstPost.getBoundingClientRect();
  console.log('  distance from top:', rect.top + 'px');
}

console.log('CSS Variables:');
console.log('  --navbar-height:', getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'));
`;
document.head.appendChild(script);
