/**
 * Explore Foods — flat searchable catalog
 */

let foodsCache = [];

function renderExplore(keyword = "") {
  const grid = document.getElementById("explore-grid");
  const status = document.getElementById("explore-status");
  const results = filterFoodsByKeyword(foodsCache, keyword);

  if (!results.length) {
    status.textContent = keyword
      ? `No results for "${keyword}"`
      : "No foods available.";
    grid.innerHTML = `<div class="empty-state col-span-full">Try another keyword.</div>`;
    return;
  }

  status.textContent = keyword
    ? `Search results for "${keyword}" · ${results.length} dish${results.length > 1 ? "es" : ""}`
    : `${results.length} dishes`;

  grid.innerHTML = results.map((f) => createFoodCard(f)).join("");
}

async function initExplore() {
  try {
    foodsCache = await loadFoods();
    renderExplore();
    document.getElementById("explore-search").addEventListener("input", (e) => {
      renderExplore(e.target.value);
    });
  } catch (err) {
    console.error(err);
    document.getElementById("explore-grid").innerHTML =
      `<div class="empty-state">Could not load foods.json.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "explore" });
  initExplore();
});
