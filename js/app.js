function getCurrentLang() {
  return localStorage.getItem("vietnam_food_guide_lang") || "en";
}

function setLanguage(nextLang) {
  if (nextLang !== "en" && nextLang !== "vi") return;
  if (nextLang === getCurrentLang()) return;
  localStorage.setItem("vietnam_food_guide_lang", nextLang);
  window.location.reload();
}

function getNavLinks() {
  const nav = uiTexts.nav || {};
  return [
    { href: "index.html", label: nav.home || "Home", id: "home" },
    { href: "explore-global.html", label: nav.exploreGlobal || "All dishes", id: "explore-global" },
    { href: "planner.html", label: nav.planner || "Planner", id: "planner" },
    { href: "saved.html", label: nav.saved || "Saved", id: "saved" },
    { href: "articles.html", label: nav.articles || "Articles", id: "articles" },
    { href: "about.html", label: nav.about || "About", id: "about" },
  ];
}

function getCurrentPageId() {
  const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (!file || file === "index.html") return "home";
  if (file.includes("explore-global")) return "explore-global";
  if (file.includes("planner")) return "planner";
  if (file.includes("saved")) return "saved";
  if (file.includes("article")) return "articles";
  if (file.includes("about") || file.includes("add-food")) return "about";
  return "";
}

function renderHeader(activeId) {
  const lang = getCurrentLang();
  const nav = uiTexts.nav || {};
  const links = getNavLinks()
    .map((link) => {
      const active = link.id === activeId ? "active" : "";
      return `<a href="${link.href}" class="${active}">${link.label}</a>`;
    })
    .join("");

  return `
    <header class="header">
      <div class="header-top">
        <a href="index.html" class="logo">
          <img src="assets/images/logo1.png" alt="Taste Vietnam">
        </a>
        <nav class="navbar" id="site-nav">
          ${links}
          <a href="add-food.html" class="login-btn nav-suggest">${nav.suggest || "Suggest Food"}</a>
        </nav>
        <div class="header-actions">
          <div class="language" id="lang-switch">
            <button
              type="button"
              class="lang-switch-btn"
              id="lang-switch-btn"
              aria-haspopup="listbox"
              aria-expanded="false"
              aria-label="${nav.language || "Language"}"
            >
              <span id="lang-switch-label">${lang.toUpperCase()}</span>
              <span class="lang-arrow" aria-hidden="true"></span>
            </button>
            <div class="lang-menu" role="listbox" aria-label="${nav.language || "Language"}">
              <button type="button" class="lang-option ${lang === "en" ? "is-active" : ""}" role="option" data-lang="en" aria-selected="${lang === "en"}">EN</button>
              <button type="button" class="lang-option ${lang === "vi" ? "is-active" : ""}" role="option" data-lang="vi" aria-selected="${lang === "vi"}">VI</button>
            </div>
          </div>
          <a href="add-food.html" class="login-btn header-suggest">${nav.suggest || "Suggest Food"}</a>
          <button
            type="button"
            class="nav-toggle"
            id="nav-toggle"
            aria-controls="site-nav"
            aria-expanded="false"
            aria-label="${nav.menu || "Menu"}"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  `;
}

function renderFooter() {
  const footer = uiTexts.footer || {};
  const nav = uiTexts.nav || {};
  return `
    <footer class="footer">
      <div class="footer-main">
        <div class="footer-brand">
          <a href="index.html" class="logo footer-logo">
            <img src="assets/images/logo1.png" alt="Taste Vietnam">
          </a>
          <p>${footer.brand || ""}</p>
        </div>
        <div class="footer-column">
          <h4>${footer.exploreTitle || "Explore"}</h4>
          <a href="index.html">${nav.home || "Home"}</a>
          <a href="explore-global.html">${nav.exploreGlobal || "All dishes"}</a>
        </div>
        <div class="footer-column">
          <h4>${footer.infoTitle || "Information"}</h4>
          <a href="planner.html">${nav.planner || "Planner"}</a>
          <a href="saved.html">${nav.saved || "Saved"}</a>
          <a href="articles.html">${nav.articles || "Articles"}</a>
          <a href="about.html">${nav.about || "About"}</a>
        </div>
        <div class="footer-column">
          <h4>${footer.followTitle || "More"}</h4>
          <a href="add-food.html">${nav.suggest || "Suggest Food"}</a>
          <a href="about.html">${footer.contact || "Contact"}</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>${footer.copy || `© ${new Date().getFullYear()} Taste Vietnam`}</p>
        <p>${footer.tagline || ""}</p>
      </div>
    </footer>
    <button id="backToTop" type="button">↑</button>
  `;
}

