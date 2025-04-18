import React, { useState, useEffect } from 'react';
import HeroCard from './HeroCard.astro';

// Load all post modules eagerly
const modules = import.meta.glob('../content/posts/*.md', { eager: true }) as Record<string, any>;

export default function PostModal() {
  const [show, setShow] = useState(false);
  const [active, setActive] = useState<any>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const tgt = (e.target as HTMLElement).closest('a,button');
      if (!tgt) return;
      // close button
      if (tgt.tagName === 'BUTTON' && tgt.id === 'hero-close-btn') {
        setShow(false);
        return;
      }
      // post link
      if (tgt.tagName === 'A') {
        const href = (tgt as HTMLAnchorElement).getAttribute('href') || '';
        if (href.startsWith('/posts/')) {
          e.preventDefault();
          const slug = href.replace('/posts/', '');
          const key = Object.keys(modules).find(path => path.endsWith(`${slug}.md`));
          if (key) {
            setActive(modules[key]);
            setShow(true);
          }
        }
      }
    }
    // catch all clicks on body so nested links in the modal also work
    document.body.addEventListener('click', handleClick);
    return () => document.body.removeEventListener('click', handleClick);
  }, []);

  if (!show || !active) return null;
  return (
    <HeroCard title={active.frontmatter.title} content={active} date={new Date(active.frontmatter.date)} />
  );
}