// src/scripts/card-nav.js

// Close overlay and restore scroll
function closeOverlay() {
  const overlay = document.getElementById('card-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
  document.body.style.overflow = '';
}

// Delegate clicks on card links
document.addEventListener('click', (event) => {
  const link = event.target.closest('a.card-link');
  if (!link) return;
  event.preventDefault();
  const url = link.href;

  fetch(url)
    .then((resp) => resp.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.querySelector('.post-content');
      const title = doc.querySelector('title')?.innerText || '';
      const overlay = document.getElementById('card-overlay');

      overlay.innerHTML = `
        <div class="overlay-inner">
          <button class="overlay-close" aria-label="Close">&times;</button>
          <h1>${title}</h1>
          ${content ? content.innerHTML : ''}
        </div>
      `;
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      // Close button handler
      overlay.querySelector('.overlay-close')?.addEventListener('click', closeOverlay);
    });
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeOverlay();
});
