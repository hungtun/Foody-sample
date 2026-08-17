/**
 * Data loading helpers for JSON files.
 */

const locale = (document.documentElement.lang || "en").toLowerCase().startsWith("vi") ? "vi" : "en";
const DataPaths = {
  foods: `data/foods_${locale}.json`,
  regions: `data/regions_${locale}.json`,
  articles: `data/articles_${locale}.json`,
};

const DataFallbackPaths = {
  foods: ["data/foods_en.json", "data/foods_vi.json"],
  regions: ["data/regions_en.json", "data/regions_vi.json"],
  articles: ["data/articles_en.json", "data/articles_vi.json"],
};

async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

async function resolveDataPath(kind) {
  const candidates = [DataPaths[kind], ...DataFallbackPaths[kind]];
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { method: "HEAD" });
      if (response.ok) return candidate;
    } catch (error) {
      // Ignore and continue to next fallback file.
    }
  }
  return DataPaths[kind];
}

async function loadFoods() {
  const path = await resolveDataPath("foods");
  return fetchJSON(path);
}

async function loadRegions() {
  const path = await resolveDataPath("regions");
  return fetchJSON(path);
}

async function loadArticles() {
  const path = await resolveDataPath("articles");
  return fetchJSON(path);
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatPrice(min, max) {
  const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);
  if (min === max) return `${fmt(min)}₫`;
  return `${fmt(min)} – ${fmt(max)}₫`;
}

function formatPriceLevel(min, max) {
  const avg = (min + max) / 2;
  if (avg < 40000) return "$";
  if (avg < 100000) return "$$";
  return "$$$";
}

function findFoodById(foods, id) {
  return foods.find((food) => food.id === Number(id));
}

function findRegionById(regions, id) {
  if (!id) return null;
  const key = String(id).toLowerCase();
  return regions.find(
    (region) =>
      region.id === key ||
      region.shortName?.toLowerCase() === key ||
      region.name?.toLowerCase().includes(key)
  );
}

function groupFoodsByProvince(foods) {
  const map = new Map();
  foods.forEach((food) => {
    if (!map.has(food.province)) map.set(food.province, []);
    map.get(food.province).push(food);
  });
  return map;
}

function filterFoodsByKeyword(foods, keyword) {
  const q = keyword.trim().toLowerCase();
  if (!q) return foods;
  return foods.filter(
    (food) =>
      (food.name || "").toLowerCase().includes(q) ||
      (food.vietnameseName || "").toLowerCase().includes(q) ||
      (food.province || "").toLowerCase().includes(q) ||
      (food.tags || []).some((tag) => String(tag).toLowerCase().includes(q))
  );
}

function regionKeyFromFood(food) {
  const value = String(food.region || "").trim().toLowerCase();
  if (!value) return "";
  if (value.includes("north")) return "north";
  if (value.includes("central")) return "central";
  if (value.includes("south")) return "south";
  return value.replace(/\s+/g, "-");
}

/** Placeholder image when asset is missing */
function foodImage(food, index = 0) {
  const src = food.images?.[index] || food.image;
  if (src) return src;
  return `https://placehold.co/600x400/1a3a2a/f5f0e8?text=${encodeURIComponent(food.name)}`;
}

function placeholderImage(label, w = 800, h = 500) {
  return `https://placehold.co/${w}x${h}/1a3a2a/f5f0e8?text=${encodeURIComponent(label)}`;
}
