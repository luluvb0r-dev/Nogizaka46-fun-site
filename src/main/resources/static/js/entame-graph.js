// 円タメグラフのフォーム管理とSVG生成を行うスクリプト
(() => {
  "use strict";

  /*** レイアウト定数 ***/
  const LAYOUT = {
    W: 1280,
    H: 720,
    HEADER_H: 110,              // ヘッダぶんの余白（配置基準用。塗りつぶしはしない）
    PANEL_X: 720,
    PANEL_Y: 140,               // ← ヘッダの下から開始
    PANEL_W: 520,
    PANEL_H: 540,
    DONUT_CX: 360,
    DONUT_CY: 400,              // ← ヘッダにかからない位置
    DONUT_R_OUT: 300,
    DONUT_R_IN: 190,
    LEGEND_LINE_H: 56,
    LEGEND_LEFT_PAD: 90,
    LEGEND_RIGHT_PAD: 20,
  };

  /*** 色とフォーム上限 ***/
  const COLORS = [
    "#D6332F", "#F08B2C", "#FFB11B", "#7DD21E", "#28C7B0",
    "#00B3E6", "#4BA3F6", "#7D4BE3", "#E63B9F"
  ];
  const MAX_ITEMS = COLORS.length;
  const SELECT_OPTIONS = Array.from({ length: 100 }, (_, i) =>
    `<option value="${i + 1}">${i + 1}</option>`
  ).join("");

  /*** DOM 準備 ***/
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(() => {
    const $add = document.getElementById("entame-add-btn");
    const $btn = document.getElementById("entame-generate-btn")
              || document.getElementById("entame-generate-btnwo");
    const $container = document.getElementById("entame-form-container");
    let $stage = document.getElementById("entame-stage");

    if (!$btn) {
      console.warn("[entame] ボタンが見つかりません。id='entame-generate-btn' を付けてください。");
      return;
    }
    if (!$add || !$container) {
      console.warn("[entame] フォーム要素が見つかりません。");
      return;
    }
    if (!$stage) {
      console.warn("[entame] 描画先 #entame-stage が見つかりません。自動作成します。");
      $stage = document.createElement("div");
      $stage.id = "entame-stage";
      $stage.className = "entame-stage";
      $btn.insertAdjacentElement("afterend", $stage);
    }

    /** フォーム行の色を順番に設定 */
    const refreshColors = () => {
      Array.from($container.children).forEach((row, i) => {
        const chip = row.querySelector(".color-chip");
        if (chip) chip.style.backgroundColor = COLORS[i];
      });
    };

    /** フォーム行を追加する */
    const createRow = () => {
      if ($container.children.length >= MAX_ITEMS) return;
      const row = document.createElement("div");
      row.className = "form-row";
      row.innerHTML = `
        <span class="color-chip"></span>
        <input type="text" class="label" maxlength="30" placeholder="ラベル">
        <select class="percent">${SELECT_OPTIONS}</select>
        <button type="button" class="remove-btn">削除</button>
      `;
      row.querySelector(".remove-btn").addEventListener("click", () => {
        $container.removeChild(row);
        console.log("[entame] remove form");
        updateAddBtn();
      });
      $container.appendChild(row);
      console.log("[entame] add form");
      updateAddBtn();
    };

    /** 追加ボタンの活性状態を更新 */
    const updateAddBtn = () => {
      $add.disabled = $container.children.length >= MAX_ITEMS;
      refreshColors();
    };

    $add.addEventListener("click", createRow);

    $btn.addEventListener("click", () => {
      const items = Array.from($container.children).map((row, i) => ({
        label: row.querySelector(".label").value.trim(),
        percent: Number(row.querySelector(".percent").value),
        color: COLORS[i]
      }));
      console.log(`[entame] generate graph (${items.length} items)`);
      $stage.innerHTML = "";
      const svg = drawEntameLike(items);
      $stage.appendChild(svg);
    });

    // 初期表示：フォーム1つ
    createRow();
  });

  /*** 描画メイン ***/
  function drawEntameLike(items) {
    const { W, H } = LAYOUT;
    const svg = createSvg(W, H);

    // ※ ヘッダ帯の塗りはしない（ドットを全域に適用）
    drawHeader(svg);

    drawLegendPanel(svg);
    drawDonut(svg, items);
    drawLegend(svg, items);

    return svg;
  }

  /*** SVG 生成（背景は全域ドット） ***/
  function createSvg(width, height) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "円タメグラフ画像風");

    const defs = el("defs");

    // ドット背景（全域）
    const pattern = el("pattern", {
      id: "bgdots", x: 0, y: 0, width: 24, height: 24, patternUnits: "userSpaceOnUse"
    });
    pattern.appendChild(el("rect", { x: 0, y: 0, width: 24, height: 24, fill: "#f5f5f5" }));
    pattern.appendChild(el("circle", { cx: 3, cy: 3, r: 2, fill: "#bbb", opacity: 0.55 }));
    defs.appendChild(pattern);

    // ラベル用ドロップシャドウ（テキストだけ少し浮かせる）
    const filter = el("filter", { id: "tagShadow", x: "-20%", y: "-20%", width: "140%", height: "140%" });
    filter.appendChild(el("feDropShadow", { dx: 0, dy: 2, stdDeviation: 2, "flood-color": "#000", "flood-opacity": 0.25 }));
    defs.appendChild(filter);

    svg.appendChild(defs);

    // 背景：ドット（←ヘッダも含めて全面に適用）
    svg.appendChild(el("rect", { x: 0, y: 0, width: width, height: height, fill: "url(#bgdots)" }));

    return svg;
  }

  /*** ヘッダ（文字だけ。下線は描かない） ***/
  function drawHeader(svg) {
    const text1 = el("text", { x: 30, y: 42, fill: "#111", class: "entame-title", "font-size": 22, "font-weight": 900 });
    text1.textContent = "NOGIZAKA UNDER CONSTRUCTION";
    svg.appendChild(text1);

    const text2 = el("text", { x: 30, y: 80, fill: "#111", class: "entame-title", "font-size": 20, "font-weight": 800 });
    text2.textContent = "FILE no.02";
    svg.appendChild(text2);

    const name = el("text", { x: 210, y: 80, fill: "#000", class: "entame-title", "font-size": 32, "font-weight": 900 });
    name.textContent = "賀喜遥香";
    svg.appendChild(name);

    const eg = el("text", { x: 900, y: 46, fill: "#111", class: "entame-title", "font-size": 16, "font-weight": 900 });
    eg.textContent = "\"ENTAME GRAPH\" OF LIFE";
    svg.appendChild(eg);
  }

  /*** 右パネル ***/
  function drawLegendPanel(svg) {
    const { PANEL_X, PANEL_Y, PANEL_W, PANEL_H } = LAYOUT;
    const panel = el("rect", { x: PANEL_X, y: PANEL_Y, width: PANEL_W, height: PANEL_H, rx: 8, ry: 8, fill: "#fff", stroke: "#222", "stroke-width": 3 });
    svg.appendChild(panel);

    const defs = svg.querySelector("defs") || el("defs");
    const grid = el("pattern", { id: "panelGrid", width: 20, height: 20, patternUnits: "userSpaceOnUse" });
    grid.appendChild(el("rect", { width: 20, height: 20, fill: "#fff" }));
    grid.appendChild(el("path", { d: "M0 0H20 M0 0V20", stroke: "#000", "stroke-opacity": 0.06, "stroke-width": 1 }));
    defs.appendChild(grid);
    if (!svg.querySelector("defs")) svg.insertBefore(defs, svg.firstChild);

    svg.appendChild(el("rect", { x: PANEL_X + 6, y: PANEL_Y + 6, width: PANEL_W - 12, height: PANEL_H - 12, fill: "url(#panelGrid)", opacity: 0.9 }));
  }

  /*** 円グラフ ***/
  function drawDonut(svg, items) {
    const { DONUT_CX: cx, DONUT_CY: cy, DONUT_R_OUT: outer, DONUT_R_IN: inner } = LAYOUT;

    // 中央の写真風フレーム
    const photoW = 420, photoH = 260;
    const photo = el("rect", { x: cx - photoW/2, y: cy - photoH/2, width: photoW, height: photoH, rx: 10, ry: 10, fill: "#f7f7f7", stroke: "#222", "stroke-width": 6 });
    svg.appendChild(photo);

    const total = Math.max(1, items.reduce((s, it) => s + (it.percent || 0), 0));
    let startAngle = -90;

    items.forEach((it) => {
      const sweep = 360 * (it.percent / total);
      const endAngle = startAngle + sweep;

      // セグメント
      const path = ringSectorPath(cx, cy, inner, outer, startAngle, endAngle);
      svg.appendChild(el("path", { d: path, fill: it.color || "#999", stroke: "#111", "stroke-width": 3 }));

      // ％ラベル：セグメント中央（角度＆半径の中点）
      placePercentBadge(svg, `${it.percent}%`, {
        cx, cy, inner, outer, startAngle, endAngle
      });

      startAngle = endAngle;
    });
  }

  /*** 右の凡例（長文は縮小→省略） ***/
  function drawLegend(svg, items) {
    const { PANEL_X, PANEL_Y, PANEL_W, LEGEND_LINE_H, LEGEND_LEFT_PAD, LEGEND_RIGHT_PAD } = LAYOUT;
    const startX = PANEL_X + 40;
    const startY = PANEL_Y + 44;
    const chipW = 76, chipH = 34;

    const maxLabelWidth = PANEL_X + PANEL_W - LEGEND_RIGHT_PAD - (startX + LEGEND_LEFT_PAD);

    items.forEach((it, i) => {
      const y = startY + i * LEGEND_LINE_H;

      const tab = el("rect", { x: startX, y, width: chipW, height: chipH, rx: 8, ry: 8, fill: it.color || "#999", stroke: "#333", "stroke-width": 3 });
      svg.appendChild(tab);

      const pct = el("text", { x: startX + 10, y: y + 24, fill: "#111", "font-weight": 900, "font-size": 18 });
      pct.textContent = `${it.percent}%`;
      svg.appendChild(pct);

      const label = el("text", { x: startX + LEGEND_LEFT_PAD, y: y + 26, fill: "#111", class: "entame-legend-text", "font-size": 20 });
      label.textContent = it.label;
      svg.appendChild(label);
      fitTextToWidth(svg, label, it.label, maxLabelWidth, { minFontSize: 14, step: 1, ellipsis: true });
    });
  }

  /*** ラベル（黒枠のみ＝透明、文字は潰さないよう自動調整） ***/
  function placePercentBadge(svg, text, { cx, cy, inner, outer, startAngle, endAngle }) {
    const midAngle = normAngle((startAngle + endAngle) / 2);
    const rMid = (inner + outer) / 2;

    // 弧の長さと厚みを基準にフォントを決定
    const sweepDeg = normSweep(endAngle - startAngle);
    const arcLen = (Math.PI * 2) * (sweepDeg / 360) * rMid; // 中心半径での弧長
    const thickness = (outer - inner) - 10;                  // 余白込みの厚み

    let fontSize = 18;
    const minFont = 12;

    // 計測：一時バッジ（透明）を SVG に追加して BBox を測定
    let temp = makeBadge(svg, text, fontSize, { strokeWidth: 3 });
    temp.setAttribute("opacity", "0");
    svg.appendChild(temp);
    let bbox = temp.getBBox();

    // 収まるまで縮小（幅＆高さ）
    while ((bbox.width + 10) > arcLen || (bbox.height + 6) > thickness) {
      fontSize -= 1;
      if (fontSize < minFont) break;
      temp.remove();
      temp = makeBadge(svg, text, fontSize, { strokeWidth: 3 });
      temp.setAttribute("opacity", "0");
      svg.appendChild(temp);
      bbox = temp.getBBox();
    }
    temp.remove();

    // 本番：黒枠のみ（fill: none）、テキストは影付きで前面
    const badge = makeBadge(svg, text, fontSize, { strokeWidth: 3, fillNone: true });
    const px = cx + rMid * Math.cos(rad(midAngle));
    const py = cy + rMid * Math.sin(rad(midAngle));
    badge.setAttribute("transform", `translate(${px}, ${py})`);
    badge.setAttribute("filter", "url(#tagShadow)");
    badge.setAttribute("pointer-events", "none"); // クリックを邪魔しない
    svg.appendChild(badge);
  }

  /*** バッジ生成：角丸の黒枠のみ＋テキスト（白塗りしない） ***/
  function makeBadge(svg, text, fontSize, { strokeWidth = 3, fillNone = false } = {}) {
    const g = el("g");

    // テキスト
    const t = el("text", {
      x: 0, y: 5, "text-anchor": "middle",
      "font-weight": 900, "font-size": fontSize, fill: "#111"
    });
    t.textContent = text;
    g.appendChild(t);

    // いったん追加して BBox 計測
    svg.appendChild(g);
    g.setAttribute("opacity", "0");
    const tb = t.getBBox();

    const padX = 12, padY = 8;
    const w = tb.width + padX * 2;
    const h = tb.height + padY * 2;
    const rx = Math.min(16, h / 2);

    // 背景は“塗り無し”で黒枠のみ
    const bg = el("rect", {
      x: -w/2, y: -h/2, width: w, height: h, rx, ry: rx,
      fill: fillNone ? "none" : "#fff", // デフォは none にする
      stroke: "#111",
      "stroke-width": strokeWidth
    });

    // 背景を背面に
    g.insertBefore(bg, t);

    // 計測終わり → 可視化
    g.setAttribute("opacity", "1");
    g.remove(); // 計測用に一度外して…
    return g;   // 呼び出し側で transform 等を設定してから appendChild する
  }

  /*** 凡例の文字はみ出し対策 ***/
  function fitTextToWidth(svg, textEl, fullText, maxWidth, opts = {}) {
    const { minFontSize = 14, step = 1, ellipsis = true } = opts;
    let size = parseFloat(textEl.getAttribute("font-size")) || 20;

    // 計測用に一時透明グループに入れて BBox を取る
    const holder = el("g"); holder.setAttribute("opacity", "0");
    svg.appendChild(holder);
    holder.appendChild(textEl);

    while (size > minFontSize) {
      textEl.setAttribute("font-size", size);
      if (textEl.getBBox().width <= maxWidth) break;
      size -= step;
    }

    if (ellipsis && textEl.getBBox().width > maxWidth) {
      let txt = fullText;
      textEl.textContent = txt + "…";
      while (textEl.getBBox().width > maxWidth && txt.length > 0) {
        txt = txt.slice(0, -1);
        textEl.textContent = txt + "…";
      }
    }

    // 元の位置に戻す
    holder.replaceWith(textEl);
  }

  /*** ユーティリティ ***/
  function el(name, attrs = {}) {
    const n = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  }
  function rad(deg) { return (deg * Math.PI) / 180; }
  function normAngle(deg) { let d = deg % 360; if (d < 0) d += 360; return d; }
  function normSweep(deg) { let d = deg % 360; if (d < 0) d += 360; return d; }

  function ringSectorPath(cx, cy, r0, r1, a0deg, a1deg) {
    const a0 = rad(a0deg), a1 = rad(a1deg);
    let sweepDeg = a1deg - a0deg; if (sweepDeg < 0) sweepDeg += 360;
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
})();
