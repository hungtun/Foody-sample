function applyLanguage() {
  applyUISection("about");
}



function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const message = document.getElementById("message");
  const count = document.getElementById("msg-count");
  const status = document.getElementById("contact-status");

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwvHLBgAeNUy-Sfof3iNibL2-14kKPGPKQjI3kg3NtQpgZPQL1IMOUf1At3uh_nTFmtaQ/exec";

  message.addEventListener("input", () => {
    count.textContent = String(message.value.length);
  });

  form.addEventListener("submit", async (e) => {
    //xu lý xuống dòng
    const fields = [
    form.name,
    form.email,
    form.message
    ];
    fields.forEach((field, index) => {
      field.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        if (index === fields.length - 1) return;

        e.preventDefault();
        fields[index + 1].focus();
      });
    });

    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    if (!name || !email || !msg) {
  status.textContent = tUI("about", "fillAll");
  status.style.color = "#b33a2b";
  return;
}

if (!isValidEmail(email)) {
  status.textContent = tUI("about", "invalidEmail");
  status.style.color = "#b33a2b";
  return;
}

try {
  status.textContent = tUI("about", "sending");
  status.style.color = "#555";

  await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      name: name,
      email: email,
      message: msg
    })
  });

  status.textContent = tUI("about", "sent");
  status.style.color = "#0f4c3a";

  form.reset();
  count.textContent = "0";
} catch (error) {
  status.textContent = tUI("about", "sendError");
  status.style.color = "#b33a2b";
}
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initLayout({ activeId: "about" });
  await loadUI();
  applyLanguage();
  initContactForm();
});