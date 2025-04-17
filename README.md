# KJK Astro Portfolio & Media Gallery

A modular, responsive website built with Astro that serves as a personal portfolio, blog, and interactive gallery of HTML5 games.

## 🏗️ Architecture Overview

This site follows a component-based architecture with clear separation of concerns:

### Core Components & Data Flow

- **MainLayout**: Base layout wrapper containing Navbar and content areas
- **Navbar/Sidebar**: Navigation components for site-wide navigation and theme toggle 
- **CardGrid**: Primary content display component that renders a responsive grid of content cards
- **Card System**: Extensible card components (Card.astro, CardGame.astro) that display content from markdown files
- **Dynamic Routes**: `[slug].astro` and `[type].astro` power the content filtering system

### Content Management

- **Markdown Content**: Blog posts and game descriptions stored as markdown files with frontmatter
- **Content Types**: Posts categorized by `type` frontmatter property for filtering
- **Interactive HTML5 Games**: Self-contained game folders in `/public/games/` 

### User Experience Features

- **Light/Dark Theme**: Client-side theme toggle with system preference detection
- **Responsive Design**: Mobile-first design with fluid typography and layout adjustments
- **Content Filtering**: Media types filterable via `/media/[type]` routes
- **Hero Cards**: Expanded view of content items with smooth transitions
- **About Section**: Dedicated about page with modular information cards

## 🚀 Features

- **Astro Framework**: Fast, content-driven static site generator
- **Markdown Posts**: Blog posts stored in `src/pages/posts/*.md` with frontmatter fields (title, description, date, type)
- **Media Filtering**: `/media/[type]` pages filter posts by frontmatter `type` (e.g., game, article)
- **Game Library**: HTML5 game pages under `public/games/<game>/` and an auto-generated listing on `/games/`
- **Responsive UI**: Card-based grid layout adapts to mobile, tablet, and desktop
- **Dark/Light Theme Toggle**: Client‑side theme switcher with system preference support
- **Custom Layouts & Components**: Reusable Astro components (Navbar, Sidebar, Card, CardGrid, CardGame, AboutGrid, HeroSection)

## 📁 Project Structure

```
/ (root)
├── public/               Static assets and games
│   ├── scripts/          Shared client scripts (card-nav.js, theme toggle)
│   ├── games/            HTML5 game folders (index.html, assets, scripts)
│   ├── favicon.svg       Site favicon
│   └── fonts/            Custom fonts
├── src/
│   ├── assets/           global.css for resets and design system
│   ├── components/       Reusable UI components
│   │   ├── AboutGrid.astro    About page information cards
│   │   ├── Card.astro         Base card component for content items
│   │   ├── CardGame.astro     Specialized card for game entries
│   │   ├── CardGrid.astro     Responsive grid for displaying cards
│   │   ├── GameCards.astro    Grid container for game cards
│   │   ├── HeroCard.astro     Expanded view of content items
│   │   ├── HeroSection.astro  Header section with site intro
│   │   ├── Navbar.astro       Top navigation bar
│   │   └── Sidebar.astro      Alternative navigation component
│   ├── layouts/
│   │   └── MainLayout.astro   Base layout template for all pages
│   ├── pages/
│   │   ├── index.astro        Home page
│   │   ├── about.astro        About page
│   │   ├── media/             Content filtering by type
│   │   │   └── [type].astro   Dynamic routes for filtering
│   │   └── posts/             Markdown content
│   │       ├── *.md           Individual posts with frontmatter
│   │       └── [slug].astro   Dynamic route to render posts
│   └── scripts/               Client-side JavaScript
├── astro.config.mjs           Astro configuration
├── package.json               Dependencies and scripts
├── tsconfig.json              TypeScript configuration
└── README.md                  This documentation
```

## 🛠️ Development

Install dependencies:

```
npm install
```

Run dev server:

```
npm run dev
```

Build for production:

```
npm run build
```

Preview production build locally:

```
npm run preview
```

## 📦 Deployment

This site is configured for Vercel via `@astrojs/vercel`. Simply push to GitHub and deploy. Ensure environment settings if needed.

## 💡 Contributing

1. Fork the repo
2. Create a feature branch
3. Submit a pull request

## 🔗 Links

- Astro Docs: https://docs.astro.build
- Vercel Deployment: https://vercel.com/docs
