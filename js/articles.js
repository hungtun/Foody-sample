/**
 * Articles list + detail (shared file)
 */

let articlesCache = [];

function renderArticleCards(list) {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state col-span-full">No articles found.</div>`;
    return;
  }

  grid.innerHTML = list
    .map(
      (a) => `
      <article class="article-card">
        <a href="article-detail.html?slug=${encodeURIComponent(a.slug)}" class="article-card__media">
          <img src="${a.image}" alt="" onerror="this.src='${placeholderImage(a.title, 640, 400)}'" />
        </a>
        <div class="article-card__body">
          <p class="muted text-sm mb-1">${a.category} · ${a.date}</p>
          <h2 class="text-xl mb-2">
            <a href="article-detail.html?slug=${encodeURIComponent(a.slug)}">${a.title}</a>
          </h2>
          <p class="muted text-sm flex-1">${a.excerpt}</p>
          <a href="article-detail.html?slug=${encodeURIComponent(a.slug)}" class="mt-3 inline-block underline">Read more →</a>
        </div>
      </article>`
    )
    .join("");
}

function filterArticles() {
  const q = document.getElementById("article-search")?.value.trim().toLowerCase() || "";
  const cat = document.getElementById("article-filter")?.value || "";

  return articlesCache.filter((a) => {
    const matchCat = !cat || a.category === cat;
    const matchQ =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
}

async function initArticlesList() {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;

  try {
    articlesCache = await loadArticles();
    const cats = [...new Set(articlesCache.map((a) => a.category))];
    const filter = document.getElementById("article-filter");
    filter.innerHTML =
      `<option value="">All topics</option>` +
      cats.map((c) => `<option value="${c}">${c}</option>`).join("");

    const refresh = () => renderArticleCards(filterArticles());
    document.getElementById("article-search").addEventListener("input", refresh);
    filter.addEventListener("change", refresh);
    refresh();
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="empty-state">Could not load articles.json.</div>`;
  }
}

async function initArticleDetail() {
  const mount = document.getElementById("article-detail");
  if (!mount) return;

  const slug = getQueryParam("slug");
  if (!slug) {
    mount.innerHTML = `<div class="empty-state"><p>Article not found.</p><a href="articles.html" class="btn btn--primary mt-4">Back to articles</a></div>`;
    return;
  }

  try {
    const articles = await loadArticles();
    const article = articles.find((a) => a.slug === slug);

    if (!article) {
      mount.innerHTML = `<div class="empty-state"><p>Article not found.</p><a href="articles.html" class="btn btn--primary mt-4">Back to articles</a></div>`;
      return;
    }

    document.title = `${article.title} · Vietnam Food Guide`;
    const paragraphs = article.content.map((p) => `<p class="mb-4 text-lg leading-relaxed">${p}</p>`).join("");

    mount.innerHTML = `
      <a href="articles.html" class="muted text-sm inline-block mb-4">← All articles</a>
      <p class="muted mb-2">${article.category} · ${article.date} · ${article.author}</p>
      <h1 class="text-4xl mb-6">${article.title}</h1>
      <img
        src="${article.image}"
        alt=""
        class="w-full max-h-[420px] object-cover mb-8 bg-[#d9d0c0]"
        onerror="this.src='${placeholderImage(article.title, 1200, 600)}'"
      />
      <div class="max-w-3xl">${paragraphs}</div>
    `;
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">Could not load article.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "articles" });
  initArticlesList();
  initArticleDetail();
});