function initLanguageSwitch() {
  const root = document.getElementById("lang-switch");
  const btn = document.getElementById("lang-switch-btn");
  if (!root || !btn) return;

  const close = () => {
    root.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = root.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  root.querySelectorAll(".lang-option").forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      setLanguage(option.dataset.lang);
      close();
    });
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initMobileNav() {
  const header = document.querySelector(".header");
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!header || !toggle) return;

  const close = () => {
    header.classList.remove("is-nav-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-lock");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = header.classList.toggle("is-nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-lock", open);
  });

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) close();
  });
}

async function initLayout(options = {}) {
  const activeId = typeof options === "string" ? options : options.activeId || getCurrentPageId();
  if (!uiTexts.nav) {
    try {
      await loadUI();
    } catch (error) {
      console.error(error);
    }
  }

  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");

  document.documentElement.lang = getCurrentLang();

  if (headerMount) headerMount.innerHTML = renderHeader(activeId);
  if (footerMount) footerMount.innerHTML = renderFooter();

  initLanguageSwitch();
  initMobileNav();
  initBackToTop();
}

function createFoodCard(food, options = {}) {
  const removable = options.removable;
  const isVi = getCurrentLang() === "vi";
  const img =
    Array.isArray(food.images) && food.images.length > 0
      ? food.images[0]
      : typeof foodImage === "function"
        ? foodImage(food)
        : "assets/images/placeholder.jpg";
  const removeLabel = isVi ? "Xóa" : "Remove";
  const displayName = food.name;

  return `
    <article class="food-card flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-1 group p-3" data-id="${food.id}">
      <div class="article-card__media relative w-full aspect-[4/3] overflow-hidden rounded-xl mb-3">
        <a href="food-detail.html?id=${food.id}" class="block w-full h-full">
          <img src="${img}" alt="${displayName}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onerror="this.src='${placeholderImage(displayName, 600, 450)}'" />
        </a>
        <div class="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white pointer-events-none shadow-md transition-all duration-300 group-hover:scale-110" style="background-color: #2d3748cc; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div class="food-card__body flex flex-col flex-1 px-1 py-1">
        <h3 class="food-card__title text-lg font-extrabold text-gray-900 mb-1 line-clamp-1 transition-colors duration-300 group-hover:text-[#a20409]" style="transition: color 0.3s ease;">
          <a href="food-detail.html?id=${food.id}">${displayName}</a>
        </h3>
        <p class="food-card__meta text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
           ${food.province}
        </p>
        <p class="food-card__desc text-sm text-gray-600 mb-3"
           style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; line-height: 1.5; height: 3em;">
          ${food.description}
        </p>
        ${
          removable
            ? `<button type="button" class="btn btn--ghost btn-remove-saved mt-auto text-xs py-1.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-id="${food.id}">${removeLabel}</button>`
            : ""
        }
      </div>
    </article>
  `;
}

function renderContentBlocks(blocks) {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
          return `<p class="mb-5 text-lg leading-relaxed text-gray-600">${block.text}</p>`;

        case "heading":
          return `<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">${block.text}</h2>`;

        case "subheading":
          return `<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">${block.text}</h3>`;

        case "list": {
          if (!Array.isArray(block.items)) return "";
          const isOrdered = block.style === "ordered";
          const tag = isOrdered ? "ol" : "ul";
          const listClass = isOrdered
            ? "list-decimal pl-6 mb-5 text-lg text-gray-600 space-y-1"
            : "list-disc pl-6 mb-5 text-lg text-gray-600 space-y-1";
          const listItems = block.items.map((item) => `<li>${item}</li>`).join("");
          return `<${tag} class="${listClass}">${listItems}</${tag}>`;
        }

        case "image":
          return `
            <figure class="my-6 block">
              <img src="${block.src}" alt="${block.caption || ""}" class="w-full h-auto rounded-lg object-cover" onerror="this.src='${placeholderImage(block.caption || "Image", 800, 450)}'" />
              ${block.caption ? `<figcaption class="text-center text-sm text-gray-500 mt-2 italic">${block.caption}</figcaption>` : ""}
            </figure>`;

        case "quote":
          return `
            <blockquote class="border-l-4 border-primary pl-4 italic text-xl my-6 text-gray-700 bg-gray-50 py-2 pr-2 rounded-r">
              <p class="mb-1">"${block.text}"</p>
              ${block.author ? `<cite class="block text-sm font-semibold text-gray-500 not-italic">— ${block.author}</cite>` : ""}
            </blockquote>`;

        case "bold-text":
          return `<p class="mb-5 text-lg font-bold leading-relaxed text-gray-700">${block.text}</p>`;

        default:
          return "";
      }
    })
    .join("");
}

function initBackToTop() {
  const backToTop = document.getElementById("backToTop");
  if (!backToTop) return;
  backToTop.onclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (window.__tasteBackToTopScroll) return;
  window.__tasteBackToTopScroll = true;
  window.addEventListener("scroll", () => {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    btn.style.display = window.scrollY > 300 ? "flex" : "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("site-header") || document.getElementById("site-footer")) {
    initLayout();
  } else {
    initBackToTop();
  }
});
