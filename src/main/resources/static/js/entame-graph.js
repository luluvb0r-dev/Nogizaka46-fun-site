(() => {
  "use strict";

  // DOM 準備完了後に安全にバインド（defer を付け忘れてもOK）
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  // ▼ サンプルデータ（画像例に寄せた並びと色）
  const DATA = [
    { label: "映画『それいけ！アンパンマン 勇気の花がひらくとき』", percent: 25, color: "#D6332F" },
    { label: "『きらりん☆レボリューション』",                          percent: 15, color: "#F08B2C" },
    { label: "乃木坂46『シンクロニシティ』",                           percent: 15, color: "#FFB11B" },
    { label: "カゲロウプロジェクト『カゲロウデイズ』",                  percent: 10, color: "#7DD21E" },
    { label: "アニメ『僕のヒーローアカデミア』第2話",                    percent: 9,  color: "#28C7B0" },
    { label: "アニメ『けいおん！』",                                   percent: 8,  color: "#00B3E6" },
    { label: "SEKAI NO OWARI『幻の命』",                               percent: 7,  color: "#4BA3F6" },
    { label: "にじさんじ",                                               percent: 6,  color: "#7D4BE3" },
    { label: "映画『サマーウォーズ』",                                 percent: 5,  color: "#E63B9F" },
  ];

  ready(() => {
    // ▼ ボタンIDの打ち間違いに寛容：entame-generate-btn のどちらでも拾う
    const $btn = document.getElementById("entame-generate-btn");
    let $stage = document.getElementById("entame-stage");

    if (!$btn) {
      console.warn("[entame] ボタンが見つかりません。id='entame-generate-btn' を付けてください。");
      return;
    }
    if (!$stage) {
      console.warn("[entame] 描画先 #entame-stage が見つかりません。自動作成します。");
      $stage = document.createElement("div");
      $stage.id = "entame-stage";
      $stage.className = "entame-stage";
      $btn.insertAdjacentElement("afterend", $stage);
    }

    $btn.addEventListener("click", () => {
      $stage.innerHTML = ""; // クリア
      const svg = drawEntameLike(DATA);
      $stage.appendChild(svg);
    });
  });

  // --- SVG 描画本体 ---
  function drawEntameLike(items) {
    const W = 1280, H = 720;
    const svg = createSvg(W, H);
    drawLegendPanel(svg);
    drawHeader(svg);
    drawDonut(svg, items);
    drawLegend(svg, items);
    return svg;
  }

  function createSvg(width, height) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "円タメグラフ画像風");

    // 背景ドット
    const defs = el("defs");
    const pattern = el("pattern", { id: "bgdots", x: 0, y: 0, width: 24, height: 24, patternUnits: "userSpaceOnUse" });
    pattern.appendChild(el("circle", { cx: 3, cy: 3, r: 2, fill: "#999", opacity: 0.2 }));
    defs.appendChild(pattern);
    svg.appendChild(defs);

    svg.appendChild(el("rect", { x: 0, y: 0, width: width, height: height, fill: "url(#bgdots)", opacity: 0.4 }));
    return svg;
  }

  function drawHeader(svg) {
    const text1 = el("text", { x: 30, y: 48, fill: "#111", class: "entame-title" });
    text1.textContent = "NOGIZAKA UNDER CONSTRUCTION";
    svg.appendChild(text1);

    const text2 = el("text", { x: 30, y: 90, fill: "#111", class: "entame-title" });
    text2.textContent = "FILE no.02";
    svg.appendChild(text2);

    const name = el("text", { x: 210, y: 90, fill: "#000", class: "entame-title", "font-size": 36 });
    name.textContent = "賀喜遥香";
    svg.appendChild(name);

    const eg = el("text", { x: 900, y: 54, fill: "#111", class: "entame-title", "font-size": 16 });
    eg.textContent = "\"ENTAME GRAPH\" OF LIFE";
    svg.appendChild(eg);
  }

  function drawLegendPanel(svg) {
    const panel = el("rect", { x: 720, y: 96, width: 520, height: 560, rx: 8, ry: 8, fill: "#fff", stroke: "#222", "stroke-width": 3 });
    svg.appendChild(panel);

    const defs = svg.querySelector("defs") || el("defs");
    const grid = el("pattern", { id: "panelGrid", width: 20, height: 20, patternUnits: "userSpaceOnUse" });
    grid.appendChild(el("rect", { width: 20, height: 20, fill: "#fff" }));
    grid.appendChild(el("path", { d: "M0 0H20 M0 0V20", stroke: "#000", "stroke-opacity": 0.06, "stroke-width": 1 }));
    defs.appendChild(grid);
    if (!svg.querySelector("defs")) svg.insertBefore(defs, svg.firstChild);

    svg.appendChild(el("rect", { x: 726, y: 102, width: 508, height: 548, fill: "url(#panelGrid)", opacity: 0.9 }));
  }

  function drawDonut(svg, items) {
    const cx = 360, cy = 380;
    const outer = 300;
    const inner = 190;

    // 中央の写真風フレーム（ダミー）
    const photoW = 420, photoH = 260;
    const photo = el("rect", { x: cx - photoW/2, y: cy - photoH/2, width: photoW, height: photoH, rx: 10, ry: 10, fill: "#f7f7f7", stroke: "#222", "stroke-width": 6 });
    svg.appendChild(photo);

    const total = Math.max(1, items.reduce((s, it) => s + (it.percent || 0), 0));
    let startAngle = -90;

    items.forEach((it) => {
      const sweep = 360 * (it.percent / total);
      const endAngle = startAngle + sweep;

      const path = ringSectorPath(cx, cy, inner, outer, startAngle, endAngle);
      const seg = el("path", { d: path, fill: it.color || "#999", stroke: "#111", "stroke-width": 3 });
      svg.appendChild(seg);

      // 吹き出し（外周中点）
      const mid = (startAngle + endAngle) / 2;
      const r = (inner + outer) / 2 + 80;
      const px = cx + r * Math.cos(rad(mid));
      const py = cy + r * Math.sin(rad(mid));
      const tag = makePercentTag(`${it.percent}%`);
      tag.setAttribute("transform", `translate(${px}, ${py}) rotate(${mid})`);
      svg.appendChild(tag);

      startAngle = endAngle;
    });
  }

  function drawLegend(svg, items) {
    const startX = 760, startY = 140;
    const lineH = 56;

    items.forEach((it, i) => {
      const y = startY + i * lineH;

      const tab = el("rect", { x: startX, y, width: 76, height: 34, rx: 8, ry: 8, fill: it.color || "#999", stroke: "#333", "stroke-width": 3 });
      svg.appendChild(tab);

      const pct = el("text", { x: startX + 10, y: y + 24, fill: "#111", "font-weight": 900, "font-size": 18 });
      pct.textContent = `${it.percent}%`;
      svg.appendChild(pct);

      const label = el("text", { x: startX + 90, y: y + 26, fill: "#111", class: "entame-legend-text", "font-size": 20 });
      label.textContent = it.label;
      svg.appendChild(label);
    });
  }

  // --- SVG ヘルパー群 ---
  function el(name, attrs = {}) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  }
  function rad(deg) { return (deg * Math.PI) / 180; }
  function ringSectorPath(cx, cy, r0, r1, a0deg, a1deg) {
    const a0 = rad(a0deg), a1 = rad(a1deg);
    let sweepDeg = a1deg - a0deg;
    if (sweepDeg < 0) sweepDeg += 360;
    const large = sweepDeg > 180 ? 1 : 0;

    const x1 = cx + r1 * Math.cos(a0), y1 = cy + r1 * Math.sin(a0);
    const x2 = cx + r1 * Math.cos(a1), y2 = cy + r1 * Math.sin(a1);
    const x3 = cx + r0 * Math.cos(a1), y3 = cy + r0 * Math.sin(a1);
    const x4 = cx + r0 * Math.cos(a0), y4 = cy + r0 * Math.sin(a0);

    return [
      `M ${x1} ${y1}`,
      `A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${r0} ${r0} 0 ${large} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");
  }
  function makePercentTag(text) {
    const g = el("g");
    const w = 62, h = 30, rx = 12;
    g.appendChild(el("rect", { x: -w/2, y: -h/2, width: w, height: h, rx, ry: rx, fill: "#fff", stroke: "#222", "stroke-width": 4 }));
    const t = el("text", { x: 0, y: 6, "text-anchor": "middle", "font-weight": 900, "font-size": 18, fill: "#111" });
    t.textContent = text;
    g.appendChild(t);
    return g;
  }
})();
