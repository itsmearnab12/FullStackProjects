document.title = "The Taza Khabar - Live News";

const API_KEY = "pub_fcb6cbd95b4e48889691a30359ea93ae";
const API_URL = "https://newsdata.io/api/1/news";

const newsEl = document.getElementById('news');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

const categoryMenu = document.getElementById('categoryMenu');
const dropbtn = document.getElementById('categoryToggle');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');

const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');

const trendingBtn = document.getElementById('trendingBtn');
const articlesBtn = document.getElementById('articlesBtn');
const blogsBtn = document.getElementById('blogsBtn');
const membershipBtn = document.getElementById('membershipBtn');

const CATEGORY_MAP = {
  'general': 'top',
  'technology': 'technology',
  'sports': 'sports',
  'entertainment': 'entertainment',
  'health': 'health',
  'trending': '', // Special case, we use q=trending
  'articles': '', // Special case, q=articles
  'blogs': '',    // Special case, q=blogs
};

let currentCategory = 'general';
let currentQuery = '';

// Show loading spinner and update aria attributes
function showLoading(show) {
  loadingEl.style.display = show ? 'block' : 'none';
  newsEl.setAttribute('aria-busy', show ? 'true' : 'false');
  loadingEl.setAttribute('aria-hidden', show ? 'false' : 'true');
}
// Show error message
function showError(msg) {
  errorEl.textContent = msg || '';
}

