import React, { useState, useEffect } from 'react';
import HeroCard from './HeroCard.astro'; // Assuming HeroCard can handle iframeSrc

// Load all post modules eagerly
const modules = import.meta.glob('../content/posts/*.md', { eager: true }) as Record<string, any>;

interface ActiveContent {
  isGame: boolean;
  title: string;
  slug: string;
  content?: any; // Markdown content
  date?: Date;
}

export default function PostModal() {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState<ActiveContent | null>(null);

  // Function to close the modal and dispatch event
  const closeModal = () => {
    setShow(false);
    setActive(null);
    // Dispatch a custom event when modal closes
    document.dispatchEvent(new CustomEvent('modalClosed'));
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const tgt = (e.target as HTMLElement).closest('a,button');
      if (!tgt) return;

      // Close button
      if (tgt.tagName === 'BUTTON' && tgt.id === 'hero-close-btn') {
        closeModal(); // Use the closeModal function
        return;
      }

      // Check for card title link (.card-open-hero)
      if (tgt.tagName === 'A' && tgt.classList.contains('card-open-hero')) {
        e.preventDefault();
        const slug = (tgt as HTMLAnchorElement).dataset.postSlug || '';
        const title = tgt.textContent || 'Untitled'; // Get title from link text
        const parentCard = tgt.closest('.card');
        const isGame = parentCard?.classList.contains('game-card') || false;

        if (isGame) {
          // It's a game card, set up for iframe
          setActive({ isGame: true, title: title, slug: slug });
          setShow(true);
        } else {
          // It's a regular post card, find the markdown module
          const key = Object.keys(modules).find(path => path.endsWith(`${slug}.md`));
          if (key) {
            const moduleContent = modules[key];
            setActive({
              isGame: false,
              title: moduleContent.frontmatter.title,
              slug: slug,
              content: moduleContent,
              date: new Date(moduleContent.frontmatter.date)
            });
            setShow(true);
          } else {
            console.error(`Markdown file for slug '${slug}' not found.`);
            // Optionally handle error, e.g., show a message
          }
        }
      }
    }

    document.body.addEventListener('click', handleClick);
    return () => document.body.removeEventListener('click', handleClick);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeModal(); // Use the closeModal function
      }
    }
    if (show) {
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.removeEventListener('keydown', handleKeydown);
    }
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [show]);

  if (!show || !active) return null;

  // Conditionally render HeroCard based on active content type
  return (
    <HeroCard
      title={active.title}
      iframeSrc={active.isGame ? `/games/${active.slug}/index.html` : undefined}
      content={active.isGame ? undefined : active.content}
      date={active.isGame ? undefined : active.date}
    />
  );
}