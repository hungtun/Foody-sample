/**
 * Add New Food — form validation + Google Apps Script submit
 */

const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz3DFOjRS7lKzhfwO7Vgk2v0VkX8_Yhd_gED_vIAXvTMHPlckIIQD8hCPXkIq3Ljb4F/exec";

function tAdd(key) {
  return tUI("addFood", key);
}

function setMessage(text, isError = false) {
  const el = document.getElementById("form-message");
  el.textContent = text;
  el.style.color = isError ? "#b33a2b" : "#0f4c3a";
}

function validateForm(data) {
  const required = ["foodName", "vietnameseName", "province", "region", "description"];
  for (const key of required) {
    if (!String(data[key] || "").trim()) {
      return tAdd("required").replace("{field}", tAdd(key));
    }
  }
  if (data.description.trim().length < 20) {
    return tAdd("descMin");
  }
  return null;
}

async function submitToSheets(payload) {
  if (!GAS_WEB_APP_URL) {
    const pending = JSON.parse(localStorage.getItem("pendingFoodSuggestions") || "[]");
    pending.push({ ...payload, status: "Pending", timestamp: new Date().toISOString() });
    localStorage.setItem("pendingFoodSuggestions", JSON.stringify(pending));
    return { ok: true, simulated: true };
  }

  const response = await fetch(GAS_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return { ok: true, response };
}

async function initAddFood() {
  await loadUI();
  applyUISection("addFood");

  const form = document.getElementById("add-food-form");
  const desc = document.getElementById("description");
  const count = document.getElementById("desc-count");

  desc.addEventListener("input", () => {
    count.textContent = String(desc.value.length);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const error = validateForm(data);
    if (error) {
      setMessage(error, true);
      return;
    }

    const btn = document.getElementById("submit-btn");
    btn.disabled = true;
    setMessage(tAdd("submitting"));

    try {
      const result = await submitToSheets(data);
      if (result.simulated) {
        setMessage(tAdd("simulated"));
      } else {
        setMessage(tAdd("submitted"));
      }
      form.reset();
      count.textContent = "0";
    } catch (err) {
      console.error(err);
      setMessage(tAdd("failed"), true);
    } finally {
      btn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLayout({ activeId: "about" });
  initAddFood();
});
