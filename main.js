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
    var nb = 42, html = "";
    for (var i = 0; i < nb; i++) {
      var trend = 18 + (i / (nb - 1)) * 70;
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
     A história da regressão (hero)
     Estrutura "story spine": Era uma vez / Todo dia / Até que um dia /
     Por causa disso (x2) / Até que finalmente / E desde então.
     ========================================================= */
  var canvas = document.getElementById("reg");
  var card = document.getElementById("story");
  if (!canvas || !canvas.getContext || !card) return;
  var ctx = canvas.getContext("2d");
  var eqEl = document.getElementById("eq");
  var r2El = document.getElementById("r2");
  var segWrap = card.querySelector(".story-segs");
  var stepEls = card.querySelectorAll(".story-step");
  var prevBtn = document.getElementById("story-prev");
  var nextBtn = document.getElementById("story-next");
  var N = stepEls.length;
  var LAST = N - 1;
  var S_OPINIONS = 1, S_DATA = 2, S_FIT = 3, S_TWIST = 4, S_RESOLVE = 5;
  var lastStepHTML = stepEls[LAST].innerHTML;

  var segHtml = "";
  for (var s = 0; s < N; s++) segHtml += "<i><b></b></i>";
  segWrap.innerHTML = segHtml;
  var segBars = segWrap.querySelectorAll("b");

  var XMIN = 4, XMAX = 20, YMIN = 0, YMAX = 20;
  var PAD = { l: 34, r: 14, t: 28, b: 36 };
  var W = 0, H = 0, dpr = 1;
  var YOU_NOW = 12, YOU_FUTURE = 16;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // gerador pseudo-aleatório com semente: mesma história a cada visita
  var seed = 11;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function gauss() {
    var u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  var people = [], influencer = null;
  function makeData() {
    seed = 11;
    people = [];
    for (var i = 0; i < 30; i++) {
      var x = 9 + Math.floor(rand() * 11) + (rand() - 0.5) * 0.5;
      var y = clamp(-2.2 + 0.62 * x + gauss() * 1.25, 0.8, 15.5);
      people.push({ bx: x, by: y, x: x, y: y, ph: rand() * 6.28, sp: 0.4 + rand() * 0.6 });
    }
    influencer = { bx: 5, by: 19, x: 5, y: 19, ph: 1.3, sp: 0.5 };
  }
  makeData();

  function fitOf(arr) {
    var n = arr.length, sx = 0, sy = 0, i;
    for (i = 0; i < n; i++) { sx += arr[i].x; sy += arr[i].y; }
    var mx = sx / n, my = sy / n, sxx = 0, sxy = 0, syy = 0;
    for (i = 0; i < n; i++) {
      var dx = arr[i].x - mx, dy = arr[i].y - my;
      sxx += dx * dx; sxy += dx * dy; syy += dy * dy;
    }
    var b = sxx > 1e-9 ? sxy / sxx : 0;
    var a = my - b * mx, sse = 0;
    for (i = 0; i < n; i++) {
      var r = arr[i].y - (a + b * arr[i].x);
      sse += r * r;
    }
    return { a: a, b: b, s: Math.sqrt(sse / Math.max(1, n - 2)), r2: syy > 1e-9 ? Math.max(0, 1 - sse / syy) : 0 };
  }
  function all() { return people.concat([influencer]); }

  // números citados no texto saem dos próprios dados
  function fmt(v, d) { return v.toFixed(d == null ? 2 : d).replace(".", ","); }
  function brl(v) { return "R$ " + Math.round(v).toLocaleString("pt-BR"); }
  (function fillNumbers() {
    var f0 = fitOf(people), f1 = fitOf(all());
    var el;
    if ((el = card.querySelector("[data-slope]"))) el.textContent = "+" + brl(Math.round(f0.b * 100) * 10);
    if ((el = card.querySelector("[data-slope-out]"))) el.textContent = brl(Math.round(f1.b * 100) * 10);
    if ((el = card.querySelector("[data-pred]"))) el.textContent = "R$ " + fmt(f0.a + f0.b * YOU_FUTURE, 1) + " mil";
  })();

  /* ---------- geometria ---------- */
  function px(x) { return PAD.l + ((x - XMIN) / (XMAX - XMIN)) * (W - PAD.l - PAD.r); }
  function py(y) { return H - PAD.b - ((y - YMIN) / (YMAX - YMIN)) * (H - PAD.t - PAD.b); }
  function dataX(p) { return XMIN + ((p - PAD.l) / (W - PAD.l - PAD.r)) * (XMAX - XMIN); }
  function dataY(p) { return YMIN + ((H - PAD.b - p) / (H - PAD.t - PAD.b)) * (YMAX - YMIN); }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(performance.now());
  }

  /* ---------- estado animado ---------- */
  var step = 0, elapsed = 0, hover = false, visible = true;
  var dataStart = -1e9, lineStart = -1e9;
  var anim = { a: 0, b: 0, s: 1, line: 0, opin: 0, ghost: 0, out: 0, youAxis: 1, youLine: 0 };
  var targetFit = fitOf(people);
  anim.a = targetFit.a; anim.b = targetFit.b; anim.s = targetFit.s;

  function approach(key, target, k) { anim[key] += (target - anim[key]) * k; }

  function pill(text, x, y, bg, fg, align) {
    ctx.font = "700 11.5px Inter, sans-serif";
    var tw = ctx.measureText(text).width, w = tw + 14, h = 21;
    var lx = align === "right" ? x - w : align === "center" ? x - w / 2 : x;
    lx = clamp(lx, 2, W - w - 2);
    var ly = clamp(y, 2, H - h - 2);
    ctx.fillStyle = bg;
    roundRect(lx, ly, w, h, 7);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.fillText(text, lx + 7, ly + 14.5);
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
  function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(px(x1), py(y1));
    ctx.lineTo(px(x2), py(y2));
    ctx.stroke();
  }

  function render(now) {
    if (!W || !H) return;
    var t = now / 1000;
    var k = reduceMotion ? 1 : 0.1;

    // posições (leve "respiração" dos pontos)
    var pts = all();
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (p === dragging || reduceMotion || step === LAST) { p.x = p.bx; p.y = p.by; continue; }
      p.x = p.bx + Math.sin(t * p.sp + p.ph) * 0.1;
      p.y = p.by + Math.cos(t * p.sp * 1.3 + p.ph) * 0.14;
    }

    // alvos de cada capítulo
    var main = (step === S_TWIST || step === LAST) ? fitOf(all()) : fitOf(people);
    targetFit = main;
    approach("a", main.a, k); approach("b", main.b, k); approach("s", main.s, k);
    approach("opin", step === S_OPINIONS ? 1 : 0, k);
    approach("ghost", step === S_RESOLVE ? 1 : 0, k);
    approach("out", step >= S_TWIST ? 1 : 0, k);
    approach("youAxis", step <= S_OPINIONS ? 1 : 0, k);
    approach("youLine", step >= S_RESOLVE ? 1 : 0, k);
    var lineT = step >= S_FIT ? (reduceMotion ? 1 : clamp((now - lineStart) / 900, 0, 1)) : 0;
    anim.line = step >= S_FIT ? 1 - Math.pow(1 - lineT, 3) : (reduceMotion ? 0 : anim.line * 0.8);
    if (anim.line < 0.002) anim.line = 0;

    ctx.clearRect(0, 0, W, H);

    // grade + eixos
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    for (var gx = 4; gx <= 20; gx += 4) { ctx.moveTo(px(gx) + 0.5, py(YMIN)); ctx.lineTo(px(gx) + 0.5, py(YMAX)); }
    for (var gy = 0; gy <= 20; gy += 5) { ctx.moveTo(px(XMIN), py(gy) + 0.5); ctx.lineTo(px(XMAX), py(gy) + 0.5); }
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.moveTo(px(XMIN) + 0.5, py(YMAX)); ctx.lineTo(px(XMIN) + 0.5, py(YMIN) + 0.5); ctx.lineTo(px(XMAX), py(YMIN) + 0.5);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.font = "10.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    for (gx = 4; gx <= 20; gx += 4) ctx.fillText(String(gx), px(gx), py(YMIN) + 15);
    ctx.textAlign = "right";
    for (gy = 0; gy <= 20; gy += 5) ctx.fillText(String(gy), px(XMIN) - 7, py(gy) + 3.5);
    ctx.fillStyle = "rgba(255,255,255,0.62)";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("anos de estudo →", px(XMAX), H - 5);
    ctx.textAlign = "left";
    ctx.fillText("↑ renda (R$ mil/mês)", 6, 16);
    ctx.textAlign = "left";

    ctx.save();
    ctx.beginPath();
    ctx.rect(px(XMIN), py(YMAX) - 2, px(XMAX) - px(XMIN) + 2, py(YMIN) - py(YMAX) + 2);
    ctx.clip();

    // palpites (capítulo 2)
    if (anim.opin > 0.01) {
      ctx.globalAlpha = anim.opin;
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      line(XMIN, 5, XMAX, 5);
      ctx.strokeStyle = "#2de2e6";
      line(5.5, 0.5, 15.5, 19.5);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    var xEnd = XMIN + (XMAX - XMIN) * anim.line;
    var a = anim.a, b = anim.b, sd = anim.s;

    // faixa de incerteza + resíduos
    if (anim.line > 0) {
      var band = ctx.createLinearGradient(px(XMIN), 0, px(XMAX), 0);
      band.addColorStop(0, "rgba(200,255,61,0.10)");
      band.addColorStop(1, "rgba(45,226,230,0.10)");
      ctx.fillStyle = band;
      ctx.beginPath();
      ctx.moveTo(px(XMIN), py(a + b * XMIN + sd));
      ctx.lineTo(px(xEnd), py(a + b * xEnd + sd));
      ctx.lineTo(px(xEnd), py(a + b * xEnd - sd));
      ctx.lineTo(px(XMIN), py(a + b * XMIN - sd));
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = anim.line;
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i < people.length; i++) {
        p = people[i];
        if (p.x > xEnd) continue;
        ctx.moveTo(px(p.x), py(p.y));
        ctx.lineTo(px(p.x), py(a + b * p.x));
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // reta "com o primo" (capítulo 6)
    if (anim.ghost > 0.01) {
      var g = fitOf(all());
      ctx.globalAlpha = anim.ghost * 0.85;
      ctx.strokeStyle = "#ff9f43";
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 6]);
      line(XMIN, g.a + g.b * XMIN, XMAX, g.a + g.b * XMAX);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // reta ajustada
    if (anim.line > 0) {
      var grad = ctx.createLinearGradient(px(XMIN), 0, px(XMAX), 0);
      grad.addColorStop(0, "#c8ff3d");
      grad.addColorStop(1, "#2de2e6");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(200,255,61,0.6)";
      ctx.shadowBlur = 14;
      line(XMIN, a + b * XMIN, xEnd, a + b * xEnd);
      ctx.shadowBlur = 0;
    }

    // pessoas (aparecem uma a uma no capítulo 3)
    var dataT = (now - dataStart) / 1000;
    for (i = 0; i < people.length; i++) {
      p = people[i];
      var alpha = step >= S_DATA ? (reduceMotion ? 1 : clamp((dataT - i * 0.06) / 0.25, 0, 1)) : 0;
      if (alpha <= 0) continue;
      var pop = reduceMotion ? 1 : 1 + (1 - alpha) * 0.8;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px(p.x), py(p.y), 5 * pop, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(139,92,246,0.88)";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(205,190,255,0.95)";
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    if (anim.ghost > 0.05) {
      var gl = fitOf(all());
      ctx.globalAlpha = anim.ghost;
      pill("com o primo", px(XMIN) + 6, py(gl.a + gl.b * XMIN) - 28, "#ff9f43", "#1f1000", "left");
      ctx.globalAlpha = 1;
    }

    // "você" hoje: no eixo, com a renda ainda em aberto
    if (anim.youAxis > 0.01) {
      ctx.globalAlpha = anim.youAxis;
      ctx.strokeStyle = "rgba(255,79,216,0.55)";
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1.5;
      line(YOU_NOW, YMIN, YOU_NOW, 11.5);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,79,216,0.9)";
      ctx.font = "800 34px Unbounded, Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("?", px(YOU_NOW), py(13));
      ctx.textAlign = "left";
      dot(px(YOU_NOW), py(YMIN), "#ff4fd8", 7);
      pill("você hoje", px(YOU_NOW) + 10, py(YMIN) - 30, "#ff4fd8", "#14001a", "left");
      if (anim.opin > 0.05) {
        ctx.globalAlpha = anim.opin;
        pill("palpite do tio", px(XMAX) - 4, py(5) - 26, "rgba(255,255,255,0.85)", "#0a0a0a", "right");
        pill("palpite da prof", px(15.5) - 6, py(19.5) - 2, "#2de2e6", "#001a1b", "right");
      }
      ctx.globalAlpha = 1;
    }

    // o primo influencer (o outlier)
    if (anim.out > 0.01) {
      var o = influencer, ox = px(o.x), oy = py(o.y);
      ctx.globalAlpha = anim.out;
      if (step >= S_RESOLVE) {
        ctx.strokeStyle = "rgba(255,159,67,0.8)";
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ox, oy, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      dot(ox, oy, "#ff9f43", 7 + (1 - anim.out) * 6);
      var oLabel = step >= S_RESOLVE && step < LAST ? "outlier 👀" : "primo influencer";
      pill(oLabel, ox + 14, oy - 10, "#ff9f43", "#1f1000", "left");
      ctx.globalAlpha = 1;
    }

    // "você" no futuro: em cima da reta
    if (anim.youLine > 0.01 && anim.line > 0.95) {
      var yy = a + b * YOU_FUTURE;
      ctx.globalAlpha = anim.youLine;
      ctx.strokeStyle = "rgba(255,79,216,0.5)";
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1.5;
      line(YOU_FUTURE, YMIN, YOU_FUTURE, yy);
      ctx.setLineDash([]);
      dot(px(YOU_FUTURE), py(yy), "#ff4fd8", 7.5);
      pill("você + faculdade", px(YOU_FUTURE), py(yy) + 14, "#ff4fd8", "#14001a", "center");
      ctx.globalAlpha = 1;
    }

    // rodapé: equação e R²
    if (step >= S_FIT && anim.line > 0.5) {
      var sign = anim.b < 0 ? " − " : " + ";
      eqEl.innerHTML = "ŷ = <em>" + fmt(anim.a) + "</em>" + sign + "<em>" + fmt(Math.abs(anim.b)) + "</em>·x";
      r2El.textContent = "R² = " + fmt(targetFit.r2);
    } else {
      eqEl.innerHTML = "ŷ = <em>?</em> + <em>?</em>·x";
      r2El.textContent = "R² = ?";
    }
  }

  function dot(x, y, color, r) {
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = color === "#ff4fd8" ? "rgba(255,79,216,0.18)" : "rgba(255,159,67,0.18)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }

  /* ---------- navegação entre capítulos ---------- */
  function duration(i) {
    return clamp(3600 + stepEls[i].textContent.length * 40, 6500, 11500);
  }

  function goTo(i) {
    var now = performance.now();
    var prev = step;
    step = clamp(i, 0, LAST);
    elapsed = 0;
    if (step >= S_DATA && prev < S_DATA) dataStart = step === S_DATA ? now : now - 10000;
    if (step >= S_FIT && prev < S_FIT) lineStart = now;
    for (var k = 0; k < N; k++) {
      stepEls[k].classList.toggle("on", k === step);
      stepEls[k].setAttribute("aria-hidden", k === step ? "false" : "true");
    }
    prevBtn.disabled = step === 0;
    nextBtn.textContent = step === LAST ? "↺ Ver de novo" : "Próximo ›";
    card.classList.toggle("playing", step === LAST);
    updateSegs();
  }

  function restart() {
    makeData();
    stepEls[LAST].innerHTML = lastStepHTML;
    reacted = false;
    dataStart = -1e9;
    lineStart = -1e9;
    goTo(0);
  }

  function updateSegs() {
    var prog = step === LAST || reduceMotion ? 1 : clamp(elapsed / duration(step), 0, 1);
    for (var k = 0; k < N; k++) {
      segBars[k].style.width = (k < step ? 100 : k === step ? prog * 100 : 0) + "%";
    }
  }

  nextBtn.addEventListener("click", function () {
    if (step === LAST) restart(); else goTo(step + 1);
  });
  prevBtn.addEventListener("click", function () { goTo(step - 1); });

  // no modo história, tocar no gráfico avança (como nos stories)
  canvas.addEventListener("click", function () {
    if (step < LAST) goTo(step + 1);
  });

  // pausa enquanto o mouse está em cima, para dar tempo de ler
  card.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hover = true; });
  card.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hover = false; });

  /* ---------- arrastar pontos (último capítulo) ---------- */
  var dragging = null, reacted = false;
  function localPos(ev) {
    var rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }
  function nearest(pos) {
    var best = null, bestD = 30 * 30, pts = all();
    for (var i = 0; i < pts.length; i++) {
      var dx = px(pts[i].x) - pos.x, dy = py(pts[i].y) - pos.y;
      var d = dx * dx + dy * dy - (pts[i] === influencer ? 200 : 0);
      if (d < bestD) { bestD = d; best = pts[i]; }
    }
    return best;
  }
  canvas.addEventListener("pointerdown", function (ev) {
    if (step !== LAST) return;
    var p = nearest(localPos(ev));
    if (!p) return;
    dragging = p;
    canvas.classList.add("dragging");
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* noop */ }
    ev.preventDefault();
  });
  canvas.addEventListener("pointermove", function (ev) {
    if (step !== LAST) return;
    var pos = localPos(ev);
    if (dragging) {
      dragging.bx = clamp(dataX(pos.x), XMIN + 0.2, XMAX - 0.2);
      dragging.by = clamp(dataY(pos.y), YMIN + 0.2, YMAX - 0.2);
      if (!reacted) {
        reacted = true;
        stepEls[LAST].innerHTML = '<span class="beat">E desde então…</span> 🔥 Viu? Um único ponto fora da curva puxa a reta toda. Saber lidar com isso é trabalho de quem faz <strong>Ciência de Dados e Estatística</strong>.';
      }
    } else {
      canvas.style.cursor = nearest(pos) ? "grab" : "default";
    }
  });
  function endDrag() {
    dragging = null;
    canvas.classList.remove("dragging");
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  /* ---------- loop ---------- */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { threshold: 0.35 }).observe(card);
  }

  var last = performance.now();
  function loop(now) {
    var dt = clamp(now - last, 0, 100);
    last = now;
    if (visible) {
      if (!reduceMotion && !hover && step < LAST) {
        elapsed += dt;
        if (elapsed >= duration(step)) { reacted = false; goTo(step + 1); }
      }
      updateSegs();
      render(now);
    }
    requestAnimationFrame(loop);
  }

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize", resize);
  goTo(0);
  resize();
  requestAnimationFrame(loop);
})();