// Fetch news articles from Newsdata.io API
async function fetchNews({ category, query }) {
  showLoading(true);
  showError('');
  newsEl.innerHTML = '';

  let params = [
    `apikey=${API_KEY}`,
    `language=en`,
    `country=in`
  ];

  if (category && CATEGORY_MAP[category]) {
    params.push(`category=${CATEGORY_MAP[category]}`);
  }

  if (category === 'trending') {
    // Override to search trending topic
    params = [
      `apikey=${API_KEY}`,
      `language=en`,
      `country=in`,
      `q=trending`
    ];
  } else if (category === 'articles') {
    params = [
      `apikey=${API_KEY}`,
      `language=en`,
      `country=in`,
      `q=articles`
    ];
  } else if (category === 'blogs') {
    params = [
      `apikey=${API_KEY}`,
      `language=en`,
      `country=in`,
      `q=blogs`
    ];
  }

  if (query && query.trim()) {
    // Remove any existing q param, add search term query
    params = params.filter(p => !p.startsWith('q='));
    params.push(`q=${encodeURIComponent(query.trim())}`);
  }

  const url = `${API_URL}?${params.join('&')}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch news.');
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      showError('No articles found.');
      return;
    }
    renderNews(data.results);
  } catch (e) {
    showError('Something went wrong. Please try again.');
  } finally {
    showLoading(false);
  }
}

// Render news cards to the DOM
function renderNews(articles) {
  newsEl.innerHTML = articles
    .map(
      (article) => `
    <div class="news-card">
      <img src="${article.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="" />
      <div class="news-content">
        <div>
          <div class="news-title">${article.title || ''}</div>
          <div class="news-meta">
            <span>${article.source_id || ''}</span>
            <span>•</span>
            <span>${article.pubDate ? new Date(article.pubDate).toLocaleDateString() : ''}</span>
          </div>
          <div class="news-desc">${article.description || ''}</div>
        </div>
        <a target="_blank" rel="noopener" href="${article.link}" class="read-more">Read more &rarr;</a>
      </div>
    </div>
  `
    )
    .join('');
}

// Clear all active states from navbar and categories
function clearNavActive() {
  document.querySelectorAll('.nav-item, .membership-nav-item').forEach(item => item.classList.remove('active'));
  categoryMenu.querySelectorAll('li').forEach(li => li.classList.remove('active'));
}

// Set active item by category string
function setActiveMenuItem(category) {
  clearNavActive();
  if (['general', 'technology', 'sports', 'entertainment', 'health'].includes(category)) {
    const li = categoryMenu.querySelector(`li[data-category="${category}"]`);
    if (li) li.classList.add('active');
  } else {
    const navItem = document.getElementById(`${category}Btn`);
    if (navItem) navItem.classList.add('active');
    else if(category==='membership'){
      membershipBtn.classList.add('active');
    }
  }
}

// CATEGORY SELECTION (dropdown)
categoryMenu.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    categoryMenu.querySelectorAll('li').forEach((li) => li.classList.remove('active'));
    e.target.classList.add('active');

    currentCategory = e.target.dataset.category;
    currentQuery = '';
    searchInput.value = '';

    clearNavActive();
    setActiveMenuItem(currentCategory);

    // Close dropdown and update aria-expanded
    categoryMenu.setAttribute('hidden', '');
    dropbtn.setAttribute('aria-expanded', 'false');

    fetchNews({ category: currentCategory, query: '' });
  }
});

// Toggle category dropdown on button click (keyboard accessibility)
dropbtn.addEventListener('click', () => {
  const isExpanded = dropbtn.getAttribute('aria-expanded') === 'true';
  if (isExpanded) {
    categoryMenu.setAttribute('hidden', '');
    dropbtn.setAttribute('aria-expanded', 'false');
  } else {
    categoryMenu.removeAttribute('hidden');
    dropbtn.setAttribute('aria-expanded', 'true');
  }
});

// Close category dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!dropbtn.contains(e.target) && !categoryMenu.contains(e.target)) {
    categoryMenu.setAttribute('hidden', '');
    dropbtn.setAttribute('aria-expanded', 'false');
  }
});

// SEARCH input handler
searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter' && searchInput.value.trim()) {
    currentQuery = searchInput.value.trim();
    currentCategory = '';
    clearNavActive();
    fetchNews({ category: '', query: currentQuery });
  }
});

// NAVBAR ITEM CLICK HANDLERS: Trending, Articles, Blogs, Membership

trendingBtn.addEventListener('click', () => {
  currentCategory = 'trending';
  currentQuery = '';
  searchInput.value = '';
  setActiveMenuItem('trending');
  fetchNews({ category: 'trending', query: '' });
});

articlesBtn.addEventListener('click', () => {
  currentCategory = 'articles';
  currentQuery = '';
  searchInput.value = '';
  setActiveMenuItem('articles');
  fetchNews({ category: 'articles', query: '' });
});

blogsBtn.addEventListener('click', () => {
  currentCategory = 'blogs';
  currentQuery = '';
  searchInput.value = '';
  setActiveMenuItem('blogs');
  fetchNews({ category: 'blogs', query: '' });
});

membershipBtn.addEventListener('click', () => {
  clearNavActive();
  currentCategory = 'membership';
  currentQuery = '';
  searchInput.value = '';
  setActiveMenuItem('membership');
  newsEl.innerHTML = '<p style="text-align:center; margin-top:2rem;">Membership feature coming soon.</p>';
});

// DARK MODE TOGGLE FUNCTIONALITY
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(current);
});
(function () {
  const savedTheme = localStorage.getItem('theme');
  const defaultTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(savedTheme || defaultTheme);
})();

// PROFILE DROPDOWN TOGGLE
profileBtn.addEventListener('click', () => {
  const isExpanded = profileBtn.getAttribute('aria-expanded') === 'true';
  profileBtn.setAttribute('aria-expanded', String(!isExpanded));
  if (profileMenu.hasAttribute('hidden')) {
    profileMenu.removeAttribute('hidden');
  } else {
    profileMenu.setAttribute('hidden', '');
  }
});

// Close profile dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
    profileMenu.setAttribute('hidden', '');
    profileBtn.setAttribute('aria-expanded', "false");
  }
});

// Initial fetch for default category
fetchNews({ category: currentCategory, query: '' });
setActiveMenuItem(currentCategory);
