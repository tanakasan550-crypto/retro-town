  // src/goodsart.js
  var TAU = Math.PI * 2;
  var ell = (c, x, y, rx, ry, f2, rot = 0) => {
    c.fillStyle = f2;
    c.beginPath();
    c.ellipse(x, y, rx, ry, rot, 0, TAU);
    c.fill();
  };
  var rect = (c, x, y, w, h, f2) => {
    c.fillStyle = f2;
    c.fillRect(x, y, w, h);
  };
  var poly3 = (c, pts, f2) => {
    c.fillStyle = f2;
    c.beginPath();
    c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    c.fill();
  };
  var hi = (c, x, y, w, h) => {
    rect(c, x, y, w, h, "rgba(255,255,255,0.45)");
  };
  function leafTuft(c, x, y, col, s = 1) {
    poly3(c, [x, y, x - 0.13 * s, y + 0.17 * s, x - 0.02 * s, y + 0.1 * s], col);
    poly3(c, [x, y, x + 0.13 * s, y + 0.17 * s, x + 0.02 * s, y + 0.1 * s], col);
    poly3(c, [x - 0.03, y, x, y + 0.22 * s, x + 0.03, y], col);
  }
  var G2 = {
    // ---- 青果 ----
    carrot: (c) => {
      poly3(c, [0.22, 0.98, 0.78, 0.98, 0.52, 0.02, 0.48, 0.02], "#ee7a1c");
      poly3(c, [0.5, 0.98, 0.78, 0.98, 0.52, 0.02], "#d9650f");
      for (const y of [0.8, 0.62, 0.44]) rect(c, 0.36 + (0.8 - y) * 0.1, y, 0.24 - (0.8 - y) * 0.2, 0.025, "#c85a0c");
      leafTuft(c, 0.5, 0.96, "#3f9a3c", 1.1);
    },
    daikon: (c) => {
      poly3(c, [0.3, 0.86, 0.7, 0.86, 0.56, 0.04, 0.44, 0.04], "#f6f7ef");
      poly3(c, [0.55, 0.86, 0.7, 0.86, 0.56, 0.04], "#dfe3d4");
      rect(c, 0.3, 0.72, 0.4, 0.16, "#b8d58a");
      leafTuft(c, 0.5, 0.86, "#47a043", 1.2);
      hi(c, 0.36, 0.3, 0.05, 0.4);
    },
    hakusai: (c) => {
      ell(c, 0.5, 0.42, 0.36, 0.42, "#e8efc4");
      ell(c, 0.5, 0.5, 0.3, 0.38, "#f6f9dc");
      ell(c, 0.5, 0.78, 0.34, 0.16, "#8dc85a");
      for (const x of [0.34, 0.5, 0.66]) rect(c, x - 0.012, 0.2, 0.024, 0.55, "rgba(120,160,70,.45)");
    },
    negi: (c) => {
      for (const [x, a] of [[0.3, -0.12], [0.5, 0], [0.7, 0.12]]) {
        c.save();
        c.translate(x, 0.05);
        c.rotate(a);
        rect(c, -0.045, 0, 0.09, 0.52, "#f4f6ee");
        rect(c, -0.045, 0.5, 0.09, 0.46, "#3f9a45");
        rect(c, -0.02, 0.5, 0.02, 0.46, "#63b862");
        c.restore();
      }
    },
    cabbage: (c) => {
      ell(c, 0.5, 0.42, 0.42, 0.4, "#7fc24a");
      ell(c, 0.5, 0.44, 0.3, 0.3, "#a6d66a");
      ell(c, 0.42, 0.5, 0.14, 0.22, "#c8e690");
      c.strokeStyle = "rgba(40,110,30,.5)";
      c.lineWidth = 0.025;
      c.beginPath();
      c.arc(0.5, 0.42, 0.3, 3.4, 5.9);
      c.stroke();
    },
    tomato: (c) => {
      ell(c, 0.3, 0.32, 0.26, 0.26, "#e03a2e");
      ell(c, 0.68, 0.3, 0.26, 0.26, "#d3281f");
      ell(c, 0.5, 0.55, 0.27, 0.26, "#e8463a");
      for (const [x, y] of [[0.3, 0.55], [0.68, 0.53], [0.5, 0.78]]) poly3(c, [x, y, x - 0.09, y + 0.02, x - 0.03, y + 0.06, x, y + 0.1, x + 0.03, y + 0.06, x + 0.09, y + 0.02], "#3c8f3a");
      ell(c, 0.42, 0.62, 0.05, 0.07, "rgba(255,255,255,.5)");
    },
    apple: (c) => {
      ell(c, 0.36, 0.5, 0.3, 0.34, "#d8322b");
      ell(c, 0.64, 0.5, 0.3, 0.34, "#e04a3a");
      ell(c, 0.5, 0.55, 0.1, 0.06, "rgba(0,0,0,.14)");
      rect(c, 0.48, 0.8, 0.04, 0.15, "#6b4a2a");
      poly3(c, [0.52, 0.88, 0.72, 0.96, 0.62, 0.82], "#4aa044");
      ell(c, 0.34, 0.6, 0.06, 0.09, "rgba(255,255,255,.45)");
    },
    mikan: (c) => {
      ell(c, 0.28, 0.28, 0.25, 0.24, "#f39a1a");
      ell(c, 0.72, 0.28, 0.25, 0.24, "#ef8a10");
      ell(c, 0.5, 0.58, 0.27, 0.26, "#f7a828");
      for (const [x, y] of [[0.28, 0.5], [0.72, 0.5], [0.5, 0.84]]) {
        ell(c, x, y, 0.04, 0.025, "#4a8a3a");
      }
      ell(c, 0.42, 0.66, 0.05, 0.07, "rgba(255,255,255,.4)");
    },
    banana: (c) => {
      c.fillStyle = "#f2d230";
      c.beginPath();
      c.moveTo(0.08, 0.58);
      c.quadraticCurveTo(0.26, 0.02, 0.88, 0.26);
      c.quadraticCurveTo(0.5, 0.2, 0.28, 0.64);
      c.closePath();
      c.fill();
      c.fillStyle = "#e0bb1e";
      c.beginPath();
      c.moveTo(0.18, 0.66);
      c.quadraticCurveTo(0.4, 0.12, 0.9, 0.4);
      c.quadraticCurveTo(0.5, 0.3, 0.32, 0.74);
      c.closePath();
      c.fill();
      rect(c, 0.06, 0.56, 0.08, 0.1, "#6a5a2a");
    },
    potato: (c) => {
      ell(c, 0.32, 0.3, 0.28, 0.22, "#c9a66a");
      ell(c, 0.7, 0.32, 0.24, 0.2, "#bf9a5e");
      ell(c, 0.5, 0.58, 0.3, 0.22, "#d2b074");
      for (const [x, y] of [[0.3, 0.3], [0.7, 0.34], [0.45, 0.6]]) ell(c, x, y, 0.03, 0.02, "#8a6a38");
    },
    // ---- 酒 ----
    sake: (c, col) => {
      rect(c, 0.38, 0.78, 0.24, 0.2, "#1f6a3a");
      rect(c, 0.34, 0.7, 0.32, 0.1, "#1f6a3a");
      poly3(c, [0.34, 0.7, 0.66, 0.7, 0.78, 0.5, 0.78, 0.04, 0.22, 0.04, 0.22, 0.5], col || "#2f8a52");
      rect(c, 0.26, 0.2, 0.48, 0.38, "#f7f2e4");
      rect(c, 0.26, 0.46, 0.48, 0.06, "#c23a2e");
      rect(c, 0.46, 0.24, 0.08, 0.2, "#2a2a2a");
      rect(c, 0.3, 0.06, 0.1, 0.5, "rgba(255,255,255,.25)");
    },
    beercan: (c, col) => {
      rect(c, 0.22, 0.08, 0.56, 0.84, col || "#e8b920");
      rect(c, 0.22, 0.08, 0.56, 0.12, "#d6d9de");
      rect(c, 0.22, 0.82, 0.56, 0.1, "#d6d9de");
      rect(c, 0.22, 0.42, 0.56, 0.16, "#fff");
      rect(c, 0.22, 0.54, 0.56, 0.06, "#c8232c");
      rect(c, 0.28, 0.1, 0.08, 0.8, "rgba(255,255,255,.35)");
    },
    beerbottle: (c) => {
      rect(c, 0.42, 0.56, 0.16, 0.42, "#5a3410");
      rect(c, 0.4, 0.9, 0.2, 0.06, "#d9b030");
      poly3(c, [0.42, 0.56, 0.58, 0.56, 0.76, 0.38, 0.76, 0.04, 0.24, 0.04, 0.24, 0.38], "#6b3f14");
      rect(c, 0.24, 0.16, 0.52, 0.2, "#f4ead0");
      rect(c, 0.24, 0.24, 0.52, 0.05, "#b52a22");
      rect(c, 0.28, 0.06, 0.08, 0.3, "rgba(255,255,255,.28)");
    },
    shochu: (c, col) => {
      rect(c, 0.4, 0.8, 0.2, 0.18, "#2a2f38");
      poly3(c, [0.4, 0.8, 0.6, 0.8, 0.76, 0.62, 0.76, 0.04, 0.24, 0.04, 0.24, 0.62], "rgba(200,225,235,.9)");
      rect(c, 0.24, 0.16, 0.52, 0.4, col || "#c24a2a");
      rect(c, 0.32, 0.24, 0.36, 0.22, "#f6efe0");
      rect(c, 0.28, 0.08, 0.08, 0.5, "rgba(255,255,255,.35)");
    },
    wine: (c, col) => {
      rect(c, 0.44, 0.74, 0.12, 0.24, col || "#2a5a2e");
      rect(c, 0.42, 0.88, 0.16, 0.08, "#8b1a2a");
      poly3(c, [0.44, 0.74, 0.56, 0.74, 0.7, 0.56, 0.7, 0.04, 0.3, 0.04, 0.3, 0.56], col || "#2a5a2e");
      rect(c, 0.3, 0.16, 0.4, 0.28, "#f2e8d0");
      rect(c, 0.3, 0.3, 0.4, 0.05, "#7a1a2a");
      rect(c, 0.33, 0.08, 0.06, 0.46, "rgba(255,255,255,.25)");
    },
    whisky: (c) => {
      rect(c, 0.36, 0.82, 0.28, 0.12, "#6b4a2a");
      poly3(c, [0.4, 0.82, 0.6, 0.82, 0.8, 0.7, 0.8, 0.04, 0.2, 0.04, 0.2, 0.7], "#b8761a");
      rect(c, 0.2, 0.16, 0.6, 0.36, "#f0e6cc");
      rect(c, 0.28, 0.26, 0.44, 0.14, "#222");
      rect(c, 0.24, 0.08, 0.08, 0.56, "rgba(255,255,255,.3)");
    },
    chuhai: (c) => {
      G2.beercan(c, "#e84a6a");
      rect(c, 0.22, 0.64, 0.56, 0.16, "#ffd84a");
    },
    // ---- 本・メディア ----
    book: (c, col, v = 0) => {
      const w = [0.34, 0.22, 0.4, 0.28][v & 3], h = [0.86, 0.78, 0.92, 0.7][v >> 2 & 3];
      const x = 0.5 - w / 2;
      rect(c, x, 0.04, w, h, col);
      rect(c, x, 0.04, w, 0.05, "rgba(0,0,0,.25)");
      rect(c, x, 0.04 + h - 0.22, w, 0.12, "rgba(255,255,255,.75)");
      rect(c, x + w * 0.1, 0.04 + h * 0.55, w * 0.8, 0.04, "rgba(255,255,255,.55)");
      rect(c, x + w * 0.1, 0.04 + h * 0.4, w * 0.5, 0.03, "rgba(255,255,255,.4)");
      rect(c, x, 0.04, 0.03, h, "rgba(255,255,255,.3)");
    },
    manga: (c, col) => {
      rect(c, 0.24, 0.04, 0.52, 0.9, col);
      rect(c, 0.24, 0.04, 0.52, 0.08, "#f4f0e6");
      rect(c, 0.3, 0.56, 0.4, 0.3, "#fff7d8");
      rect(c, 0.3, 0.22, 0.4, 0.14, "#222");
      ell(c, 0.5, 0.7, 0.1, 0.1, col);
    },
    vhs: (c) => {
      rect(c, 0.1, 0.2, 0.8, 0.6, "#26262e");
      rect(c, 0.18, 0.34, 0.64, 0.34, "#e9e4d4");
      rect(c, 0.22, 0.5, 0.56, 0.06, "#c23a2e");
      rect(c, 0.2, 0.24, 0.6, 0.06, "#3a3a44");
    },
    cd: (c, col) => {
      rect(c, 0.14, 0.08, 0.72, 0.84, "rgba(210,225,235,.8)");
      rect(c, 0.18, 0.12, 0.64, 0.76, col || "#4a6ab8");
      ell(c, 0.5, 0.5, 0.22, 0.22, "#e8edf2");
      ell(c, 0.5, 0.5, 0.05, 0.05, "#4a6ab8");
      rect(c, 0.18, 0.12, 0.08, 0.76, "rgba(255,255,255,.4)");
    },
    // ---- 魚・肉・その他 ----
    fish: (c) => {
      poly3(c, [0.06, 0.5, 0.3, 0.78, 0.72, 0.72, 0.92, 0.5, 0.72, 0.28, 0.3, 0.22], "#8fb4cc");
      poly3(c, [0.06, 0.5, 0.3, 0.78, 0.72, 0.72, 0.92, 0.5, 0.72, 0.5, 0.3, 0.5], "#b8d3e4");
      poly3(c, [0.9, 0.5, 1, 0.72, 1, 0.28], "#7aa0ba");
      ell(c, 0.24, 0.56, 0.04, 0.04, "#222");
      rect(c, 0.4, 0.28, 0.04, 0.46, "rgba(60,90,120,.3)");
    },
    meat: (c) => {
      ell(c, 0.5, 0.45, 0.42, 0.3, "#c9473f");
      ell(c, 0.44, 0.5, 0.26, 0.16, "#e8827a");
      ell(c, 0.66, 0.4, 0.14, 0.1, "#f4dcd2");
    },
    shell: (c) => {
      ell(c, 0.5, 0.42, 0.38, 0.32, "#e3d3c0");
      for (let i = -3; i <= 3; i++) {
        c.strokeStyle = "rgba(120,90,60,.45)";
        c.lineWidth = 0.03;
        c.beginPath();
        c.moveTo(0.5, 0.12);
        c.lineTo(0.5 + i * 0.1, 0.62);
        c.stroke();
      }
    },
    egg: (c) => {
      ell(c, 0.3, 0.32, 0.22, 0.28, "#f6ecd0");
      ell(c, 0.7, 0.32, 0.22, 0.28, "#efe2c0");
      ell(c, 0.5, 0.56, 0.22, 0.28, "#faf2dc");
    },
    bread: (c) => {
      ell(c, 0.5, 0.52, 0.42, 0.34, "#d9a85a");
      rect(c, 0.08, 0.12, 0.84, 0.3, "#d9a85a");
      ell(c, 0.5, 0.62, 0.3, 0.18, "#e8c07a");
    },
    rice: (c) => {
      poly3(c, [0.14, 0.08, 0.86, 0.08, 0.8, 0.92, 0.2, 0.92], "#f0ecdc");
      rect(c, 0.14, 0.08, 0.72, 0.1, "#d6d0b8");
      rect(c, 0.26, 0.4, 0.48, 0.24, "#c23a2e");
      rect(c, 0.3, 0.5, 0.4, 0.05, "#fff");
    }
  };
  var MAP = {
    carrot: "carrot",
    daikon: "daikon",
    hakusai: "hakusai",
    negi: "negi",
    cabbage: "cabbage",
    tomato: "tomato",
    apple: "apple",
    mikan: "mikan",
    banana: "banana",
    potato: "potato",
    fruit: "apple",
    vegset: "cabbage",
    veg: "cabbage",
    sake_ip: ["sake", "#2f8a52"],
    sake_gin: ["sake", "#3a6ab0"],
    sake_cup: ["sake", "#a8742a"],
    beer_can: ["beercan", "#e8b920"],
    beer_blk: ["beercan", "#222a38"],
    beer_btl: "beerbottle",
    shochu_i: ["shochu", "#c24a2a"],
    shochu_k: ["shochu", "#3a6a8a"],
    umeshu: ["shochu", "#d08a1a"],
    wine_r: ["wine", "#4a1a2a"],
    wine_w: ["wine", "#8aa84a"],
    whisky: "whisky",
    chuhai: "chuhai",
    novel: ["book", "#b84a4a", 1],
    ref: ["book", "#4a70b8", 6],
    dict: ["book", "#c89a48", 10],
    manga: ["manga", "#58a858"],
    manga2: ["manga", "#d86a3a"],
    mag: ["book", "#d0508a", 5],
    pic: ["book", "#e8a8c0", 3],
    travel: ["book", "#3aa6a0", 2],
    cook: ["book", "#e8a83a", 7],
    jr: ["book", "#7a9ae0", 4],
    book: ["book", "#4a70b8", 9],
    vhs: "vhs",
    cd: ["cd", "#4a6ab8"],
    fish: "fish",
    dried: "fish",
    shell: "shell",
    meat: "meat",
    egg: "egg",
    bread: "bread",
    rice: "rice"
  };
  var hasGlyph = (id) => !!MAP[id];
  function drawGood(c, id, variant = 0) {
    const m = MAP[id];
    if (!m) return false;
    const name = Array.isArray(m) ? m[0] : m, col = Array.isArray(m) ? m[1] : void 0, v = Array.isArray(m) && m[2] != null ? m[2] + variant : variant;
    const f2 = G2[name];
    if (!f2) return false;
    c.save();
    f2(c, col, v);
    c.restore();
    return true;
  }

