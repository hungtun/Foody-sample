document.addEventListener("DOMContentLoaded", async () => {
  await loadUI();
  applyUI("explore");

  const copy = uiTexts.explore || {};
  const fallbackImg = "assets/images/taste/theme.jpg";
  const rowsMount = document.getElementById("nfRows");
  const heroEl = document.getElementById("nfHero");
  const emptyEl = document.getElementById("nfEmpty");
  const allowed = ["north", "central", "south"];
  const currentRegion = String(getQueryParam("region") || "").toLowerCase();

  if (!allowed.includes(currentRegion)) {
    window.location.replace("index.html#regions");
    return;
  }

  let foods = [];
  let regions = [];
  try {
    [foods, regions] = await Promise.all([loadFoods(), loadRegions()]);
  } catch (error) {
    console.error(error);
    rowsMount.innerHTML = `<p class="intro-text">${copy.emptyText || "Could not load foods."}</p>`;
    return;
  }

  const regionMeta = findRegionById(regions, currentRegion);
  const regionFoods = foods.filter((food) => regionKeyFromFood(food) === currentRegion);
  const regionTitle = regionMeta?.name || currentRegion;

  document.title = (copy.pageTitle || "{name} | Taste Vietnam").replace("{name}", regionTitle);

  const featured = regionFoods[0];
  if (featured && heroEl) {
    heroEl.innerHTML = `
      <img src="${resolveFoodImage(featured)}" alt="${featured.name}" onerror="this.src='${fallbackImg}'">
      <div class="nf-hero-overlay"></div>
      <div class="nf-hero-content">
        <p class="hero-tagline">${copy.tagline || ""}</p>
        <h1>${regionTitle}</h1>
        <p>${copy.desc || ""}</p>
        <div class="nf-hero-actions">
          <a class="primary-btn" href="food-detail.html?id=${featured.id}">${featured.name} →</a>
          <a class="secondary-btn" href="index.html">${copy.backToRegion || "Back to region"}</a>
        </div>
      </div>
    `;
  }

  function posterCard(food) {
    return `
      <a class="nf-card" href="food-detail.html?id=${food.id}">
        <img src="${resolveFoodImage(food)}" alt="${food.name}" onerror="this.src='${fallbackImg}'">
        <div class="nf-card-meta">
          <h3>${food.name}</h3>
          <p>${food.province || food.region || ""}</p>
        </div>
      </a>
    `;
  }

  function renderRow(title, list, seeAllHref) {
    if (!list.length) return "";
    return `
      <section class="nf-row">
        <div class="nf-row-head">
          <h2>${title}</h2>
          ${seeAllHref ? `<a class="nf-see-all" href="${seeAllHref}">${copy.seeAll || "See all"} →</a>` : ""}
        </div>
        <div class="nf-track-wrap">
          <button type="button" class="nf-arrow nf-prev" aria-label="Previous">‹</button>
          <div class="nf-track">${list.map(posterCard).join("")}</div>
          <button type="button" class="nf-arrow nf-next" aria-label="Next">›</button>
        </div>
      </section>
    `;
  }

  const byProvince = new Map();
  regionFoods.forEach((food) => {
    const key = String(food.province || "").trim();
    if (!key) return;
    if (!byProvince.has(key)) byProvince.set(key, []);
    byProvince.get(key).push(food);
  });

  const featuredRow = renderRow(
    `${copy.popularIn || "Popular in"} ${regionTitle}`,
    regionFoods,
    `explore-global.html?region=${currentRegion}`
  );
  const provinceRows = [...byProvince.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([province, list]) =>
      renderRow(province, list, `explore-global.html?region=${currentRegion}&city=${slugify(province)}`)
    )
    .join("");

  rowsMount.innerHTML = `<section class="nf-region-block is-visible" data-region="${currentRegion}">${featuredRow}${provinceRows}</section>`;
  emptyEl.style.display = regionFoods.length ? "none" : "block";

  rowsMount.querySelectorAll(".nf-track-wrap").forEach((wrap) => {
    const track = wrap.querySelector(".nf-track");
    wrap.querySelector(".nf-prev")?.addEventListener("click", () => {
      track.scrollBy({ left: -track.clientWidth * 0.8, behavior: "smooth" });
    });
    wrap.querySelector(".nf-next")?.addEventListener("click", () => {
      track.scrollBy({ left: track.clientWidth * 0.8, behavior: "smooth" });
    });
  });
});
