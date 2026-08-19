let articlesCache = [];

function getCurrentLang() {
  return localStorage.getItem("vietnam_food_guide_lang") || "en";
}

function renderArticleCards(list) {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;

  const isVi = getCurrentLang() === "vi";
  if (!list.length) {
    const emptyMsg = isVi ? "Không tìm thấy bài viết nào." : "No articles found.";
    grid.innerHTML = `<div class="empty-state col-span-full">${emptyMsg}</div>`;
    return;
  }

  const readMoreLabel = isVi ? "Xem thêm " : "Read more ";
  grid.innerHTML = list
    .map(
      (a) => `
      <article class="article-card flex flex-col h-full bg-transparent">
        
        <!--ảnh -->
        <a href="article-detail.html?slug=${encodeURIComponent(a.slug)}" class="article-card__media">
          <img src="${a.image}" alt="" onerror="this.src='${placeholderImage(a.title, 600, 450)}'" />
        </a>
        
        <!-- nội dung -->
        <div class="article-card__body">
          <p class="muted text-sm mb-1 text-gray-500">${a.category} · ${a.date}</p>
          <h2 class="text-xl font-bold mb-2 line-clamp-2 min-h-[3rem] text-gray-900">
            <a href="article-detail.html?slug=${encodeURIComponent(a.slug)}" class="hover:text-primary transition-colors">${a.title}</a>
          </h2>
          <p class="muted text-sm mb-3 text-gray-600">${a.excerpt}</p>
          <a href="article-detail.html?slug=${encodeURIComponent(a.slug)}" class="mt-auto font-medium text-primary readmore-btn">${readMoreLabel}<span class="arrow">&nbsp;→</span></a>
        </div>
      </article>`
    )
    .join("");
}

function filterArticles() {
  const q = document.getElementById("search-input")?.value.trim().toLowerCase() || "";
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
  const isVi = getCurrentLang() === "vi";
  const pageTitle = document.querySelector(".page-hero h1");
  if (pageTitle) {
    pageTitle.innerText = isVi ? "TIN TỨC" : "ARTICLES & NEWS";
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.placeholder = isVi ? "Tìm kiếm bài viết..." : "Search articles...";
  }

  try {
    articlesCache = await loadArticles();
    const cats = [...new Set(articlesCache.map((a) => a.category))];
    const filter = document.getElementById("article-filter");
    const allTopicsLabel = isVi ? "Tất cả chủ đề" : "All topics";
    filter.innerHTML =
      `<option value="">${allTopicsLabel}</option>` +
      cats.map((c) => `<option value="${c}">${c}</option>`).join("");

    const refresh = () => renderArticleCards(filterArticles());
    searchInput.addEventListener("input", refresh);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchInput.blur();
  }
});

filter.addEventListener("change", refresh);
    refresh();
  } catch (err) {
    console.error(err);
    const errorMsg = isVi ? "Không thể tải danh sách bài viết." : "Could not load articles data.";
    grid.innerHTML = `<div class="empty-state">${errorMsg}</div>`;
  }
}



async function initArticleDetail() {
  const mount = document.getElementById("article-detail");
  if (!mount) return;
  const slug = getQueryParam("slug");
  const isVi = getCurrentLang() === "vi";
  if (!slug) {
    const notFoundTxt = isVi ? "Không tìm thấy bài viết." : "Article not found.";
    const backBtnTxt = isVi ? "Quay lại danh sách" : "Back to articles";
    mount.innerHTML = `<div class="empty-state"><p>${notFoundTxt}</p><a href="articles.html" class="mt-4">${backBtnTxt}</a></div>`;
    return;
  }

  try {
    const articles = await loadArticles();
    const article = articles.find((a) => a.slug === slug);
    if (!article) {
      const notFoundTxt = isVi ? "Không tìm thấy bài viết." : "Article not found.";
      const backBtnTxt = isVi ? "Quay lại danh sách" : "Back to articles";
      mount.innerHTML = `<div class="empty-state"><p>${notFoundTxt}</p><a href="articles.html" class="mt-4">${backBtnTxt}</a></div>`;
      return;
    }

    document.title = `${article.title} · Taste Vietnam`;

    // phần gợi ý bài viết 
    const relatedArticles = articles
      .filter((a) => a.category === article.category && a.slug !== article.slug)
      .slice(0, 3);

    let relatedHtml = "";
    if (relatedArticles.length > 0) {
      const readMoreLabel = isVi ? "Xem thêm" : "Read more";

      const relatedCards = relatedArticles
        .map(
          (ra) => `
          <article class="article-card flex flex-col h-full bg-transparent">
            <a href="article-detail.html?slug=${encodeURIComponent(ra.slug)}" class="article-card__media">
              <img src="${ra.image}" alt="${ra.title}" onerror="this.src='${placeholderImage(ra.title, 600, 450)}'" />
            </a>
            <div class="article-card__body">
              <p class="muted text-sm mb-1 text-gray-500">${ra.category} · ${ra.date}</p>
              <h2 class="text-xl font-bold mb-2 line-clamp-2 min-h-[3rem] text-gray-900">
                <a href="article-detail.html?slug=${encodeURIComponent(ra.slug)}">${ra.title}</a>
              </h2>
              <p class="muted text-sm mb-3 text-gray-600">${ra.excerpt}</p>
              <a href="article-detail.html?slug=${encodeURIComponent(ra.slug)}" class="mt-auto font-medium text-primary readmore-btn">${readMoreLabel}<span class="arrow">&nbsp;→</span></a>
            </div>
          </article>`
        )
        .join("");
      const relatedSectionTitle = isVi ? "Bài viết liên quan" : "Related articles";
      relatedHtml = `
        <section class="related-articles-section">
          <h3 class="related-articles-title">${relatedSectionTitle}</h3>
          <div class="related-articles-grid">${relatedCards}</div>
        </section>
      `;
    }
    
    const contentHtml = renderContentBlocks(article.content);
    const backLabel = isVi ? "← Trở về" : "← Back";

    mount.innerHTML = `
      <a href="articles.html" class="muted text-sm inline-block mb-6 back-btn">${backLabel}</a>
      
      <header class="article-hero">
        <!-- cột bên trái -->
        <div class="article-hero__media">
          <img
            src="${article.image}"
            alt="${article.title}"
            onerror="this.src='${placeholderImage(article.title, 800, 600)}'"
          />
        </div>
        
        <!-- cột bên phải -->
        <div class="article-hero__meta">
          <h1 class="article-title">${article.title}</h1>
          <p class="article-excerpt">${article.excerpt}</p>
          <div class="article-author-info">
            <span class="article-badge">${article.category}</span>
            <span class="font-medium text-gray-900">${article.author}</span>
            <span class="text-gray-400">·</span>
            <time>${article.date}</time>
          </div>
        </div>
      </header>

      <!-- nội dung bài viết chi tiết -->
      <div class="article-body-wrapper">
        <div class="article-content">${contentHtml}</div>
      </div>

      <!-- phần bài viết liên quan -->
      ${relatedHtml}
    `;
  } catch (err) {
    console.error(err);
    const globalErrorMsg = isVi ? "Không thể tải nội dung bài viết." : "Could not load article.";
    mount.innerHTML = `<div class="empty-state">${globalErrorMsg}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "articles" });
  initArticlesList();
  initArticleDetail();
});
