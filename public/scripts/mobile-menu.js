/**
 * Simple mobile menu toggle functionality
 */
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger-menu');
  const navLinks = document.querySelectorAll('.nav-list a');
  
  if (!navbar || !hamburger) return;
  
  // Set initial state
  hamburger.setAttribute('aria-expanded', 'false');
  
  // Toggle menu on hamburger click
  hamburger.addEventListener('click', (event) => {
    event.preventDefault();
    
    const isExpanded = navbar.classList.contains('expanded');
    
    // Toggle menu state
    navbar.classList.toggle('expanded');
    hamburger.setAttribute('aria-expanded', !isExpanded);
  });
  
  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('expanded');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navbar.classList.contains('expanded')) {
      navbar.classList.remove('expanded');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
});