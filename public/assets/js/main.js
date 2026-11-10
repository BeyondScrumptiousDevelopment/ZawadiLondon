/* Zawadi London — site interactions */
(function () {
  "use strict";

  var ETSY_URL = "https://zawadilondon.etsy.com";
  var EMAIL = "zawadildn@gmail.com";

  var doc = document.documentElement;
  doc.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function store(get, key, val) {
    try { return get ? sessionStorage.getItem(key) : sessionStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* Etsy links */
  $$("[data-etsy]").forEach(function (a) {
    a.href = ETSY_URL; a.target = "_blank"; a.rel = "noopener";
  });

  /* Year */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Intro curtain — once per visit */
  var curtain = $(".curtain");
  if (curtain) {
    if (reduceMotion || store(true, "zw-intro")) {
      curtain.classList.add("is-gone");
    } else {
      store(false, "zw-intro", "1");
      setTimeout(function () { curtain.classList.add("is-done"); }, 1100);
      setTimeout(function () { curtain.classList.add("is-gone"); }, 2300);
    }
  }

  /* Header: solid after scroll, hide on scroll down */
  var header = $(".header");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-solid", y > 40);
      var hide = y > lastY && y > 400 && !doc.classList.contains("menu-open");
      header.classList.toggle("is-hidden", hide);
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var menuBtn = $(".menu-btn");
  function setMenu(open) {
    doc.classList.toggle("menu-open", open);
    if (menuBtn) menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    var mm = $(".mobile-menu"); if (mm) mm.setAttribute("aria-hidden", open ? "false" : "true");
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(!doc.classList.contains("menu-open")); });
    $$(".mobile-menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* Split .lines text into animated lines (by <br>) */
  $$("[data-lines]").forEach(function (el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (p) { return '<span class="line"><span>' + p.trim() + "</span></span>"; }).join("");
    el.classList.add("lines");
  });

  /* Reveal on scroll */
  var revealEls = $$(".reveal, .lines, .img-reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* Autoplay videos only while on screen */
  var autoVids = $$("video[data-autoplay]");
  if ("IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && !reduceMotion) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.2 });
    autoVids.forEach(function (v) { v.muted = true; vio.observe(v); });
  }

  /* Moments tiles: play on hover (desktop) or when centred (touch) */
  var hoverable = window.matchMedia("(hover: hover)").matches;
  $$(".moment[data-video]").forEach(function (tile) {
    var v = $("video", tile);
    if (!v || reduceMotion) return;
    function play() { tile.classList.add("is-playing"); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    function stop() { tile.classList.remove("is-playing"); v.pause(); }
    if (hoverable) {
      tile.addEventListener("mouseenter", play);
      tile.addEventListener("mouseleave", stop);
      tile.addEventListener("focus", play);
      tile.addEventListener("blur", stop);
    } else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? play() : stop(); },
        { rootMargin: "-35% 0px -35% 0px" }).observe(tile);
    }
  });

  /* Sticky statement — words light up with scroll */
  $$(".scrolly").forEach(function (sec) {
    var words = $$(".word", sec);
    var z = $(".bg-z", sec);
    function update() {
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - window.innerHeight;
      var prog = Math.min(1, Math.max(0, -r.top / (total || 1)));
      var lit = Math.round(prog * (words.length + 1));
      words.forEach(function (w, i) { w.classList.toggle("on", i < lit); });
      if (z) z.style.setProperty("--rot", (prog * 24 - 12).toFixed(2) + "deg");
    }
    if (reduceMotion) { words.forEach(function (w) { w.classList.add("on"); }); return; }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* How-it-works: activate step + matching media */
  $$("[data-steps]").forEach(function (wrap) {
    var steps = $$(".step", wrap);
    var media = $$(".steps-media > *", wrap);
    function activate(i) {
      steps.forEach(function (s, k) { s.classList.toggle("active", k === i); });
      media.forEach(function (m, k) {
        var on = k === Math.min(i, media.length - 1);
        m.classList.toggle("active", on);
        if (m.tagName === "VIDEO") { if (on && !reduceMotion) { var p = m.play(); if (p && p.catch) p.catch(function () {}); } else m.pause(); }
      });
    }
    activate(0);
    if (!("IntersectionObserver" in window)) return;
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) activate(steps.indexOf(en.target)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { sio.observe(s); });
  });

  /* Frame designer */
  $$("[data-designer]").forEach(function (root) {
    var mock = $(".mock", root);
    var photo = $(".mock-photo img", root);
    var nameEl = $(".mock-name", root);
    var nameText = $(".mock-name-text", root);
    var dateEl = $(".mock-date", root);
    var nameInput = $("[name=frame-name]", root);
    var dateInput = $("[name=frame-date]", root);
    var capsInput = $("[name=frame-caps]", root);
    var pearls = $(".mock-pearls", root);
    var copyBtn = $("[data-copy]", root);
    var copied = $(".copied", root);
    var current = { moment: "", frame: "white" };

    if (pearls && !pearls.children.length) {
      var html = "";
      for (var i = 0; i < 46; i++) {
        var s = [7, 9, 11, 13, 8, 10][i % 6];
        html += '<i style="--s:' + s + 'px"></i>';
      }
      pearls.innerHTML = html;
    }

    function render() {
      var n = (nameInput && nameInput.value.trim()) || nameInput.getAttribute("placeholder");
      nameText.textContent = n;
      var d = dateInput ? dateInput.value.trim() : "";
      dateEl.textContent = d;
      dateEl.style.display = d ? "block" : "none";
      nameEl.classList.toggle("caps", !!(capsInput && capsInput.checked));
      var len = n.length;
      nameEl.style.fontSize = len > 22 ? "clamp(16px,3vw,26px)" : len > 14 ? "clamp(18px,3.6vw,32px)" : "";
    }

    $$("[name=frame-moment]", root).forEach(function (r) {
      r.addEventListener("change", function () {
        if (!r.checked) return;
        current.moment = r.getAttribute("data-label");
        photo.classList.add("swap");
        setTimeout(function () {
          photo.src = r.value;
          photo.onload = function () { photo.classList.remove("swap"); };
          if (photo.complete) photo.classList.remove("swap");
        }, 250);
        if (nameInput && r.getAttribute("data-name") && !nameInput.dataset.touched) {
          nameInput.setAttribute("placeholder", r.getAttribute("data-name"));
          render();
        }
      });
      if (r.checked) current.moment = r.getAttribute("data-label");
    });
    $$("[name=frame-colour]", root).forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) { mock.setAttribute("data-frame", r.value); current.frame = r.value; } });
    });
    [nameInput, dateInput].forEach(function (inp) {
      if (inp) inp.addEventListener("input", function () { inp.dataset.touched = "1"; render(); });
    });
    if (capsInput) capsInput.addEventListener("change", render);

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var txt = "Zawadi Frame — " + current.moment +
          "\nFrame: " + current.frame +
          "\nName(s): " + ((nameInput && nameInput.value.trim()) || "") +
          (dateInput && dateInput.value.trim() ? "\nDate: " + dateInput.value.trim() : "") +
          "\nLettering: " + (capsInput && capsInput.checked ? "capitals" : "as typed");
        function done() { if (copied) { copied.classList.add("show"); setTimeout(function () { copied.classList.remove("show"); }, 2200); } }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
        else done();
      });
    }

    /* Gentle tilt toward the pointer */
    if (hoverable && !reduceMotion) {
      var stage = $(".stage", root);
      stage.addEventListener("mousemove", function (e) {
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        mock.style.transform = "perspective(1200px) rotateY(" + (x * 8).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
      });
      stage.addEventListener("mouseleave", function () { mock.style.transform = ""; });
    }
    render();
  });

  /* Lightbox gallery */
  var gallery = $$("[data-gallery] button");
  if (gallery.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML = '<img alt=""><button class="lb-btn lb-close" aria-label="Close">×</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous photo">‹</button><button class="lb-btn lb-next" aria-label="Next photo">›</button><p class="lb-count"></p>';
    document.body.appendChild(lb);
    var lbImg = $("img", lb), lbCount = $(".lb-count", lb), idx = 0, opener = null;
    function show(i) {
      idx = (i + gallery.length) % gallery.length;
      var src = gallery[idx].getAttribute("data-full"), alt = $("img", gallery[idx]).alt;
      lbImg.src = src; lbImg.alt = alt;
      lbCount.textContent = (idx + 1) + " / " + gallery.length;
    }
    function open(i) { opener = document.activeElement; show(i); lb.classList.add("open"); $(".lb-close", lb).focus(); }
    function close() { lb.classList.remove("open"); if (opener) opener.focus(); }
    gallery.forEach(function (b, i) { b.addEventListener("click", function () { open(i); }); });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    var sx = 0;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
  }

  /* Product page thumbnails */
  function initProduct(wrap) {
    var main = $(".product-main", wrap);
    var thumbs = $$(".thumbs button", wrap);
    thumbs.forEach(function (t) {
      t.addEventListener("click", function () {
        thumbs.forEach(function (o) { o.setAttribute("aria-pressed", o === t ? "true" : "false"); });
        var src = t.getAttribute("data-src"), alt = $("img", t).alt;
        var isVid = /\.mp4$/.test(src);
        var el = isVid ? document.createElement("video") : new Image();
        if (isVid) { el.muted = true; el.loop = true; el.playsInline = true; el.autoplay = !reduceMotion; el.setAttribute("aria-label", alt); el.poster = src.replace(".mp4", ".jpg"); }
        else el.alt = alt;
        el.src = src; el.style.opacity = "0";
        main.appendChild(el);
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.opacity = "1"; }); });
        setTimeout(function () { while (main.children.length > 1) main.removeChild(main.firstChild); }, 550);
      });
    });
  }
  $$("[data-product]").forEach(initProduct);

  /* ---------- Products from the CMS (content/products.json) ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function asset(p) { return p ? String(p).replace(/^\//, "") : ""; }
  function priceText(p) {
    if (typeof p.price === "number" && p.price > 0) return "£" + (p.price % 1 ? p.price.toFixed(2) : p.price);
    return p.priceNote || "Price on request";
  }
  function placeholder(p) {
    return '<div class="ph"><img src="assets/img/brand/mark-white.png" alt=""><span>' + esc(p.name) + "</span></div>";
  }
  function revealNew(root) {
    $$(".reveal, .img-reveal", root).forEach(function (el) {
      if (!("IntersectionObserver" in window) || reduceMotion) { el.classList.add("in"); return; }
      var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { el.classList.add("in"); o.disconnect(); } }, { threshold: 0.1 });
      o.observe(el);
    });
  }

  var productsPromise = null;
  function loadProducts() {
    if (!productsPromise) {
      productsPromise = fetch("content/products.json", { cache: "no-cache" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { return (d.products || []).filter(function (p) { return p.available !== false && p.slug; }); });
    }
    return productsPromise;
  }

  /* Product cards: data-products="all" or "featured" */
  $$("[data-products]").forEach(function (grid) {
    var mode = grid.getAttribute("data-products");
    loadProducts().then(function (list) {
      if (mode === "featured") list = list.filter(function (p) { return p.featured; });
      if ($("[data-product-page]")) {
        var cur = new URLSearchParams(location.search).get("p") || "zawadi-frame";
        list = list.filter(function (p) { return p.slug !== cur; });
      }
      grid.innerHTML = list.map(function (p, i) {
        var media = p.image ? '<img src="' + esc(asset(p.image)) + '" alt="' + esc(p.name) + '" loading="lazy">' : placeholder(p);
        return '<a class="card reveal" data-delay="' + (i % 4) + '" href="product.html?p=' + encodeURIComponent(p.slug) + '">' +
          '<div class="card-media">' + media + "</div>" +
          '<div class="card-body"><h3>' + esc(p.name) + "</h3><p>" + esc(p.tagline) + "</p>" +
          '<span class="card-foot"><span class="card-price">' + esc(priceText(p)) + '</span><span class="card-go">View →</span></span></div></a>';
      }).join("");
      revealNew(grid);
    }).catch(function () {
      grid.innerHTML = '<p class="lead">See everything we make in our <a data-etsy href="' + ETSY_URL + '">Etsy shop</a>.</p>';
    });
  });

  /* Single product page: product.html?p=slug */
  var pp = $("[data-product-page]");
  if (pp) {
    var slug = new URLSearchParams(location.search).get("p") || "zawadi-frame";
    loadProducts().then(function (list) {
      var p = list.filter(function (x) { return x.slug === slug; })[0];
      if (!p) { pp.innerHTML = '<div class="center"><h1 class="section-title">We couldn’t find that piece</h1><p><a class="link" href="shop.html">See everything we make</a></p></div>'; return; }
      document.title = p.name + " | Zawadi London";
      var md = $('meta[name="description"]'); if (md) md.setAttribute("content", p.tagline || p.description || "");
      var etsy = p.etsyUrl || ETSY_URL;

      var media = [];
      if (p.image) media.push({ src: asset(p.image), alt: p.name });
      if (p.video) media.push({ src: asset(p.video), alt: "Video: " + p.name, video: true });
      (p.gallery || []).forEach(function (g) { if (g) media.push({ src: asset(g), alt: p.name }); });

      var first = media[0];
      var mainHtml = !first ? placeholder(p) : first.video
        ? '<video muted loop playsinline autoplay poster="' + esc(first.src.replace(".mp4", ".jpg")) + '" src="' + esc(first.src) + '"></video>'
        : '<img src="' + esc(first.src) + '" alt="' + esc(first.alt) + '">';
      var thumbs = media.length > 1 ? '<div class="thumbs">' + media.map(function (m, i) {
        return '<button type="button" data-src="' + esc(m.src) + '" aria-pressed="' + (i === 0) + '" aria-label="Show: ' + esc(m.alt) + '"' + (m.video ? ' class="play"' : "") + '><img src="' + esc(m.video ? m.src.replace(".mp4", ".jpg") : m.src) + '" alt="" loading="lazy"></button>';
      }).join("") + "</div>" : "";

      var opts = (p.options || []).filter(function (o) { return o && o.name && o.choices && o.choices.length; }).map(function (o, k) {
        return '<fieldset class="opt"><legend>' + esc(o.name) + '</legend><div class="chips">' + o.choices.map(function (c, j) {
          return '<label class="chip"><input type="radio" name="opt-' + k + '" data-opt="' + esc(o.name) + '" value="' + esc(c) + '"' + (j === 0 ? " checked" : "") + "><span>" + esc(c) + "</span></label>";
        }).join("") + "</div></fieldset>";
      }).join("");

      var spec = "";
      if (p.perfectFor && p.perfectFor.length) spec += "<li><span>Perfect for</span><span>" + p.perfectFor.map(esc).join(" · ") + "</span></li>";
      if (p.personalise && p.personalise.length) spec += "<li><span>You choose</span><span>" + p.personalise.map(esc).join(" · ") + "</span></li>";
      spec += "<li><span>Price</span><span>" + esc(priceText(p)) + "</span></li>";

      pp.innerHTML =
        '<div class="product" data-product>' +
          '<div><div class="product-main img-reveal">' + mainHtml + "</div>" + thumbs + "</div>" +
          '<div class="product-info">' +
            '<span class="eyebrow reveal">Personalised keepsake</span>' +
            '<h1 class="section-title reveal">' + esc(p.name) + "</h1>" +
            '<p class="price reveal">' + esc(priceText(p)) + "</p>" +
            (p.tagline ? '<p class="lead reveal">' + esc(p.tagline) + "</p>" : "") +
            (p.description ? '<p class="reveal">' + esc(p.description) + "</p>" : "") +
            (opts ? '<div class="reveal opts">' + opts + "</div>" : "") +
            '<ul class="spec reveal">' + spec + "</ul>" +
            '<div class="btn-row reveal"><a class="btn" href="' + esc(etsy) + '" target="_blank" rel="noopener">Order on Etsy <span class="arrow">→</span></a>' +
            (opts ? '<button type="button" class="btn btn--ghost" data-copy-opts>Copy my choices</button><span class="copied" role="status">Copied</span>' : '<a class="btn btn--ghost" href="contact.html">Enquire</a>') +
            "</div>" +
            '<p class="caption reveal" style="margin-top:24px">Want something a little different? <a href="contact.html">Make a custom enquiry.</a></p>' +
          "</div></div>";

      initProduct($("[data-product]", pp));
      revealNew(pp);

      var copyOpts = $("[data-copy-opts]", pp);
      if (copyOpts) copyOpts.addEventListener("click", function () {
        var txt = p.name + "\n" + $$("input[data-opt]:checked", pp).map(function (i) { return i.getAttribute("data-opt") + ": " + i.value; }).join("\n");
        var c = $(".copied", pp);
        function done() { c.classList.add("show"); setTimeout(function () { c.classList.remove("show"); }, 2200); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done); else done();
      });

      var ds = $("#designer-section"); if (ds) ds.hidden = !p.designer;
      $$("[data-product-only]").forEach(function (el) { el.hidden = !p.designer; });
    }).catch(function () {
      pp.innerHTML = '<div class="center"><p class="lead">See everything we make in our <a href="' + ETSY_URL + '">Etsy shop</a>.</p></div>';
    });
  }

  /* ---------- Live Instagram feed (Cloudflare function /api/instagram) ---------- */
  $$("[data-instagram]").forEach(function (box) {
    fetch("/api/instagram")
      .then(function (r) { return r.ok ? r.json() : { items: [] }; })
      .then(function (d) {
        var items = (d.items || []).slice(0, 8);
        if (items.length < 4) return; /* keep the brand posts */
        box.classList.add("is-live");
        box.innerHTML = items.map(function (m, i) {
          var cap = m.caption ? m.caption.split("\n")[0] : "Zawadi London on Instagram";
          return '<a href="' + esc(m.permalink) + '" target="_blank" rel="noopener" class="reveal" data-delay="' + (i % 4) + '">' +
            '<img src="' + esc(m.image) + '" alt="' + esc(cap) + '" loading="lazy">' +
            (m.type === "VIDEO" ? '<span class="ig-type">▶</span>' : m.type === "CAROUSEL_ALBUM" ? '<span class="ig-type">❐</span>' : "") +
            '<span class="ig-cap">' + esc(cap) + "</span></a>";
        }).join("");
        var label = box.parentNode.querySelector("[data-live-label]");
        if (label) label.hidden = false;
        revealNew(box);
      })
      .catch(function () {});
  });

  /* Contact form — opens the visitor's email app with the enquiry filled in */
  var form = $("[data-enquiry]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var f = new FormData(form);
      var subject = "Custom enquiry — " + (f.get("moment") || "Zawadi Frame");
      var body = "Name: " + f.get("name") + "\nEmail: " + f.get("email") + "\nThe moment: " + (f.get("moment") || "") + "\n\n" + f.get("idea");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var wrap = form.closest(".form-wrap");
      setTimeout(function () { wrap.classList.add("form-sent"); wrap.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); }, 400);
    });
  }
})();
