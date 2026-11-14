(() => {
  // ---------- Elements ----------
  const section = document.querySelector(".cinema-scroll");
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sightsTrack = document.querySelector(".sights-track");
  const sightsControls = document.querySelector(".sights-controls");
  const sightPrev = document.querySelector(".sight-prev");
  const sightNext = document.querySelector(".sight-next");
  const originalSightCards = Array.from(document.querySelectorAll(".sight-card"));

  if (!section) return;

  // ---------- State ----------
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetScroll = 0;
  let smoothScroll = 0;
  let initialized = false;
  let rafPending = false;
  let sightCards = [];
  const originalSightCount = originalSightCards.length;
  let activeSight = originalSightCount;

  // ---------- Helpers ----------
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smoothstep = (e0, e1, v) => {
    const x = clamp((v - e0) / (e1 - e0));
    return x * x * (3 - 2 * x);
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const segmentInOut = (s, a, b, c, d) => {
    const enter = smoothstep(a, b, s);
    const exit = smoothstep(c, d, s);
    return { enter, exit, active: enter * (1 - exit) };
  };
  const getScrollDistance = () =>
    clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - window.innerHeight);

  const setVar = (name, value) => root.style.setProperty(name, value);

  // ---------- Per-frame update ----------
  function update() {
    rafPending = false;

    targetScroll = getScrollDistance();
    if (!initialized || reduceMotion.matches) {
      smoothScroll = targetScroll;
      initialized = true;
    } else {
      smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
    }
    if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

    mouseX = lerp(mouseX, targetMouseX, 0.12);
    mouseY = lerp(mouseY, targetMouseY, 0.12);

    const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
    const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
    const progress = clamp(smoothScroll / 2700);
    const introExit = smoothstep(90, 650, smoothScroll);
    const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
    const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
    const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
    const blurActive = clamp(frame2.active + frame3.active);
    const frame2Opacity = frame2.active * (1 - frame3.enter);
    const splitDrift = Math.pow(frame2.enter, 1.5);
    const panel2Opacity = frame2.active * (1 - frame2.exit);
    const panel3Opacity = frame3.active * (1 - frame3.exit);
    const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
    const sharedHeroY = progress * -74;
    const sharedHeroScale = progress * 0.23;
    const sightsScreenTop = Math.min(220, Math.max(112, window.innerHeight * 0.19)) - 50;
    const sightsParentTop = window.innerHeight - (window.innerHeight - sightsScreenTop) / backScale;

    // Pointer
    setVar("--mx", (reduceMotion.matches ? 0 : mouseX).toFixed(4));
    setVar("--my", (reduceMotion.matches ? 0 : mouseY).toFixed(4));

    // Back stack
    setVar("--back-opacity", (1 - frame2.active * 0.06).toFixed(3));
    setVar("--back-x", `${(mouseX * -12).toFixed(2)}px`);
    setVar("--back-y", `${(mouseY * -4).toFixed(2)}px`);
    setVar("--back-scale", backScale.toFixed(4));
    setVar("--four-y", `${(10 + progress * 10).toFixed(3)}vh`);
    setVar("--four-scale", (0.78 + progress * 0.16).toFixed(4));
    setVar("--bazaar-y", `${(20 - progress * 8).toFixed(3)}vh`);
    setVar("--blur-px", `${(blurActive * 14).toFixed(2)}px`);
    setVar("--back-brightness", (1 - blurActive * 0.255).toFixed(3));
    setVar("--bazaar-blur-px", `${(frame2.active * 14).toFixed(2)}px`);
    setVar("--bazaar-brightness", (1 - frame2.active * 0.255 - frame3.active * 0.06).toFixed(3));
    setVar("--bazaar-saturation", (1 + frame3.active * 0.18).toFixed(3));

    // Shade
    setVar("--shade-opacity", "1");
    setVar("--shade-z", frame2.active > 0.02 ? "2" : "0");
    setVar("--shade-top-alpha", (blurActive * 0.465).toFixed(3));
    setVar("--shade-mid-alpha", (blurActive * 0.42).toFixed(3));
    setVar("--shade-bottom-alpha", (blurActive * 0.51).toFixed(3));

    // Title
    setVar("--title-y", `${(introExit * -210).toFixed(2)}px`);
    setVar("--title-scale", (1 - introExit * 0.08).toFixed(4));
    setVar("--title-opacity", (1 - introExit).toFixed(3));

    // Bridge
    setVar("--bridge-x", `calc(-50% + ${(mouseX * 18).toFixed(2)}px)`);
    setVar("--bridge-y", `${(mouseY * 8 + sharedHeroY - frame2.exit * 760).toFixed(2)}px`);
    setVar("--bridge-bottom", `${(5 - frame2.enter * 13).toFixed(3)}vh`);
    setVar("--bridge-width", `${(67.2 + frame2.enter * 37.8).toFixed(3)}vw`);
    setVar("--bridge-scale", (1.02 + sharedHeroScale + frame2.exit * 0.46).toFixed(4));

    // Splitframes
    setVar("--split-left-x", `calc(-50% + ${(-splitDrift * 46).toFixed(3)}vw + ${(mouseX * 22).toFixed(2)}px)`);
    setVar("--split-left-y", `${(mouseY * 10 + sharedHeroY - splitDrift * 180).toFixed(2)}px`);
    setVar("--split-left-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));
    setVar("--split-right-x", `calc(-50% + ${(splitDrift * 46).toFixed(3)}vw + ${(mouseX * 22).toFixed(2)}px)`);
    setVar("--split-right-y", `${(mouseY * 10 + sharedHeroY - splitDrift * 180).toFixed(2)}px`);
    setVar("--split-right-scale", (1 + sharedHeroScale + frame2.enter * 0.74).toFixed(4));

    // Frame two
    setVar("--frame2-opacity", frame2Opacity.toFixed(3));
    setVar("--frame2-x", `calc(-50% + ${(mouseX * 10).toFixed(2)}px)`);
    setVar("--frame2-y", `calc(-50% + ${(mouseY * 8 - frame2.exit * 150).toFixed(2)}px)`);
    setVar("--frame2-scale", (1.06 + frame2.enter * 0.08 + frame2.exit * 0.08).toFixed(4));

    // Copy and panels
    setVar("--intro-copy-y", `${(introExit * 90).toFixed(2)}px`);
    setVar("--intro-copy-opacity", (1 - introExit).toFixed(3));
    setVar("--panel2-opacity", panel2Opacity.toFixed(3));
    setVar("--panel2-y", `calc(-50% + ${(-frame2.exit * 86 + (1 - frame2.enter) * 58).toFixed(2)}px)`);
    setVar("--panel3-opacity", panel3Opacity.toFixed(3));
    setVar("--panel3-y", `calc(-50% + ${(-frame3.exit * 86 + (1 - frame3.enter) * 58).toFixed(2)}px)`);

    // Sights
    setVar("--sights-opacity", sightsEnter.toFixed(3));
    setVar("--sights-controls-opacity", sightsControlsEnter.toFixed(3));
    if (sightsControls) sightsControls.classList.toggle("is-ready", sightsControlsEnter > 0.98);
    setVar("--sights-visibility", sightsEnter > 0.01 ? "visible" : "hidden");
    setVar("--sights-y", "0px");
    setVar("--sights-enter-x", `${((1 - sightsEnter) * 420).toFixed(3)}vw`);
    setVar("--sights-scale", (1 / backScale).toFixed(4));
    setVar("--sights-top", `${sightsParentTop.toFixed(2)}px`);
    setVar("--sights-screen-top", `${sightsScreenTop.toFixed(2)}px`);

    // Keep animating while easing toward targets
    if (
      Math.abs(smoothScroll - targetScroll) > 0.08 ||
      Math.abs(mouseX - targetMouseX) > 0.001 ||
      Math.abs(mouseY - targetMouseY) > 0.001
    ) {
      requestTick();
    }
  }

  function requestTick() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(update);
  }

  // ---------- Infinite sights slider ----------
  function setupSightSlider() {
    if (!sightsTrack || !originalSightCount) return;
    sightsTrack.replaceChildren();
    for (let setIndex = 0; setIndex < 3; setIndex += 1) {
      originalSightCards.forEach((card, cardIndex) => {
        const clone = card.cloneNode(true);
        clone.dataset.sightIndex = String(setIndex * originalSightCount + cardIndex);
        sightsTrack.appendChild(clone);
      });
    }
    sightCards = Array.from(sightsTrack.querySelectorAll(".sight-card"));
    activeSight = originalSightCount;

    sightCards.forEach((card) => {
      card.addEventListener("click", () => selectSightCard(card));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectSightCard(card);
        }
      });
    });

    sightsTrack.addEventListener("transitionend", normalizeSightSlider);
    updateSightSlider();
  }

  function updateSightSlider() {
    if (!sightsTrack || !sightCards.length) return;
    const cardWidth = sightCards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(sightsTrack).columnGap || "0") || 0;
    setVar("--sights-shift", `${-(cardWidth + gap) * activeSight}px`);
    sightCards.forEach((card, index) => card.classList.toggle("is-active", index === activeSight));
  }

  function moveSightSlider(direction) {
    activeSight += direction;
    updateSightSlider();
  }

  function selectSightCard(card) {
    const index = Number(card.dataset.sightIndex);
    if (Number.isFinite(index)) {
      activeSight = index;
      updateSightSlider();
    }
  }

  function jumpSightSlider(index) {
    sightsTrack.classList.add("is-jumping");
    activeSight = index;
    updateSightSlider();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => sightsTrack.classList.remove("is-jumping"));
    });
  }

  function normalizeSightSlider(event) {
    if (event && event.target !== sightsTrack) return;
    if (activeSight >= originalSightCount * 2) {
      jumpSightSlider(activeSight - originalSightCount);
    } else if (activeSight < originalSightCount) {
      jumpSightSlider(activeSight + originalSightCount);
    }
  }

  // ---------- Listeners ----------
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", () => {
    updateSightSlider();
    requestTick();
  });
  window.addEventListener(
    "pointermove",
    (event) => {
      targetMouseX = event.clientX / window.innerWidth - 0.5;
      targetMouseY = event.clientY / window.innerHeight - 0.5;
      requestTick();
    },
    { passive: true }
  );
  if (sightPrev) sightPrev.addEventListener("click", () => moveSightSlider(-1));
  if (sightNext) sightNext.addEventListener("click", () => moveSightSlider(1));

  setupSightSlider();
  requestTick();
})();
