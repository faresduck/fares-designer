// Interactions: typed role rotator, custom cursor, scroll reveals,
// tilt cards, animated counters, folder tabs, nav.

(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loading screen ---------- */
  const preloader = document.getElementById("preloader");
  const preloaderText = document.getElementById("preloaderText");
  const plBarFill = document.getElementById("plBarFill");
  const bootLines = [
    { text: "$ open fares-design-portfolio", cmd: true },
    { text: "loading visuals ......... ok" },
    { text: "mixing colors ........... ok" },
    { text: "hanging the artwork ...... ok" },
    { text: "$ welcome", cmd: true },
  ];
  const totalBootChars = bootLines.reduce((n, l) => n + l.text.length, 0);
  let typedBootChars = 0;

  function revealHero() {
    document.querySelectorAll("#hero .reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("visible"), 120 + i * 110);
    });
  }

  let preloaderDone = false;
  function finishPreloader() {
    if (preloaderDone) return;
    preloaderDone = true;
    plBarFill.style.width = "100%";
    setTimeout(() => {
      preloader.classList.add("done");
      revealHero();
    }, 320);
  }

  if (reducedMotion) {
    preloaderDone = true;
    preloader.classList.add("done");
    document.querySelectorAll("#hero .reveal").forEach((el) => el.classList.add("visible"));
  } else {
    setTimeout(finishPreloader, 4000);

    let li = 0;
    (function nextLine() {
      if (preloaderDone) return;
      if (li >= bootLines.length) return finishPreloader();
      const line = bootLines[li++];
      const p = document.createElement("p");
      preloaderText.appendChild(p);

      if (!line.cmd) {
        p.innerHTML = line.text.replace(/ok$/, '<span class="pl-ok">ok</span>');
        typedBootChars += line.text.length;
        plBarFill.style.width = (typedBootChars / totalBootChars) * 92 + "%";
        return setTimeout(nextLine, 140);
      }

      let ci = 0;
      (function typeChar() {
        if (preloaderDone) return;
        if (ci <= line.text.length) {
          const shown = line.text.slice(0, ci);
          p.innerHTML = `<span class="pl-prompt">$</span>${shown.slice(1)}<span class="pl-caret"></span>`;
          typedBootChars++;
          plBarFill.style.width = (typedBootChars / totalBootChars) * 92 + "%";
          ci++;
          setTimeout(typeChar, 24);
        } else {
          p.querySelector(".pl-caret")?.remove();
          setTimeout(nextLine, 170);
        }
      })();
    })();
  }

  /* ---------- Typed role rotator ---------- */
  const roles = [
    "graphic design.",
    "motion design.",
    "video editing.",
    "visual storytelling.",
    "brand identity.",
  ];
  const typedEl = document.getElementById("typedRole");
  if (reducedMotion) {
    typedEl.textContent = roles[0];
  } else {
    let roleIdx = 0, charIdx = 0, deleting = false;
    (function typeRole() {
      const word = roles[roleIdx];
      typedEl.textContent = word.slice(0, charIdx);
      let delay = deleting ? 40 : 75;
      if (!deleting && charIdx === word.length) {
        delay = 1900;
        deleting = true;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        delay = 350;
      }
      charIdx += deleting ? -1 : 1;
      setTimeout(typeRole, delay);
    })();
  }

  /* ---------- Custom cursor ---------- */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion) {
    let rx = -100, ry = -100, tx = -100, ty = -100;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    });
    (function followRing() {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(followRing);
    })();
    document.querySelectorAll("a, button, [data-tilt]").forEach((el) => {
      el.addEventListener("pointerenter", () => ring.classList.add("hovering"));
      el.addEventListener("pointerleave", () => ring.classList.remove("hovering"));
    });
  }

  /* ---------- Scroll reveals ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll("main > :not(#hero) .reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Tilt cards ---------- */
  if (window.matchMedia("(hover: hover)").matches && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 6}deg) rotateX(${py * -6}deg) translateY(-3px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Animated counters ---------- */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterObserver.unobserve(el);
        const target = parseInt(el.dataset.count, 10);
        if (reducedMotion) {
          el.textContent = target + "+";
          return;
        }
        const start = performance.now();
        const dur = 1600;
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + (p === 1 ? "+" : "");
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".stat-num").forEach((el) => counterObserver.observe(el));

  /* ---------- Portrait scene parallax ---------- */
  const scene = document.getElementById("portraitScene");
  if (scene && window.matchMedia("(hover: hover)").matches && !reducedMotion) {
    const layers = scene.querySelectorAll("[data-depth]");
    scene.addEventListener("pointermove", (e) => {
      const r = scene.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((layer) => {
        const d = parseFloat(layer.dataset.depth);
        const rot = layer.classList.contains("ps-stroke") ? " rotate(-24deg)" : "";
        layer.style.transform = `translate(${px * d * 46}px, ${py * d * 46}px)${rot}`;
      });
    });
    scene.addEventListener("pointerleave", () => {
      layers.forEach((layer) => {
        layer.style.transform = layer.classList.contains("ps-stroke") ? "rotate(-24deg)" : "";
      });
    });
  }

  /* ---------- Project folders ---------- */
  const folders = document.querySelectorAll(".folder");
  folders.forEach((folder) => {
    const tab = folder.querySelector(".folder-tab");
    tab.addEventListener("click", () => {
      const willOpen = !folder.classList.contains("open");
      folders.forEach((f) => {
        f.classList.remove("open");
        f.querySelector(".folder-tab").setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        folder.classList.add("open");
        tab.setAttribute("aria-expanded", "true");
      }
    });
  });
  if (folders.length) {
    folders[0].classList.add("open");
    folders[0].querySelector(".folder-tab").setAttribute("aria-expanded", "true");
  }

  /* ---------- Nav: shadow, hide on scroll down, burger ---------- */
  const nav = document.getElementById("nav");
  const navLinks = document.getElementById("navLinks");
  const burger = document.getElementById("navBurger");
  let lastScroll = 0;

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      nav.classList.toggle("scrolled", y > 20);
      nav.classList.toggle("hidden", y > lastScroll && y > 300 && !navLinks.classList.contains("open"));
      lastScroll = y;
    },
    { passive: true }
  );

  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Console easter egg ---------- */
  console.log(
    "%c> hello, curious creative 👀\n%c> this site was hand-coded by Fares Alyaqout\n> psst… he's available for design projects: faresalyaqout2@gmail.com",
    "color:#f13c15;font-family:monospace;font-size:14px;font-weight:bold",
    "color:#6f6459;font-family:monospace;font-size:12px"
  );
})();
