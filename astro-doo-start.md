# Astro DOO Start Guide

*A complete setup guide for rebuilding the KJK Astro site from scratch*

## Project Initialization

### 1. Create New Astro Project

```bash
# Create new Astro project
npm create astro@latest kjk-astro-2H25

# Navigate to project
cd kjk-astro-2H25

# Install dependencies
npm install
```

### 2. Install Core Dependencies

```bash
# Add Astro integrations
npm install @astrojs/vercel @astrojs/react @astrojs/svelte

# Add search functionality
npm install astro-pagefind

# Add content utilities
npm install gray-matter

# Add React dependencies
npm install react react-dom

# Add development dependencies
npm install -D @playwright/test @types/node typescript

# Add Svelte (if keeping hybrid approach)
npm install svelte
```

### 4. Content Collections Setup

```bash
# Add content collections utilities
npm install @astrojs/content

# Create content folder
mkdir src/content

# Add example schema
cat <<EOL > src/content/config.ts
export const schema = {
  posts: {
    title: "string",
    description: "string",
    dateCreated: "Date",
    type: "string",
    dateUpdated: "Date",
  },
};
EOL
```

## Configuration Files

### 3. Configure Astro (`astro.config.mjs`)

```javascript
// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    pagefind()
  ],
  adapter: vercel(),
  output: "hybrid" // For dynamic content management
});
```

### 4. TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.astro",
    "src/**/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "public",
    "tests"
  ]
}
```

### 5. Package.json Scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "start": "vercel dev --listen 3000",
    "test": "playwright test",
    "astro": "astro"
  }
}
```

## Project Structure Setup

### 6. Create Directory Structure

```bash
# Create main directories
mkdir -p src/{content,layouts,components,pages,utils,assets}

# Create component subdirectories
mkdir -p src/components/{common,islands,features,admin}

# Create content subdirectories
mkdir -p src/content/{posts,pages}

# Create public directories
mkdir -p public/{styles,scripts,assets,images}

# Create utility directories
mkdir -p src/utils/{content,search,theme}

# Create test directories
mkdir -p tests/{unit,e2e}
```

### 7. Content Collections Schema (`src/content/config.ts`)

```typescript
import { defineCollection, z } from 'astro:content';

const dateField = z.preprocess(
  (val) => {
    if (val instanceof Date) return val;
    if (typeof val === 'string' || typeof val === 'number') {
      return new Date(val);
    }
    return undefined;
  },
  z.date()
);

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    dateCreated: dateField,
    dateUpdated: dateField.optional(),
    type: z.enum(['post', 'read', 'play', 'about']).default('post'),
    slug: z.string().optional(),
    show: z.boolean().default(false),
    priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
    tags: z.array(z.string()).default([]),
    author: z.string().default('KJK'),
    thumbnail: z.string().optional(),
    excerpt: z.string().optional()
  })
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    dateCreated: dateField,
    dateUpdated: dateField.optional(),
    show: z.boolean().default(true),
    slug: z.string().optional()
  })
});

export const collections = {
  posts,
  pages
};
```

## Core Components

### 8. Base Layout (`src/layouts/BaseLayout.astro`)

```astro
---
export interface Props {
  title?: string;
  description?: string;
  type?: string;
  sort?: string;
  order?: string;
}

const { 
  title = "KJK Site",
  description = "Personal blog and portfolio",
  type = "all",
  sort = "created",
  order = "desc"
} = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    
    <!-- Styles -->
    <link rel="stylesheet" href="/styles/global.css" />
    <link rel="stylesheet" href="/styles/components.css" />
    
    <!-- Theme script (prevent FOUC) -->
    <script is:inline>
      (function() {
        try {
          const theme = localStorage.getItem('theme');
          if (theme) {
            document.documentElement.dataset.theme = theme;
          }
        } catch (e) {}
      })();
    </script>
  </head>
  
  <body>
    <div class="site-container">
      <header class="site-header">
        <slot name="header" />
      </header>
      
      <main class="site-main" data-pagefind-body>
        <slot />
      </main>
      
      <footer class="site-footer">
        <slot name="footer" />
      </footer>
    </div>
    
    <!-- Scripts -->
    <script src="/scripts/theme.js"></script>
    <script src="/scripts/search.js"></script>
  </body>
</html>
```

### 9. Navigation Component (`src/components/common/Navbar.astro`)

```astro
---
export interface Props {
  currentPath?: string;
  taxonomy?: string[];
}

const { 
  currentPath = "/",
  taxonomy = ["all", "post", "read", "play", "about"]
} = Astro.props;
---

<nav class="navbar">
  <div class="navbar-content">
    <a href="/" class="navbar-logo">
      <img src="/assets/logo.svg" alt="KJK" />
    </a>
    
    <div class="navbar-search">
      <slot name="search" />
    </div>
    
    <div class="navbar-menu">
      <slot name="menu" />
    </div>
    
    <div class="navbar-theme">
      <slot name="theme" />
    </div>
  </div>
</nav>
```

