document.addEventListener('DOMContentLoaded', () => {
  console.log("--- [Mobile Menu - v4] SCRIPT LOADED ---");

  const hamburgerButton = document.querySelector('.hamburger-menu');
  const navbar = document.querySelector('.navbar');

  console.log("--- [Mobile Menu - v4] Hamburger button:", hamburgerButton);
  console.log("--- [Mobile Menu - v4] Navbar:", navbar);

  if (hamburgerButton && navbar) {
    console.log("--- [Mobile Menu - v4] Adding click listener to hamburger.");
    hamburgerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      console.log("--- [Mobile Menu - v4] HAMBURGER CLICKED! ---");
      navbar.classList.toggle('expanded');
      const isExpanded = navbar.classList.contains('expanded');
      hamburgerButton.setAttribute('aria-expanded', String(isExpanded));
      console.log("--- [Mobile Menu - v4] Navbar expanded toggled. Is now expanded:", isExpanded);
    });
  } else {
    if (!hamburgerButton) console.error('--- [Mobile Menu - v4] ERROR: Hamburger button (.hamburger-menu) NOT FOUND.');
    if (!navbar) console.error('--- [Mobile Menu - v4] ERROR: Navbar (.navbar) NOT FOUND.');
  }
});
