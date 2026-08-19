/**
 * Data loading helpers for JSON files.
 */

function getDataLang() {
  const stored = localStorage.getItem("vietnam_food_guide_lang");
  if (stored === "vi" || stored === "en") return stored;
  return (document.documentElement.lang || "en").toLowerCase().startsWith("vi")
    ? "vi"
    : "en";
}

function getDataPaths(locale = getDataLang()) {
  return {
    foods: `data/foods_${locale}.json`,
    regions: `data/regions_${locale}.json`,
    articles: `data/articles_${locale}.json`,
    ui: `data/ui_${locale}.json`,
  };
}

const DataFallbackPaths = {
  foods: ["data/foods_en.json", "data/foods_vi.json"],
  regions: ["data/regions_en.json", "data/regions_vi.json"],
  articles: ["data/articles_en.json", "data/articles_vi.json"],
  ui: ["data/ui_en.json", "data/ui_vi.json"],
};

async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

async function resolveDataPath(kind) {
  const dataPaths = getDataPaths();
  const candidates = [dataPaths[kind], ...DataFallbackPaths[kind]];
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { method: "HEAD" });
      if (response.ok) return candidate;
    } catch (error) {
      // Ignore and continue to next fallback file.
    }
  }
  return dataPaths[kind];
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

let uiTexts = {};

async function loadUI() {
  const path = await resolveDataPath("ui");
  uiTexts = await fetchJSON(path);
  return uiTexts;
}

function tUI(section, key) {
  return uiTexts?.[section]?.[key] || key;
}

function lookupUI(path, sectionDict) {
  if (!path) return undefined;
  if (path.includes(".")) {
    let value = uiTexts;
    for (const key of path.split(".")) value = value?.[key];
    return value;
  }
  return sectionDict?.[path];
}

function applyUI(section) {
  const dict = uiTexts[section] || {};
  document.documentElement.lang = getDataLang();
  if (dict.pageTitle) document.title = dict.pageTitle;
  document.querySelectorAll("[data-trans]").forEach((element) => {
    const value = lookupUI(element.dataset.trans, dict);
    if (typeof value !== "string") return;
    if (element.getAttribute("data-trans-html") === "true") element.innerHTML = value;
    else element.textContent = value;
  });
  document.querySelectorAll("[data-placeholder-trans]").forEach((element) => {
    const value = lookupUI(element.dataset.placeholderTrans, dict);
    if (typeof value === "string") element.placeholder = value;
  });
  return dict;
}

function applyUISection(section) {
  return applyUI(section);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function removeAccents(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function resolveFoodImage(food) {
  const src = food?.images?.[0] || food?.image || "";
  if (src) return src;
  return "assets/images/taste/theme.jpg";
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
      (food.category || "").toLowerCase().includes(q) ||
      (food.province || "").toLowerCase().includes(q) ||
      (food.tags || []).some((tag) => String(tag).toLowerCase().includes(q))
  );
}

function regionKeyFromFood(food) {
  const raw = String(food.region || "").trim();
  if (!raw) return "";
  const compact = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const nationwide = ["vietnam", "viet nam", "toan quoc", "nationwide", "ca nuoc", "all vietnam"];
  if (nationwide.includes(compact)) return "";

  if (compact.includes("north") || compact.includes("bac") || compact.includes("northern")) return "north";
  if (compact.includes("central") || compact.includes("trung")) return "central";
  if (compact.includes("south") || compact.includes("mien nam") || compact.includes("southern")) return "south";
  return compact.replace(/\s+/g, "-");
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
