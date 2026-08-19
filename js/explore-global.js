function bindSelect(id, input, onChange) {
  const select = document.getElementById(id);
  if (!select) return;
  const trigger = select.querySelector(".select-trigger");
  const text = select.querySelector(".selected-text");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".custom-select").forEach((s) => s !== select && s.classList.remove("open"));
    select.classList.toggle("open");
  });

  select.addEventListener("click", (e) => {
    const opt = e.target.closest(".option");
    if (!opt) return;
    select.querySelectorAll(".option").forEach((o) => o.classList.remove("selected"));
    opt.classList.add("selected");
    text.textContent = opt.textContent;
    input.value = opt.dataset.value;
    select.classList.remove("open");
    onChange();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadUI();
  applyUI("exploreGlobal");

  const explore = uiTexts.exploreGlobal || {};
  const fallbackImg = "assets/images/taste/theme.jpg";
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const resultCount = document.getElementById("resultCount");
  const emptyState = document.getElementById("emptyState");
  const foodGrid = document.getElementById("foodGrid");
  const cityInput = document.getElementById("cityFilter");
  const categoryInput = document.getElementById("categoryFilter");
  const regionTabsEl = document.getElementById("regionTabs");

  let foods = [];
  let currentRegion = getQueryParam("region") || "all";

  function renderCards(list) {
    foodGrid.innerHTML = list
      .map((food) => {
        const region = regionKeyFromFood(food);
        const city = slugify(food.province) || "unknown";
        const category = slugify(food.category) || "other";
        const tags = (food.tags || []).slice(0, 2).map((tag) => `<span>#${tag}</span>`).join("");
        return `
          <a href="food-detail.html?id=${food.id}" class="explore-card" data-name="${removeAccents(food.name)} ${removeAccents(food.vietnameseName)}" data-region="${region}" data-city="${city}" data-category="${category}">
            <div class="card-img-wrap">
              <img src="${resolveFoodImage(food)}" alt="${food.name}" onerror="this.src='${fallbackImg}'">
              <span class="region-badge badge-${region}">${food.region || region}</span>
            </div>
            <div class="card-body">
              <span class="card-location">📍 ${food.province || ""}</span>
              <h3>${food.name}</h3>
              <p>${food.description || ""}</p>
              <div class="card-tags">${tags}</div>
            </div>
          </a>
        `;
      })
      .join("");
  }

  function fillSelect(selectId, items, allLabel) {
    const box = document.querySelector(`#${selectId} .select-options`);
    if (!box) return;
    box.innerHTML =
      `<div class="option selected" data-value="all">${allLabel}</div>` +
      items.map((item) => `<div class="option" data-value="${item.value}">${item.label}</div>`).join("");
    const text = document.querySelector(`#${selectId} .selected-text`);
    if (text) text.textContent = allLabel;
  }

  function filterDishes() {
    const query = removeAccents(searchInput.value.trim());
    const selectedCity = cityInput.value;
    const selectedCategory = categoryInput.value;
    const cards = [...document.querySelectorAll(".explore-card")];
    clearSearchBtn.style.display = searchInput.value ? "flex" : "none";
    let count = 0;

    cards.forEach((card) => {
      const matchSearch = !query || card.dataset.name.includes(query);
      const matchRegion = currentRegion === "all" || card.dataset.region === currentRegion;
      const matchCity = selectedCity === "all" || card.dataset.city === selectedCity;
      const matchCategory = selectedCategory === "all" || card.dataset.category === selectedCategory;
      const show = matchSearch && matchRegion && matchCity && matchCategory;
      card.style.display = show ? "flex" : "none";
      if (show) count++;
    });

    resultCount.innerHTML = (explore.showing || "")
      .replace("{count}", String(count))
      .replace("{total}", String(cards.length));
    emptyState.style.display = count === 0 ? "block" : "none";
  }

  try {
    foods = await loadFoods();
  } catch (error) {
    console.error(error);
    foodGrid.innerHTML = `<p>${explore.emptyText || "Could not load foods."}</p>`;
    return;
  }

  const regionKeys = ["all", "north", "central", "south"];
  const regionLabels = {
    all: explore.allRegions,
    north: getCurrentLang() === "vi" ? "Bắc" : "North",
    central: getCurrentLang() === "vi" ? "Trung" : "Central",
    south: getCurrentLang() === "vi" ? "Nam" : "South",
  };
  regionTabsEl.innerHTML = regionKeys
    .map(
      (key) =>
        `<button class="region-tab ${key === currentRegion ? "active" : ""}" data-region="${key}">${regionLabels[key]}</button>`
    )
    .join("");

  const cities = [...new Map(foods.filter((f) => f.province).map((f) => [slugify(f.province), f.province])).entries()].map(
    ([value, label]) => ({ value, label })
  );
  const categories = [...new Map(foods.filter((f) => f.category).map((f) => [slugify(f.category), f.category])).entries()].map(
    ([value, label]) => ({ value, label })
  );

  fillSelect("citySelect", cities, `📍 ${explore.allLocations}`);
  fillSelect("categorySelect", categories, `🍲 ${explore.allCategories}`);
  renderCards(foods);

  const queryCity = getQueryParam("city");
  if (queryCity) {
    cityInput.value = queryCity;
    const citySelect = document.getElementById("citySelect");
    const match = citySelect?.querySelector(`.option[data-value="${queryCity}"]`);
    if (match) {
      citySelect.querySelectorAll(".option").forEach((opt) => opt.classList.remove("selected"));
      match.classList.add("selected");
      const text = citySelect.querySelector(".selected-text");
      if (text) text.textContent = match.textContent;
    }
  }

  bindSelect("citySelect", cityInput, filterDishes);
  bindSelect("categorySelect", categoryInput, filterDishes);

  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-select").forEach((s) => s.classList.remove("open"));
  });

  searchInput.addEventListener("input", filterDishes);
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    filterDishes();
  });

  regionTabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".region-tab");
    if (!tab) return;
    regionTabsEl.querySelectorAll(".region-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentRegion = tab.dataset.region;
    filterDishes();
  });

  function resetSelect(selectId, allLabel, hiddenInput) {
    hiddenInput.value = "all";
    const select = document.getElementById(selectId);
    if (!select) return;
    select.querySelectorAll(".option").forEach((opt) => {
      opt.classList.toggle("selected", opt.dataset.value === "all");
    });
    const text = select.querySelector(".selected-text");
    if (text) text.textContent = allLabel;
  }

  function resetFilters() {
    searchInput.value = "";
    currentRegion = "all";
    regionTabsEl.querySelectorAll(".region-tab").forEach((t) => t.classList.toggle("active", t.dataset.region === "all"));
    resetSelect("citySelect", `📍 ${explore.allLocations}`, cityInput);
    resetSelect("categorySelect", `🍲 ${explore.allCategories}`, categoryInput);
    filterDishes();
  }

  document.getElementById("resetFilterBtn")?.addEventListener("click", resetFilters);
  document.getElementById("emptyResetBtn")?.addEventListener("click", resetFilters);

  filterDishes();
});