### 10. Feed Component (`src/components/islands/Feed.jsx`)

```jsx
import { useState, useEffect } from 'react';

export default function Feed({ 
  initialPosts = [], 
  type = "all", 
  sort = "created", 
  order = "desc" 
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Load more posts
  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/posts?page=${page + 1}&type=${type}&sort=${sort}&order=${order}`);
      const data = await response.json();
      
      if (data.posts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
    setLoading(false);
  };

  return (
    <div className="feed">
      <div className="feed-posts">
        {posts.map(post => (
          <article key={post.slug} className="post-card">
            <h2>
              <a href={`/posts/${post.slug}`}>{post.data.title}</a>
            </h2>
            <p>{post.data.description}</p>
            <div className="post-meta">
              <time>{post.data.dateCreated.toLocaleDateString()}</time>
              <span className="post-type">{post.data.type}</span>
            </div>
          </article>
        ))}
      </div>
      
      {hasMore && (
        <button 
          onClick={loadMore} 
          disabled={loading}
          className="load-more-button"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## Content Management

### 11. Admin Page (`src/pages/admin/index.astro`)

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import AdminPanel from '../../components/admin/AdminPanel.jsx';
---

<BaseLayout title="Admin Panel">
  <h1>Content Management</h1>
  <AdminPanel client:load />
</BaseLayout>
```

### 12. Admin Panel Component (`src/components/admin/AdminPanel.jsx`)

```jsx
import { useState } from 'react';

export default function AdminPanel() {
  const [posts, setPosts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const createPost = async (postData) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      
      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Posts</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="create-button"
        >
          Create New Post
        </button>
      </div>
      
      {isCreating && (
        <PostForm 
          onSave={createPost}
          onCancel={() => setIsCreating(false)}
        />
      )}
      
      <div className="posts-list">
        {posts.map(post => (
          <PostItem key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

function PostForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'post',
    content: '',
    show: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      dateCreated: new Date().toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        required
      />
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        required
      />
      
      <select
        value={formData.type}
        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
      >
        <option value="post">Post</option>
        <option value="read">Read</option>
        <option value="play">Play</option>
        <option value="about">About</option>
      </select>
      
      <textarea
        placeholder="Content (Markdown)"
        value={formData.content}
        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
        rows={10}
        required
      />
      
      <label>
        <input
          type="checkbox"
          checked={formData.show}
          onChange={(e) => setFormData(prev => ({ ...prev, show: e.target.checked }))}
        />
        Show publicly
      </label>
      
      <div className="form-actions">
        <button type="submit">Save Post</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function PostItem({ post }) {
  return (
    <div className="post-item">
      <h3>{post.data.title}</h3>
      <p>{post.data.description}</p>
      <div className="post-actions">
        <button>Edit</button>
        <button>Delete</button>
      </div>
    </div>
  );
}
```

## API Routes

### 13. Posts API (`src/pages/api/posts.ts`)

```typescript
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async ({ url }) => {
  const searchParams = new URL(url).searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const type = searchParams.get('type') || 'all';
  const sort = searchParams.get('sort') || 'created';
  const order = searchParams.get('order') || 'desc';
  const limit = 10;

  try {
    const allPosts = await getCollection('posts');
    const visiblePosts = allPosts.filter(post => post.data.show);
    
    // Filter by type
    const filteredPosts = type === 'all' 
      ? visiblePosts 
      : visiblePosts.filter(post => post.data.type === type);
    
    // Sort posts
    const sortedPosts = filteredPosts.sort((a, b) => {
      let aVal, bVal;
      
      if (sort === 'created') {
        aVal = new Date(a.data.dateCreated).getTime();
        bVal = new Date(b.data.dateCreated).getTime();
      } else if (sort === 'updated') {
        aVal = new Date(a.data.dateUpdated || a.data.dateCreated).getTime();
        bVal = new Date(b.data.dateUpdated || b.data.dateCreated).getTime();
      } else if (sort === 'title') {
        aVal = a.data.title.toLowerCase();
        bVal = b.data.title.toLowerCase();
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    // Paginate
    const start = (page - 1) * limit;
    const posts = sortedPosts.slice(start, start + limit);
    
    return new Response(JSON.stringify({
      posts,
      hasMore: start + limit < sortedPosts.length,
      total: sortedPosts.length
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Create frontmatter
    const frontmatter = {
      title: data.title,
      description: data.description,
      dateCreated: data.dateCreated,
      type: data.type,
      show: data.show,
      ...(data.tags && { tags: data.tags }),
      ...(data.priority && { priority: data.priority })
    };
    
    // Create file content
    const fileContent = `---
${Object.entries(frontmatter)
  .map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
  .join('\n')}
---

${data.content || ''}
`;
    
    // Write file
    const filePath = path.join(process.cwd(), 'src', 'content', 'posts', `${slug}.md`);
    await fs.writeFile(filePath, fileContent, 'utf-8');
    
    return new Response(JSON.stringify({ 
      success: true, 
      slug,
      message: 'Post created successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to create post',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

## Styling System

### 14. Global Styles (`public/styles/global.css`)

```css
/* CSS Custom Properties */
:root {
  /* Colors */
  --color-primary: #007acc;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  
  /* Typography */
  --font-family-sans: system-ui, -apple-system, sans-serif;
  --font-family-mono: 'Fira Code', monospace;
  --font-size-base: 1rem;
  --line-height-base: 1.5;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-xxl: 3rem;
  
  /* Layout */
  --container-max-width: 1200px;
  --navbar-height: 4rem;
  --border-radius: 0.375rem;
  --border-width: 1px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Dark theme */
[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #e5e5e5;
  --color-border: #333;
}

/* Light theme */
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #333333;
  --color-border: #e5e5e5;
}

/* Base styles */
* {
  box-sizing: border-box;
}

html {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

body {
  margin: 0;
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.2s, color 0.2s;
}

/* Layout */
.site-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-main {
  flex: 1;
  padding: var(--spacing-lg);
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin: 0 0 var(--spacing-md) 0;
  font-weight: 600;
  line-height: 1.2;
}

p {
  margin: 0 0 var(--spacing-md) 0;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Utilities */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 15. Component Styles (`public/styles/components.css`)

```css
/* Navbar */
.navbar {
  height: var(--navbar-height);
  background-color: var(--color-bg);
  border-bottom: var(--border-width) solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo img {
  height: 2rem;
}

/* Feed */
.feed {
  max-width: 800px;
  margin: 0 auto;
}

.feed-posts {
  display: grid;
  gap: var(--spacing-xl);
}

.post-card {
  padding: var(--spacing-lg);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-bg);
}

.post-card h2 {
  margin-bottom: var(--spacing-sm);
}

.post-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--color-secondary);
  margin-top: var(--spacing-md);
}

.post-type {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Buttons */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: var(--border-width) solid transparent;
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.button-primary {
  background-color: var(--color-primary);
  color: white;
}

.button-primary:hover {
  background-color: color-mix(in srgb, var(--color-primary) 90%, black);
}

.button-secondary {
  background-color: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}

.button-secondary:hover {
  background-color: var(--color-border);
}

/* Forms */
.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  background-color: var(--color-bg);
  color: var(--color-text);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

/* Admin Panel */
.admin-panel {
  max-width: 1000px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.post-form {
  background-color: var(--color-bg);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.posts-list {
  display: grid;
  gap: var(--spacing-md);
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius);
}

.post-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 var(--spacing-md);
  }
  
  .site-main {
    padding: var(--spacing-md);
  }
  
  .admin-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .post-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
}
```

## Scripts

### 16. Theme Script (`public/scripts/theme.js`)

```javascript
// Theme management
class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme() || 'light';
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.bindEvents();
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('theme');
    } catch {
      return null;
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    this.setStoredTheme(theme);
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.theme);
  }

  bindEvents() {
    // Listen for theme toggle buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-theme-toggle]')) {
        this.toggle();
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
  });
} else {
  new ThemeManager();
}
```

## Getting Started

### 17. First Steps After Setup

1. **Initialize the project:**

   ```bash
   npm run dev
   ```

2. **Create your first post:**
   - Navigate to `/admin`
   - Create a new post using the form
   - Set `show: true` to make it visible

3. **Test the setup:**
   - Visit the homepage to see the feed
   - Try filtering by content type
   - Test the search functionality

4. **Customize styling:**
   - Modify `/public/styles/global.css` for theme colors
   - Update `/public/styles/components.css` for component styles

### 18. Next Steps

1. **Content Migration:**
   - Create a script to import existing markdown files
   - Validate frontmatter against the new schema

2. **Enhanced Features:**
   - Add image upload functionality
   - Implement tags system
   - Add comment system

3. **Performance:**
   - Optimize images with Astro's image service
   - Implement proper caching headers
   - Add service worker for offline functionality

4. **Testing:**
   - Set up Playwright tests for critical user flows
   - Add unit tests for utility functions

---

This guide provides a complete foundation for rebuilding your Astro site with modern architecture, content management capabilities, and a clean, maintainable codebase.
