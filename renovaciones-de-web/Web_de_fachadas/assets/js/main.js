/* ==========================================================================
   CJBR Fachadas — interacción
   Sin dependencias. Progresivo: si falla el JS, la web sigue siendo usable.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ 1. Tema */

  const THEME_KEY = "cjbr-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
    const meta = $('meta[name="theme-color"]');
    if (meta) {
      const dark = theme === "dark" ||
        (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      meta.setAttribute("content", dark ? "#0b0e11" : "#f5f3f0");
    }
  }

  function currentTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  applyTheme(localStorage.getItem(THEME_KEY));

  $$("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      btn.setAttribute("aria-label", next === "dark" ? "Activar modo claro" : "Activar modo oscuro");
    });
  });

  /* ------------------------------------------------- 2. Cabecera y scroll */

  const header = $(".site-header");
  const progress = $(".progress-bar");
  const fab = $(".fab");
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    if (progress) progress.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);

    if (header) {
      header.classList.toggle("is-stuck", y > 12);
      // Oculta la cabecera al bajar, la devuelve al subir (más área de lectura)
      const goingDown = y > lastY && y > 320;
      header.classList.toggle("is-hidden", goingDown && !$(".nav__menu.is-open"));
    }

    if (fab) fab.classList.toggle("is-visible", y > 620);

    lastY = y;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* -------------------------------------------------------- 3. Nav móvil */

  const navToggle = $(".nav__toggle");
  const navMenu = $(".nav__menu");

  if (navToggle && navMenu) {
    const setNav = (open) => {
      navMenu.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) header?.classList.remove("is-hidden");
    };
    navToggle.addEventListener("click", () => setNav(!navMenu.classList.contains("is-open")));
    navMenu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) setNav(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 960 && navMenu.classList.contains("is-open")) setNav(false);
    });
  }

  /* --------------------------------------------------- 4. Reveal on scroll */

  const revealables = $$("[data-reveal]");
  if (revealables.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealables.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

      revealables.forEach((el, i) => {
        // Escalona los hermanos del mismo contenedor para un ritmo natural
        const stagger = el.dataset.reveal === "stagger" ? (i % 4) * 90 : 0;
        if (stagger) el.style.setProperty("--reveal-delay", `${stagger}ms`);
        io.observe(el);
      });
    }
  }

  /* --------------------------------------------------- 5. Contadores */

  const counters = $$("[data-count]");
  if (counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.decimals && Number(el.dataset.decimals)) || 0;
      if (reduceMotion) {
        el.textContent = target.toLocaleString("es-ES", { minimumFractionDigits: decimals });
        return;
      }
      const duration = 1500;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toLocaleString("es-ES", {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals,
        });
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const co = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          animate(e.target);
          co.unobserve(e.target);
        });
      }, { threshold: 0.5 });
      counters.forEach((el) => co.observe(el));
    } else {
      counters.forEach(animate);
    }
  }

  /* ------------------------------------------- 6. Brillo que sigue al cursor */

  if (window.matchMedia("(hover: hover)").matches) {
    $$(".card, .btn").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    });
  }

  /* ---------------------------------------------- 7. Tarjeta 3D del hero */

  const facadeCard = $(".facade-card");
  const heroVisual = $(".hero__visual");
  if (facadeCard && heroVisual && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    heroVisual.addEventListener("pointermove", (e) => {
      const r = heroVisual.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      facadeCard.style.setProperty("--ry", `${px * 9}deg`);
      facadeCard.style.setProperty("--rx", `${-py * 7}deg`);
    });
    heroVisual.addEventListener("pointerleave", () => {
      facadeCard.style.setProperty("--ry", "0deg");
      facadeCard.style.setProperty("--rx", "0deg");
    });
  }

  /* ------------------------------------- 8. Diagrama del sistema (capas) */

  const layers = $$(".layer");
  if (layers.length) {
    const setLayer = (btn) => {
      layers.forEach((l) => {
        l.classList.toggle("is-active", l === btn);
        l.setAttribute("aria-pressed", String(l === btn));
      });
      const id = btn.dataset.layer;
      $$("[data-layer-target]").forEach((el) => {
        el.classList.toggle("is-on", el.dataset.layerTarget === id);
      });
      const detail = $("#layer-detail");
      if (detail && btn.dataset.detail) detail.textContent = btn.dataset.detail;
    };
    layers.forEach((btn) => {
      btn.addEventListener("click", () => setLayer(btn));
      btn.addEventListener("mouseenter", () => setLayer(btn));
    });
    const initial = layers.find((l) => l.classList.contains("is-active")) || layers[0];
    if (initial) setLayer(initial);
  }

  /* ----------------------------------------------------------- 9. Tabs */

  $$("[data-tabs]").forEach((group) => {
    const tabs = $$('[role="tab"]', group);
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.classList.toggle("is-active", on);
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const map = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i };
        if (!(e.key in map)) return;
        e.preventDefault();
        const next = tabs[(i + map[e.key] + tabs.length) % tabs.length];
        next.focus(); select(next);
      });
    });
  });

  /* --------------------------------------------- 10. Filtro de proyectos */

  const filterBar = $("[data-filters]");
  if (filterBar) {
    const projects = $$("[data-category]");
    const count = $("[data-project-count]");
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      $$("button[data-filter]", filterBar).forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      const f = btn.dataset.filter;
      let shown = 0;
      projects.forEach((p) => {
        const match = f === "all" || p.dataset.category.split(" ").includes(f);
        p.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      if (count) count.textContent = String(shown);
    });
  }

  /* ------------------------------------------------------ 11. Lightbox */

  const lightbox = $("#lightbox");
  if (lightbox) {
    const lbMedia = $(".lightbox__media", lightbox);
    const lbTitle = $("[data-lb-title]", lightbox);
    const lbMeta = $("[data-lb-meta]", lightbox);
    const lbBody = $("[data-lb-body]", lightbox);
    const lbSpecs = $("[data-lb-specs]", lightbox);
    let lastFocus = null;

    const open = (card) => {
      lastFocus = document.activeElement;
      const img = $("img", card);
      lbMedia.innerHTML = img
        ? `<img src="${img.getAttribute("src")}" alt="${img.getAttribute("alt")}" style="width:100%;height:100%;object-fit:cover">`
        : "";
      lbTitle.textContent = card.dataset.title || "";
      lbMeta.textContent = card.dataset.meta || "";
      lbBody.textContent = card.dataset.body || "";
      lbSpecs.innerHTML = (card.dataset.specs || "")
        .split("|")
        .filter(Boolean)
        .map((s) => {
          const [k, v] = s.split(":");
          return `<li><span class="k">${k.trim()}</span><span class="v">${(v || "").trim()}</span></li>`;
        })
        .join("");
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      $(".lightbox__close", lightbox)?.focus();
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lastFocus?.focus();
    };

    $$("[data-lightbox]").forEach((card) => {
      card.addEventListener("click", (e) => { e.preventDefault(); open(card); });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(card); }
      });
    });

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.closest("[data-lb-close]")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });
    // Mantiene el foco dentro del diálogo mientras está abierto
    lightbox.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusables = $$('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])', lightbox)
        .filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ----------------------------------------------------------- 12. FAQ */

  $$(".faq__q").forEach((q) => {
    q.addEventListener("click", () => {
      const open = q.getAttribute("aria-expanded") === "true";
      // Acordeón exclusivo dentro de su grupo
      const group = q.closest(".faq");
      if (group && !open) {
        $$(".faq__q", group).forEach((o) => o.setAttribute("aria-expanded", "false"));
      }
      q.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ------------------------------------------------------ 13. Formulario */

  const form = $("#contact-form");
  if (form) {
    const status = $("#form-status");

    const validators = {
      nombre: (v) => v.trim().length >= 2 || "Indica tu nombre.",
      email: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) || "Revisa el correo electrónico.",
      telefono: (v) => v.trim() === "" || /^[+]?[\d\s().-]{9,}$/.test(v.trim()) || "Revisa el teléfono.",
      mensaje: (v) => v.trim().length >= 12 || "Cuéntanos algo más del proyecto (mínimo 12 caracteres).",
    };

    const showError = (field, msg) => {
      const input = form.elements[field];
      if (!input) return;
      const slot = form.querySelector(`[data-error-for="${field}"]`);
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (slot) slot.textContent = msg || "";
    };

    Object.keys(validators).forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      input.addEventListener("blur", () => {
        const res = validators[name](input.value);
        showError(name, res === true ? "" : res);
      });
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") {
          const res = validators[name](input.value);
          if (res === true) showError(name, "");
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      let firstBad = null;
      Object.keys(validators).forEach((name) => {
        const input = form.elements[name];
        if (!input) return;
        const res = validators[name](input.value);
        if (res !== true) { ok = false; showError(name, res); firstBad = firstBad || input; }
        else showError(name, "");
      });

      const consent = form.elements["consentimiento"];
      if (consent && !consent.checked) {
        ok = false;
        const slot = form.querySelector('[data-error-for="consentimiento"]');
        if (slot) slot.textContent = "Necesitamos tu consentimiento para responderte.";
        firstBad = firstBad || consent;
      }

      if (!ok) {
        status.className = "form-status form-status--err is-visible";
        status.textContent = "Revisa los campos marcados antes de enviar.";
        firstBad?.focus();
        return;
      }

      // Sin backend: se compone un correo con los datos del formulario.
      // Sustituye este bloque por un fetch() a tu endpoint cuando lo tengas.
      const data = new FormData(form);
      const cuerpo = [
        `Nombre: ${data.get("nombre")}`,
        `Email: ${data.get("email")}`,
        `Teléfono: ${data.get("telefono") || "—"}`,
        `Tipo de proyecto: ${data.get("tipo") || "—"}`,
        `Superficie estimada: ${data.get("superficie") || "—"}`,
        `Localización: ${data.get("localizacion") || "—"}`,
        "",
        data.get("mensaje"),
      ].join("\n");

      const href = `mailto:presupuestos@cjbrfachadas.com?subject=${encodeURIComponent(
        "Solicitud de presupuesto — " + (data.get("nombre") || "")
      )}&body=${encodeURIComponent(cuerpo)}`;

      status.className = "form-status form-status--ok is-visible";
      status.textContent = "Preparando tu solicitud… se abrirá tu gestor de correo con los datos ya rellenados. Respondemos en menos de 24 h laborables.";
      window.location.href = href;
    });
  }

  /* ------------------------------------------- 14. Presupuesto orientativo */

  const calc = $("#calc");
  if (calc) {
    const m2 = $("#calc-m2", calc);
    const m2out = $("#calc-m2-out", calc);
    const out = $("#calc-out", calc);
    const range = $("#calc-range", calc);

    // Horquillas orientativas €/m² instalados (material + subestructura + montaje)
    const PRECIOS = {
      composite: [95, 145],
      ceramico: [120, 190],
      fibrocemento: [105, 165],
      fenolico: [110, 170],
      "muro-cortina": [280, 450],
    };
    const FACTOR_ALTURA = { baja: 1, media: 1.12, alta: 1.28 };

    const fmt = (n) => n.toLocaleString("es-ES", { maximumFractionDigits: 0 });

    const update = () => {
      const sup = Number(m2.value);
      // El relleno de la pista sigue al pulgar (Chrome/Safari no lo hacen solos)
      const pct = ((sup - m2.min) / (m2.max - m2.min)) * 100;
      m2.style.setProperty("--fill", `${pct}%`);
      const mat = calc.querySelector('input[name="calc-material"]:checked')?.value || "composite";
      const alt = calc.querySelector('input[name="calc-altura"]:checked')?.value || "baja";
      const [lo, hi] = PRECIOS[mat];
      const f = FACTOR_ALTURA[alt];
      // Economía de escala: obras grandes bajan el €/m²
      const escala = sup > 2000 ? 0.9 : sup > 800 ? 0.95 : 1;
      if (m2out) m2out.textContent = `${fmt(sup)} m²`;
      if (out) out.textContent = `${fmt(sup * lo * f * escala)} € – ${fmt(sup * hi * f * escala)} €`;
      if (range) range.textContent = `${fmt(lo * f * escala)} – ${fmt(hi * f * escala)} €/m²`;
    };

    calc.addEventListener("input", update);
    calc.addEventListener("change", update);
    update();
  }

  /* ------------------------------------------------------ 15. Año actual */

  $$("[data-year]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* --------------------------------- 16. Marca activa en navegación local */

  const sectionLinks = $$('.nav__link[href^="#"], .nav__link[href*="#"]');
  const sections = sectionLinks
    .map((l) => {
      const id = l.getAttribute("href").split("#")[1];
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((l) => {
          const on = l.getAttribute("href").endsWith(`#${entry.target.id}`);
          if (on) l.setAttribute("data-active", "true");
          else l.removeAttribute("data-active");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => so.observe(s));
  }
})();
