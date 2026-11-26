/* Ciência de Dados e Estatística · UFU — interações da landing page */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav com borda ao rolar ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- barras decorativas do CTA (tendência de alta) ---------- */
  var bars = document.querySelector(".cta-bars");
  if (bars) {
    var n = 42, html = "";
    for (var i = 0; i < n; i++) {
      var trend = 18 + (i / (n - 1)) * 70;
      var noise = Math.sin(i * 1.7) * 9 + Math.cos(i * 0.6) * 6;
      html += '<i style="height:' + Math.max(8, Math.min(100, trend + noise)).toFixed(0) + '%"></i>';
    }
    bars.innerHTML = html;
  }

  /* ---------- "Combina com você?" ---------- */
  var fit = document.querySelector(".fit");
  if (fit) {
    var boxes = fit.querySelectorAll('input[type="checkbox"]');
    var mathBox = fit.querySelector("input[data-math]");
    var result = fit.querySelector(".fit-result");
    var OFICIAL = '<a href="https://www.ime.ufu.br/graduacao/ciencia-de-dados-e-estatistica" target="_blank" rel="noopener">site oficial</a>';
    var updateFit = function () {
      var n = 0;
      boxes.forEach(function (b) { if (b.checked) n++; });
      var total = boxes.length;
      var cls = "", msg;
      if (n === 0) {
        msg = "Marque o que tem a ver com você 👆";
      } else if (!mathBox.checked) {
        cls = "warn";
        msg = "<strong>" + n + " de " + total + ".</strong> Fica a dica: a matemática está em todos os semestres do curso. Vale refletir com calma sobre isso antes de decidir, olhar a grade no " + OFICIAL + " e tirar dúvidas com a coordenação.";
      } else if (n <= 2) {
        msg = "<strong>" + n + " de " + total + ".</strong> Vale pesquisar mais: confira a grade no " + OFICIAL + " e converse com quem já faz o curso antes de decidir.";
      } else if (n < total) {
        cls = "good";
        msg = "<strong>" + n + " de " + total + ".</strong> Bom sinal! Confira a grade completa no " + OFICIAL + " pra ter certeza.";
      } else {
        cls = "good";
        msg = "<strong>" + n + " de " + total + ".</strong> Tudo indica que esse curso tem a sua cara 💚 Próximo passo: a grade completa no " + OFICIAL + ".";
      }
      result.className = "fit-result" + (cls ? " " + cls : "");
      result.innerHTML = msg;
    };
    boxes.forEach(function (b) { b.addEventListener("change", updateFit); });
    updateFit();
  }

  /* =========================================================
     Regressão linear ao vivo (canvas do hero)
     ========================================================= */
  var canvas = document.getElementById("reg");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var eqEl = document.getElementById("eq");
  var r2El = document.getElementById("r2");
  var resetBtn = document.getElementById("reset");

  var W = 0, H = 0, dpr = 1;
  var PAD = { l: 34, r: 16, t: 18, b: 28 };
  var XMAX = 10, YMAX = 10;

  // gerador pseudo-aleatório com semente (mesma nuvem a cada visita)
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function gauss() {
    var u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  var points = [];
  function makePoints() {
    seed = 7;
    points = [];
    for (var i = 0; i < 26; i++) {
      var x = 0.6 + rand() * 8.8;
      var y = 1.4 + 0.66 * x + gauss() * 1.05;
      y = Math.max(0.4, Math.min(9.6, y));
      points.push({ bx: x, by: y, x: x, y: y, ph: rand() * 6.28, sp: 0.4 + rand() * 0.6, you: false });
    }
    // o ponto rosa: "você"
    points.push({ bx: 2.2, by: 8.4, x: 2.2, y: 8.4, ph: 0, sp: 0, you: true, auto: true });
  }
  makePoints();

  var fit = { a: 1.4, b: 0.66, s: 1, r2: 0.7 };
  var shown = { a: 1.4, b: 0.66, s: 1 };

  function computeFit() {
    var n = points.length, sx = 0, sy = 0;
    for (var i = 0; i < n; i++) { sx += points[i].x; sy += points[i].y; }
    var mx = sx / n, my = sy / n, sxx = 0, sxy = 0, syy = 0;
    for (i = 0; i < n; i++) {
      var dx = points[i].x - mx, dy = points[i].y - my;
      sxx += dx * dx; sxy += dx * dy; syy += dy * dy;
    }
    var b = sxx > 1e-9 ? sxy / sxx : 0;
    var a = my - b * mx;
    var sse = 0;
    for (i = 0; i < n; i++) {
      var r = points[i].y - (a + b * points[i].x);
      sse += r * r;
    }
    fit.a = a; fit.b = b;
    fit.s = Math.sqrt(sse / Math.max(1, n - 2));
    fit.r2 = syy > 1e-9 ? Math.max(0, 1 - sse / syy) : 0;
  }

  function px(x) { return PAD.l + (x / XMAX) * (W - PAD.l - PAD.r); }
  function py(y) { return H - PAD.b - (y / YMAX) * (H - PAD.t - PAD.b); }
  function dataX(p) { return ((p - PAD.l) / (W - PAD.l - PAD.r)) * XMAX; }
  function dataY(p) { return ((H - PAD.b - p) / (H - PAD.t - PAD.b)) * YMAX; }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function fmt(v) {
    return v.toFixed(2).replace(".", ",");
  }

  var lastText = 0;
  function updateText(now, force) {
    if (!force && now - lastText < 120) return;
    lastText = now;
    if (eqEl) {
      var sign = shown.b < 0 ? " − " : " + ";
      eqEl.innerHTML = "ŷ = <em>" + fmt(shown.a) + "</em>" + sign + "<em>" + fmt(Math.abs(shown.b)) + "</em>·x";
    }
    if (r2El) r2El.textContent = "R² = " + fmt(fit.r2);
  }

  function draw() {
    if (!W || !H) return;
    ctx.clearRect(0, 0, W, H);

    // grade
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    for (var g = 0; g <= 10; g += 2) {
      ctx.moveTo(px(g) + 0.5, py(0)); ctx.lineTo(px(g) + 0.5, py(YMAX));
      ctx.moveTo(px(0), py(g) + 0.5); ctx.lineTo(px(XMAX), py(g) + 0.5);
    }
    ctx.stroke();

    // eixos
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.moveTo(px(0) + 0.5, py(YMAX)); ctx.lineTo(px(0) + 0.5, py(0) + 0.5); ctx.lineTo(px(XMAX), py(0) + 0.5);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillText("x", px(XMAX) - 8, py(0) + 18);
    ctx.fillText("y", px(0) - 18, py(YMAX) + 10);

    // faixa de previsão (± 1 desvio padrão residual)
    var a = shown.a, b = shown.b, s = shown.s;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px(0), py(YMAX), px(XMAX) - px(0), py(0) - py(YMAX));
    ctx.clip();
    var band = ctx.createLinearGradient(px(0), 0, px(XMAX), 0);
    band.addColorStop(0, "rgba(200,255,61,0.10)");
    band.addColorStop(1, "rgba(45,226,230,0.10)");
    ctx.fillStyle = band;
    ctx.beginPath();
    ctx.moveTo(px(0), py(a + s));
    ctx.lineTo(px(XMAX), py(a + b * XMAX + s));
    ctx.lineTo(px(XMAX), py(a + b * XMAX - s));
    ctx.lineTo(px(0), py(a - s));
    ctx.closePath();
    ctx.fill();

    // resíduos
    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      ctx.moveTo(px(p.x), py(p.y));
      ctx.lineTo(px(p.x), py(a + b * p.x));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // reta ajustada
    var grad = ctx.createLinearGradient(px(0), 0, px(XMAX), 0);
    grad.addColorStop(0, "#c8ff3d");
    grad.addColorStop(1, "#2de2e6");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(200,255,61,0.6)";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(px(0), py(a));
    ctx.lineTo(px(XMAX), py(a + b * XMAX));
    ctx.stroke();
    ctx.restore();
    ctx.shadowBlur = 0;

    // pontos
    for (i = 0; i < points.length; i++) {
      p = points[i];
      if (p.you) continue;
      ctx.beginPath();
      ctx.arc(px(p.x), py(p.y), 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(139,92,246,0.85)";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(200,180,255,0.9)";
      ctx.stroke();
    }

    // "você"
    var you = points[points.length - 1];
    var yx = px(you.x), yy = py(you.y);
    ctx.beginPath();
    ctx.arc(yx, yy, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,79,216,0.16)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(yx, yy, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ff4fd8";
    ctx.shadowColor = "rgba(255,79,216,0.9)";
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    ctx.font = "700 12px Inter, sans-serif";
    var label = "você";
    var tw = ctx.measureText(label).width;
    var lx = Math.min(Math.max(yx - tw / 2 - 8, 4), W - tw - 20);
    var ly = yy - 38 < 4 ? yy + 20 : yy - 38;
    ctx.fillStyle = "#ff4fd8";
    roundRect(lx, ly, tw + 16, 22, 7);
    ctx.fill();
    ctx.fillStyle = "#14001a";
    ctx.fillText(label, lx + 8, ly + 15);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- arrastar pontos ---------- */
  var dragging = null;
  function localPos(ev) {
    var rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }
  function nearest(pos) {
    var best = null, bestD = 30 * 30;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var dx = px(p.x) - pos.x, dy = py(p.y) - pos.y;
      var d = dx * dx + dy * dy - (p.you ? 200 : 0); // prioriza o ponto rosa
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }
  function clampData(v, max) { return Math.max(0.2, Math.min(max - 0.2, v)); }

  canvas.addEventListener("pointerdown", function (ev) {
    var pos = localPos(ev);
    var p = nearest(pos);
    if (!p) return;
    dragging = p;
    p.auto = false;
    canvas.classList.add("dragging");
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* noop */ }
    ev.preventDefault();
    hideHint();
  });
  canvas.addEventListener("pointermove", function (ev) {
    var pos = localPos(ev);
    if (dragging) {
      dragging.bx = clampData(dataX(pos.x), XMAX);
      dragging.by = clampData(dataY(pos.y), YMAX);
      dragging.x = dragging.bx; dragging.y = dragging.by;
      if (reduceMotion) { step(performance.now(), true); }
    } else {
      canvas.style.cursor = nearest(pos) ? "grab" : "crosshair";
    }
  });
  function endDrag() {
    dragging = null;
    canvas.classList.remove("dragging");
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      makePoints();
      if (reduceMotion) step(performance.now(), true);
    });
  }

  var hint = document.querySelector(".viz-hint");
  function hideHint() {
    if (hint && !hint.dataset.done) {
      hint.dataset.done = "1";
      hint.innerHTML = "<span>🔥</span><span><b>Viu?</b> Um único ponto fora da curva puxa a reta toda. Entender isso (e saber o que fazer) é trabalho de quem faz <b>Ciência de Dados e Estatística</b>.</span>";
    }
  }

  /* ---------- loop de animação ---------- */
  var visible = true;
  var t0 = performance.now();
  function step(now, force) {
    var t = (now - t0) / 1000;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      if (p === dragging) continue;
      if (p.you) {
        if (p.auto && !reduceMotion) {
          // passeio lento do ponto rosa, para a reta "dançar"
          p.x = 5 + 3.6 * Math.sin(t * 0.33);
          p.y = 6.2 + 2.9 * Math.sin(t * 0.52 + 1.2);
        } else {
          p.x = p.bx; p.y = p.by;
        }
      } else if (!reduceMotion) {
        p.x = p.bx + Math.sin(t * p.sp + p.ph) * 0.12;
        p.y = p.by + Math.cos(t * p.sp * 1.3 + p.ph) * 0.12;
      }
    }
    computeFit();
    var k = force || reduceMotion ? 1 : 0.12;
    shown.a += (fit.a - shown.a) * k;
    shown.b += (fit.b - shown.b) * k;
    shown.s += (fit.s - shown.s) * k;
    draw();
    updateText(now, force);
  }

  function loop(now) {
    if (visible) step(now);
    requestAnimationFrame(loop);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(canvas);
  }

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();

  if (reduceMotion) {
    points[points.length - 1].auto = false;
    step(performance.now(), true);
  } else {
    requestAnimationFrame(loop);
  }
})();
