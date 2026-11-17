(() => {
  // Adds the river clip to the scene; it plays only while the cards scene is on screen
  const world = document.querySelector(".world");
  if (!world) return;
  const fig = document.createElement("figure");
  fig.className = "river-clip";
  fig.innerHTML = '<video muted loop playsinline preload="metadata" poster="../media/river-clip.jpg" tabindex="0" aria-label="Vidéo de démonstration"><source src="../media/river-clip.mp4" type="video/mp4"></video>';
  world.appendChild(fig);

  const video = fig.querySelector("video");
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let userPaused = false;

  const sync = () => {
    const shown = (parseFloat(root.style.getPropertyValue("--sights-opacity")) || 0) > 0.05;
    if (shown && !userPaused && !reduce.matches) {
      if (video.paused) video.play().catch(() => {});
    } else if (!shown && !video.paused) {
      video.pause();
    }
  };
  // Tap or Enter toggles playback
  const toggle = () => {
    if (video.paused) { userPaused = false; video.play().catch(() => {}); }
    else { userPaused = true; video.pause(); }
  };
  video.addEventListener("click", toggle);
  video.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  });
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["style"] });
  sync();
})();
