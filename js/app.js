/**
 * Shared layout: header, footer, mobile nav
 */

const NAV_LINKS = [
  { href: "index.html", label: "Home", id: "home" },
  { href: "explore.html", label: "Explore", id: "explore" },
  { href: "planner.html", label: "Planner", id: "planner" },
  { href: "saved.html", label: "Saved Foods", id: "saved" },
  { href: "articles.html", label: "Articles", id: "articles" },
  { href: "about.html", label: "About", id: "about" },
];

function getCurrentPageId() {
  const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (!file || file === "index.html") return "home";
  if (file.includes("explore") || file.includes("explorer") || file.includes("region") || file.includes("food-detail")) {
    return "explore";
  }
  if (file.includes("planner")) return "planner";
  if (file.includes("saved")) return "saved";
  if (file.includes("article")) return "articles";
  if (file.includes("about") || file.includes("add-food")) return "about";
  return "";
}

function renderHeader(activeId) {
  const links = NAV_LINKS.map((link) => {
    const active = link.id === activeId ? "is-active" : "";
    return `<a href="${link.href}" class="nav-link ${active}">${link.label}</a>`;
  }).join("");

  return `
    <header class="site-header">
      <div class="site-header__inner">
        <a href="index.html" class="brand">Vietnam Food Guide</a>
        <button type="button" class="nav-toggle" id="nav-toggle">Menu</button>
        <nav class="site-nav" id="site-nav">
          ${links}
          <a href="add-food.html" class="nav-cta">Suggest Food</a>
        </nav>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <strong>Vietnam Food Guide</strong>
        <p class="muted">Discover Vietnamese cuisine across North, Central, and South.</p>
        <div class="footer-links">
          <a href="explore.html">Explore</a>
          <a href="planner.html">Planner</a>
          <a href="add-food.html">Suggest Food</a>
          <a href="about.html">About</a>
        </div>
        <p class="muted">&copy; ${new Date().getFullYear()} Vietnam Food Guide</p>
      </div>
    </footer>
  `;
}

function initLayout(options = {}) {
  const activeId = options.activeId || getCurrentPageId();
  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");

  if (headerMount) headerMount.innerHTML = renderHeader(activeId);
  if (footerMount) footerMount.innerHTML = renderFooter();

  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("is-open");
    });
  }
}

function createFoodCard(food, options = {}) {
  const removable = options.removable;
  const img = foodImage(food);
  return `
    <article class="food-card" data-id="${food.id}">
      <a href="food-detail.html?id=${food.id}" class="food-card__media">
        <img src="${img}" alt="${food.name}"
          onerror="this.src='${placeholderImage(food.name, 600, 400)}'" />
      </a>
      <div class="food-card__body">
        <a href="food-detail.html?id=${food.id}">
          <h3 class="food-card__title">${food.name}</h3>
          <p class="food-card__vn">${food.vietnameseName}</p>
        </a>
        <p class="food-card__meta">${food.province} · ${formatPriceLevel(food.priceMin, food.priceMax)}</p>
        <p class="food-card__desc">${food.description}</p>
        ${
          removable
            ? `<button type="button" class="btn btn--ghost btn-remove-saved" data-id="${food.id}">Remove</button>`
            : ""
        }
      </div>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("site-header") || document.getElementById("site-footer")) {
    initLayout();
  }
});
