const pageFiles = Object.freeze({
  profile: "profile.html",
  projek: "projek.html"
});

const pageTitles = Object.freeze({
  home: "Beranda — Mohammad Hafidh Fathur Rouf",
  profile: "Profil — Mohammad Hafidh Fathur Rouf",
  projek: "Proyek — Mohammad Hafidh Fathur Rouf"
});

function initializeSkillHighlights(root) {
  const panel = root.querySelector(".skill-chart-panel");
  if (!panel) {
    return;
  }

  ["html", "css", "php", "python", "sql", "javascript"].forEach(skill => {
    const sources = [
      panel.querySelector(`.skill-arc.skill-${skill}`),
      panel.querySelector(`.skill-legend li.skill-${skill}`)
    ].filter(Boolean);
    const states = new Map(sources.map(element => [element, { hovered: false, focused: false }]));

    const updateHighlight = () => {
      const active = Array.from(states.values()).some(state => state.hovered || state.focused);
      sources.forEach(element => element.classList.toggle("is-active", active));
    };

    sources.forEach(element => {
      const state = states.get(element);
      element.addEventListener("pointerenter", () => {
        state.hovered = true;
        updateHighlight();
      });
      element.addEventListener("pointerleave", () => {
        state.hovered = false;
        updateHighlight();
      });
      element.addEventListener("focus", () => {
        state.focused = true;
        updateHighlight();
      });
      element.addEventListener("blur", () => {
        state.focused = false;
        updateHighlight();
      });
    });
  });
}

async function loadFragment(element, file) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} saat memuat ${file}`);
    }

    element.innerHTML = await response.text();
    if (file === "profile.html") {
      initializeSkillHighlights(element);
    }
  } catch (error) {
    console.error(`Gagal memuat komponen "${file}".`, error);
    element.textContent = `Komponen ${file} gagal dimuat. Jalankan halaman melalui server lokal.`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const sharedElements = document.querySelectorAll("[data-include]");
  const outlet = document.querySelector("[data-page-outlet]");
  const requestedPage = new URLSearchParams(window.location.search).get("page");
  const pageFile = requestedPage
    ? Object.prototype.hasOwnProperty.call(pageFiles, requestedPage)
      ? pageFiles[requestedPage]
      : null
    : "pembuka.html";

  document.title = requestedPage
    ? Object.prototype.hasOwnProperty.call(pageTitles, requestedPage)
      ? pageTitles[requestedPage]
      : "Halaman tidak ditemukan — Mohammad Hafidh Fathur Rouf"
    : pageTitles.home;

  const sharedLoads = Array.from(sharedElements, element =>
    loadFragment(element, element.dataset.include)
  );

  if (!outlet) {
    throw new Error("Elemen [data-page-outlet] tidak ditemukan di index.html.");
  }

  if (!pageFile) {
    console.warn(`Halaman "${requestedPage}" tidak tersedia.`);
    outlet.innerHTML = `
      <section>
        <h1>Halaman tidak ditemukan</h1>
        <p>Pilih halaman yang tersedia:</p>
        <a href="index.html">Beranda</a> ·
        <a href="index.html?page=profile">Tentang</a> ·
        <a href="index.html?page=projek">Proyek</a>
      </section>
    `;
    await Promise.all(sharedLoads);
    return;
  }

  const pageLoad = loadFragment(outlet, pageFile);
  const activeLink = requestedPage
    ? document.querySelector(`[data-page-link="${requestedPage}"]`)
    : null;
  if (activeLink) {
    activeLink.setAttribute("aria-current", "page");
  }

  await Promise.all([...sharedLoads, pageLoad]);
});
