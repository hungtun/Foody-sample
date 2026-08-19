document.addEventListener("DOMContentLoaded", async () => {
  await loadUI();
  applyUI("home");

  const home = uiTexts.home || {};
  const grid = document.getElementById("region-grid");
  if (!grid) return;

  try {
    const regions = await loadRegions();
    const numbers = ["01", "02", "03"];
    grid.innerHTML = regions
      .map((region, index) => {
        const key = region.id || regionKeyFromFood({ region: region.name });
        return `
          <a href="region-detail.html?region=${key}" class="region-card ${key}">
            <div class="region-overlay"></div>
            <div class="region-content">
              <span class="region-number">${numbers[index] || String(index + 1).padStart(2, "0")}</span>
              <h3>${region.name}</h3>
              <p>${region.tagline || ""}</p>
              <span class="explore-link">${home.exploreLink || "Explore →"}</span>
            </div>
          </a>
        `;
      })
      .join("");
  } catch (error) {
    console.error(error);
    grid.innerHTML = `<p class="intro-text">Could not load regions.</p>`;
  }
});
