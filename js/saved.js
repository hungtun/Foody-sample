/**
 * Saved Foods — localStorage IDs → foods.json
 * Also shows recently viewed dishes from storage.js
 */

function tSaved(key) {
  return tUI("saved", key);
}

function bindRemoveButtons(grid) {
  grid.querySelectorAll(".btn-remove-saved").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeSavedFood(btn.dataset.id);
      initSaved();
    });
  });
}

function renderSavedGrid(foods) {
  const grid = document.getElementById("saved-grid");
  const ids = getSavedFoodIds();
  const saved = ids.map((id) => findFoodById(foods, id)).filter(Boolean);

  if (!saved.length) {
    grid.innerHTML = `
      <div class="empty-state col-span-full">
        <p>${tSaved("empty")}</p>
        <a href="index.html#regions" class="btn btn--primary mt-4 inline-flex">${tSaved("explore")}</a>
      </div>`;
    return;
  }

  grid.innerHTML = saved.map((f) => createFoodCard(f, { removable: true })).join("");
  bindRemoveButtons(grid);
}

function renderRecentGrid(foods) {
  const grid = document.getElementById("recent-grid");
  const section = document.getElementById("recent-section");
  if (!grid || !section) return;

  const recent = getRecentlyViewed()
    .map((id) => findFoodById(foods, id))
    .filter(Boolean);

  if (!recent.length) {
    grid.innerHTML = `
      <div class="empty-state col-span-full recent-empty">
        <p>${tSaved("recentEmpty")}</p>
      </div>`;
    return;
  }

  grid.innerHTML = recent.map((f) => createFoodCard(f)).join("");
}

async function initSaved() {
  await loadUI();
  applyUISection("saved");

  try {
    const foods = await loadFoods();
    renderSavedGrid(foods);
    renderRecentGrid(foods);
  } catch (err) {
    console.error(err);
    const grid = document.getElementById("saved-grid");
    if (grid) grid.innerHTML = `<div class="empty-state">${tSaved("loadError")}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "saved" });
  initSaved();
});
