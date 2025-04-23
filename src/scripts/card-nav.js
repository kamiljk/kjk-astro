// src/scripts/card-nav.js

console.log('[card-nav.js] Script file loading...'); // Log file load attempt

document.addEventListener('DOMContentLoaded', () => {
  console.log('[card-nav.js] DOMContentLoaded: Script loaded.');

  const heroCard = document.getElementById('hero-card');
  const heroTitle = heroCard?.querySelector('.hero-title');
  const heroContentArea = heroCard?.querySelector('.hero-card-content');
  const heroMarkdownContainer = heroCard?.querySelector('.hero-markdown');
  const heroIframe = heroCard?.querySelector('.hero-iframe');
  const heroCloseBtn = heroCard?.querySelector('#hero-close-btn');

  if (!heroCard || !heroTitle || !heroContentArea || !heroMarkdownContainer || !heroIframe || !heroCloseBtn) {
    console.error('[card-nav.js] Critical Error: HeroCard elements not found. Card navigation cannot function.');
    return;
  }
  console.log('[card-nav.js] Found HeroCard elements:', { heroCard, heroIframe });

  // Close HeroCard and restore scroll, reset content
  function closeHeroCard() {
    console.log('[card-nav.js] closeHeroCard called.');
    heroCard.classList.remove('active');
    document.body.style.overflow = '';
    // Reset content after transition
    setTimeout(() => {
      if (heroCard.classList.contains('active')) return; // Don't clear if opened again quickly
      console.log('[card-nav.js] Resetting HeroCard content.');
      heroIframe.src = 'about:blank'; // Clear iframe source
      heroMarkdownContainer.innerHTML = ''; // Clear markdown content
      heroTitle.textContent = ''; // Clear title
      heroContentArea.classList.remove('has-iframe'); // Reset class
    }, 300); // Match CSS transition duration
  }

  // Delegate clicks on card links - USE CAPTURE PHASE
  document.addEventListener('click', (event) => {
    // Get the closest anchor link clicked
    const link = event.target.closest('a'); 
    if (!link) {
        // console.log('[card-nav.js] Click detected, but not on a link.');
        return; // Exit if the click wasn't on or inside a link
    }

    // Check if this link is one we care about (game or post card)
    const isGameCardLink = link.classList.contains('game-card');
    const isPostCardLink = link.classList.contains('card-link'); // Assuming post cards have 'card-link'

    if (!isGameCardLink && !isPostCardLink) {
        // console.log('[card-nav.js] Clicked link is not a relevant card link:', link);
        return; // Exit if it's not a relevant card link
    }

    console.log('[card-nav.js] Relevant link clicked:', link.href);

    event.preventDefault(); // Prevent default navigation
    console.log('[card-nav.js] event.preventDefault() called.');

    const rawHref = link.getAttribute('href') || '';
    const url = new URL(rawHref, window.location.href).href;
    // More robust check: ensure it's the specific game path structure
    const isGame = url.includes('/games/') && url.endsWith('/index.html'); 
    console.log('[card-nav.js] isGame check:', isGame, 'for URL:', url);

    const cardTitle = link.closest('.card, .game-card')?.querySelector('h2, h3')?.textContent?.trim() || 'Details';
    heroTitle.textContent = cardTitle;

    if (isGame) {
      console.log('[card-nav.js] Handling as game link.');
      heroIframe.src = url;
      heroMarkdownContainer.innerHTML = '';
      heroContentArea.classList.add('has-iframe');
      heroCard.classList.add('active');
      document.body.style.overflow = 'hidden';
      console.log('[card-nav.js] Game iframe src set and HeroCard activated.');
    } else {
      console.log('[card-nav.js] Handling as post link.');
      fetch(url)
        .then((resp) => {
          if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
          return resp.text();
        })
        .then((html) => {
          console.log('[card-nav.js] Post content fetched successfully.');
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const content = doc.querySelector('.post-content');
          
          heroMarkdownContainer.innerHTML = content ? content.innerHTML : '<p>Could not load content.</p>';
          heroIframe.src = 'about:blank';
          heroContentArea.classList.remove('has-iframe');
          heroCard.classList.add('active');
          document.body.style.overflow = 'hidden';
          console.log('[card-nav.js] Post content displayed and HeroCard activated.');
        })
        .catch((error) => {
          console.error('[card-nav.js] Error fetching post content:', error);
          heroMarkdownContainer.innerHTML = '<p>Error loading content. Please try again later.</p>';
          heroIframe.src = 'about:blank';
          heroContentArea.classList.remove('has-iframe');
          heroCard.classList.add('active');
          document.body.style.overflow = 'hidden';
        });
    }
  }, true); // <--- Use capture phase: true

  // Close button handler
  heroCloseBtn.addEventListener('click', closeHeroCard);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && heroCard.classList.contains('active')) {
      console.log('[card-nav.js] Escape key pressed, closing HeroCard.');
      closeHeroCard();
    }
  });

  // Close if clicking outside the card content area (on the backdrop)
  heroCard.addEventListener('click', (event) => {
    if (event.target === heroCard) {
      console.log('[card-nav.js] Backdrop clicked, closing HeroCard.');
      closeHeroCard();
    }
  });
});
