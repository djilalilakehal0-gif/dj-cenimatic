(() => {
  // Tapping a service card opens its poster full size

  function openViewer(card) {
    const poster = card.querySelector(".sight-poster");
    if (!poster) return;
    const viewer = document.createElement("div");
    viewer.className = "poster-viewer";
    viewer.setAttribute("role", "dialog");
    viewer.setAttribute("aria-label", poster.alt);
    viewer.innerHTML = '<img alt=""><button type="button" aria-label="Fermer">✕</button>';
    viewer.querySelector("img").src = poster.src;
    viewer.querySelector("img").alt = poster.alt;
    const close = () => {
      viewer.classList.remove("is-open");
      setTimeout(() => viewer.remove(), 220);
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    viewer.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(viewer);
    requestAnimationFrame(() => viewer.classList.add("is-open"));
    viewer.querySelector("button").focus();
  }

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".sight-card");
    if (card) openViewer(card);
  });
  document.addEventListener("keydown", (e) => {
    const card = e.target.closest && e.target.closest(".sight-card");
    if (card && (e.key === "Enter" || e.key === " ")) openViewer(card);
  });
})();
