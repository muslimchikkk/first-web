const header = document.querySelector(".site-header");

if (header) {
  const toggleHeaderShadow = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  toggleHeaderShadow();
  window.addEventListener("scroll", toggleHeaderShadow, { passive: true });
}

const initPanelWidthFromMenu = () => {
  const menuButton = document.querySelector(".header-cta .btn");
  if (!menuButton) {
    return;
  }
  const heroVisual = document.querySelector(".hero-visual");
  const nav = document.querySelector(".nav");
  const goldTrack = document.querySelector(".marquee-track--gold");

  const updatePanelWidth = () => {
    const rect = menuButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const rightWidth = Math.max(
      0,
      Math.min(window.innerWidth, window.innerWidth - centerX)
    );
    document.documentElement.style.setProperty(
      "--panel-right-width",
      `${rightWidth}px`
    );

    if (heroVisual) {
      const visualRect = heroVisual.getBoundingClientRect();
      const localCenterX = centerX - visualRect.left;
      heroVisual.style.setProperty("--plate-center-x", `${localCenterX}px`);

      if (nav && goldTrack) {
        const navRect = nav.getBoundingClientRect();
        const goldRect = goldTrack.getBoundingClientRect();
        const targetCenterY = (navRect.bottom + goldRect.top) / 2;
        const localCenterY = targetCenterY - visualRect.top;
        heroVisual.style.setProperty("--plate-center-y", `${localCenterY}px`);
      }
    }
  };

  updatePanelWidth();
  window.addEventListener("resize", updatePanelWidth);
};

const initPanelVerticalText = () => {
  const textEl = document.querySelector(".panel-vertical-text__content");
  if (!textEl) {
    return;
  }

  const word = textEl.getAttribute("data-word") || "DON'S";

  const updateText = () => {
    const panel = textEl.closest(".page-panel");
    const panelHeight = panel ? panel.getBoundingClientRect().height : window.innerHeight;
    const fontSize = parseFloat(getComputedStyle(textEl).fontSize) || 16;
    const approxUnit = fontSize * (word.length + 3);
    const count = Math.max(6, Math.ceil(panelHeight / approxUnit));
    textEl.innerHTML = Array.from({ length: count })
      .map((_, index) => {
        const outlineClass = index % 2 === 1 ? " panel-vertical-text__word--outline" : "";
        return `<span class="panel-vertical-text__word${outlineClass}">${word}</span>`;
      })
      .join(" ");
  };

  updateText();
  window.addEventListener("resize", updateText);
};

const initRatingSlider = () => {
  const slider = document.querySelector(".rating-slider");
  if (!slider) {
    return;
  }

  const cards = Array.from(slider.querySelectorAll(".rating-card"));
  if (cards.length <= 1) {
    return;
  }

  let current = cards.findIndex((card) => card.classList.contains("is-active"));
  if (current < 0) {
    current = 0;
    cards[0].classList.add("is-active");
  }

  const setHeight = () => {
    slider.style.height = `${cards[current].offsetHeight}px`;
  };

  const showNext = () => {
    cards[current].classList.remove("is-active");
    current = (current + 1) % cards.length;
    cards[current].classList.add("is-active");
    setHeight();
  };

  setHeight();
  window.addEventListener("resize", setHeight);
  setInterval(showNext, 4500);
};

const initBelts = () => {
  const marqBand = document.querySelector(".marquee-band");
  if (!marqBand) {
    return;
  }

  const darkTrack = document.querySelector(".marquee-track--dark");
  const goldTrack = document.querySelector(".marquee-track--gold");
  const darkRuns = darkTrack ? darkTrack.querySelectorAll(".marquee-run") : [];
  const goldRuns = goldTrack ? goldTrack.querySelectorAll(".marquee-run") : [];
  let latestScroll = window.scrollY;
  let ticking = false;

  const setBeltOffsets = () => {
    const updateOffset = (track, runs) => {
      if (!track || runs.length === 0) {
        return;
      }
      runs.forEach((run, index) => {
        run.classList.toggle("is-second", index === 1);
      });
      const gap = parseFloat(getComputedStyle(track).gap || "0");
      const runWidth = runs[0].scrollWidth;
      const trackWidth = track.getBoundingClientRect().width;
      const baseOffset = (trackWidth - runWidth) / 2;
      track.style.setProperty("--belt-run-offset", `${runWidth + gap}px`);
      track.style.setProperty("--belt-base", `${baseOffset}px`);
    };

    updateOffset(darkTrack, darkRuns);
    updateOffset(goldTrack, goldRuns);
  };

  const updateBelt = () => {
    document.documentElement.style.setProperty(
      "--belt-dark",
      `${-(latestScroll * 0.9)}px`
    );
    document.documentElement.style.setProperty(
      "--belt-gold",
      `${latestScroll * 0.9}px`
    );
    ticking = false;
  };

  const handleScroll = () => {
    latestScroll = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateBelt);
      ticking = true;
    }
  };

  setBeltOffsets();
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", setBeltOffsets);
};

