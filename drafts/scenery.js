(() => {
  // Adds moving layers right above their source images, reusing the same
  // classes so they follow every scroll transform exactly.
  const make = (html) => {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  const srcOf = (img) => `url("${img.currentSrc || img.src}")`;

  const sky = document.querySelector(".sky-img");
  if (sky) sky.after(make('<div class="sky-fx" aria-hidden="true"><i class="cloud-high"></i><i class="cloud-low"></i></div>'));

  const bazaar = document.querySelector("img.back-bazaar");
  if (bazaar) {
    const trees = make('<div class="scene-img back-img back-bazaar scene-fx bazaar-fx trees-fx bazaar-trees" aria-hidden="true"><b class="fx-crop"><i></i></b></div>');
    trees.style.setProperty("--fx-src", srcOf(bazaar));
    const river = make('<div class="scene-img back-img back-bazaar scene-fx bazaar-fx river-fx" aria-hidden="true"><b class="fx-crop"><i class="flow-far"></i><i class="flow-near"></i></b></div>');
    bazaar.after(trees, river);
  }

  [["splitframe-left", "left-trees"], ["splitframe-right", "right-trees"]].forEach(([cls, fx]) => {
    const img = document.querySelector(`img.${cls}`);
    if (!img) return;
    const layer = make(`<div class="scene-img splitframe-img ${cls} scene-fx trees-fx ${fx}" aria-hidden="true"><b class="fx-crop"><i></i></b></div>`);
    layer.style.setProperty("--fx-src", srcOf(img));
    img.after(layer);
  });

  // Hide the sharp moving layers while the scroll story blurs the background
  const root = document.documentElement;
  const sync = () => {
    const blur = parseFloat(root.style.getPropertyValue("--blur-px")) || 0;
    const bazaarBlur = parseFloat(root.style.getPropertyValue("--bazaar-blur-px")) || 0;
    root.classList.toggle("fx-sky-off", blur > 0.3);
    root.classList.toggle("fx-bazaar-off", bazaarBlur > 0.3 || blur > 0.3);
    root.classList.toggle("fx-calm", blur < 0.005 && bazaarBlur < 0.005);
  };
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ["style"] });
  sync();
})();
