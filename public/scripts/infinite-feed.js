// public/scripts/infinite-feed.js

let currentPage = 1;
let loading = false;
let done = false;

const feed = document.getElementById('posts-feed');
const loadMoreBtn = document.getElementById('load-more-btn');
const type = feed?.dataset.type || 'all';
const sort = feed?.dataset.sort || 'newest';

async function loadMorePosts() {
  if (loading || done) return;
  loading = true;
  currentPage++;
  loadMoreBtn.textContent = 'Loading...';
  const res = await fetch(`/api/feed.json?type=${type}&sort=${sort}&page=${currentPage}`);
  const posts = await res.json();
  if (!posts.length) {
    done = true;
    loadMoreBtn.textContent = 'No more posts';
    loadMoreBtn.disabled = true;
    return;
  }
  for (const post of posts) {
    const li = document.createElement('li');
    li.className = 'post-card';
    li.innerHTML = `<a href="/posts/${post.slug}/"><h2>${post.data.title}</h2><p>${post.data.description || ''}</p></a>`;
    feed.appendChild(li);
  }
  loadMoreBtn.textContent = 'Load More';
  loading = false;
}

if (loadMoreBtn && feed) {
  loadMoreBtn.addEventListener('click', loadMorePosts);
}

// Optional: auto-load on scroll near bottom
window.addEventListener('scroll', () => {
  if (done || loading) return;
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMorePosts();
  }
});
