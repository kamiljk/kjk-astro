/**
 * Enhanced Mobile Menu - v9
 * Improved mobile menu toggle functionality
 */

// Simple global function to toggle the menu
function toggleMobileMenu(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger-menu');

  if (!navbar || !hamburger) {
    console.warn('Navbar or hamburger menu not found');
    return;
  }

  const isExpanded = navbar.classList.contains('expanded');
  
  if (isExpanded) {
    // Closing the menu
    navbar.classList.remove('expanded');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  } else {
    // Opening the menu
    navbar.classList.add('expanded');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  console.log(`Mobile menu ${isExpanded ? 'closed' : 'opened'}`);
}

// Function to close the menu with optional animation
function closeMenu(animate = true) {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger-menu');
  const navList = document.querySelector('.nav-list');
  
  if (navbar && navbar.classList.contains('expanded')) {
    if (animate && navList) {
      // First fade out the nav items
      navList.style.opacity = '0';
      navList.style.transform = 'translateY(-10px)';
      
      // Then after a short delay remove expanded class
      setTimeout(() => {
        navbar.classList.remove('expanded');
        if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
        
        // Reset the styles after animation completes
        setTimeout(() => {
          navList.style.opacity = '';
          navList.style.transform = '';
        }, 300);
      }, 150);
    } else {
      // Immediate close without animation
      navbar.classList.remove('expanded');
      if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
    console.log('Mobile menu closed');
  }
}

// Add event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Mobile menu script loaded (v9)');

  const hamburger = document.querySelector('.hamburger-menu');
  const navLinks = document.querySelectorAll('.nav-list a'); // Changed selector to match structure

  // Toggle menu when hamburger is clicked
  if (hamburger) {
    hamburger.setAttribute('aria-expanded', 'false'); // Initialize ARIA state
    hamburger.setAttribute('aria-controls', 'nav-list');
    hamburger.addEventListener('click', toggleMobileMenu);
  }

  // Close menu when a nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger-menu');

    // Check if the menu is expanded and the click is outside the navbar itself
    if (navbar && 
        navbar.classList.contains('expanded') && 
        !navbar.contains(event.target)) {
      closeMenu();
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
});

// Ensure initialization runs even if DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  console.log('Document already loaded, initializing mobile menu immediately');
  const hamburger = document.querySelector('.hamburger-menu');
  if (hamburger && !hamburger.hasAttribute('data-listener-attached')) { // Prevent double listeners
     hamburger.addEventListener('click', toggleMobileMenu);
     hamburger.setAttribute('data-listener-attached', 'true');
  }
}