const initHeroSlider = () => {
  const images = document.querySelectorAll(".hero-image");
  if (images.length === 0) {
    return;
  }
  let current = 0;

  setInterval(() => {
    images[current].classList.remove("is-active");
    current = (current + 1) % images.length;
    images[current].classList.add("is-active");
  }, 5000);
};

const initTestimonialsAvatars = () => {
  const avatars = document.querySelectorAll(".testimonial-card .reviewer-avatar");
  if (avatars.length === 0) {
    return;
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const palette = [
    "--avatar-1",
    "--avatar-2",
    "--avatar-3",
    "--avatar-4",
    "--avatar-5",
    "--avatar-6",
    "--avatar-7",
    "--avatar-8",
    "--avatar-9",
    "--avatar-10",
    "--avatar-11",
    "--avatar-12",
    "--avatar-13",
    "--avatar-14",
    "--avatar-15",
  ]
    .map((name) => rootStyle.getPropertyValue(name).trim())
    .filter(Boolean);

  const fallback = [
    "#f59e0b",
    "#22c55e",
    "#3b82f6",
    "#ef4444",
    "#14b8a6",
    "#f97316",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#fb7185",
    "#6366f1",
    "#a855f7",
    "#0ea5e9",
    "#eab308",
  ];
  const colors = palette.length ? palette : fallback;

  avatars.forEach((avatar) => {
    if (avatar.style.getPropertyValue("--avatar-color")) {
      return;
    }
    const color = colors[Math.floor(Math.random() * colors.length)];
    avatar.style.setProperty("--avatar-color", color);
  });
};

const initTestimonialsMarquee = () => {
  const rows = document.querySelectorAll(".slider-row");
  if (rows.length === 0) {
    return;
  }

  const getRowGap = (row) => {
    const styles = getComputedStyle(row);
    const gapValue = styles.gap || styles.columnGap || "0";
    const gap = parseFloat(gapValue);
    return Number.isNaN(gap) ? 0 : gap;
  };

  const updateRow = (row) => {
    if (!row.__baseNodes) {
      row.__baseNodes = Array.from(row.children);
    }
    if (row.__baseNodes.length === 0) {
      return;
    }

    const gap = getRowGap(row);
    const baseWidth =
      row.__baseNodes.reduce(
        (sum, node) => sum + node.getBoundingClientRect().width,
        0
      ) +
      gap * Math.max(0, row.__baseNodes.length - 1);

    if (!baseWidth) {
      return;
    }

    row.style.setProperty("--marquee-shift", `${baseWidth}px`);

    const parentWidth = row.parentElement
      ? row.parentElement.clientWidth
      : window.innerWidth;
    const targetWidth = parentWidth + baseWidth;

    let safety = 0;
    while (row.scrollWidth < targetWidth && safety < 20) {
      row.__baseNodes.forEach((node) => {
        row.appendChild(node.cloneNode(true));
      });
      safety += 1;
    }
  };

  rows.forEach(updateRow);
  window.addEventListener("resize", () => rows.forEach(updateRow));
};

const getSkewYRadians = (element) => {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === "none") {
    return 0;
  }

  const values = transform
    .replace("matrix3d(", "")
    .replace("matrix(", "")
    .replace(")", "")
    .split(",")
    .map((value) => parseFloat(value));

  const b = transform.startsWith("matrix3d") ? values[1] : values[1];
  if (Number.isNaN(b)) {
    return 0;
  }
  return Math.atan(b);
};

const initPanelCut = () => {
  const panel = document.querySelector(".page-panel--full .page-slicer");
  const goldTrack = document.querySelector(".marquee-track--gold");
  if (!panel || !goldTrack) {
    return;
  }

  let ticking = false;

  const updateCut = () => {
    const goldRect = goldTrack.getBoundingClientRect();
    const angle = getSkewYRadians(goldTrack);
    const overlap = Math.max(24, Math.round(goldRect.height * 0.90));
    const panelRect = panel.getBoundingClientRect();
    const cutY = goldRect.top - panelRect.top;
    const rise = Math.tan(angle) * panelRect.width;

    panel.style.setProperty("--panel-cut-y", `${cutY}px`);
    panel.style.setProperty("--panel-cut-rise", `${rise}px`);
    panel.style.setProperty("--panel-cut-overlap", `${overlap}px`);
    ticking = false;
  };

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateCut);
      ticking = true;
    }
  };

  updateCut();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", updateCut);
};

const includeTargets = document.querySelectorAll("[data-include]");
const includeJobs = Array.from(includeTargets).map((target) => {
  const file = target.getAttribute("data-include");
  if (!file) {
    return Promise.resolve();
  }
  return fetch(file)
    .then((response) => response.text())
    .then((html) => {
      target.outerHTML = html;
    })
    .catch((error) => {
      console.error("Include failed:", file, error);
    });
});

Promise.all(includeJobs).then(() => {
  initPanelWidthFromMenu();
  initPanelVerticalText();
  initRatingSlider();
  initBelts();
  initPanelCut();
  initHeroSlider();
  initTestimonialsAvatars();
  initTestimonialsMarquee();
});
