/**
 * Food Detail — gallery, lightbox, save, recently viewed
 */

function tFood(key) {
  return tUI("foodDetail", key);
}

function showToast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-visible");
  setTimeout(() => el.classList.remove("is-visible"), 2200);
}

function renderCookingMethod(method) {
  if (!Array.isArray(method) || !method.length) {
    return `<p class="muted max-w-3xl">${tFood("noCooking")}</p>`;
  }

  return method
    .map((step) => {
      if (step.type === "subheading") {
        return `<h3 class="text-xl font-semibold mt-6 mb-2">${step.text}</h3>`;
      }
      if (step.type === "heading") {
        return `<h3 class="text-xl font-semibold mt-6 mb-2">${step.text}</h3>`;
      }
      if (step.type === "paragraph") {
        return `<p class="mb-3 text-base leading-relaxed">${step.text}</p>`;
      }
      if (step.type === "list") {
        return `<ul class="list-disc pl-5 mb-3 space-y-1">${(step.items || []).map((item) => `<li>${item}</li>`).join("")}</ul>`;
      }
      return "";
    })
    .join("");
}

function openLightbox(src, alt) {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  if (!box || !img) return;
  img.src = src;
  img.alt = alt || "";
  box.classList.add("is-open");
}

function closeLightbox() {
  const box = document.getElementById("lightbox");
  if (box) box.classList.remove("is-open");
}

function emptyState(message) {
  return `<div class="empty-state"><p>${message}</p><a href="index.html#regions" class="btn btn--primary mt-4">${tFood("explore")}</a></div>`;
}

async function initFoodDetail() {
  await loadUI();
  document.documentElement.lang = getDataLang();
  const mount = document.getElementById("food-detail");
  const id = getQueryParam("id");

  if (!id) {
    mount.innerHTML = emptyState(tFood("noFood"));
    return;
  }

  try {
    const foods = await loadFoods();
    const food = findFoodById(foods, id);

    if (!food) {
      mount.innerHTML = emptyState(tFood("notFound"));
      return;
    }

    document.title = `${food.name} · ${tFood("siteName")}`;
    addRecentlyViewed(food.id);

    const images = food.images?.length
      ? food.images
      : [food.image || placeholderImage(food.name)];

    const saved = isFoodSaved(food.id);
    const tags = (food.tags || []).map((t) => `<span class="tag">${t}</span>`).join("");
    const ingredients = (food.ingredients || []).map((i) => `<li>${i}</li>`).join("");
    const ratingText = Number.isFinite(Number(food.rating))
      ? `${food.rating} / 5`
      : tFood("notRated");
    const thumbs = images
      .map(
        (src, i) => `
        <button type="button" class="${i === 0 ? "is-active" : ""}" data-index="${i}">
          <img src="${src}" alt="" onerror="this.src='${placeholderImage(food.name, 150, 150)}'" />
        </button>`
      )
      .join("");

    mount.innerHTML = `
      <div class="grid lg:grid-cols-2 gap-8 mb-10">
        <div>
          <div class="gallery-main" id="gallery-main">
            <img id="gallery-image" src="${images[0]}" alt="${food.name}"
              onerror="this.src='${placeholderImage(food.name)}'" />
          </div>
          <div class="gallery-thumbs" id="gallery-thumbs">${thumbs}</div>
        </div>
        <div>
          <p class="muted mb-1">${food.province} · ${food.region}</p>
          <h1 class="text-4xl mb-1">${food.name}</h1>
          <p class="text-xl muted mb-4">${food.vietnameseName}</p>
          <p class="mb-4">${food.description}</p>
          <p class="mb-2"><strong>${tFood("price")}:</strong> ${formatPrice(food.priceMin, food.priceMax)}</p>
          <p class="mb-4"><strong>${tFood("rating")}:</strong> ${ratingText}</p>
          <div class="mb-5">${tags}</div>
          <button type="button" class="btn ${saved ? "btn--ghost" : "btn--primary"}" id="btn-save">
            ${saved ? tFood("saved") : tFood("saveFood")}
          </button>
        </div>
      </div>

      <section class="mb-8">
        <h2 class="text-2xl mb-3">${tFood("ingredients")}</h2>
        <ul class="list-disc pl-5 muted space-y-1">${ingredients}</ul>
      </section>

      <section>
        <h2 class="text-2xl mb-3">${tFood("cooking")}</h2>
        <div class="muted max-w-3xl">${renderCookingMethod(food.cookingMethod)}</div>
      </section>
    `;

    let current = 0;
    const mainImg = document.getElementById("gallery-image");
    const thumbBtns = [...document.querySelectorAll("#gallery-thumbs button")];

    function setImage(index) {
      current = index;
      const src = images[index];
      mainImg.src = src;
      thumbBtns.forEach((btn, i) => btn.classList.toggle("is-active", i === index));
    }

    thumbBtns.forEach((btn) => {
      btn.addEventListener("click", () => setImage(Number(btn.dataset.index)));
    });

    document.getElementById("gallery-main")?.addEventListener("click", () => {
      openLightbox(images[current], food.name);
    });

    document.getElementById("btn-save")?.addEventListener("click", (e) => {
      const nowSaved = toggleSavedFood(food.id);
      e.currentTarget.textContent = nowSaved ? tFood("saved") : tFood("saveFood");
      e.currentTarget.className = `btn ${nowSaved ? "btn--ghost" : "btn--primary"}`;
      showToast(nowSaved ? tFood("added") : tFood("removed"));
    });
  } catch (err) {
    console.error(err);
    mount.innerHTML = `<div class="empty-state">${tFood("loadError")}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "explore" });
  initFoodDetail();

  document.getElementById("lightbox-close")?.addEventListener("click", closeLightbox);
  document.getElementById("lightbox")?.addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
});
