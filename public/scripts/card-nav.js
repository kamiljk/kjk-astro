console.log('[card-nav.js] File parsing started.');

// Declare variables in the outer scope
let heroCard = null;
let heroTitle = null;
let heroContentArea = null;
let heroMarkdownContainer = null;
let heroIframe = null;
let heroCloseBtn = null;

// Function to close HeroCard and restore scroll, reset content
function closeHeroCard() {
  if (!heroCard) return; // Guard clause
  console.log('[card-nav.js] closeHeroCard called.');
  heroCard.classList.remove('active');
  document.body.style.overflow = '';
  // Reset content after transition
  setTimeout(() => {
    if (!heroCard || heroCard.classList.contains('active')) return; // Don't clear if opened again quickly
    console.log('[card-nav.js] Resetting HeroCard content.');
    if (heroIframe) heroIframe.src = 'about:blank'; // Clear iframe source
    if (heroMarkdownContainer) heroMarkdownContainer.innerHTML = ''; // Clear markdown content
    if (heroTitle) heroTitle.textContent = ''; // Clear title
    if (heroContentArea) heroContentArea.classList.remove('has-iframe'); // Reset class
  }, 300); // Match CSS transition duration
}

// Delegate clicks on card links - USE CAPTURE PHASE
document.addEventListener('click', (event) => {
  console.log('[card-nav.js] Click event detected on document (capture phase).');

  // Lazy-initialize hero elements if not already
  if (!heroCard) {
    heroCard = document.querySelector('.hero-card');
    heroTitle = heroCard?.querySelector('.hero-title');
    heroContentArea = heroCard?.querySelector('.hero-card-content');
    heroMarkdownContainer = heroCard?.querySelector('.hero-markdown');
    heroIframe = heroCard?.querySelector('.hero-iframe');
    heroCloseBtn = heroCard?.querySelector('.hero-close-btn');

    if (!heroCard || !heroTitle || !heroContentArea || !heroMarkdownContainer || !heroCloseBtn) {
      console.error('[card-nav.js] Lazy init error: HeroCard elements not found.');
      return;
    }
    console.log('[card-nav.js] Lazy init: Found HeroCard elements.');
    // Attach close button and backdrop listeners
    heroCloseBtn.addEventListener('click', closeHeroCard);
    heroCard.addEventListener('click', (e) => {
      if (e.target === heroCard) closeHeroCard();
    });
  }

  // Check if hero elements are ready before processing click
  if (!heroCard || !heroTitle || !heroContentArea || !heroMarkdownContainer) {
      console.warn('[card-nav.js] Click detected, but HeroCard elements not ready yet.');
      return;
  }

  // Get the closest anchor link clicked
  const link = event.target.closest('a'); 
  if (!link) {
      // console.log('[card-nav.js] Click detected, but not on a link.');
      return; // Exit if the click wasn't on or inside a link
  }

  const isGameCardLink = link.classList.contains('game-card');
  const isPostCardLink = link.classList.contains('card-link'); // Assuming post cards have 'card-link'

  const rawHref = link.getAttribute('href') || '';
  const url = new URL(rawHref, window.location.href).href;

  const cardTitle = link.closest('.card, .game-card')?.querySelector('h2, h3')?.textContent?.trim() || 'Details';

  // If it's a game card, embed via iframe
  if (isGameCardLink) {
    event.preventDefault(); // Prevent full-page navigation for game links
    console.log('[card-nav.js] Handling as game link: embedding in iframe.');
    heroTitle.textContent = cardTitle;
    heroContentArea.classList.add('has-iframe');
    // Ensure an iframe exists
    let iframe = heroIframe;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.className = 'hero-iframe';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'autoplay; encrypted-media');
      iframe.setAttribute('allowfullscreen', '');
      heroContentArea.appendChild(iframe);
      heroIframe = iframe;
    }
    iframe.src = rawHref;  // Use relative path for file protocol contexts
    heroMarkdownContainer.innerHTML = '';
    heroCard.classList.add('active');
    document.body.style.overflow = 'hidden';
    return;  // Stop further handling
  }

  // Treat both game and post cards the same way: fetch content from the link's href
  if (!isGameCardLink && !isPostCardLink) {
      // console.log('[card-nav.js] Clicked link is not a relevant card link:', link);
      return; // Exit if it's not a relevant card link
  }

  console.log('[card-nav.js] Relevant link clicked:', link.href);

  event.preventDefault(); // Prevent default navigation
  console.log('[card-nav.js] event.preventDefault() called.');

  // ALWAYS fetch content now
  console.log('[card-nav.js] Handling as content link (post).');
  fetch(url)
    .then((resp) => {
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.text();
    })
    .then((html) => {
      console.log('[card-nav.js] Content fetched successfully.');
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.querySelector('.post-content, .content, main, article');
      heroMarkdownContainer.innerHTML = content ? content.innerHTML : '<p>Could not load content.</p>';
      heroContentArea.classList.remove('has-iframe');

      heroCard.classList.add('active');
      document.body.style.overflow = 'hidden';
      console.log('[card-nav.js] Content displayed and HeroCard activated.');
    })
    .catch((error) => {
      console.error('[card-nav.js] Error fetching content:', error);
      if (heroMarkdownContainer) heroMarkdownContainer.innerHTML = '<p>Error loading content. Please try again later.</p>';
      heroContentArea.classList.remove('has-iframe');
      heroCard.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  // END of unified fetch logic

}, true); // <--- Use capture phase: true

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && heroCard && heroCard.classList.contains('active')) {
    console.log('[card-nav.js] Escape key pressed, closing HeroCard.');
    closeHeroCard();
  }
});
