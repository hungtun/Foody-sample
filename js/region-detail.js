document.addEventListener("DOMContentLoaded", async () => {
  await loadUI();
  const copy = applyUI("region");
  const regionId = getQueryParam("region") || getQueryParam("id") || "north";
  const fallbackImg = "assets/images/taste/theme.jpg";

  const mount = document.getElementById("region-page");
  let regions = [];
  let foods = [];
  try {
    [regions, foods] = await Promise.all([loadRegions(), loadFoods()]);
  } catch (error) {
    console.error(error);
    mount.innerHTML = "<p>Could not load region data.</p>";
    return;
  }

  const region = findRegionById(regions, regionId) || regions[0];
  if (!region) {
    mount.innerHTML = `<div class="empty-state"><p>Region not found.</p><a class="primary-btn" href="index.html">Back home</a></div>`;
    return;
  }

  document.title = (copy.pageTitle || "{name} | Taste Vietnam").replace("{name}", region.name);

  const regionFoods = foods.filter((food) => regionKeyFromFood(food) === region.id);
  const featured = region.featuredFoodIds?.length
    ? region.featuredFoodIds.map((id) => foods.find((f) => f.id === Number(id))).filter(Boolean)
    : regionFoods.slice(0, 5);

  const slides = copy.slides?.[region.id] || [fallbackImg];
  const exploreHref = `explore.html?region=${encodeURIComponent(region.id)}`;
  const numbers = { north: "01", central: "02", south: "03" };

  mount.innerHTML = `
    <section class="region-hero">
      <img src="assets/images/taste/hero.jfif" alt="${region.name}">
      <div class="region-hero-overlay"></div>
      <div class="region-hero-text">
        <p>REGION ${numbers[region.id] || ""}</p>
        <h1>${region.name}</h1>
        <span>${region.tagline || ""}</span>
        <a class="region-hero-cta" href="${exploreHref}">${copy.ctaBtn || ""}</a>
      </div>
    </section>

    <section class="region-story">
      <div class="story-slideshow">
        <img id="slideImage" src="${slides[0]}" alt="${region.name}">
      </div>
      <div class="story-text">
        <p class="section-label">${region.shortName || ""}</p>
        <h2>${region.tagline || ""}</h2>
        <p>${region.description || ""}</p>
        <p>${region.culture || ""}</p>
      </div>
    </section>

    <section class="top-foods section">
      <div class="section-heading">
        <div>
          <p class="section-label">${copy.mustTryLabel || ""}</p>
          <h2>${copy.mustTryTitle || ""}</h2>
        </div>
        <div class="heading-aside">
          <p class="heading-description">${copy.mustTryDesc || ""}</p>
          <a class="region-inline-cta" href="${exploreHref}">${copy.ctaBtn || ""}</a>
        </div>
      </div>
      <div class="food-grid">
        ${featured
          .map(
            (food, index) => `
          <a href="food-detail.html?id=${food.id}" class="food-card ${index === 0 ? "food-large" : ""}">
            <img src="${resolveFoodImage(food)}" alt="${food.name}" onerror="this.src='${fallbackImg}'">
            <div class="food-info">
              <span>#${String(index + 1).padStart(2, "0")}</span>
              <h3>${food.name}</h3>
              <p>${food.description || ""}</p>
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    </section>

    <section class="special section">
      <p class="section-label">${copy.specialLabel || ""}</p>
      <h2>${copy.specialTitle || ""}</h2>
      <div class="special-grid">
        ${(region.commonIngredients || region.ingredients || [])
          .slice(0, 3)
          .map(
            (item) => `
          <div>
            <span>•</span>
            <h3>${item}</h3>
            <p>${region.flavorProfile || ""}</p>
          </div>
        `
          )
          .join("")}
      </div>
    </section>
  `;

  if (slides.length > 1) {
    let slide = 0;
    const slideImage = document.getElementById("slideImage");
    setInterval(() => {
      slideImage.style.opacity = 0;
      setTimeout(() => {
        slide = (slide + 1) % slides.length;
        slideImage.src = slides[slide];
        slideImage.style.opacity = 1;
      }, 230);
    }, 4000);
  }
});
