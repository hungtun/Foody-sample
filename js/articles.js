/**
 * Articles list + detail (shared file)
 */

let articlesCache = [];

function renderStructuredContent(content = []) {
  return content
    .map((block) => {
      if (!block || typeof block !== "object") return "";

      switch (block.type) {
        case "heading":
          return `<h2 class="text-2xl font-bold my-4">${block.text}</h2>`;
        case "subheading":
          return `<h3 class="text-xl font-semibold mt-6 mb-3">${block.text}</h3>`;
        case "bold-text":
          return `<p class="font-semibold my-3">${block.text}</p>`;
        case "paragraph":
          return `<p class="mb-4 text-lg leading-relaxed">${block.text}</p>`;
        case "image":
          return `
            <figure class="my-6">
              <img src="${block.src}" alt="${block.caption || "Article image"}" class="w-full max-h-[420px] object-cover bg-[#d9d0c0]" onerror="this.src='${placeholderImage(block.caption || "Article image", 1200, 600)}'" />
              ${block.caption ? `<figcaption class="mt-2 text-sm muted">${block.caption}</figcaption>` : ""}
            </figure>
          `;
        case "list":
          return `<ul class="list-disc pl-6 mb-4 space-y-1">${(block.items || []).map((item) => `<li>${item}</li>`).join("")}</ul>`;
        default:
          return "";
      }
    })
    .join("");
}

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
      (a.title || "").toLowerCase().includes(q) ||
      (a.excerpt || "").toLowerCase().includes(q) ||
      (a.category || "").toLowerCase().includes(q);
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
    grid.innerHTML = `<div class="empty-state">Could not load articles data.</div>`;
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
      <div class="max-w-3xl">${renderStructuredContent(article.content || [])}</div>
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
